const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const otpModel = require("../models/otp.model")
const otpGenerator = require("otp-generator")
const { sendMail, buildOtpEmailHtml } = require("../services/mail.service")
const { z } = require("zod")

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters").max(30, "Username must be at most 30 characters").trim(),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
})

const loginSchema = z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
})

const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    code: z.string().length(4, "Code must be 4 characters"),
})

const resendOtpSchema = z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
})

// ── Cookie helper ────────────────────────────────────────────────────────────

function setAuthCookie(res, token) {
    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
    })
}

// ── OTP helper ───────────────────────────────────────────────────────────────

async function generateAndSendOtp(user) {
    // Invalidate any previous OTPs for this user
    await otpModel.deleteMany({ user: user._id })

    const code = otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    })

    const hashedCode = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await otpModel.create({ user: user._id, code: hashedCode, expiresAt })

    const subject = "Your CareerLens AI Verification Code"
    const html = buildOtpEmailHtml(code)
    await sendMail({ to: user.email, subject, html })
}

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    // Validate request body
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message || "Invalid input"
        return res.status(400).json({ message: firstError })
    }

    const { username, email, password } = parsed.data

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    // generate OTP and send verification email
    try {
        await generateAndSendOtp(user)

        // do not sign/token or set cookie here — require verification first
        return res.status(201).json({
            message: "Verification code sent to email",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("Failed to send verification email:", err.message)
        // cleanup the otp if created and inform client
        await otpModel.deleteMany({ user: user._id })
        return res.status(500).json({ message: "Failed to send verification email. Please try again later." })
    }
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    // Validate request body
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message || "Invalid input"
        return res.status(400).json({ message: firstError })
    }

    const { email, password } = parsed.data

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Block login if email is not verified
    if (!user.isVerified) {
        return res.status(403).json({
            message: "Email not verified. Please verify your email before logging in.",
            requiresVerification: true,
            email: user.email
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    setAuthCookie(res, token)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name verifyOtpController
 * @description verify otp sent to user's email
 * @access Public
 */
async function verifyOtpController(req, res) {
    // Validate request body
    const parsed = verifyOtpSchema.safeParse(req.body)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message || "Invalid input"
        return res.status(400).json({ message: firstError })
    }

    const { email, code } = parsed.data

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({ message: "Invalid request" })
    }

    // If already verified, don't allow re-verification
    if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified. Please login." })
    }

    const otp = await otpModel.findOne({ user: user._id })

    if (!otp) {
        return res.status(400).json({ message: "No verification code found. Please request a new one." })
    }

    // Check expiration first
    if (otp.expiresAt < new Date()) {
        await otpModel.deleteMany({ user: user._id })
        return res.status(400).json({ message: "Verification code has expired. Please request a new one." })
    }

    // Compare hashed OTP
    const isCodeValid = await bcrypt.compare(code, otp.code)
    if (!isCodeValid) {
        return res.status(400).json({ message: "Invalid verification code" })
    }

    user.isVerified = true
    await user.save()

    await otpModel.deleteMany({ user: user._id })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    setAuthCookie(res, token)

    return res.status(200).json({
        message: "Email verified successfully",
        user: { id: user._id, username: user.username, email: user.email }
    })
}


/**
 * @name resendOtpController
 * @description resend OTP to user's email with cooldown
 * @access Public
 */
async function resendOtpController(req, res) {
    // Validate request body
    const parsed = resendOtpSchema.safeParse(req.body)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message || "Invalid input"
        return res.status(400).json({ message: firstError })
    }

    const { email } = parsed.data

    const user = await userModel.findOne({ email })

    if (!user) {
        // Don't reveal whether the email exists
        return res.status(200).json({ message: "If an account exists, a new code has been sent." })
    }

    if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified. Please login." })
    }

    // Rate limiting: check if an OTP was created less than 60 seconds ago
    const existingOtp = await otpModel.findOne({ user: user._id })
    if (existingOtp) {
        const secondsSinceCreated = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000
        if (secondsSinceCreated < 60) {
            const waitSeconds = Math.ceil(60 - secondsSinceCreated)
            return res.status(429).json({
                message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
                retryAfter: waitSeconds
            })
        }
    }

    try {
        await generateAndSendOtp(user)
        return res.status(200).json({ message: "A new verification code has been sent to your email." })
    } catch (err) {
        console.error("Failed to resend verification email:", err.message)
        return res.status(500).json({ message: "Failed to send verification email. Please try again later." })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    verifyOtpController,
    resendOtpController
}
