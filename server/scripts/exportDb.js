const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function exportDatabase() {
  console.log('========================================');
  console.log('   EduUp Database Export Utility');
  console.log('========================================');

  // Generate ISO-like clean timestamp for directory name: YYYY-MM-DDTHH-mm-ss
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups', timestamp);
  const seedDataDir = path.resolve(__dirname, '../prisma/seed-data');

  fs.mkdirSync(backupDir, { recursive: true });
  fs.mkdirSync(seedDataDir, { recursive: true });

  console.log(`\nBackup directory: ${backupDir}\n`);

  const tables = [
    { name: 'users', model: prisma.user, sortField: 'createdAt' },
    { name: 'subjects', model: prisma.subject, sortField: 'name' },
    { name: 'subtopics', model: prisma.subtopic, sortField: 'name' },
    { name: 'playlists', model: prisma.playlist, sortField: 'title' },
    { name: 'questions', model: prisma.question, sortField: 'createdAt' },
    { name: 'submissions', model: prisma.submission, sortField: 'submittedAt' },
    { name: 'userBadges', model: prisma.userBadge, sortField: 'unlockedAt' },
  ];

  const summary = [];
  let questionsData = [];

  for (const table of tables) {
    try {
      const records = await table.model.findMany({
        orderBy: { [table.sortField]: 'asc' },
      });

      const filename = `${table.name}.json`;
      const filePath = path.join(backupDir, filename);
      const jsonContent = JSON.stringify(records, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf8');

      const stats = fs.statSync(filePath);

      summary.push({
        table: table.name,
        rows: records.length,
        file: filename,
        bytes: stats.size,
        formattedSize: formatBytes(stats.size),
      });

      if (table.name === 'questions') {
        questionsData = records;
      }
    } catch (err) {
      console.error(`Error exporting table "${table.name}":`, err.message);
      summary.push({
        table: table.name,
        rows: 0,
        file: 'FAILED',
        bytes: 0,
        formattedSize: '0 B',
        error: err.message,
      });
    }
  }

  // Export Question seed data to server/prisma/seed-data/questions.json
  const seedQuestionsFile = path.join(seedDataDir, 'questions.json');
  const seedJsonContent = JSON.stringify(questionsData, null, 2);
  fs.writeFileSync(seedQuestionsFile, seedJsonContent, 'utf8');
  const seedStats = fs.statSync(seedQuestionsFile);

  // Write manifest in the backup directory
  const manifest = {
    exportedAt: now.toISOString(),
    timestamp,
    backupDir,
    totalTables: tables.length,
    tables: summary,
  };
  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // Display summary table
  console.log('Table Export Summary:');
  console.log('------------------------------------------------------------');
  console.log(
    'Table'.padEnd(16) +
      'Row Count'.padStart(12) +
      'File Size'.padStart(14) +
      '   File'
  );
  console.log('------------------------------------------------------------');
  for (const row of summary) {
    console.log(
      row.table.padEnd(16) +
        String(row.rows).padStart(12) +
        row.formattedSize.padStart(14) +
        '   ' +
        row.file
    );
  }
  console.log('------------------------------------------------------------');

  console.log(`\nSeed Data Export:`);
  console.log(`Target: ${seedQuestionsFile}`);
  console.log(`Questions: ${questionsData.length} records`);
  console.log(`Size: ${formatBytes(seedStats.size)}`);
  console.log('\nDatabase export completed successfully.\n');

  return {
    timestamp,
    backupDir,
    summary,
    seedQuestionsFile,
    seedSize: seedStats.size,
  };
}

if (require.main === module) {
  exportDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during export:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { exportDatabase };
