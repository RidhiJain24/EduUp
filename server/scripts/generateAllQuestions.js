const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateAndSeedQuestions } = require('./generateQuestions');

const prisma = new PrismaClient();

/**
 * Complete list of subjects and subtopics with associated question types
 */
const SUBJECTS_CONFIG = [
  {
    subject: 'DSA',
    type: 'coding',
    subtopics: [
      'Arrays',
      'Strings',
      'Backtracking',
      'Linked Lists',
      'Stacks & Queues',
      'Binary Trees',
      'Binary Search Trees',
      'Heaps',
      'Hashing',
      'Graphs',
      'Sorting Algorithms',
      'Searching Algorithms',
      'Dynamic Programming',
      'Greedy Algorithms',
      'Tries',
      'Bit Manipulation',
      'Sliding Window',
      // 'Recursion' is already done
    ],
  },
  {
    subject: 'DBMS',
    type: 'mcq',
    subtopics: [
      'Normalization',
      'SQL Queries',
      'Transactions & Concurrency',
      'Indexing',
      'ER Diagrams',
      'Joins',
      'Database Design',
    ],
  },
  {
    subject: 'System Design',
    type: 'mcq',
    subtopics: [
      'Load Balancing',
      'Caching',
      'Database Sharding',
      'Microservices',
      'API Design',
      'Scalability',
      'CAP Theorem',
    ],
  },
  {
    subject: 'OOP',
    type: 'mcq',
    subtopics: [
      'Classes & Objects',
      'Inheritance',
      'Polymorphism',
      'Encapsulation',
      'Abstraction',
      'Design Patterns',
      'SOLID Principles',
    ],
  },
  {
    subject: 'Operating Systems',
    type: 'mcq',
    subtopics: [
      'Process Management',
      'Memory Management',
      'Scheduling Algorithms',
      'Deadlocks',
      'File Systems',
      'Threads & Concurrency',
      'Virtual Memory',
    ],
  },
  {
    subject: 'Computer Networks',
    type: 'mcq',
    subtopics: [
      'OSI Model',
      'TCP/IP',
      'Routing',
      'DNS',
      'HTTP/HTTPS',
      'Network Security',
      'Sockets',
    ],
  },
  {
    subject: 'Web Development',
    type: 'mcq',
    subtopics: [
      'HTML & CSS',
      'JavaScript',
      'React',
      'Node.js & Express',
      'REST APIs',
      'Responsive Design',
    ],
  },
  {
    subject: 'Aptitude & Interview Prep',
    type: 'mcq',
    subtopics: [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'HR Interview Prep',
      'Technical Interview Prep',
    ],
  },
  {
    subject: 'Machine Learning',
    type: 'mcq',
    subtopics: [
      'Linear Regression',
      'Classification',
      'Neural Networks',
      'Model Evaluation',
      'Data Preprocessing',
    ],
  },
  {
    subject: 'Computer Architecture',
    type: 'mcq',
    subtopics: [
      'Number Systems',
      'Logic Gates',
      'CPU Architecture',
      'Memory Hierarchy',
      'Pipelining',
    ],
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateAllQuestions() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in server/.env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Flatten subtopics into a flat work queue
  const tasks = [];
  for (const group of SUBJECTS_CONFIG) {
    for (const subtopic of group.subtopics) {
      tasks.push({
        subject: group.subject,
        subtopic,
        type: group.type,
      });
    }
  }

  console.log('====================================================');
  console.log('Bulk Question Bank Generation');
  console.log(`Total topics to process: ${tasks.length}`);
  console.log('Questions per topic:     80 (4 sets of 20)');
  console.log('Delay between requests:  2000ms');
  console.log('====================================================\n');

  let successfulTopics = 0;
  let totalInsertedQuestions = 0;
  const failures = [];
  const startTime = Date.now();

  for (let i = 0; i < tasks.length; i++) {
    const { subject, subtopic, type } = tasks[i];
    const indexStr = `[${i + 1}/${tasks.length}]`;
    process.stdout.write(`${indexStr} Generating ${subject} - ${subtopic} (${type})... `);

    try {
      const result = await generateAndSeedQuestions({
        subject,
        subtopic,
        type,
        count: 80,
        prismaClient: prisma,
        genAIClient: genAI,
      });

      successfulTopics++;
      totalInsertedQuestions += result.inserted;
      console.log(`done (${result.inserted} questions)`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failures.push({
        subject,
        subtopic,
        type,
        error: err.message,
      });
    }

    // 2-second rate limit backoff between API requests
    if (i < tasks.length - 1) {
      await sleep(2000);
    }
  }

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  console.log('\n====================================================');
  console.log('Bulk Question Generation Summary');
  console.log('====================================================');
  console.log(`Total subtopics processed: ${tasks.length}`);
  console.log(`Successfully completed:    ${successfulTopics}`);
  console.log(`Failed subtopics:          ${failures.length}`);
  console.log(`Total questions inserted:  ${totalInsertedQuestions}`);
  console.log(`Total time elapsed:        ${elapsedSeconds} seconds`);

  if (failures.length > 0) {
    console.log('\nFailed Topics List:');
    failures.forEach((f) => {
      console.log(`  - ${f.subject} > ${f.subtopic} (${f.type}): ${f.error}`);
    });
  } else {
    console.log('\nAll topics were generated and inserted successfully!');
  }
  console.log('====================================================\n');

  await prisma.$disconnect();
}

if (require.main === module) {
  generateAllQuestions().catch(async (err) => {
    console.error('Fatal error in bulk generation runner:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
}

module.exports = {
  generateAllQuestions,
  SUBJECTS_CONFIG,
};
