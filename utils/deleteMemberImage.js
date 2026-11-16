
const fs = require("fs");
const path = require("path");

const deleteMemberImage = async (image) => {
  try {
    if (!image || typeof image !== "string") return;

    // Only delete images stored in our uploads folder.
    // Never delete external URLs or default website images.
    const normalizedImage = image.replace(/\\/g, "/");

    if (!normalizedImage.startsWith("/uploads/") &&
        !normalizedImage.startsWith("uploads/")) {
      return;
    }

    const filename = path.basename(normalizedImage);

    if (!filename || filename === "." || filename === "..") return;

    // Make sure this matches your actual uploads directory.
    const uploadDirectory = path.resolve(process.cwd(), "uploads");
    const imagePath = path.join(uploadDirectory, filename);

    // Prevent paths outside the uploads directory.
    if (!imagePath.startsWith(uploadDirectory + path.sep)) return;

    await fs.promises.unlink(imagePath);

    console.log("Deleted member image:", filename);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Image deletion error:", error);
    }
  }
};

module.exports = deleteMemberImage;
