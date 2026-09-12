const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedQuestions() {
  try {
    console.log('--- Seeding Question Bank ---');

    // 1. Read both JSON files
    const recursionPath = path.resolve(__dirname, 'questions-recursion.json');
    const allTopicsPath = path.resolve(__dirname, 'questions-all-topics.json');

    console.log(`Reading: ${recursionPath}`);
    const recursionRaw = fs.readFileSync(recursionPath, 'utf8');
    const recursionQuestions = JSON.parse(recursionRaw);

    console.log(`Reading: ${allTopicsPath}`);
    const allTopicsRaw = fs.readFileSync(allTopicsPath, 'utf8');
    const allTopicsQuestions = JSON.parse(allTopicsRaw);

    console.log(`Loaded ${recursionQuestions.length} recursion questions.`);
    console.log(`Loaded ${allTopicsQuestions.length} all-topics questions.`);

    // 2. Merge them into one array
    const mergedQuestions = [...recursionQuestions, ...allTopicsQuestions];
    console.log(`Total questions merged: ${mergedQuestions.length}`);

    // Check existing questions by questionText for idempotency
    const existing = await prisma.question.findMany({
      select: { questionText: true },
    });
    const existingTexts = new Set(existing.map((q) => q.questionText));
    const questionsToInsert = mergedQuestions.filter(
      (q) => !existingTexts.has(q.questionText)
    );

    let insertedCount = 0;
    if (questionsToInsert.length > 0) {
      // 3. Insert questions into the Question table using createMany, skipDuplicates: true
      const result = await prisma.question.createMany({
        data: questionsToInsert,
        skipDuplicates: true,
      });
      insertedCount = result.count;
      console.log(`Questions inserted successfully: ${insertedCount}`);
    } else {
      console.log('All questions from JSON files already exist in the database (0 new questions needed).');
    }

    const totalQuestionsInDb = await prisma.question.count();
    console.log(`Total questions in database: ${totalQuestionsInDb}`);
    console.log('--- Seeding Completed Successfully ---');

    return {
      inserted: insertedCount,
      totalInDb: totalQuestionsInDb,
    };
  } catch (error) {
    console.error('Error during question seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();
