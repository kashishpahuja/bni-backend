const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      !password ||
      !process.env.ADMIN_PASSWORD_HASH
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const hash = process.env.ADMIN_PASSWORD_HASH;

    const isValid = await bcrypt.compare(
      password,
      hash
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }


const normalizedEmail = email?.trim().toLowerCase();

if (
  normalizedEmail !== process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
  !password ||
  !process.env.ADMIN_PASSWORD_HASH
) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
}


const token = jwt.sign(
  { email: normalizedEmail, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      success: true,
      token,
      admin: { email },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;