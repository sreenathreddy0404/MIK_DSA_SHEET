import { Topic } from "../models/Topic.js";
import { Question } from "../models/Question.js";
import { UserProgress } from "../models/UserProgress.js";
import { formatQuestion } from "../utils/formatters.js";

export async function listQuestions(req, res) {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { active: true };
    const questions = await Question.find(filter).sort({ position: 1 });
    res.json(questions.map((q) => formatQuestion(q)));
  } catch (err) {
    console.error("List questions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
}

export async function getQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    const topic = await Topic.findById(question.topic_id);
    res.json(formatQuestion(question, topic));
  } catch (err) {
    console.error("Get question error:", err);
    res.status(500).json({ error: "Failed to fetch question" });
  }
}

export async function createQuestion(req, res) {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(formatQuestion(question));
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ error: "Failed to create question" });
  }
}

export async function updateQuestion(req, res) {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_at: new Date() },
      { new: true, runValidators: true },
    );
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(formatQuestion(question));
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: "Failed to update question" });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    await UserProgress.deleteMany({ question_id: question._id });
    await question.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
}
