import multer from "multer";
import path from "path";

export const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let extention = path.extname(file.originalname);
    if (
      extention !== ".jpg" &&
      extention !== ".jpeg" &&
      extention !== ".png" &&
      extention !== ".pdf"
    ) {
      cb(new Error("File type not supported"), false);
      return;
    }

    cb(null, true);
  },
});