const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const otpModel = require("../models/otp.model")
const otpGenerator = require("otp-generator")
const { sendMail } = require("../services/mail.service")

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
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
        const code = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, specialChars: false, alphabets: false })
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await otpModel.create({ user: user._id, code, expiresAt })

        const subject = "Your verification code"
        const html = `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`
        await sendMail({ to: user.email, subject, html })

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
        console.error("Failed to send verification email:", err)
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

    const { email, password } = req.body

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

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
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

    res.clearCookie("token")

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
    const { email, code } = req.body

    if (!email || !code) {
        return res.status(400).json({ message: "Please provide email and code" })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({ message: "Invalid request" })
    }

    const otp = await otpModel.findOne({ user: user._id, code })

    if (!otp) {
        return res.status(400).json({ message: "Invalid or expired code" })
    }

    if (otp.expiresAt < new Date()) {
        await otpModel.deleteMany({ user: user._id })
        return res.status(400).json({ message: "Code expired" })
    }

    user.isVerified = true
    await user.save()

    await otpModel.deleteMany({ user: user._id })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    return res.status(200).json({ message: "Email verified successfully", user: { id: user._id, username: user.username, email: user.email } })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    verifyOtpController
}
