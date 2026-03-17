import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_BASE_PATH = path.join(process.cwd(), 'uploads', 'reports');

// Ensure base folder exists
if (!fs.existsSync(UPLOAD_BASE_PATH)) {
  fs.mkdirSync(UPLOAD_BASE_PATH, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_BASE_PATH);
  },
  // Generate unique filenames
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadReportImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});
