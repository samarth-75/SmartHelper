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
