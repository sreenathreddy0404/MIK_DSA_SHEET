import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    topic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    name: { type: String, required: true, trim: true },
    item_type: { type: String, enum: ["problem", "theory"], default: "problem" },
    content: { type: String, default: null },
    problem_url: { type: String, default: null },
    github_url: { type: String, default: null },
    resource_url: { type: String, default: null },
    youtube_url: { type: String, default: null },
    youtube_video_id: { type: String, default: null },
    position: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

questionSchema.index({ topic_id: 1, position: 1 });

export const Question = mongoose.model("Question", questionSchema);
