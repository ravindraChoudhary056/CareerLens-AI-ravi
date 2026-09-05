import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport, generateMoreQuestions as apiGenerateMoreQuestions } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, technicalCount, behavioralCount, difficulty }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({
                jobDescription, selfDescription, resumeFile,
                technicalCount, behavioralCount, difficulty
            })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            const message = error.response?.data?.message || "Failed to generate report"
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("Failed to fetch report:", error.message)
            return null
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("Failed to fetch reports:", error.message)
            return []
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            return { success: true }
        }
        catch (error) {
            console.error("Failed to generate PDF:", error.message)
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const removeReport = async (id) => {
        try {
            await deleteInterviewReport(id)
            setReports(prev => prev.filter(r => r._id !== id))
            return { success: true }
        } catch (error) {
            console.error("Failed to delete report:", error.message)
            return { success: false }
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    const generateMoreQuestions = async ({ interviewId, type, difficulty, count = 3 }) => {
        try {
            const response = await apiGenerateMoreQuestions({ interviewId, type, difficulty, count })
            setReport(response.report)
            return response.newQuestions
        } catch (error) {
            console.error("Failed to generate more questions:", error.message)
            return null
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, removeReport, generateMoreQuestions }

}