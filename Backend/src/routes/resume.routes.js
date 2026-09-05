const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const resumeController = require("../controllers/resume.controller")
const upload = require("../middlewares/file.middleware")

const resumeRouter = express.Router()

/**
 * @route POST /api/resumes
 * @description Upload a resume to Cloudinary
 * @access Private
 */
resumeRouter.post("/", authMiddleware.authUser, upload.single("resume"), resumeController.uploadResumeController)

/**
 * @route GET /api/resumes
 * @description Get all resumes of logged in user
 * @access Private
 */
resumeRouter.get("/", authMiddleware.authUser, resumeController.getMyResumesController)

/**
 * @route GET /api/resumes/:id
 * @description Get a single resume by ID
 * @access Private
 */
resumeRouter.get("/:id", authMiddleware.authUser, resumeController.getResumeByIdController)

/**
 * @route GET /api/resumes/:id/download
 * @description Get a signed download URL for a resume
 * @access Private
 */
resumeRouter.get("/:id/download", authMiddleware.authUser, resumeController.downloadResumeController)

/**
 * @route DELETE /api/resumes/:id
 * @description Delete a resume from Cloudinary + MongoDB
 * @access Private
 */
resumeRouter.delete("/:id", authMiddleware.authUser, resumeController.deleteResumeController)


module.exports = resumeRouter
