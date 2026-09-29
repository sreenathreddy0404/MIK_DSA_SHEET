import { User } from "../models/User.js";
import { formatUser } from "../utils/formatters.js";

export async function listUsers(_req, res) {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.json(users.map(formatUser));
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
