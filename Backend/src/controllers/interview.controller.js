const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, generateMoreQuestions } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const cloudinary = require("../config/cloudinary.config")
const resumeModel = require("../models/resume.model")
const { z } = require("zod")

// Validation schema for interview generation
const generateReportSchema = z.object({
    jobDescription: z.string().min(10, "Job description must be at least 10 characters").max(10000, "Job description is too long"),
    selfDescription: z.string().max(5000, "Self description is too long").optional().default(""),
    technicalCount: z.coerce.number().int().min(1, "Minimum 1 technical question").max(20, "Maximum 20 technical questions").optional().default(5),
    behavioralCount: z.coerce.number().int().min(1, "Minimum 1 behavioral question").max(15, "Maximum 15 behavioral questions").optional().default(3),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
})


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    // Validate body fields
    const parsed = generateReportSchema.safeParse(req.body)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message || "Invalid input"
        return res.status(400).json({ message: firstError })
    }

    const { jobDescription, selfDescription, technicalCount, behavioralCount, difficulty } = parsed.data

    let resumeContent = { text: "" }
    let savedResumeId = null

    // Parse resume PDF if uploaded
    if (req.file) {
        try {
            resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        } catch (err) {
            console.error("PDF parse error:", err.message)
            return res.status(400).json({ message: "Failed to parse the uploaded PDF. Please ensure it's a valid PDF file." })
        }

        // Upload resume to Cloudinary
        try {
            const userId = req.user.id
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

            const savedResume = await resumeModel.create({
                userId,
                originalFilename: req.file.originalname,
                cloudinaryPublicId: result.public_id,
                secureUrl: result.secure_url,
                resourceType: result.resource_type,
                fileSize: result.bytes || req.file.size,
                format: result.format || "pdf",
            })
            savedResumeId = savedResume._id
        } catch (err) {
            console.error("Resume upload to Cloudinary failed:", err.message)
            // Don't block report generation if Cloudinary fails
        }
    }

    try {
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            technicalCount,
            behavioralCount,
            difficulty,
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            technicalCount,
            behavioralCount,
            difficulty,
            resumeId: savedResumeId,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Interview report generation error:", err.message)
        res.status(500).json({ message: err.message || "Failed to generate interview report. Please try again." })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -matchedSkills -missingSkills")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    // Ownership check: ensure the report belongs to the authenticated user
    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    try {
        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("Resume PDF generation error:", err.message)
        res.status(500).json({ message: "Failed to generate resume PDF. Please try again." })
    }
}


/**
 * @description Controller to delete an interview report.
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params

    const report = await interviewReportModel.findOneAndDelete({
        _id: interviewId,
        user: req.user.id
    })

    if (!report) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({ message: "Interview report deleted successfully." })
}
/**
 * @description Controller to generate more questions for an existing interview report.
 */
async function generateMoreQuestionsController(req, res) {
    const { interviewId } = req.params
    const { type, difficulty, count } = req.body

    if (!type || !["technical", "behavioral"].includes(type)) {
        return res.status(400).json({ message: "Invalid question type" })
    }

    const report = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    })

    if (!report) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    try {
        const { resume, jobDescription, selfDescription } = report
        const newQuestions = await generateMoreQuestions({
            resume,
            jobDescription,
            selfDescription,
            type,
            difficulty: difficulty || "medium",
            count: count || 3
        })

        // Append questions to the respective array
        if (type === "technical") {
            report.technicalQuestions.push(...newQuestions)
        } else {
            report.behavioralQuestions.push(...newQuestions)
        }

        await report.save()

        res.status(200).json({
            message: "More questions generated successfully.",
            newQuestions,
            report
        })
    } catch (err) {
        console.error("More questions generation error:", err.message)
        res.status(500).json({ message: "Failed to generate more questions. Please try again." })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController,
    generateMoreQuestionsController
}