const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// optional: create TTL index to auto-remove expired otps
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const otpModel = mongoose.model('otps', otpSchema)

module.exports = otpModel
