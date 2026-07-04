import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'
import FormField from '../../../components/FormField.jsx'
import { useToast } from '../../../components/ToastProvider.jsx'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const { pushToast } = useToast()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})

    const validate = () => {
        const nextErrors = {}
        if (!email.trim()) nextErrors.email = 'Email is required.'
        if (!password) nextErrors.password = 'Password is required.'
        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validate()) return
        const result = await handleLogin({ email, password })
        if (result?.success) {
            pushToast('Welcome back', 'success')
            navigate('/')
        } else {
            pushToast('Unable to sign in. Please check your credentials.', 'error')
        }
    }

    if (loading) {
        return (
            <main className='auth-shell'>
                <div className='loading-screen__card'>
                    <div className='loading-screen__ring' />
                    <h1>Checking your account…</h1>
                </div>
            </main>
        )
    }

    return (
        <main className='auth-shell'>
            <section className='auth-card'>
                <div className='auth-card__form'>
                    <div className='auth-card__head'>
                        <p className='auth-card__eyebrow'>Secure access</p>
                        <h1>Welcome back</h1>
                        <p>Sign in to continue refining your interview strategy.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <FormField
                            id='email'
                            label='Email'
                            type='email'
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value)
                                setErrors((current) => ({ ...current, email: '' }))
                            }}
                            placeholder='name@company.com'
                            autoComplete='email'
                            error={errors.email}
                        />
                        <FormField
                            id='password'
                            label='Password'
                            type='password'
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value)
                                setErrors((current) => ({ ...current, password: '' }))
                            }}
                            placeholder='Enter your password'
                            autoComplete='current-password'
                            error={errors.password}
                        />
                        <button className='button primary-button auth-submit'>Login</button>
                    </form>
                    <p className='auth-link'>Don’t have an account? <Link to={'/register'}>Register</Link></p>
                </div>
                <div className='auth-card__visual'>
                    <div className='auth-card__visual-glow' />
                    <div className='auth-card__visual-content'>
                        <p className='auth-card__eyebrow'>Northstar AI</p>
                        <h2>Precision coaching for modern interviews.</h2>
                        <p>Turn your résumé and role context into a tailored prep roadmap with calm, clear guidance.</p>
                        <div className='auth-card__illustration' aria-hidden='true'>
                            <svg viewBox='0 0 320 220' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                                <rect x='32' y='38' width='256' height='144' rx='24' fill='rgba(255,255,255,0.06)' stroke='rgba(255,255,255,0.12)' />
                                <rect x='58' y='64' width='86' height='18' rx='9' fill='#4fc3ff' opacity='0.9' />
                                <rect x='58' y='92' width='142' height='12' rx='6' fill='rgba(255,255,255,0.13)' />
                                <rect x='58' y='112' width='126' height='12' rx='6' fill='rgba(255,255,255,0.13)' />
                                <circle cx='229' cy='105' r='44' fill='rgba(79,195,255,0.18)' stroke='#4fc3ff' strokeWidth='3' />
                                <path d='M214 107c6-14 24-14 30 0' stroke='#f5f8fc' strokeWidth='6' strokeLinecap='round' />
                                <path d='M206 126c10 10 42 10 52 0' stroke='#f5f8fc' strokeWidth='6' strokeLinecap='round' />
                                <rect x='74' y='146' width='96' height='10' rx='5' fill='rgba(255,255,255,0.1)' />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Login