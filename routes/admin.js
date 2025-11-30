// routes/admin.js
import express from "express";
import {auth, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// 🧮 Admin summary – basic stats
router.get("/admin/summary", auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: "admin" });
    const normalUsers = totalUsers - admins;

    // placeholder values, adjust later when you have books, etc.
    res.json({
      totalUsers,
      admins,
      normalUsers,
      totalBooks: 0,
      borrowedBooks: 0,
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 👥 List all users (no passwords)
router.get("/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
