import api from "../../../api"

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Registration failed. Please try again."
        throw new Error(message)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Login failed. Please try again."
        const error = new Error(message)
        // Attach extra data for unverified user handling
        if (err.response?.data?.requiresVerification) {
            error.requiresVerification = true
            error.email = err.response.data.email
        }
        throw error
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Logout failed."
        throw new Error(message)
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // Don't throw on 401 — handled by interceptor
        return null
    }
}

export async function verifyOtp({ email, code }) {
    try {
        const response = await api.post('/api/auth/verify-otp', { email, code })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Verification failed. Please try again."
        throw new Error(message)
    }
}

export async function resendOtp({ email }) {
    try {
        const response = await api.post('/api/auth/resend-otp', { email })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Failed to resend code."
        const error = new Error(message)
        error.retryAfter = err.response?.data?.retryAfter
        throw error
    }
}