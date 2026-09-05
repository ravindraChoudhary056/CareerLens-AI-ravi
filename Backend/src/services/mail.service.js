const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

/**
 * Build a professional OTP email template
 */
function buildOtpEmailHtml(code) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
        <tr><td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#0b1120,#1a2744);padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">CareerLens AI</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#8aa0b8;">AI-Powered Resume Intelligence</p>
            </td></tr>
            <tr><td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a2e;">Verify your email address</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">Enter the code below to verify your account. This code expires in <strong>10 minutes</strong>.</p>
              <div style="text-align:center;margin:0 0 24px;">
                <span style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:8px;color:#1a1a2e;background:#f0f4ff;border:2px dashed #4fc3ff;border-radius:12px;padding:16px 32px;">${code}</span>
              </div>
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">If you didn't request this code, you can safely ignore this email.</p>
            </td></tr>
            <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#b0b8c4;">&copy; ${new Date().getFullYear()} CareerLens AI. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`
}

async function sendMail({ to, subject, html, text }) {
    const msg = {
        from: `"CareerLens AI" <${process.env.EMAIL_USER}>`,
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
        console.error('sendMail error:', err.message)
        throw err
    }
}

module.exports = { sendMail, buildOtpEmailHtml }
