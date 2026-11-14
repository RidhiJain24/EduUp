const path = require('path');
if (!process.env.GEMINI_API_KEY) {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  } catch (e) {}
}

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const { checkAndAwardBadges } = require('./progress');

const prisma = new PrismaClient();

const MODEL_PREFERENCES = [
  'gemini-2.0-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
];

/**
 * Builds prompt for reviewing coding questions in any language
 */
function buildCodingReviewPrompt(questionText, studentCode) {
  return `You are an expert programming instructor and code reviewer.
Analyze the following student code submission for a coding problem. The code may be written in any programming language (e.g., Java, Python, C++, JavaScript).

Problem Statement:
${questionText}

Student Code:
${studentCode}

Perform a thorough evaluation for correctness, edge cases, algorithmic efficiency, and code quality.
Return ONLY a valid JSON object (no markdown fences, no backticks, no preamble or extra text) strictly conforming to this structure:
{
  "score": 0-100,
  "isCorrect": boolean,
  "feedback": "string (2-3 sentences)",
  "strengths": ["string"],
  "improvements": ["string"],
  "timeComplexity": "string",
  "suggestedApproach": "string (a hint, not a full solution)"
}

Guidelines for the fields:
- score: Integer between 0 and 100 based on correctness, test case coverage, efficiency, and code quality.
- isCorrect: Boolean (true if the solution correctly solves the problem and passes all expected test cases/edge cases, false otherwise).
- feedback: Exactly 2 to 3 concise, constructive sentences summarizing evaluation of their solution.
- strengths: Array of strings highlighting key strengths of the implementation.
- improvements: Array of strings highlighting specific areas for improvement, edge case bugs, or optimizations.
- timeComplexity: Asymptotic time complexity in Big-O notation (e.g., "O(n)", "O(n log n)", "O(1)").
- suggestedApproach: A helpful hint or conceptual suggestion for the optimal approach (a hint only, NOT a full code solution).`;
}

/**
 * Strips markdown code fences if present and parses coding review JSON
 */
function parseCodingReview(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response received from AI');
  }

  let cleaned = text.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // Extract JSON between outermost curly braces if surrounding text exists
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Parsed AI review is not a valid JSON object');
  }

  // Validate and clamp score
  const numScore = Number(parsed.score);
  if (isNaN(numScore)) {
    throw new Error(`Invalid score in AI review: ${parsed.score}`);
  }
  const score = Math.max(0, Math.min(100, Math.round(numScore)));

  // Validate and parse isCorrect
  let isCorrect;
  if (typeof parsed.isCorrect === 'boolean') {
    isCorrect = parsed.isCorrect;
  } else if (typeof parsed.isCorrect === 'string') {
    isCorrect = parsed.isCorrect.toLowerCase() === 'true';
  } else if (typeof parsed.isCorrect !== 'undefined') {
    isCorrect = Boolean(parsed.isCorrect);
  } else {
    isCorrect = score >= 70;
  }

  // Validate feedback
  const feedback =
    typeof parsed.feedback === 'string' && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : 'No feedback provided.';

  // Validate strengths
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.map((s) => String(s).trim()).filter(Boolean)
    : (parsed.strengths ? [String(parsed.strengths).trim()] : []);

  // Validate improvements
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((i) => String(i).trim()).filter(Boolean)
    : (parsed.improvements ? [String(parsed.improvements).trim()] : []);

  // Validate timeComplexity
  const timeComplexity =
    typeof parsed.timeComplexity === 'string' && parsed.timeComplexity.trim()
      ? parsed.timeComplexity.trim()
      : 'N/A';

  // Validate suggestedApproach
  const suggestedApproach =
    typeof parsed.suggestedApproach === 'string' && parsed.suggestedApproach.trim()
      ? parsed.suggestedApproach.trim()
      : 'No suggested approach provided.';

  return {
    score,
    isCorrect,
    feedback,
    strengths,
    improvements,
    timeComplexity,
    suggestedApproach,
  };
}

/**
 * Call Gemini model with model preferences fallback
 */
async function callGeminiForReview(genAI, prompt) {
  let lastError = null;

  for (const modelName of MODEL_PREFERENCES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      return { rawText, modelUsed: modelName };
    } catch (err) {
      lastError = err;
      const isUnavailable =
        err.message?.includes('404') ||
        err.message?.includes('no longer available') ||
        err.message?.includes('not found') ||
        err.message?.includes('503') ||
        err.message?.includes('429') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('quota') ||
        err.status === 404 ||
        err.status === 503 ||
        err.status === 429;

      if (isUnavailable) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No available Gemini model could be reached.');
}

/**
 * Evaluates coding submission using Gemini with 1 retry on failure
 */
async function evaluateCodingSubmission(questionText, studentCode) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildCodingReviewPrompt(questionText, studentCode);

  let lastError = null;
  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { rawText } = await callGeminiForReview(genAI, prompt);
      const parsedReview = parseCodingReview(rawText);
      return parsedReview;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini evaluation attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < maxRetries) {
        // Wait 2000ms before retry to handle transient rate limits or demand spikes
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError || new Error('Coding evaluation failed after retry');
}

/**
 * Builds prompt for generating an MCQ explanation
 */
function buildMCQExplanationPrompt(questionText, options, correctOption) {
  const optionsText = Array.isArray(options)
    ? options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')
    : 'None provided';

  let correctText = '';
  if (
    correctOption !== null &&
    correctOption !== undefined &&
    Array.isArray(options) &&
    options[correctOption] !== undefined
  ) {
    correctText = `${String.fromCharCode(65 + correctOption)}. ${options[correctOption]}`;
  } else if (correctOption !== null && correctOption !== undefined) {
    correctText = `Option index ${correctOption}`;
  } else {
    correctText = 'Not specified';
  }

  return `You are an educational tutor explaining a multiple-choice question.

Question:
${questionText}

Options:
${optionsText}

Correct Answer:
${correctText}

Provide a short explanation (exactly 3-4 sentences) explaining why the correct answer is right and why the other options are wrong.
Rules:
- Plain text only.
- Do NOT use markdown (no asterisks, no bullet points, no bold, no italics, no code blocks, no backticks).
- Keep it clear, concise, and helpful for a student.`;
}

/**
 * Strips markdown formatting to ensure plain text only
 */
function cleanPlainText(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();

  // Strip code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:\w+)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // Remove markdown formatting symbols
  cleaned = cleaned
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '');

  return cleaned.trim();
}

/**
 * Call Gemini model with model preferences fallback for plain text explanation
 */
async function callGeminiForExplanation(genAI, prompt) {
  let lastError = null;

  for (const modelName of MODEL_PREFERENCES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      return { rawText, modelUsed: modelName };
    } catch (err) {
      lastError = err;
      const isUnavailable =
        err.message?.includes('404') ||
        err.message?.includes('no longer available') ||
        err.message?.includes('not found') ||
        err.message?.includes('503') ||
        err.message?.includes('429') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('quota') ||
        err.status === 404 ||
        err.status === 503 ||
        err.status === 429;

      if (isUnavailable) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No available Gemini model could be reached.');
}

/**
 * Generates an MCQ explanation using Gemini API with 1 retry on failure
 */
async function generateMCQExplanationWithRetry(questionText, options, correctOption) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildMCQExplanationPrompt(questionText, options, correctOption);

  let lastError = null;
  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { rawText } = await callGeminiForExplanation(genAI, prompt);
      const cleaned = cleanPlainText(rawText);
      if (!cleaned) {
        throw new Error('Empty response received from AI');
      }
      return cleaned;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini explanation attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < maxRetries) {
        // Wait 1500ms before retry to handle transient rate limits or demand spikes
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError || new Error('Explanation generation failed after retry');
}

// @route   GET /api/questions/sets?subject=<subject>&subtopic=<subtopic>
// @desc    Get distinct assignmentSet values and count of questions per set for given subject/subtopic
// @access  Public
router.get('/sets', async (req, res) => {
  try {
    const { subject, subtopic } = req.query;
    const where = {};

    if (subject && typeof subject === 'string' && subject.trim()) {
      where.subject = { equals: subject.trim(), mode: 'insensitive' };
    }

    if (subtopic && typeof subtopic === 'string' && subtopic.trim()) {
      where.subtopic = { equals: subtopic.trim(), mode: 'insensitive' };
    }

    const setGroups = await prisma.question.groupBy({
      by: ['assignmentSet'],
      where,
      _count: {
        _all: true,
      },
      orderBy: {
        assignmentSet: 'asc',
      },
    });

    const result = setGroups.map((group) => ({
      set: group.assignmentSet || 'Set 1',
      count: group._count?._all ?? 0,
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error fetching question sets:', error);
    return res.status(500).json({ error: 'Failed to fetch question sets' });
  }
});

// @route   GET /api/questions/results?subject=<subject>&subtopic=<subtopic>&assignmentSet=<set>
// @desc    Get summary of submissions for a specific assignment set (JWT protected)
// @access  Private
router.get('/results', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const { subject, subtopic, assignmentSet, set } = req.query;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'subject query parameter is required' });
    }

    if (!subtopic || typeof subtopic !== 'string' || !subtopic.trim()) {
      return res.status(400).json({ error: 'subtopic query parameter is required' });
    }

    const where = {
      subject: { equals: subject.trim(), mode: 'insensitive' },
      subtopic: { equals: subtopic.trim(), mode: 'insensitive' },
    };

    const targetSet = assignmentSet || set;
    if (targetSet && typeof targetSet === 'string' && targetSet.trim()) {
      where.assignmentSet = { equals: targetSet.trim(), mode: 'insensitive' };
    }

    // Fetch all questions for this assignment set
    const questions = await prisma.question.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    const questionIds = questions.map((q) => q.id);

    // Fetch all user submissions for these questions (ordered latest first)
    const submissions = questionIds.length > 0 ? await prisma.submission.findMany({
      where: {
        userId,
        questionId: { in: questionIds },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    }) : [];

    // Map each question to its most recent submission
    const submissionMap = new Map();
    for (const sub of submissions) {
      if (!submissionMap.has(sub.questionId)) {
        submissionMap.set(sub.questionId, sub);
      }
    }

    let numberCorrect = 0;
    let numberPendingReview = 0;

    const questionList = questions.map((q) => {
      const sub = submissionMap.get(q.id);
      const isMcq = q.type?.toLowerCase() === 'mcq';
      const isCoding = q.type?.toLowerCase() === 'coding';

      let isCorrect = null;
      if (sub) {
        if (sub.isCorrect !== null && sub.isCorrect !== undefined) {
          isCorrect = sub.isCorrect;
        } else if (isMcq && q.correctOption !== null && q.correctOption !== undefined) {
          // Fallback evaluation if previous submission lacked isCorrect
          const subAnswer = sub.answerText;
          let subIndex = -1;
          if (
            !isNaN(Number(subAnswer)) &&
            Number.isInteger(Number(subAnswer)) &&
            Number(subAnswer) >= 0 &&
            Number(subAnswer) < (q.options?.length || 0)
          ) {
            subIndex = Number(subAnswer);
          } else if (q.options) {
            subIndex = q.options.indexOf(subAnswer);
          }
          isCorrect = subIndex === q.correctOption;
        }
      }

      if (isCorrect === true) {
        numberCorrect++;
      } else if (isCoding && sub && isCorrect === null) {
        numberPendingReview++;
      }

      let correctAnswer = null;
      let explanation = null;

      if (isMcq) {
        const correctOptionIndex = q.correctOption;
        if (
          correctOptionIndex !== null &&
          correctOptionIndex !== undefined &&
          q.options &&
          q.options[correctOptionIndex] !== undefined
        ) {
          correctAnswer = q.options[correctOptionIndex];
        } else if (correctOptionIndex !== null && correctOptionIndex !== undefined) {
          correctAnswer = `Option ${correctOptionIndex + 1}`;
        }

        if (correctAnswer) {
          explanation = `The correct answer is ${correctAnswer}`;
        }
      } else if (isCoding) {
        if (sub && sub.aiFeedback) {
          try {
            const parsed = JSON.parse(sub.aiFeedback);
            explanation = parsed.feedback || 'AI evaluation complete.';
          } catch (e) {
            explanation = sub.aiFeedback;
          }
        } else {
          explanation = sub ? 'Pending AI evaluation and feedback' : 'No submission recorded yet';
        }
      }

      return {
        id: q.id,
        subject: q.subject,
        subtopic: q.subtopic,
        assignmentSet: q.assignmentSet,
        type: q.type,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        correctAnswer,
        explanation,
        userAnswer: sub ? sub.answerText : null,
        answer: sub ? sub.answerText : null,
        isCorrect,
        submitted: Boolean(sub),
        submittedAt: sub ? sub.submittedAt : null,
        submissionId: sub ? sub.id : null,
        aiScore: sub ? sub.aiScore : null,
        aiFeedback: sub ? sub.aiFeedback : null,
      };
    });

    return res.json({
      totalQuestions: questions.length,
      numberCorrect,
      numberPendingReview,
      correctCount: numberCorrect,
      pendingCount: numberPendingReview,
      questions: questionList,
    });
  } catch (error) {
    console.error('Error fetching assignment results:', error);
    return res.status(500).json({ error: 'Failed to fetch assignment results' });
  }
});

// @route   GET /api/questions?subject=<subject>&subtopic=<subtopic>&assignmentSet=<assignmentSet>
// @desc    Get questions filtered by subject, subtopic, and/or assignmentSet (excluding correctOption)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { subject, subtopic, assignmentSet } = req.query;
    const where = {};

    if (subject && typeof subject === 'string' && subject.trim()) {
      where.subject = { equals: subject.trim(), mode: 'insensitive' };
    }

    if (subtopic && typeof subtopic === 'string' && subtopic.trim()) {
      where.subtopic = { equals: subtopic.trim(), mode: 'insensitive' };
    }

    if (assignmentSet && typeof assignmentSet === 'string' && assignmentSet.trim()) {
      where.assignmentSet = { equals: assignmentSet.trim(), mode: 'insensitive' };
    }

    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        subject: true,
        subtopic: true,
        type: true,
        questionText: true,
        options: true,
        difficulty: true,
        assignmentSet: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// @route   GET /api/questions/:id/explanation
// @desc    Get AI-generated explanation for an MCQ question (JWT protected)
// @access  Private
router.get('/:id/explanation', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // 1. If the Question already has a saved explanation, return it
    if (question.explanation && question.explanation.trim()) {
      return res.json({ explanation: question.explanation.trim() });
    }

    // 2. Otherwise call Gemini API with retry
    try {
      const generator = router.generateMCQExplanationWithRetry || generateMCQExplanationWithRetry;
      const explanation = await generator(
        question.questionText,
        question.options,
        question.correctOption
      );

      // Save the explanation on the Question record so it is cached for future requests
      if (explanation) {
        await prisma.question.update({
          where: { id: question.id },
          data: { explanation },
        });
      }

      return res.json({ explanation });
    } catch (aiErr) {
      console.warn('Gemini explanation generation failed after retry:', aiErr.message);
      return res.json({ explanation: null });
    }
  } catch (error) {
    console.error('Error fetching question explanation:', error);
    return res.status(500).json({ error: 'Failed to fetch explanation' });
  }
});

// @route   POST /api/questions/submit
// @desc    Submit an answer to a question (JWT protected)
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionId, answerText, selectedOption } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }

    if (
      (answerText === undefined || answerText === null || String(answerText).trim() === '') &&
      (selectedOption === undefined || selectedOption === null)
    ) {
      return res.status(400).json({ error: 'Either answerText or selectedOption is required' });
    }

    // Validate that question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isMcq = question.type?.toLowerCase() === 'mcq';

    if (isMcq) {
      // Determine submitted option index
      let submittedIndex = -1;

      if (selectedOption !== undefined && selectedOption !== null && selectedOption !== '') {
        if (typeof selectedOption === 'number') {
          submittedIndex = selectedOption;
        } else if (!isNaN(Number(selectedOption))) {
          submittedIndex = parseInt(selectedOption, 10);
        } else if (question.options) {
          submittedIndex = question.options.indexOf(String(selectedOption).trim());
        }
      } else if (answerText !== undefined && answerText !== null) {
        if (
          !isNaN(Number(answerText)) &&
          Number.isInteger(Number(answerText)) &&
          Number(answerText) >= 0 &&
          Number(answerText) < (question.options?.length || 0)
        ) {
          submittedIndex = Number(answerText);
        } else if (question.options) {
          submittedIndex = question.options.indexOf(String(answerText).trim());
        }
      }

      // Check correctness against question.correctOption
      const isCorrect =
        question.correctOption !== null && question.correctOption !== undefined
          ? submittedIndex === question.correctOption
          : false;

      // Determine text representation to store in answerText field
      let finalAnswerText = '';
      if (answerText !== undefined && answerText !== null && String(answerText).trim() !== '') {
        finalAnswerText = String(answerText).trim();
      } else if (submittedIndex >= 0 && question.options && question.options[submittedIndex] !== undefined) {
        finalAnswerText = question.options[submittedIndex];
      } else if (selectedOption !== undefined && selectedOption !== null) {
        finalAnswerText = String(selectedOption);
      }

      // Auto-generated explanation
      let correctOptionText = '';
      if (
        question.correctOption !== null &&
        question.correctOption !== undefined &&
        question.options &&
        question.options[question.correctOption] !== undefined
      ) {
        correctOptionText = question.options[question.correctOption];
      } else if (question.correctOption !== null && question.correctOption !== undefined) {
        correctOptionText = `Option ${question.correctOption + 1}`;
      }

      const explanation = correctOptionText
        ? `The correct answer is ${correctOptionText}`
        : 'No correct answer specified';

      const submission = await prisma.submission.create({
        data: {
          userId,
          questionId,
          answerText: finalAnswerText,
          isCorrect,
          aiScore: null,
          aiFeedback: null,
        },
      });

      // Check and award badges after successful submit
      await checkAndAwardBadges(userId);

      return res.status(201).json({
        isCorrect,
        correctOption: question.correctOption,
        explanation,
        id: submission.id,
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        submission,
      });
    }

    const isCoding = question.type?.toLowerCase() === 'coding';

    // For "coding" (or non-mcq) type questions: save submission first
    let finalAnswerText = '';
    if (answerText !== undefined && answerText !== null) {
      finalAnswerText = String(answerText);
    } else if (selectedOption !== undefined && selectedOption !== null) {
      finalAnswerText = String(selectedOption);
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        questionId,
        answerText: finalAnswerText,
        isCorrect: null,
        aiScore: null,
        aiFeedback: null,
      },
    });

    if (isCoding) {
      try {
        const review = await evaluateCodingSubmission(question.questionText, finalAnswerText);

        const updatedSubmission = await prisma.submission.update({
          where: { id: submission.id },
          data: {
            aiScore: review.score,
            aiFeedback: JSON.stringify(review),
            isCorrect: review.isCorrect,
          },
        });

        // Check and award badges after successful submit & evaluation
        await checkAndAwardBadges(userId);

        return res.status(201).json({
          status: 'reviewed',
          id: updatedSubmission.id,
          submissionId: updatedSubmission.id,
          submittedAt: updatedSubmission.submittedAt,
          isCorrect: review.isCorrect,
          score: review.score,
          aiScore: review.score,
          feedback: review.feedback,
          explanation: review.feedback,
          strengths: review.strengths,
          improvements: review.improvements,
          timeComplexity: review.timeComplexity,
          suggestedApproach: review.suggestedApproach,
          review,
          submission: updatedSubmission,
        });
      } catch (aiErr) {
        console.warn('Coding question AI review failed or hit rate limits; preserving submission with pending_ai_review:', aiErr.message);
        // Check and award badges even if AI review failed
        await checkAndAwardBadges(userId);

        return res.status(201).json({
          status: 'pending_ai_review',
          id: submission.id,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          submission,
        });
      }
    }

    await checkAndAwardBadges(userId);

    return res.status(201).json({
      status: 'pending_ai_review',
      id: submission.id,
      submissionId: submission.id,
      submittedAt: submission.submittedAt,
      submission,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
});

router.evaluateCodingSubmission = evaluateCodingSubmission;
router.parseCodingReview = parseCodingReview;
router.buildCodingReviewPrompt = buildCodingReviewPrompt;
router.callGeminiForReview = callGeminiForReview;
router.MODEL_PREFERENCES = MODEL_PREFERENCES;
router.generateMCQExplanationWithRetry = generateMCQExplanationWithRetry;
router.buildMCQExplanationPrompt = buildMCQExplanationPrompt;
router.cleanPlainText = cleanPlainText;
router.callGeminiForExplanation = callGeminiForExplanation;

module.exports = router;
