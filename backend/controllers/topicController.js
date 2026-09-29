import { Topic } from "../models/Topic.js";
import { Question } from "../models/Question.js";
import { formatTopic } from "../utils/formatters.js";

export async function listTopics(req, res) {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { active: true };
    const topics = await Topic.find(filter).sort({ position: 1 });
    res.json(topics.map(formatTopic));
  } catch (err) {
    console.error("List topics error:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
}

export async function createTopic(req, res) {
  try {
    const { name, description, position } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Topic name is required" });
    }
    const topic = await Topic.create({
      name: name.trim(),
      description: description?.trim() || null,
      position: position ?? 0,
    });
    res.status(201).json(formatTopic(topic));
  } catch (err) {
    console.error("Create topic error:", err);
    res.status(500).json({ error: "Failed to create topic" });
  }
}

export async function updateTopic(req, res) {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_at: new Date() },
      { new: true, runValidators: true },
    );
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json(formatTopic(topic));
  } catch (err) {
    console.error("Update topic error:", err);
    res.status(500).json({ error: "Failed to update topic" });
  }
}

export async function deleteTopic(req, res) {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    await Question.deleteMany({ topic_id: topic._id });
    await topic.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete topic error:", err);
    res.status(500).json({ error: "Failed to delete topic" });
  }
}
