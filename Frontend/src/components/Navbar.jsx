import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useToast } from './ToastProvider'

const Navbar = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()
    const { pushToast } = useToast()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return

        const handleClick = () => setOpen(false)
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [open])

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

    return (
        <header className="app-navbar">
            <div className="app-navbar__brand">
                <span className="app-navbar__mark" />
                <div>
                    <p className="app-navbar__name">Northstar AI</p>
                    <p className="app-navbar__sub">Interview readiness platform</p>
                </div>
            </div>

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
                                <p className="app-navbar__profile-email">{user.email || 'member@northstar.ai'}</p>
                            </div>
                        </div>
                        <button type="button" className="app-navbar__menu-item" onClick={() => setOpen(false)}>
                            User Information
                        </button>
                        <button type="button" className="app-navbar__menu-item" onClick={() => setOpen(false)}>
                            Profile
                        </button>
                        <button type="button" className="app-navbar__menu-item app-navbar__menu-item--danger" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
