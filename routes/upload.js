
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const protect = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }

    cb(null, true);
  },
});

const generateFilename = (fullName) => {
  const name = (fullName || "Image")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return name || "Image";
};

router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image",
        });
      }
const metadata = await sharp(req.file.buffer).metadata();

if (!["jpeg", "png", "webp"].includes(metadata.format)) {
  return res.status(400).json({
    success: false,
    message: "Invalid image format",
  });
}
      const name = generateFilename(req.body.fullName);

      let filename = `${name}.webp`;
      let counter = 1;

      while (fs.existsSync(path.join(uploadDir, filename))) {
        filename = `${name}-${counter}.webp`;
        counter++;
      }

      const outputPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer)
        .rotate()
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log("Image saved:", outputPath);

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        image: `/uploads/${filename}`,
      });

    } catch (error) {
      console.error("Image upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Image conversion or saving failed",
      });
    }
  });
});

module.exports = router;
