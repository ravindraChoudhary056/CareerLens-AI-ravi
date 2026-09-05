import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import Navbar from "../../../components/Navbar"
import PageTransition from "../../../components/PageTransition"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen">
                <div className="loading-screen__card">
                    <div className="loading-screen__ring" />
                    <h1>Preparing your workspace…</h1>
                </div>
            </main>
        )
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return (
        <div className="app-shell">
            <Navbar />
            <PageTransition>{children}</PageTransition>
        </div>
    )
}

export default Protected