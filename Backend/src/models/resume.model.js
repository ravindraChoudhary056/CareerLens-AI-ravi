const mongoose = require("mongoose")

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    originalFilename: {
        type: String,
        required: [true, "Original filename is required"]
    },
    cloudinaryPublicId: {
        type: String,
        required: [true, "Cloudinary public ID is required"]
    },
    secureUrl: {
        type: String,
        required: [true, "Secure URL is required"]
    },
    resourceType: {
        type: String,
        default: "raw"
    },
    fileSize: {
        type: Number,
        default: 0
    },
    format: {
        type: String,
        default: "pdf"
    }
}, {
    timestamps: true
})

const resumeModel = mongoose.model("Resume", resumeSchema)

module.exports = resumeModel
