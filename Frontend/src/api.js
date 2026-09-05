import axios from "axios"

export const API_BASE_URL = "https://careerlens-ai-ravi.onrender.com";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

// Response interceptor: handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // If we get a 401 on any request (except login/register/verify/me), redirect to login
            const url = error.config?.url || ""
            const isAuthRoute = url.includes("/api/auth/login") || 
                               url.includes("/api/auth/register") || 
                               url.includes("/api/auth/verify-otp") ||
                               url.includes("/api/auth/resend-otp") ||
                               url.includes("/api/auth/me")
            
            if (!isAuthRoute && typeof window !== "undefined") {
                const path = window.location.pathname
                if (path !== "/login" && path !== "/register" && path !== "/landing") {
                    window.location.href = "/login"
                }
            }
        }
        return Promise.reject(error)
    }
)

export default api
