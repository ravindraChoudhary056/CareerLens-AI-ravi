const cloudinary = require("../config/cloudinary.config")
const resumeModel = require("../models/resume.model")

/**
 * @description Upload resume to Cloudinary and save metadata in MongoDB
 */
async function uploadResumeController(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Please upload a resume file." })
    }

    try {
        const userId = req.user.id

        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: `resume-ai/users/${userId}/resumes`,
                    public_id: `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
                    access_mode: "authenticated",
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            stream.end(req.file.buffer)
        })

        const resume = await resumeModel.create({
            userId,
            originalFilename: req.file.originalname,
            cloudinaryPublicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            fileSize: result.bytes || req.file.size,
            format: result.format || "pdf",
        })

        res.status(201).json({
            message: "Resume uploaded successfully.",
            resume: {
                id: resume._id,
                originalFilename: resume.originalFilename,
                fileSize: resume.fileSize,
                createdAt: resume.createdAt,
            }
        })
    } catch (err) {
        console.error("Resume upload error:", err.message)
        res.status(500).json({ message: "Failed to upload resume. Please try again." })
    }
}

/**
 * @description Get all resumes for the logged-in user
 */
async function getMyResumesController(req, res) {
    const resumes = await resumeModel.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select("originalFilename fileSize createdAt format")

    res.status(200).json({
        message: "Resumes fetched successfully.",
        resumes
    })
}

/**
 * @description Get a single resume by ID (ownership check)
 */
async function getResumeByIdController(req, res) {
    const resume = await resumeModel.findOne({
        _id: req.params.id,
        userId: req.user.id
    })

    if (!resume) {
        return res.status(404).json({ message: "Resume not found." })
    }

    res.status(200).json({
        message: "Resume fetched successfully.",
        resume: {
            id: resume._id,
            originalFilename: resume.originalFilename,
            fileSize: resume.fileSize,
            createdAt: resume.createdAt,
            format: resume.format,
        }
    })
}

/**
 * @description Generate a time-limited signed download URL (ownership check)
 */
async function downloadResumeController(req, res) {
    const resume = await resumeModel.findOne({
        _id: req.params.id,
        userId: req.user.id
    })

    if (!resume) {
        return res.status(404).json({ message: "Resume not found." })
    }

    try {
        // Generate a signed URL valid for 10 minutes
        const signedUrl = cloudinary.utils.private_download_url(
            resume.cloudinaryPublicId,
            resume.format || "pdf",
            {
                resource_type: "raw",
                expires_at: Math.floor(Date.now() / 1000) + 600,
            }
        )

        res.status(200).json({
            message: "Download URL generated.",
            downloadUrl: signedUrl,
            filename: resume.originalFilename,
        })
    } catch (err) {
        console.error("Download URL generation error:", err.message)
        res.status(500).json({ message: "Failed to generate download link." })
    }
}

/**
 * @description Delete resume from Cloudinary + MongoDB (ownership check)
 */
async function deleteResumeController(req, res) {
    const resume = await resumeModel.findOne({
        _id: req.params.id,
        userId: req.user.id
    })

    if (!resume) {
        return res.status(404).json({ message: "Resume not found." })
    }

    try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(resume.cloudinaryPublicId, {
            resource_type: "raw"
        })
    } catch (err) {
        console.error("Cloudinary delete error:", err.message)
        // Continue to delete from DB even if Cloudinary fails
    }

    await resumeModel.deleteOne({ _id: resume._id })

    res.status(200).json({ message: "Resume deleted successfully." })
}

module.exports = {
    uploadResumeController,
    getMyResumesController,
    getResumeByIdController,
    downloadResumeController,
    deleteResumeController,
}
