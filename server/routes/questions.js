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
    const { questionId, answerText } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    if (!questionId || answerText === undefined || answerText === null) {
      return res.status(400).json({ error: 'questionId and answerText are required' });
    }

    // Optional validation: check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        questionId,
        answerText: String(answerText),
        aiScore: null,
        aiFeedback: null,
      },
    });

    return res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
});

module.exports = router;
