const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://career-lens-ai-ravi.vercel.app"
    ],
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const resumeRouter = require("./routes/resume.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/resumes", resumeRouter)


/* Global error handling middleware */
app.use((err, req, res, next) => {
    // Handle Multer file size errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." })
    }

    // Handle Multer file filter errors
    if (err.message && (err.message.includes("Only PDF") || err.message.includes("Invalid file extension"))) {
        return res.status(400).json({ message: err.message })
    }

    // Log the error (don't log sensitive data)
    console.error("Unhandled error:", err.message)

    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    })
})


module.exports = app