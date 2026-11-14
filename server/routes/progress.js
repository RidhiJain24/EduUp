const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Computes current and longest streaks based on submission dates.
 * A streak is consecutive calendar days (UTC YYYY-MM-DD).
 * Current streak is active if the latest streak ends today or yesterday.
 */
function computeStreaks(submissionDates) {
  if (!submissionDates || submissionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(
    submissionDates
      .filter((d) => Boolean(d))
      .map((d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10))
  );

  const sortedDates = Array.from(dateSet).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak across all history
  let longestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00Z');
    const currDate = new Date(sortedDates[i] + 'T00:00:00Z');
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else if (diffDays > 1) {
      runningStreak = 1;
    }
  }

  // Calculate current streak ending today or yesterday
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let currentStreak = 0;
  let checkDay = null;

  if (dateSet.has(todayStr)) {
    checkDay = new Date(todayStr + 'T00:00:00Z');
  } else if (dateSet.has(yesterdayStr)) {
    checkDay = new Date(yesterdayStr + 'T00:00:00Z');
  }

  if (checkDay) {
    let cursor = new Date(checkDay.getTime());
    while (true) {
      const curStr = cursor.toISOString().slice(0, 10);
      if (dateSet.has(curStr)) {
        currentStreak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * Extracts a concise feedback string from aiFeedback JSON or raw string
 */
function parseFeedbackSafe(aiFeedback) {
  if (!aiFeedback) return '';
  if (typeof aiFeedback === 'object') {
    return aiFeedback.feedback || aiFeedback.summary || '';
  }
  try {
    const parsed = JSON.parse(aiFeedback);
    return parsed.feedback || parsed.summary || String(aiFeedback);
  } catch (e) {
    return String(aiFeedback);
  }
}

/**
 * Checks and awards eligible badges for a given user.
 * Badges (skips if already awarded):
 * - first_steps: first ever submission
 * - streak_starter: 3-day streak
 * - week_warrior: 7-day streak
 * - streak_50: 50-day streak
 * - streak_100: 100-day streak
 * - sharp_shooter: any coding submission with aiScore >= 90
 * - perfectionist: aiScore = 100 on 3 different coding questions
 * - multi_tasker: submissions in 3 different subjects on the same day
 */
async function checkAndAwardBadges(userId) {
  if (!userId) return [];

  try {
    // 1. Fetch user's existing badges
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true },
    });
    const earnedKeys = new Set(existingBadges.map((b) => b.badgeKey));

    // 2. Fetch all submissions for the user
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'asc' },
    });

    if (submissions.length === 0) return [];

    // 3. Fetch questions to map subjects and subtopics
    const questionIds = Array.from(new Set(submissions.map((s) => s.questionId)));
    const questions = questionIds.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: questionIds } },
        })
      : [];
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // 4. Streaks
    const { currentStreak, longestStreak } = computeStreaks(
      submissions.map((s) => s.submittedAt)
    );
    const maxStreak = Math.max(currentStreak, longestStreak);

    // Keep user's streak field synchronized
    await prisma.user.update({
      where: { id: userId },
      data: { streak: currentStreak },
    }).catch(() => {});

    const badgesToAward = [];

    // 1. first_steps: first ever submission
    if (!earnedKeys.has('first_steps') && submissions.length >= 1) {
      badgesToAward.push('first_steps');
    }

    // 2. streak_starter: 3-day streak
    if (!earnedKeys.has('streak_starter') && maxStreak >= 3) {
      badgesToAward.push('streak_starter');
    }

    // 3. week_warrior: 7-day streak
    if (!earnedKeys.has('week_warrior') && maxStreak >= 7) {
      badgesToAward.push('week_warrior');
    }

    // 4. streak_50: 50-day streak
    if (!earnedKeys.has('streak_50') && maxStreak >= 50) {
      badgesToAward.push('streak_50');
    }

    // 5. streak_100: 100-day streak
    if (!earnedKeys.has('streak_100') && maxStreak >= 100) {
      badgesToAward.push('streak_100');
    }

    // 6. sharp_shooter: any coding submission with aiScore >= 90
    if (!earnedKeys.has('sharp_shooter')) {
      const hasSharpScore = submissions.some(
        (s) => typeof s.aiScore === 'number' && s.aiScore >= 90
      );
      if (hasSharpScore) {
        badgesToAward.push('sharp_shooter');
      }
    }

    // 7. perfectionist: aiScore = 100 on 3 different coding questions
    if (!earnedKeys.has('perfectionist')) {
      const perfectQuestionIds = new Set(
        submissions
          .filter((s) => s.aiScore === 100)
          .map((s) => s.questionId)
      );
      if (perfectQuestionIds.size >= 3) {
        badgesToAward.push('perfectionist');
      }
    }

    // 8. multi_tasker: submissions in 3 different subjects on the same day
    if (!earnedKeys.has('multi_tasker')) {
      const subjectsByDay = new Map();
      for (const s of submissions) {
        const q = questionMap.get(s.questionId);
        if (q && q.subject) {
          const dateStr = s.submittedAt.toISOString().slice(0, 10);
          if (!subjectsByDay.has(dateStr)) {
            subjectsByDay.set(dateStr, new Set());
          }
          subjectsByDay.get(dateStr).add(q.subject.trim().toLowerCase());
        }
      }

      let hasThreeSubjects = false;
      for (const subjectsSet of subjectsByDay.values()) {
        if (subjectsSet.size >= 3) {
          hasThreeSubjects = true;
          break;
        }
      }

      if (hasThreeSubjects) {
        badgesToAward.push('multi_tasker');
      }
    }

    // Insert newly awarded badges
    const newlyAwarded = [];
    for (const badgeKey of badgesToAward) {
      try {
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeKey,
            unlockedAt: new Date(),
          },
        });
        newlyAwarded.push(userBadge);
      } catch (err) {
        // Handle duplicate key race conditions gracefully
        console.warn(`Badge ${badgeKey} award skipped:`, err.message);
      }
    }

    return newlyAwarded;
  } catch (err) {
    console.error('Error in checkAndAwardBadges:', err);
    return [];
  }
}

// @route   GET /api/progress/summary
// @desc    Get user's progress summary metrics, streaks, activity, and badges (JWT protected)
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    // Check and award any earned badges based on past or recent activity
    await checkAndAwardBadges(userId);

    // Fetch all submissions for user
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });

    // Fetch question metadata for all questions submitted
    const questionIds = Array.from(new Set(submissions.map((s) => s.questionId)));
    const questions = questionIds.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: questionIds } },
        })
      : [];
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // 1. Current and Longest Streak
    const { currentStreak, longestStreak } = computeStreaks(
      submissions.map((s) => s.submittedAt)
    );

    // 2. Total Submissions
    const totalSubmissions = submissions.length;

    // 3. Assignments Attempted (distinct subject + subtopic + assignmentSet combos)
    const distinctCombos = new Set();
    for (const s of submissions) {
      const q = questionMap.get(s.questionId);
      if (q && q.subject && q.subtopic) {
        const setName = (q.assignmentSet || 'Set 1').trim().toLowerCase();
        distinctCombos.add(`${q.subject.trim().toLowerCase()}:::${q.subtopic.trim().toLowerCase()}:::${setName}`);
      }
    }
    const assignmentsAttempted = distinctCombos.size;

    // 4. Average AI Score over coding submissions
    const codingSubmissionsWithScore = submissions.filter((s) => {
      const q = questionMap.get(s.questionId);
      const isCoding = q ? q.type?.toLowerCase() === 'coding' : false;
      return (isCoding || s.aiScore !== null) && typeof s.aiScore === 'number' && !isNaN(s.aiScore);
    });

    const averageAiScore =
      codingSubmissionsWithScore.length > 0
        ? Math.round(
            codingSubmissionsWithScore.reduce((sum, s) => sum + s.aiScore, 0) /
              codingSubmissionsWithScore.length
          )
        : null;

    // 5. MCQ Accuracy (% of MCQ submissions where isCorrect is true)
    const mcqSubmissions = submissions.filter((s) => {
      const q = questionMap.get(s.questionId);
      return q ? q.type?.toLowerCase() === 'mcq' : s.isCorrect !== null && s.aiScore === null;
    });

    const correctMcqs = mcqSubmissions.filter((s) => s.isCorrect === true);
    const mcqAccuracy =
      mcqSubmissions.length > 0
        ? Math.round((correctMcqs.length / mcqSubmissions.length) * 100)
        : 0;

    // 6. Weekly Activity: array of 7 items (last 7 days ending today)
    const weeklyActivity = [];
    const submissionDateCounts = new Map();
    for (const s of submissions) {
      const dStr = s.submittedAt.toISOString().slice(0, 10);
      submissionDateCounts.set(dStr, (submissionDateCounts.get(dStr) || 0) + 1);
    }

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setUTCDate(targetDate.getUTCDate() - i);
      const dateStr = targetDate.toISOString().slice(0, 10);
      const count = submissionDateCounts.get(dateStr) || 0;
      weeklyActivity.push({
        date: dateStr,
        count,
        submissions: count,
      });
    }

    // 7. Recent Feedback: last 3 coding submissions with question text, subject, subtopic, aiScore and feedback
    const recentCodingSubmissions = submissions
      .filter((s) => {
        const q = questionMap.get(s.questionId);
        return (
          (q?.type?.toLowerCase() === 'coding' || s.aiScore !== null) &&
          (s.aiScore !== null || s.aiFeedback !== null)
        );
      })
      .slice(0, 3);

    const recentFeedback = recentCodingSubmissions.map((s) => {
      const q = questionMap.get(s.questionId);
      return {
        id: s.id,
        submissionId: s.id,
        questionId: s.questionId,
        questionText: q?.questionText || 'Coding Problem',
        subject: q?.subject || 'Coding',
        subtopic: q?.subtopic || 'Problem',
        aiScore: s.aiScore,
        feedback: parseFeedbackSafe(s.aiFeedback),
        submittedAt: s.submittedAt,
      };
    });

    // 8. Badges: [{ badgeKey, unlockedAt }]
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      select: {
        badgeKey: true,
        unlockedAt: true,
      },
    });

    return res.json({
      currentStreak,
      longestStreak,
      totalSubmissions,
      assignmentsAttempted,
      averageAiScore,
      mcqAccuracy,
      weeklyActivity,
      recentFeedback,
      badges: userBadges,
    });
  } catch (error) {
    console.error('Error in GET /api/progress/summary:', error);
    return res.status(500).json({ error: 'Failed to retrieve progress summary' });
  }
});

router.computeStreaks = computeStreaks;
router.checkAndAwardBadges = checkAndAwardBadges;
router.parseFeedbackSafe = parseFeedbackSafe;

module.exports = router;

