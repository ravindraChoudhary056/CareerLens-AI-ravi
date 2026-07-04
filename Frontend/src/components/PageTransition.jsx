import { useEffect, useState } from 'react'

const PageTransition = ({ children }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const timeout = window.setTimeout(() => setVisible(true), 40)
        return () => window.clearTimeout(timeout)
    }, [])

    return <div className={`page-transition ${visible ? 'is-visible' : ''}`}>{children}</div>
}

export default PageTransition
