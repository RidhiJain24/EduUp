const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

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

      if (isMcq && isCorrect === true) {
        numberCorrect++;
      }

      if (isCoding && sub) {
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
        explanation = sub ? 'Pending AI evaluation and feedback' : 'No submission recorded yet';
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

    // For "coding" (or non-mcq) type questions: don't grade yet - just save submission
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

module.exports = router;
