const express = require("express");
const router = express.Router();
const Attempt = require("../models/Attempt");
const Assessment = require("../models/Assessment");
const { protect, authorize } = require("../middleware/auth");

// ─── POST /api/attempt/start ──────────────────────────────────
// Student starts an assessment
router.post("/start", protect, authorize("student"), async (req, res) => {
  const { assessmentId } = req.body;

  const assessment = await Assessment.findOne({ _id: assessmentId, status: "active" });
  if (!assessment) {
    return res.status(404).json({ success: false, message: "Assessment not found or not active" });
  }

  // Check if already attempted
  const existing = await Attempt.findOne({ student: req.user._id, assessment: assessmentId });
  if (existing?.status === "submitted") {
    return res.status(400).json({ success: false, message: "Already submitted" });
  }

  // Return existing in-progress attempt or create new
  if (existing) return res.json({ success: true, attempt: existing });

  const attempt = await Attempt.create({
    student: req.user._id,
    assessment: assessmentId,
    answers: [],
    status: "in-progress",
  });

  res.status(201).json({ success: true, attempt });
});

// ─── POST /api/attempt/submit ─────────────────────────────────
// Student submits assessment
router.post("/submit", protect, authorize("student"), async (req, res) => {
  const { attemptId, answers, timeTaken } = req.body;
  // answers: [{ questionId, givenAnswer }]

  const attempt = await Attempt.findOne({ _id: attemptId, student: req.user._id });
  if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });
  if (attempt.status === "submitted") {
    return res.status(400).json({ success: false, message: "Already submitted" });
  }

  const assessment = await Assessment.findById(attempt.assessment);
  if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

  // Auto-evaluate answers
  let score = 0;
  const evaluatedAnswers = answers.map((ans) => {
    const question = assessment.questions.id(ans.questionId);
    if (!question) return { questionId: ans.questionId, givenAnswer: ans.givenAnswer, isCorrect: false };

    let isCorrect = false;

    if (question.type === "mcq" || question.type === "truefalse") {
      isCorrect = ans.givenAnswer?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
    } else if (question.type === "fillblank") {
      isCorrect = ans.givenAnswer?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
    } else {
      // short answer: mark as correct if not empty (teacher reviews manually)
      isCorrect = ans.givenAnswer?.trim().length > 0;
    }

    if (isCorrect) score++;
    return { questionId: ans.questionId, givenAnswer: ans.givenAnswer, isCorrect };
  });

  const totalQuestions = assessment.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  attempt.answers = evaluatedAnswers;
  attempt.score = score;
  attempt.percentage = percentage;
  attempt.timeTaken = timeTaken || 0;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();

  res.json({
    success: true,
    result: {
      score,
      percentage,
      total: totalQuestions,
      correct: score,
      wrong: evaluatedAnswers.filter((a) => !a.isCorrect && a.givenAnswer !== "").length,
      skipped: evaluatedAnswers.filter((a) => a.givenAnswer === "").length,
      timeTaken,
    },
  });
});

// ─── GET /api/attempt/my ──────────────────────────────────────
// Student: get all their past attempts
router.get("/my", protect, authorize("student"), async (req, res) => {
  const attempts = await Attempt.find({ student: req.user._id, status: "submitted" })
    .populate("assessment", "title totalQuestions timeLimit")
    .sort({ submittedAt: -1 });

  res.json({ success: true, attempts });
});

// ─── GET /api/attempt/review/:attemptId ───────────────────────
// Student: get detailed review of submitted attempt
router.get("/review/:attemptId", protect, authorize("student"), async (req, res) => {
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, student: req.user._id });
  if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

  const assessment = await Assessment.findById(attempt.assessment);

  // Merge answers with questions (include correct answers now)
  const review = attempt.answers.map((ans) => {
    const question = assessment.questions.id(ans.questionId);
    return {
      questionId: ans.questionId,
      questionText: question?.questionText,
      type: question?.type,
      options: question?.options,
      givenAnswer: ans.givenAnswer,
      correctAnswer: question?.correctAnswer,
      explanation: question?.explanation,
      isCorrect: ans.isCorrect,
    };
  });

  res.json({
    success: true,
    review,
    score: attempt.score,
    percentage: attempt.percentage,
    timeTaken: attempt.timeTaken,
  });
});

module.exports = router;
