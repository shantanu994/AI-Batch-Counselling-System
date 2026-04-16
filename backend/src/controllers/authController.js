const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { createToken } = require("../services/tokenService");

async function register(req, res, next) {
  try {
    const { name, email, password, role = "student" } = req.body;
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role]
    );

    const user = { id: result.insertId, name, email, role };
    const token = createToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = createToken(payload);

    return res.json({ token, user: payload });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
