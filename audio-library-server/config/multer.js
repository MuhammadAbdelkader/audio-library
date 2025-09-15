const multer = require("multer");
const path = require("path");
const fs = require("fs");

// File filters
const audioTypes = [".mp3", ".m4a"];
const imageTypes = [".jpg", ".jpeg", ".png"];

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user?._id?.toString() || "anonymous";
    let subFolder = "others";

    if (file.fieldname === "audio") {
      subFolder = `audio/user_${userId}`;
    } else if (file.fieldname === "cover") {
      subFolder = `covers/user_${userId}`;
    } else if (file.fieldname === "profilePic") {
      subFolder = `profiles/user_${userId}`;
    }

    const folderPath = path.join("uploads", subFolder);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

// File filter: Only allow certain types
const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "audio" && audioTypes.includes(ext)) {
    cb(null, true);
  } else if ((file.fieldname === "cover" || file.fieldname === "profilePic") && imageTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// File size limits
const limits = {
  fileSize: 50 * 1024 * 1024, // max 50MB per file
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;


