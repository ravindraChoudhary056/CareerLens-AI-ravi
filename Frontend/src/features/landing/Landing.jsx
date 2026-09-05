import React from 'react'
import { Link } from 'react-router'
import './landing.scss'

const FEATURES = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        ),
        title: 'Resume Analysis',
        desc: 'Upload your resume and get a detailed match score against any job description with skill gap analysis.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        ),
        title: 'Technical Questions',
        desc: 'AI-generated technical interview questions tailored to your resume and target role with model answers.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ),
        title: 'Behavioral Questions',
        desc: 'Prepare for behavioral interview rounds with personalized STAR-method based questions.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        ),
        title: 'Personalized Roadmap',
        desc: 'Get a day-by-day preparation plan tailored to your specific skill gaps and the target position.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ),
        title: 'Secure Storage',
        desc: 'Your resumes are stored securely in the cloud. Access, download, or delete them anytime.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ),
        title: 'Interview History',
        desc: 'All your interview sessions are saved. Revisit questions, scores, and roadmaps whenever you need.',
    },
]

const Landing = () => {
    return (
        <div className='landing-page'>
            <header className='landing-nav'>
                <div className='landing-nav__brand'>
                    <span className='landing-nav__mark' />
                    <span className='landing-nav__name'>CareerLens AI</span>
                </div>
                <div className='landing-nav__actions'>
                    <Link to='/login' className='landing-nav__link'>Sign in</Link>
                    <Link to='/register' className='landing-nav__cta'>Get started</Link>
                </div>
            </header>

            <section className='landing-hero'>
                <p className='landing-hero__eyebrow'>AI-Powered Interview Preparation</p>
                <h1>Turn your resume into <span className='highlight'>interview confidence</span></h1>
                <p className='landing-hero__sub'>
                    Upload your resume, paste a job description, and get AI-generated match scores, interview questions, skill gap analysis, and a personalized preparation roadmap — all in one place.
                </p>
                <div className='landing-hero__actions'>
                    <Link to='/register' className='landing-hero__btn landing-hero__btn--primary'>Start free</Link>
                    <Link to='/login' className='landing-hero__btn landing-hero__btn--secondary'>Sign in</Link>
                </div>
            </section>

            <section className='landing-features'>
                <div className='landing-features__header'>
                    <p className='landing-features__eyebrow'>Everything you need</p>
                    <h2>Comprehensive interview preparation</h2>
                    <p>From resume analysis to mock interview questions — prepare smarter, not harder.</p>
                </div>
                <div className='landing-features__grid'>
                    {FEATURES.map((f, i) => (
                        <div key={i} className='feature-card'>
                            <div className='feature-card__icon'>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className='landing-cta'>
                <h2>Ready to ace your next interview?</h2>
                <p>Create your free account and start preparing with AI-powered insights today.</p>
                <Link to='/register' className='landing-hero__btn landing-hero__btn--primary'>Get started for free</Link>
            </section>

            <footer className='landing-footer'>
                <span>© {new Date().getFullYear()} CareerLens AI</span>
                <div className='landing-footer__links'>
                    <a href='#'>Privacy</a>
                    <a href='#'>Terms</a>
                    <a href='#'>Help</a>
                </div>
            </footer>
        </div>
    )
}

export default Landing
