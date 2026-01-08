import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const register = (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
    if (row) return res.status(400).json({ error: "User already exists" });

    db.run(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hashed, role],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Registration failed" });
        }
        res.json({ message: "Registered successfully" });
      }
    );
  });
};


export const login = (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!bcrypt.compareSync(password, user.password))
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  });
};

// Issue a short-lived Chatbase identity token for the authenticated user
export const chatbaseToken = (req, res) => {
  // req.user is set by the `protect` middleware (contains id and role)
  if (!req.user || !req.user.id) {
    console.warn('chatbaseToken called without authenticated user');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!process.env.CHATBOT_IDENTITY_SECRET) {
    console.error('CHATBOT_IDENTITY_SECRET is not set. Cannot sign chatbase identity tokens.');
    return res.status(500).json({ error: 'Chatbase identity secret not configured' });
  }

  db.get("SELECT id, email, stripe_accounts FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      console.error('DB error while fetching user for chatbaseToken', err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    const payload = {
      user_id: user.id,
      email: user.email,
    };

    // If stripe_accounts stored as JSON text, try to parse it (optional)
    try {
      if (user.stripe_accounts) payload.stripe_accounts = JSON.parse(user.stripe_accounts);
    } catch (e) {
      // leave as-is if parsing fails
      payload.stripe_accounts = user.stripe_accounts;
    }

    try {
      const cbToken = jwt.sign(payload, process.env.CHATBOT_IDENTITY_SECRET, { expiresIn: '1h' });
      res.json({ token: cbToken });
    } catch (e) {
      console.error('Failed to sign Chatbase token', e);
      res.status(500).json({ error: 'Failed to create chatbase token' });
    }
  });
};
