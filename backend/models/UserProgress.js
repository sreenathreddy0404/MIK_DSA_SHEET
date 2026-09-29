import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    completed: { type: Boolean, default: true },
    completed_at: { type: Date, default: null },
  },
  { timestamps: false },
);

userProgressSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
