import { useState, useCallback } from 'react'
import FileUpload from './components/FileUpload'
import ChatWindow from './components/ChatWindow'
import Login from './components/Login'
import './App.css'

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export default function App() {
  const [files, setFiles] = useState([])
  const [token, setToken] = useState(() => localStorage.getItem('id_token') || null)

  const handleSignIn = useCallback((credential) => {
    localStorage.setItem('id_token', credential)
    setToken(credential)
  }, [])

  function signOut() {
    localStorage.removeItem('id_token')
    setToken(null)
    setFiles([])
  }

  if (!token) {
    return <Login onSignIn={handleSignIn} />
  }

  const profile = decodeJwt(token)

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>RAG Demo</h1>
          <p>Upload documents and ask questions about them</p>
        </div>
        <div className="account">
          {profile?.email && <span className="account-email">{profile.email}</span>}
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <FileUpload token={token} onUpload={(name) => setFiles((prev) => [...prev, name])} />

          {files.length > 0 && (
            <div className="file-list">
              <h3>Indexed Documents</h3>
              <ul>
                {files.map((f, i) => (
                  <li key={i} title={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="chat-area">
          <ChatWindow token={token} onAuthError={signOut} />
        </main>
      </div>
    </div>
  )
}
