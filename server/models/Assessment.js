const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "truefalse", "short", "fillblank"],
    required: true,
  },
  questionText: { type: String, required: true },
  options: [String],          // MCQ ke liye 4 options
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
});

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assessment title is required"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Source config
    sourceType: {
      type: String,
      enum: ["pdf", "text", "youtube", "topic"],
      required: true,
    },
    sourceContent: { type: String, default: "" }, // extracted raw text

    // AI config
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },
    questionTypes: {
      mcq:       { type: Boolean, default: true },
      truefalse: { type: Boolean, default: true },
      short:     { type: Boolean, default: false },
      fillblank: { type: Boolean, default: false },
    },
    totalQuestions: { type: Number, default: 10 },

    // Generated questions
    questions: [QuestionSchema],

    // Publishing
    shareCode: {
      type: String,
      unique: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    timeLimit: { type: Number, default: 30 }, // minutes, 0 = no limit
  },
  { timestamps: true }
);

// Auto-generate unique share code before saving
AssessmentSchema.pre("save", async function (next) {
  if (!this.shareCode) {
    this.shareCode = generateShareCode();
  }
  // next();
});

function generateShareCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // format: XXXX-XXXX
}

module.exports = mongoose.model("Assessment", AssessmentSchema);
