const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
})

async function sendMail({ to, subject, html, text }) {
    const msg = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
        html
    }

    try {
        const info = await transporter.sendMail(msg)
        console.log(`Email sent to ${to}: ${info.messageId}`)
        return info
    } catch (err) {
        console.error('sendMail error:', err)
        throw err
    }
}

module.exports = { sendMail }
