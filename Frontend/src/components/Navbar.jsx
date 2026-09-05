import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useToast } from './ToastProvider'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, handleLogout } = useAuth()
    const { pushToast } = useToast()
    const [open, setOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const handleClick = () => setOpen(false)
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [open])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    const initials = useMemo(() => {
        if (!user) return 'U'
        const source = user.username || user.email || 'User'
        return source.charAt(0).toUpperCase()
    }, [user])

    if (!user) return null

    const onLogout = async () => {
        await handleLogout()
        pushToast('Signed out successfully', 'success')
        navigate('/login')
    }

    const navLinks = [
        { path: '/', label: 'Dashboard' },
        { path: '/resumes', label: 'My Resumes' },
    ]

    return (
        <header className="app-navbar">
            <div className="app-navbar__brand">
                <span className="app-navbar__mark" />
                <div className="app-navbar__titles">
                    <p className="app-navbar__name">CareerLens AI</p>
                    <p className="app-navbar__sub">AI-Powered Resume Intelligence</p>
                </div>
            </div>

            <nav className={`app-navbar__links ${mobileMenuOpen ? 'app-navbar__links--mobile-open' : ''}`}>
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`app-navbar__link ${location.pathname === link.path ? 'app-navbar__link--active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="app-navbar__actions">
                <button
                    type="button"
                    className="app-navbar__avatar"
                    onClick={(event) => {
                        event.stopPropagation()
                        setOpen((value) => !value)
                    }}
                >
                    {initials}
                </button>

                <div className={`app-navbar__dropdown ${open ? 'is-open' : ''}`}>
                    <div className="app-navbar__dropdown-card">
                        <div className="app-navbar__profile">
                            <div className="app-navbar__avatar app-navbar__avatar--large">{initials}</div>
                            <div>
                                <p className="app-navbar__profile-name">{user.username || 'Member'}</p>
                                <p className="app-navbar__profile-email">{user.email || 'member@careerlens.ai'}</p>
                            </div>
                        </div>
                        <button type="button" className="app-navbar__menu-item app-navbar__menu-item--danger" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <button 
                    className="app-navbar__hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {mobileMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>
            </div>
        </header>
    )
}

export default Navbar
