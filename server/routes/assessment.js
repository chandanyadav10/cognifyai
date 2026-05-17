const express = require("express");
const router = express.Router();
const multer = require("multer");
const Assessment = require("../models/Assessment");
const Attempt = require("../models/Attempt");
const { protect, authorize } = require("../middleware/auth");
const { generateQuestions } = require("../services/aiService");
const { extractPdfText } = require("../services/pdfService");
const { extractYoutubeTranscript } = require("../services/youtubeService");

// Multer: store PDF in memory (not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// ─── POST /api/assessment/generate ───────────────────────────
// Step 1+2: Extract content + Generate questions (preview only, not saved)
router.post(
  "/generate",
  protect,
  authorize("teacher"),
  upload.single("pdf"),
  async (req, res) => {
    const { sourceType, textContent, youtubeUrl, topicName, totalQuestions, difficulty, questionTypes } = req.body;

    let content = "";

    // Extract content based on source type
    if (sourceType === "pdf") {
      if (!req.file) return res.status(400).json({ success: false, message: "PDF file required" });
      content = await extractPdfText(req.file.buffer);

    } else if (sourceType === "text") {
      if (!textContent?.trim()) return res.status(400).json({ success: false, message: "Text content required" });
      content = textContent.trim();

    } else if (sourceType === "youtube") {
      if (!youtubeUrl?.trim()) return res.status(400).json({ success: false, message: "YouTube URL required" });
      content = await extractYoutubeTranscript(youtubeUrl.trim());

    } else if (sourceType === "topic") {
      if (!topicName?.trim()) return res.status(400).json({ success: false, message: "Topic name required" });
      content = `Generate educational questions about the topic: ${topicName.trim()}. 
      Cover key concepts, definitions, applications, and important facts related to this topic.`;

    } else {
      return res.status(400).json({ success: false, message: "Invalid source type" });
    }

    // Parse questionTypes (comes as JSON string from FormData)
    const parsedTypes = typeof questionTypes === "string" ? JSON.parse(questionTypes) : questionTypes;

    const questions = await generateQuestions(content, {
      totalQuestions: parseInt(totalQuestions) || 10,
      difficulty: difficulty || "medium",
      questionTypes: parsedTypes || { mcq: true, truefalse: true },
    });

    res.json({ success: true, questions, sourceContent: content });
  }
);

// ─── POST /api/assessment ─────────────────────────────────────
// Save assessment (after teacher reviews questions)
router.post("/", protect, authorize("teacher"), async (req, res) => {
  const { title, sourceType, sourceContent, difficulty, questionTypes, totalQuestions, questions, timeLimit } = req.body;

  if (!title || !questions?.length) {
    return res.status(400).json({ success: false, message: "Title and questions are required" });
  }

  const assessment = await Assessment.create({
    title,
    createdBy: req.user._id,
    sourceType,
    sourceContent,
    difficulty,
    questionTypes,
    totalQuestions: questions.length,
    questions,
    timeLimit: parseInt(timeLimit) || 30,
    status: "draft",
  });

  res.status(201).json({ success: true, assessment });
});

// ─── GET /api/assessment ──────────────────────────────────────
// Teacher: get all their assessments
router.get("/", protect, authorize("teacher"), async (req, res) => {
  const assessments = await Assessment.find({ createdBy: req.user._id })
    .select("-questions -sourceContent")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: assessments.length, assessments });
});

// ─── GET /api/assessment/join/:shareCode ──────────────────────
// Student: join assessment by share code
router.get("/join/:shareCode", protect, authorize("student"), async (req, res) => {
  const assessment = await Assessment.findOne({
    shareCode: req.params.shareCode.toUpperCase(),
    status: "active",
  }).select("-questions.correctAnswer -questions.explanation -sourceContent");

  if (!assessment) {
    return res.status(404).json({ success: false, message: "Invalid code or assessment not active" });
  }

  // Check if already attempted
  const existing = await Attempt.findOne({ student: req.user._id, assessment: assessment._id });
  if (existing?.status === "submitted") {
    return res.status(400).json({ success: false, message: "You have already attempted this assessment" });
  }

  res.json({ success: true, assessment });
});

// ─── GET /api/assessment/:id ──────────────────────────────────
// Get single assessment (teacher sees answers, student doesn't)
router.get("/:id", protect, async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

  // Students don't get correct answers
  if (req.user.role === "student") {
    const safe = assessment.toObject();
    safe.questions = safe.questions.map(({ correctAnswer, explanation, ...q }) => q);
    return res.json({ success: true, assessment: safe });
  }

  res.json({ success: true, assessment });
});

// ─── PATCH /api/assessment/:id/publish ───────────────────────
// Teacher: publish or close assessment
router.patch("/:id/publish", protect, authorize("teacher"), async (req, res) => {
  const { status } = req.body; // "active" or "closed"

  const assessment = await Assessment.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

  assessment.status = status || "active";
  await assessment.save();

  res.json({ success: true, assessment });
});

// ─── DELETE /api/assessment/:id ───────────────────────────────
router.delete("/:id", protect, authorize("teacher"), async (req, res) => {
  const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });
  res.json({ success: true, message: "Assessment deleted" });
});

// ─── GET /api/assessment/:id/analytics ───────────────────────
// Teacher: get analytics for one assessment
router.get("/:id/analytics", protect, authorize("teacher"), async (req, res) => {
  const assessment = await Assessment.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

  const attempts = await Attempt.find({ assessment: req.params.id, status: "submitted" })
    .populate("student", "name email");

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
    : 0;
  const topScore = totalAttempts ? Math.max(...attempts.map((a) => a.percentage)) : 0;

  // Score distribution buckets: 0-20, 21-40, 41-60, 61-80, 81-100
  const distribution = [0, 0, 0, 0, 0];
  attempts.forEach((a) => {
    const bucket = Math.min(Math.floor(a.percentage / 20), 4);
    distribution[bucket]++;
  });

  res.json({
    success: true,
    analytics: {
      totalAttempts,
      avgScore,
      topScore,
      completionRate: totalAttempts,
      distribution,
      attempts: attempts.map((a) => ({
        student: a.student,
        score: a.score,
        percentage: a.percentage,
        timeTaken: a.timeTaken,
        submittedAt: a.submittedAt,
      })),
    },
  });
});

module.exports = router;
