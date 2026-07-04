import React, { useMemo, useRef, useState } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { useToast } from '../../../components/ToastProvider.jsx'

const MAX_CHARS = 5000

const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const units = ['B', 'KB', 'MB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex += 1
    }
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const resumeInputRef = useRef()
    const navigate = useNavigate()
    const { pushToast } = useToast()

    const charCount = jobDescription.length
    const remainingChars = MAX_CHARS - charCount
    const counterTone = useMemo(() => {
        if (remainingChars <= 250) return 'danger'
        if (remainingChars <= 750) return 'warning'
        return 'neutral'
    }, [remainingChars])

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0] || selectedFile || null

        if (!jobDescription.trim() && !selfDescription.trim() && !resumeFile) {
            pushToast('Add a job description, profile summary, or resume to continue.', 'error')
            return
        }

        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) {
            pushToast('Strategy generated successfully', 'success')
            navigate(`/interview/${data._id}`)
        } else {
            pushToast('We could not generate the plan. Please try again.', 'error')
        }
    }

    const onFileSelect = (file) => {
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            pushToast('Resume must be smaller than 5MB.', 'error')
            return
        }
        setSelectedFile(file)
        pushToast(`Loaded ${file.name}`, 'success')
    }

    const onInputChange = (event) => {
        const file = event.target.files?.[0]
        onFileSelect(file)
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ''
        }
        pushToast('Resume removed', 'info')
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='loading-screen__card'>
                    <div className='loading-screen__ring' />
                    <h1>Building your interview strategy…</h1>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <header className='page-header'>
                <div className='page-header__eyebrow'>CareerLens AI</div>
                <h1>Create a <span className='highlight'>premium interview plan</span> in minutes</h1>
                <p>AI-Powered Resume Intelligence & Career Optimization Platform for stronger positioning and interview readiness.</p>
            </header>

            <div className='interview-card'>
                <div className='interview-card__body'>
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <div>
                                <h2>Target role</h2>
                                <p className='panel__sub'>Paste the position details the interviewer is likely to evaluate.</p>
                            </div>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(event) => setJobDescription(event.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. Senior Frontend Engineer at a high-growth SaaS company seeks React, TypeScript, and product intuition.`}
                            maxLength={MAX_CHARS}
                            value={jobDescription}
                        />
                        <div className={`char-counter char-counter--${counterTone}`}>
                            <span>{charCount}</span> / {MAX_CHARS} characters · <strong>{remainingChars} left</strong>
                        </div>
                    </div>

                    <div className='panel-divider' />

                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <div>
                                <h2>Your profile</h2>
                                <p className='panel__sub'>Upload a resume or give a concise self-summary.</p>
                            </div>
                        </div>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Resume upload
                                <span className='badge badge--best'>Best results</span>
                            </label>
                            <label
                                className={`dropzone ${dragActive ? 'dropzone--active' : ''} ${selectedFile ? 'dropzone--success' : ''}`}
                                htmlFor='resume'
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setDragActive(true)
                                }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(event) => {
                                    event.preventDefault()
                                    setDragActive(false)
                                    onFileSelect(event.dataTransfer.files?.[0])
                                }}
                            >
                                <span className='dropzone__icon'>
                                    {selectedFile ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                {selectedFile ? (
                                    <div className='dropzone__content'>
                                        <p className='dropzone__title'>{selectedFile.name}</p>
                                        <p className='dropzone__subtitle'>{formatFileSize(selectedFile.size)} • Uploaded successfully</p>
                                        <div className='dropzone__actions'>
                                            <span className='dropzone__action'>Replace file</span>
                                            <button type='button' className='dropzone__action dropzone__action--ghost' onClick={(event) => { event.preventDefault(); removeFile() }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='dropzone__content'>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX • Max 5MB</p>
                                    </div>
                                )}
                                <input ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf,.docx' onChange={onInputChange} />
                            </label>
                        </div>

                        <div className='or-divider'><span>or</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick self-description</label>
                            <textarea
                                onChange={(event) => setSelfDescription(event.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, core strengths, and years of experience if you don't have a resume handy..."
                                value={selfDescription}
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#0b1120" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#0b1120" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>resume</strong> or a <strong>self-summary</strong> is enough to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-powered strategy generation • ~30 seconds</span>
                    <button onClick={handleGenerateReport} className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate my interview strategy
                    </button>
                </div>
            </div>

            {reports.length > 0 && (
                <section className='recent-reports'>
                    <div className='recent-reports__header'>
                        <h2>Recent interview plans</h2>
                        <p>Jump back into a previous strategy at any time.</p>
                    </div>
                    <ul className='reports-list'>
                        {reports.map((report) => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <div>
                                    <h3>{report.title || 'Untitled position'}</h3>
                                    <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <span>CareerLens AI</span>
                <a href='#'>Privacy policy</a>
                <a href='#'>Terms</a>
                <a href='#'>Help center</a>
            </footer>
        </div>
    )
}

export default Home