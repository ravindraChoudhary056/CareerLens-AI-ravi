import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'
import FormField from '../../../components/FormField.jsx'
import { useToast } from '../../../components/ToastProvider.jsx'

const RESEND_COOLDOWN = 60

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtp, setShowOtp] = useState(false)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const timerRef = useRef(null)

    const { loading, handleRegister, handleVerifyOtp, handleResendOtp } = useAuth()
    const { pushToast } = useToast()

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = window.setTimeout(() => setResendTimer(v => v - 1), 1000)
        }
        return () => window.clearTimeout(timerRef.current)
    }, [resendTimer])

    const validate = () => {
        const nextErrors = {}
        if (!username.trim()) nextErrors.username = 'Username is required.'
        if (!email.trim()) nextErrors.email = 'Email is required.'
        if (!password) nextErrors.password = 'Password is required.'
        else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
        if (showOtp && otp.trim().length < 4) nextErrors.otp = 'Enter the 4-digit code.'
        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validate() || submitting) return
        setSubmitting(true)

        try {
            if (!showOtp) {
                const result = await handleRegister({ username, email, password })
                if (result?.success) {
                    setShowOtp(true)
                    setResendTimer(RESEND_COOLDOWN)
                    pushToast('Verification code sent to your email', 'success')
                } else {
                    pushToast(result?.error || 'We could not create your account. Please try again.', 'error')
                }
            } else {
                // verify otp
                const verifyResult = await handleVerifyOtp({ email, code: otp })
                if (verifyResult?.success) {
                    pushToast('Account verified successfully', 'success')
                    navigate('/')
                    return
                }
                pushToast(verifyResult?.error || 'Invalid or expired code. Please try again.', 'error')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const onResendOtp = async () => {
        if (resendTimer > 0) return
        const result = await handleResendOtp({ email })
        if (result?.success) {
            pushToast('A new verification code has been sent', 'success')
            setResendTimer(RESEND_COOLDOWN)
        } else {
            pushToast(result?.error || 'Failed to resend code', 'error')
            if (result?.retryAfter) {
                setResendTimer(result.retryAfter)
            }
        }
    }

    if (loading && !showOtp) {
        return (
            <main className='auth-shell'>
                <div className='loading-screen__card'>
                    <div className='loading-screen__ring' />
                    <h1>Creating your profile…</h1>
                </div>
            </main>
        )
    }

    return (
        <main className='auth-shell'>
            <section className='auth-card'>
                <div className='auth-card__form'>
                    <div className='auth-card__head'>
                        <p className='auth-card__eyebrow'>Create account</p>
                        <h1>{showOtp ? 'Verify your email' : 'Start your prep journey'}</h1>
                        <p>{showOtp
                            ? `We've sent a 4-digit code to ${email}. Enter it below to verify your account.`
                            : 'Set up your profile and verify your email before continuing.'
                        }</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {!showOtp && (
                            <>
                                <FormField
                                    id='username'
                                    label='Username'
                                    value={username}
                                    onChange={(event) => {
                                        setUsername(event.target.value)
                                        setErrors((current) => ({ ...current, username: '' }))
                                    }}
                                    placeholder='Choose a username'
                                    autoComplete='username'
                                    error={errors.username}
                                />
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
                                    placeholder='Create a password (min. 6 characters)'
                                    autoComplete='new-password'
                                    error={errors.password}
                                />
                            </>
                        )}
                        {showOtp && (
                            <>
                                <FormField
                                    id='otp'
                                    label='Verification code'
                                    type='text'
                                    value={otp}
                                    onChange={(event) => {
                                        setOtp(event.target.value)
                                        setErrors((current) => ({ ...current, otp: '' }))
                                    }}
                                    placeholder='Enter 4-digit code'
                                    error={errors.otp}
                                />
                                <div className='resend-otp-row'>
                                    <button
                                        type='button'
                                        className={`resend-otp-btn ${resendTimer > 0 ? 'resend-otp-btn--disabled' : ''}`}
                                        onClick={onResendOtp}
                                        disabled={resendTimer > 0}
                                    >
                                        {resendTimer > 0
                                            ? `Resend code in ${resendTimer}s`
                                            : 'Resend verification code'
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                        <button
                            className='button primary-button auth-submit'
                            disabled={submitting}
                        >
                            {submitting
                                ? (showOtp ? 'Verifying…' : 'Creating account…')
                                : (showOtp ? 'Verify account' : 'Create account')
                            }
                        </button>
                    </form>
                    <p className='auth-link'>Already have an account? <Link to={'/login'}>Login</Link></p>
                </div>
                <div className='auth-card__visual'>
                    <div className='auth-card__visual-glow' />
                    <div className='auth-card__visual-content'>
                        <p className='auth-card__eyebrow'>CareerLens AI</p>
                        <h2>Shape a stronger career narrative.</h2>
                        <p>Build polished interview stories and understand the gaps that matter before the big day.</p>
                        <div className='auth-card__illustration' aria-hidden='true'>
                            <svg viewBox='0 0 320 220' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                                <rect x='42' y='40' width='236' height='140' rx='24' fill='rgba(255,255,255,0.06)' stroke='rgba(255,255,255,0.12)' />
                                <path d='M80 152c8-34 40-54 80-54s72 20 80 54' fill='none' stroke='#4fc3ff' strokeWidth='6' strokeLinecap='round' />
                                <circle cx='120' cy='94' r='24' fill='rgba(79,195,255,0.18)' stroke='#4fc3ff' strokeWidth='3' />
                                <circle cx='200' cy='94' r='24' fill='rgba(126,231,189,0.18)' stroke='#7ee7bd' strokeWidth='3' />
                                <rect x='84' y='62' width='44' height='10' rx='5' fill='rgba(255,255,255,0.16)' />
                                <rect x='192' y='62' width='44' height='10' rx='5' fill='rgba(255,255,255,0.16)' />
                                <path d='M106 154h102' stroke='rgba(255,255,255,0.14)' strokeWidth='8' strokeLinecap='round' />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Register
