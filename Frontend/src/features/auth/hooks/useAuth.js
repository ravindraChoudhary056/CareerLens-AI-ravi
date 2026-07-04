import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { verifyOtp } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data?.user) {
                setUser(data.user)
            }
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            // do not set user here; only mark verified after OTP
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return { success: true }
        } catch (err) {
            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async ({ email, code }) => {
        setLoading(true)
        try {
            const data = await verifyOtp({ email, code })
            if (data?.user) {
                setUser(data.user)
            }
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data?.user ?? null)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout, handleVerifyOtp }
}