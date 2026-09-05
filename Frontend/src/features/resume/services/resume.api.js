import api from "../../../api"

export const uploadResume = async (file) => {
    const formData = new FormData()
    formData.append("resume", file)

    const response = await api.post("/api/resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const getMyResumes = async () => {
    const response = await api.get("/api/resumes")
    return response.data
}

export const getResumeById = async (id) => {
    const response = await api.get(`/api/resumes/${id}`)
    return response.data
}

export const downloadResume = async (id) => {
    const response = await api.get(`/api/resumes/${id}/download`)
    return response.data
}

export const deleteResume = async (id) => {
    const response = await api.delete(`/api/resumes/${id}`)
    return response.data
}
