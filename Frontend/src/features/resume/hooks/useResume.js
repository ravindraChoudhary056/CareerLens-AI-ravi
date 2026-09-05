import { useContext, useEffect, useCallback } from "react"
import { ResumeContext } from "../resume.context"
import * as resumeApi from "../services/resume.api"

export const useResume = () => {
    const context = useContext(ResumeContext)

    if (!context) {
        throw new Error("useResume must be used within a ResumeProvider")
    }

    const { resumes, setResumes, loading, setLoading } = context

    const fetchResumes = useCallback(async () => {
        setLoading(true)
        try {
            const data = await resumeApi.getMyResumes()
            setResumes(data.resumes || [])
        } catch (err) {
            console.error("Failed to fetch resumes:", err.message)
        } finally {
            setLoading(false)
        }
    }, [setResumes, setLoading])

    const handleUpload = async (file) => {
        setLoading(true)
        try {
            const data = await resumeApi.uploadResume(file)
            await fetchResumes() // refresh list
            return { success: true, data }
        } catch (err) {
            const message = err.response?.data?.message || "Upload failed."
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (id, filename) => {
        try {
            const data = await resumeApi.downloadResume(id)
            // Open the signed download URL
            const link = document.createElement("a")
            link.href = data.downloadUrl
            link.setAttribute("download", filename || "resume.pdf")
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.message || "Download failed."
            return { success: false, error: message }
        }
    }

    const handleDelete = async (id) => {
        try {
            await resumeApi.deleteResume(id)
            setResumes(prev => prev.filter(r => r._id !== id))
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.message || "Delete failed."
            return { success: false, error: message }
        }
    }

    useEffect(() => {
        fetchResumes()
    }, [fetchResumes])

    return { resumes, loading, handleUpload, handleDownload, handleDelete, fetchResumes }
}
