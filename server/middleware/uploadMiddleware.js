import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directories if they don't exist
const packageUploadsDir = "./uploads/packages";
const reviewUploadsDir = "./uploads/reviews";

if (!fs.existsSync(packageUploadsDir)) {
  fs.mkdirSync(packageUploadsDir, { recursive: true });
}

if (!fs.existsSync(reviewUploadsDir)) {
  fs.mkdirSync(reviewUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on route
    if (req.path.includes("/reviews") || req.baseUrl.includes("/reviews")) {
      cb(null, reviewUploadsDir);
    } else {
      cb(null, packageUploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png) are allowed!"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: fileFilter,
});

export default upload;
