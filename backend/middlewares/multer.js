import multer from "multer";

// Set up multer to use disk storage
const storage = multer.diskStorage({
    // Destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    // Rename the file to avoid name collisions
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Prefix with timestamp
    }
});

// Create the multer instance
const upload = multer({ storage });

export default upload;
