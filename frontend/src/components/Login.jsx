import { useEffect, useRef, useState } from 'react'
import './Login.css'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const FEATURES = [
  { icon: '📄', text: 'Upload PDFs and text files' },
  { icon: '🔍', text: 'Ask questions in plain English' },
  { icon: '🔒', text: 'Only you can see your documents' },
]

export default function Login({ onSignIn }) {
  const buttonRef = useRef()
  const initialized = useRef(false)
  const [scriptReady, setScriptReady] = useState(false)

  // The Google script tag loads with `defer`, so on first mount
  // window.google may not exist yet — poll briefly until it does.
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptReady(true)
      return
    }
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true)
        clearInterval(interval)
      }
    }, 100)
    const timeout = setTimeout(() => clearInterval(interval), 8000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || initialized.current) return
    initialized.current = true

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => onSignIn(response.credential),
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 280,
    })
  }, [scriptReady, onSignIn])

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="brand-mark">
          <span className="brand-dot" />
          RAG&nbsp;Demo
        </div>
        <h1>Chat with your own documents</h1>
        <p className="lede">
          Upload a PDF or text file and get instant, grounded answers —
          powered by retrieval-augmented generation.
        </p>
        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f.text}>
              <span className="feature-icon">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="login-panel login-panel--form">
        <div className="login-card">
          <h2>Sign in to continue</h2>
          <p className="login-sub">
            We use Google Sign-In to keep your uploads private to your account.
          </p>

          <div className="google-btn-slot">
            {!CLIENT_ID ? (
              <p className="login-error">
                Missing VITE_GOOGLE_CLIENT_ID. Set it in your environment and reload.
              </p>
            ) : !scriptReady ? (
              <div className="btn-skeleton" aria-label="Loading sign-in button">
                <span className="spinner" />
                Loading sign-in…
              </div>
            ) : (
              <div ref={buttonRef} />
            )}
          </div>

          <p className="login-footnote">
            By continuing you agree that only you can access documents you upload.
          </p>
        </div>
      </div>
    </div>
  )
}
