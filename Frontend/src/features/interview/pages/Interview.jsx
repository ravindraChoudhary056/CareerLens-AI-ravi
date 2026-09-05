import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, useNavigate } from 'react-router'
import { useToast } from '../../../components/ToastProvider.jsx'

const NAV_ITEMS = [
    { id: 'analysis', label: 'Analysis', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>) },
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen((value) => !value)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

const ScoreBar = ({ label, value }) => {
    const color = value >= 80 ? '#3fb950' : value >= 60 ? '#f5a623' : '#ff4d4d'
    return (
        <div className='score-bar'>
            <div className='score-bar__header'>
                <span>{label}</span>
                <span className='score-bar__value'>{value ?? 0}%</span>
            </div>
            <div className='score-bar__track'>
                <div className='score-bar__fill' style={{ width: `${value ?? 0}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

const Interview = () => {
    const [activeNav, setActiveNav] = useState('analysis')
    const { report, getReportById, loading, getResumePdf, removeReport, generateMoreQuestions } = useInterview()
    const [isDownloadingResume, setIsDownloadingResume] = useState(false)
    const [moreQuestionsLoading, setMoreQuestionsLoading] = useState(null) // 'technical' or 'behavioral'
    const [technicalDifficulty, setTechnicalDifficulty] = useState('medium')
    const [behavioralDifficulty, setBehavioralDifficulty] = useState('medium')
    const { interviewId } = useParams()
    const { pushToast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    const handleDownloadResume = async () => {
        setIsDownloadingResume(true)
        const result = await getResumePdf(interviewId)
        setIsDownloadingResume(false)
        if (result?.success) {
            pushToast('Resume downloaded', 'success')
        } else {
            pushToast('Failed to download resume', 'error')
        }
    }

    const handleGenerateMoreQuestions = async (type) => {
        setMoreQuestionsLoading(type)
        const difficulty = type === 'technical' ? technicalDifficulty : behavioralDifficulty
        const success = await generateMoreQuestions({ interviewId, type, difficulty, count: 3 })
        if (success) {
            pushToast(`Added more ${type} questions!`, 'success')
        } else {
            pushToast('Failed to generate more questions', 'error')
        }
        setMoreQuestionsLoading(null)
    }

    const handleDeleteReport = async () => {
        if (!window.confirm('Delete this interview report? This cannot be undone.')) return
        const result = await removeReport(interviewId)
        if (result?.success) {
            pushToast('Report deleted', 'success')
            navigate('/')
        } else {
            pushToast('Failed to delete report', 'error')
        }
    }

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='loading-screen__card'>
                    <div className='loading-screen__ring' />
                    <h1>Loading your interview plan…</h1>
                </div>
            </main>
        )
    }

    const scoreColor = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>
                <nav className='interview-nav'>
                    <div className='nav-content'>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className='interview-nav__actions'>
                        <button onClick={handleDownloadResume} className='button primary-button' disabled={isDownloadingResume}>
                            <svg height='0.8rem' style={{ marginRight: '0.65rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                            {isDownloadingResume ? 'Downloading Resume...' : 'Download Resume'}
                        </button>
                        <button onClick={handleDeleteReport} className='button delete-btn'>
                            Delete Report
                        </button>
                    </div>
                </nav>

                <div className='interview-divider' />

                <main className='interview-content'>
                    
                    {activeNav === 'analysis' && (
                        <section>
                            <div className='content-header'>
                                <h2>Match Analysis</h2>
                                <span className='content-header__count'>{report.title}</span>
                            </div>
                            
                            <div className='analysis-grid'>
                                <div className='analysis-overall'>
                                    <div className={`match-score__ring match-score__ring--large ${scoreColor}`}>
                                        <span className='match-score__value'>{report.matchScore}</span>
                                        <span className='match-score__pct'>%</span>
                                    </div>
                                    <p className='analysis-overall__label'>Overall Match</p>
                                </div>

                                <div className='analysis-breakdown'>
                                    <ScoreBar label='Skill Match' value={report.skillMatch} />
                                    <ScoreBar label='Experience Match' value={report.experienceMatch} />
                                    <ScoreBar label='Education Match' value={report.educationMatch} />
                                    <ScoreBar label='Project Relevance' value={report.projectMatch} />
                                    <ScoreBar label='ATS Keywords' value={report.keywordMatch} />
                                </div>
                            </div>

                            {(report.matchedSkills?.length > 0 || report.missingSkills?.length > 0) && (
                                <div className='skills-section'>
                                    {report.matchedSkills?.length > 0 && (
                                        <div className='skills-block'>
                                            <h3 className='skills-block__title skills-block__title--matched'>Matched Skills</h3>
                                            <div className='skills-block__tags'>
                                                {report.matchedSkills.map((skill, i) => (
                                                    <span key={i} className='skill-tag skill-tag--low'>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {report.missingSkills?.length > 0 && (
                                        <div className='skills-block'>
                                            <h3 className='skills-block__title skills-block__title--missing'>Missing Skills</h3>
                                            <div className='skills-block__tags'>
                                                {report.missingSkills.map((skill, i) => (
                                                    <span key={i} className='skill-tag skill-tag--high'>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                            <div className='more-questions-actions' style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <select 
                                    className='select-input' 
                                    style={{ padding: '0.5rem', borderRadius: '4px', background: '#1c1c1e', color: '#fff', border: '1px solid #333' }}
                                    value={technicalDifficulty} 
                                    onChange={(e) => setTechnicalDifficulty(e.target.value)}
                                >
                                    <option value='easy'>Easy</option>
                                    <option value='medium'>Medium</option>
                                    <option value='hard'>Hard</option>
                                </select>
                                <button 
                                    className='button primary-button' 
                                    onClick={() => handleGenerateMoreQuestions('technical')}
                                    disabled={moreQuestionsLoading === 'technical'}
                                >
                                    {moreQuestionsLoading === 'technical' ? 'Generating...' : 'Add More Questions'}
                                </button>
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                            <div className='more-questions-actions' style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <select 
                                    className='select-input' 
                                    style={{ padding: '0.5rem', borderRadius: '4px', background: '#1c1c1e', color: '#fff', border: '1px solid #333' }}
                                    value={behavioralDifficulty} 
                                    onChange={(e) => setBehavioralDifficulty(e.target.value)}
                                >
                                    <option value='easy'>Easy</option>
                                    <option value='medium'>Medium</option>
                                    <option value='hard'>Hard</option>
                                </select>
                                <button 
                                    className='button primary-button' 
                                    onClick={() => handleGenerateMoreQuestions('behavioral')}
                                    disabled={moreQuestionsLoading === 'behavioral'}
                                >
                                    {moreQuestionsLoading === 'behavioral' ? 'Generating...' : 'Add More Questions'}
                                </button>
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                <aside className='interview-sidebar'>
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>
                            {report.matchScore >= 80 ? 'Strong match for this role' :
                             report.matchScore >= 60 ? 'Moderate match — focus on gaps' :
                             'Needs improvement — review roadmap'}
                        </p>
                    </div>

                    <div className='sidebar-card'>
                        <p className='sidebar-card__label'>Missing Skills</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className='sidebar-card'>
                        <p className='sidebar-card__label'>Improvement Plan</p>
                        <ul className='sidebar-card__list'>
                            {report.preparationPlan.slice(0, 3).map((day, index) => (
                                <li key={index}>{day.focus}</li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview