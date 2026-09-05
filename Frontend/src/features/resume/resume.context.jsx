import { createContext, useState } from "react"

export const ResumeContext = createContext()

export const ResumeProvider = ({ children }) => {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(false)

    return (
        <ResumeContext.Provider value={{ resumes, setResumes, loading, setLoading }}>
            {children}
        </ResumeContext.Provider>
    )
}
