const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

async function importQuestions() {
  console.log('========================================');
  console.log('   EduUp Question Import Utility');
  console.log('========================================');

  const seedFile = path.resolve(__dirname, '../prisma/seed-data/questions.json');

  if (!fs.existsSync(seedFile)) {
    console.error(`Error: Seed file not found at ${seedFile}`);
    console.error('Please run "npm run db:export" first to generate the seed data.');
    process.exit(1);
  }

  console.log(`\nReading seed file: ${seedFile}`);
  const rawData = fs.readFileSync(seedFile, 'utf8');
  let questions = [];

  try {
    questions = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse questions.json:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(questions)) {
    console.error('Invalid format: questions.json must contain an array of question objects.');
    process.exit(1);
  }

  console.log(`Total questions in seed file: ${questions.length}`);

  if (questions.length === 0) {
    console.log('No questions to import.');
    return { totalInFile: 0, inserted: 0 };
  }

  const initialCount = await prisma.question.count();
  console.log(`Current questions in database before import: ${initialCount}`);

  let totalInserted = 0;
  const totalBatches = Math.ceil(questions.length / BATCH_SIZE);

  console.log(`\nImporting in ${totalBatches} batch(es) of up to ${BATCH_SIZE} questions with skipDuplicates: true...\n`);

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    const rawBatch = questions.slice(i, i + BATCH_SIZE);

    const formattedBatch = rawBatch.map((q) => ({
      id: q.id,
      subject: q.subject,
      subtopic: q.subtopic,
      type: q.type,
      questionText: q.questionText,
      options: Array.isArray(q.options) ? q.options : [],
      correctOption: q.correctOption !== undefined ? q.correctOption : null,
      difficulty: q.difficulty || 'medium',
      assignmentSet: q.assignmentSet || 'Set 1',
      explanation: q.explanation || null,
      createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
    }));

    try {
      const result = await prisma.question.createMany({
        data: formattedBatch,
        skipDuplicates: true,
      });

      totalInserted += result.count;
      console.log(
        `Batch ${batchIndex}/${totalBatches}: processed ${rawBatch.length} records -> ${result.count} new inserted (${rawBatch.length - result.count} already existed/skipped)`
      );
    } catch (batchErr) {
      console.error(`Error inserting batch ${batchIndex}:`, batchErr.message);
      throw batchErr;
    }
  }

  const finalCount = await prisma.question.count();
  console.log('\n----------------------------------------');
  console.log('Import Complete:');
  console.log(`- Questions in seed file: ${questions.length}`);
  console.log(`- Newly inserted:         ${totalInserted}`);
  console.log(`- Total in database:      ${finalCount}`);
  console.log('----------------------------------------\n');

  return {
    totalInFile: questions.length,
    inserted: totalInserted,
    finalCount,
  };
}

if (require.main === module) {
  importQuestions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during import:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { importQuestions };
