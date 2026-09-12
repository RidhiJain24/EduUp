const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MODEL_PREFERENCES = [
  'gemini-2.0-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

/**
 * Strips markdown code fences if present and parses JSON array
 */
function parseAIResponse(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response received from AI');
  }

  let cleaned = text.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Extract JSON array between outermost brackets if surrounding text exists
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error('AI response is not a valid JSON array');
  }

  return parsed;
}

/**
 * Call Gemini model with fallback in case of model deprecation/unavailability
 */
async function callGemini(genAI, prompt) {
  let lastError = null;

  for (const modelName of MODEL_PREFERENCES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
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
        err.message?.includes('not found');

      if (isUnavailable) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No available Gemini model could be reached.');
}

/**
 * Executes AI generation with one retry on failure (e.g. invalid JSON)
 */
async function generateWithRetry(genAI, prompt, maxRetries = 1) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;
    try {
      const { rawText, modelUsed } = await callGemini(genAI, prompt);
      const parsedQuestions = parseAIResponse(rawText);
      return { parsedQuestions, modelUsed };
    } catch (err) {
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw new Error(`Generation failed after ${attempt} attempts: ${err.message}`);
      }
    }
  }
}

/**
 * Core reusable function to generate and seed questions for a subject and subtopic
 */
async function generateAndSeedQuestions({
  subject,
  subtopic,
  type,
  count = 80,
  prismaClient = null,
  genAIClient = null,
}) {
  const prismaInstance = prismaClient || prisma;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey && !genAIClient) {
    throw new Error('GEMINI_API_KEY is not defined in server/.env');
  }

  const genAIInstance = genAIClient || new GoogleGenerativeAI(apiKey);
  const SET_SIZE = 20;
  const totalSets = Math.max(1, Math.ceil(count / SET_SIZE));

  let prompt = '';
  if (type === 'mcq') {
    prompt = `Generate exactly ${count} unique, high-quality multiple-choice questions (MCQs) for the subject "${subject}" and subtopic "${subtopic}".
Provide a mixed distribution of difficulty levels: easy, medium, and hard.

Return ONLY a valid JSON array matching this exact shape:
[
  {
    "questionText": "Question statement here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctOption": 0,
    "difficulty": "easy"
  }
]

Requirements:
- Generate ${count} question items.
- "options" must contain an array of exactly 4 strings.
- "correctOption" must be the 0-based integer index (0, 1, 2, or 3) of the correct choice.
- "difficulty" must be one of: "easy", "medium", or "hard".
- Return ONLY valid JSON, with no markdown code blocks, backticks, or extra text.`;
  } else {
    prompt = `Generate exactly ${count} unique, high-quality, practical coding questions/problems for the subject "${subject}" and subtopic "${subtopic}".
Provide a mixed distribution of difficulty levels: easy, medium, and hard.

Return ONLY a valid JSON array matching this exact shape:
[
  {
    "questionText": "Clear problem description outlining the problem, requirements, sample inputs/outputs, or constraints",
    "difficulty": "medium"
  }
]

Requirements:
- Generate ${count} question items.
- Keep each "questionText" concise, practical, and clear (1-3 sentences describing the problem statement and expectations).
- "difficulty" must be one of: "easy", "medium", or "hard".
- Return ONLY valid JSON, with no markdown code blocks, backticks, or extra text.`;
  }

  const { parsedQuestions, modelUsed } = await generateWithRetry(genAIInstance, prompt, 1);

  if (!parsedQuestions || parsedQuestions.length === 0) {
    throw new Error('AI returned an empty list of questions');
  }

  // Map questions to sets (Set 1, Set 2, etc., up to 20 per set)
  const formattedQuestions = parsedQuestions.map((q, index) => {
    const setNumber = Math.min(Math.floor(index / SET_SIZE) + 1, totalSets);
    const assignmentSet = `Set ${setNumber}`;

    return {
      subject,
      subtopic,
      type,
      questionText: String(q.questionText || '').trim(),
      options: Array.isArray(q.options) ? q.options.map((opt) => String(opt).trim()) : [],
      correctOption: typeof q.correctOption === 'number' ? q.correctOption : null,
      difficulty:
        typeof q.difficulty === 'string' && ['easy', 'medium', 'hard'].includes(q.difficulty.toLowerCase().trim())
          ? q.difficulty.toLowerCase().trim()
          : 'medium',
      assignmentSet,
    };
  }).filter((q) => q.questionText.length > 0);

  const insertResult = await prismaInstance.question.createMany({
    data: formattedQuestions,
    skipDuplicates: true,
  });

  const setCounts = {};
  for (const q of formattedQuestions) {
    setCounts[q.assignmentSet] = (setCounts[q.assignmentSet] || 0) + 1;
  }

  return {
    subject,
    subtopic,
    type,
    generated: parsedQuestions.length,
    inserted: insertResult.count,
    sets: totalSets,
    setCounts,
    modelUsed,
  };
}

async function main() {
  const [,, subjectArg, subtopicArg, typeArg, countArg] = process.argv;

  if (!subjectArg || !subtopicArg || !typeArg) {
    console.log('Usage: node scripts/generateQuestions.js <subject> <subtopic> <mcq|coding> [count]');
    console.log('Example: node scripts/generateQuestions.js "DSA" "Recursion" "coding" 80');
    process.exit(1);
  }

  const subject = subjectArg.trim();
  const subtopic = subtopicArg.trim();
  const type = typeArg.toLowerCase().trim();
  const count = parseInt(countArg, 10) || 80;

  if (!['mcq', 'coding'].includes(type)) {
    console.error(`Error: Invalid question type "${typeArg}". Expected "mcq" or "coding".`);
    process.exit(1);
  }

  if (count <= 0) {
    console.error(`Error: Count must be a positive number, received: ${countArg}`);
    process.exit(1);
  }

  const SET_SIZE = 20;
  const totalSets = Math.max(1, Math.ceil(count / SET_SIZE));

  console.log('====================================================');
  console.log('Question Generation Task');
  console.log(`Subject:        ${subject}`);
  console.log(`Subtopic:       ${subtopic}`);
  console.log(`Type:           ${type}`);
  console.log(`Requested:      ${count} questions`);
  console.log(`Target Sets:    ${totalSets} set(s) (approx. ${SET_SIZE} per set)`);
  console.log('====================================================');

  try {
    const result = await generateAndSeedQuestions({
      subject,
      subtopic,
      type,
      count,
      prismaClient: prisma,
    });

    console.log('====================================================');
    console.log(`Model Used:          ${result.modelUsed}`);
    console.log(`Questions Generated: ${result.generated}`);
    console.log(`Questions Inserted:  ${result.inserted}`);
    console.log('Set Distribution:');
    for (const [setName, setCount] of Object.entries(result.setCounts)) {
      console.log(`  - ${setName}: ${setCount} questions`);
    }

    const totalInDb = await prisma.question.count({
      where: { subject, subtopic },
    });
    console.log(`Total questions for "${subject}" > "${subtopic}" in DB: ${totalInDb}`);
    console.log('====================================================');
    console.log('Question generation and seeding completed successfully!');
  } catch (error) {
    console.error('Fatal error during question generation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateAndSeedQuestions,
  parseAIResponse,
  callGemini,
  generateWithRetry,
};
