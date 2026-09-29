import { UserProgress } from "../models/UserProgress.js";

export async function getProgress(req, res) {
  try {
    const rows = await UserProgress.find({ user_id: req.user._id, completed: true }).select(
      "question_id completed",
    );
    res.json(
      rows.map((row) => ({
        question_id: row.question_id.toString(),
        completed: row.completed,
      })),
    );
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
}

export async function setProgress(req, res) {
  try {
    const { question_id, completed } = req.body;
    if (!question_id) {
      return res.status(400).json({ error: "question_id is required" });
    }

    const row = await UserProgress.findOneAndUpdate(
      { user_id: req.user._id, question_id },
      {
        user_id: req.user._id,
        question_id,
        completed: Boolean(completed),
        completed_at: completed ? new Date() : null,
      },
      { upsert: true, new: true },
    );

    res.json({
      question_id: row.question_id.toString(),
      completed: row.completed,
    });
  } catch (err) {
    console.error("Set progress error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
}
