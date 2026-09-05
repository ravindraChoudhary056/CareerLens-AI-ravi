import React, { useRef, useState } from 'react'
import { useResume } from '../hooks/useResume'
import { useToast } from '../../../components/ToastProvider'
import './resume.scss'

const formatFileSize = (bytes) => {
    if (!bytes) return '—'
    const units = ['B', 'KB', 'MB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex += 1
    }
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const MyResumes = () => {
    const { resumes, loading, handleUpload, handleDownload, handleDelete } = useResume()
    const { pushToast } = useToast()
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const onFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            pushToast('File must be smaller than 5MB', 'error')
            return
        }

        setUploading(true)
        const result = await handleUpload(file)
        setUploading(false)

        if (result.success) {
            pushToast('Resume uploaded successfully', 'success')
        } else {
            pushToast(result.error || 'Upload failed', 'error')
        }

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const onDownload = async (resume) => {
        const result = await handleDownload(resume._id, resume.originalFilename)
        if (result.success) {
            pushToast('Download started', 'success')
        } else {
            pushToast(result.error || 'Download failed', 'error')
        }
    }

    const onDelete = async (resume) => {
        if (!window.confirm(`Delete "${resume.originalFilename}"? This cannot be undone.`)) return
        const result = await handleDelete(resume._id)
        if (result.success) {
            pushToast('Resume deleted', 'success')
        } else {
            pushToast(result.error || 'Delete failed', 'error')
        }
    }

    return (
        <div className='resumes-page'>
            <header className='resumes-page__header'>
                <div>
                    <h1>My Resumes</h1>
                    <p>Manage your uploaded resumes. Download or delete them anytime.</p>
                </div>
                <button
                    className='upload-resume-btn'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                    {uploading ? 'Uploading…' : 'Upload Resume'}
                </button>
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf'
                    hidden
                    onChange={onFileChange}
                />
            </header>

            {loading && resumes.length === 0 ? (
                <div className='resumes-empty'>
                    <div className='loading-screen__ring' />
                    <p>Loading your resumes…</p>
                </div>
            ) : resumes.length === 0 ? (
                <div className='resumes-empty'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <h3>No resumes yet</h3>
                    <p>Upload your first resume to get started with AI-powered analysis.</p>
                    <button className='upload-resume-btn' onClick={() => fileInputRef.current?.click()}>
                        Upload your first resume
                    </button>
                </div>
            ) : (
                <div className='resumes-grid'>
                    {resumes.map((resume) => (
                        <div key={resume._id} className='resume-card'>
                            <div className='resume-card__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </div>
                            <div className='resume-card__info'>
                                <h3 className='resume-card__name'>{resume.originalFilename}</h3>
                                <p className='resume-card__meta'>
                                    {formatFileSize(resume.fileSize)} • {new Date(resume.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <div className='resume-card__actions'>
                                <button className='resume-action resume-action--download' onClick={() => onDownload(resume)} title='Download'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                </button>
                                <button className='resume-action resume-action--delete' onClick={() => onDelete(resume)} title='Delete'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyResumes
