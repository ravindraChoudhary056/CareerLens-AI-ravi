import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const pushToast = (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        setToasts((current) => [...current, { id, message, type }])
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id))
        }, 2600)
    }

    const value = useMemo(() => ({ pushToast }), [])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast-card toast-card--${toast.type}`}>
                        <span className="toast-card__dot" />
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within ToastProvider')
    return context
}
