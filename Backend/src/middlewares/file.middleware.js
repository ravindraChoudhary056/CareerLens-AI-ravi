const multer = require("multer")

const ALLOWED_MIMETYPES = [
    "application/pdf",
]

const ALLOWED_EXTENSIONS = /\.(pdf)$/i

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB (matches frontend messaging)
    },
    fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
            return cb(new Error("Only PDF files are allowed."), false)
        }

        // Check file extension
        if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
            return cb(new Error("Invalid file extension. Only .pdf files are allowed."), false)
        }

        cb(null, true)
    }
})


module.exports = upload