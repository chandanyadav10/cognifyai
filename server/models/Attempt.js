const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionId:  { type: mongoose.Schema.Types.ObjectId, required: true },
  givenAnswer: { type: String, default: "" }, // "" = skipped
  isCorrect:   { type: Boolean, default: false },
});

const AttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    answers:    [AnswerSchema],
    score:      { type: Number, default: 0 },      // correct count
    percentage: { type: Number, default: 0 },      // 0-100
    timeTaken:  { type: Number, default: 0 },      // seconds
    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress",
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// One attempt per student per assessment
AttemptSchema.index({ student: 1, assessment: 1 }, { unique: true });

module.exports = mongoose.model("Attempt", AttemptSchema);
