import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { formatUser } from "../utils/formatters.js";

async function assignRoleForNewUser() {
  const adminExists = await User.exists({ role: "admin" });
  return adminExists ? "user" : "admin";
}

export async function register(req, res) {
  try {
    const { email, password, username } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const cleanUsername = username?.trim().toLowerCase();
    if (!cleanUsername) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return res
        .status(400)
        .json({ error: "Username must be 3-30 characters (letters, numbers, underscores only)" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const usernameTaken = await User.findOne({ username: cleanUsername });
    if (usernameTaken) {
      return res.status(409).json({ error: "That username is already taken" });
    }

    const role = await assignRoleForNewUser();
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      username: cleanUsername,
      role,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function me(req, res) {
  res.json({ user: formatUser(req.user) });
}

export async function googleCallback(req, res) {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    if (!req.user) {
      return res.redirect(`${clientUrl}/auth?error=google_failed`);
    }
    const token = signToken(req.user);
    res.redirect(`${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google callback error:", err);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth?error=google_failed`);
  }
}

export async function findOrCreateGoogleUser(profile) {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) return null;

  let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
  if (user) {
    if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }
    return user;
  }

  const role = await assignRoleForNewUser();
  user = await User.create({
    email,
    googleId: profile.id,
    name: profile.displayName || email.split("@")[0],
    role,
  });
  return user;
}
