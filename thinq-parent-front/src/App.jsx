import { useEffect, useRef, useState } from 'react'
import './App.css'
import albumPhoto1 from './assets/album-photo-1.svg'
import albumPhoto2 from './assets/album-photo-2.svg'
import albumPhoto3 from './assets/album-photo-3.svg'
import albumPhoto4 from './assets/album-photo-4.svg'
import albumPhoto5 from './assets/album-photo-5.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const SESSION_STORAGE_KEY = 'thinq-parent-auth-session'

const albumCards = [
  { id: 1, image: albumPhoto1, alt: 'Baby album card 1' },
  { id: 2, image: albumPhoto2, alt: 'Baby album card 2' },
  { id: 3, image: albumPhoto3, alt: 'Baby album card 3' },
  { id: 4, image: albumPhoto4, alt: 'Baby album card 4' },
  { id: 5, image: albumPhoto5, alt: 'Baby album card 5' },
]

const diaryCards = [
  {
    title: 'Daily diary',
    body: 'Capture the moments that mattered today and keep the family timeline in one place.',
    action: 'Write now',
    type: 'primary',
  },
  {
    title: 'AI summary',
    body: 'Track feeding, naps, and mood notes. The summary block can be connected to the backend next.',
    action: 'View log',
    type: 'secondary',
  },
]

const navItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'baby', label: 'Baby', icon: 'baby' },
  { key: 'timer', label: 'Timer', icon: 'timer' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'pin', label: 'Community', icon: 'pin' },
]

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistSession(sessionData) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function normalizeSession(response) {
  return {
    sessionToken: response.session_token,
    user: {
      userId: response.user.user_id,
      loginId: response.user.login_id,
      name: response.user.name,
      createdAt: response.user.created_at,
    },
  }
}

function normalizeUser(response) {
  return {
    userId: response.user_id,
    loginId: response.login_id,
    name: response.name,
    createdAt: response.created_at,
  }
}

async function requestJson(path, options = {}) {
  const headers = new Headers(options.headers ?? {})

  if (options.sessionToken) {
    headers.set('Authorization', `Bearer ${options.sessionToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  })

  if (response.status === 204) {
    return null
  }

  const responseText = await response.text()
  const data = responseText ? JSON.parse(responseText) : null

  if (!response.ok) {
    throw new Error(data?.detail ?? 'Request failed.')
  }

  return data
}

function App() {
  const albumRowRef = useRef(null)
  const [initialSessionToken] = useState(() => readStoredSession()?.sessionToken ?? null)
  const [albumProgress, setAlbumProgress] = useState({ width: 42, left: 0 })
  const [activeNav, setActiveNav] = useState('home')
  const [session, setSession] = useState(() => readStoredSession())
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(initialSessionToken))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState(
    initialSessionToken ? '' : 'Home opens after login or sign up.',
  )
  const [formValues, setFormValues] = useState({
    loginId: '',
    password: '',
    name: '',
  })

  useEffect(() => {
    const syncAlbumProgress = () => {
      const albumRow = albumRowRef.current

      if (!albumRow) {
        return
      }

      const maxScrollLeft = albumRow.scrollWidth - albumRow.clientWidth

      if (maxScrollLeft <= 0) {
        setAlbumProgress({ width: 100, left: 0 })
        return
      }

      const visibleRatio = albumRow.clientWidth / albumRow.scrollWidth
      const thumbWidth = Math.max(visibleRatio * 100, 18)
      const maxLeft = 100 - thumbWidth
      const thumbLeft = (albumRow.scrollLeft / maxScrollLeft) * maxLeft

      setAlbumProgress({ width: thumbWidth, left: thumbLeft })
    }

    const albumRow = albumRowRef.current

    syncAlbumProgress()

    if (!albumRow) {
      return undefined
    }

    albumRow.addEventListener('scroll', syncAlbumProgress, { passive: true })
    window.addEventListener('resize', syncAlbumProgress)

    return () => {
      albumRow.removeEventListener('scroll', syncAlbumProgress)
      window.removeEventListener('resize', syncAlbumProgress)
    }
  }, [])

  useEffect(() => {
    if (!initialSessionToken) {
      return undefined
    }

    let ignore = false

    const restoreSession = async () => {
      setIsBootstrapping(true)

      try {
        const user = await requestJson('/auth/me', {
          sessionToken: initialSessionToken,
        })

        if (ignore) {
          return
        }

        const restoredSession = {
          sessionToken: initialSessionToken,
          user: normalizeUser(user),
        }

        persistSession(restoredSession)
        setSession(restoredSession)
        setAuthError('')
      } catch (error) {
        if (ignore) {
          return
        }

        clearStoredSession()
        setSession(null)
        setAuthError(error.message)
        setAuthMessage('Saved session expired. Please log in again.')
      } finally {
        if (!ignore) {
          setIsBootstrapping(false)
        }
      }
    }

    restoreSession()

    return () => {
      ignore = true
    }
  }, [initialSessionToken])

  const currentNav = navItems.find((item) => item.key === activeNav) ?? navItems[0]

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleHomeClick = () => {
    setActiveNav('home')

    if (!session?.sessionToken) {
      setAuthMessage('Log in or sign up to enter Home.')
      setAuthError('')
    }
  }

  const handleNavClick = (key) => {
    if (key === 'home') {
      handleHomeClick()
      return
    }

    setActiveNav(key)
    setAuthError('')
    setAuthMessage('')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setAuthError('')
    setAuthMessage('')

    try {
      const payload =
        authMode === 'signup'
          ? {
              login_id: formValues.loginId.trim(),
              password: formValues.password,
              name: formValues.name.trim(),
            }
          : {
              login_id: formValues.loginId.trim(),
              password: formValues.password,
            }

      const response = await requestJson(authMode === 'signup' ? '/auth/signup' : '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const nextSession = normalizeSession(response)

      persistSession(nextSession)
      setSession(nextSession)
      setActiveNav('home')
      setFormValues({
        loginId: '',
        password: '',
        name: '',
      })
      setAuthMessage(
        authMode === 'signup'
          ? `${nextSession.user.name}, your account is ready.`
          : `Welcome back, ${nextSession.user.name}.`,
      )
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    const currentSessionToken = session?.sessionToken

    if (currentSessionToken) {
      try {
        await requestJson('/auth/logout', {
          method: 'POST',
          sessionToken: currentSessionToken,
        })
      } catch {
        // Clear the browser session even when the backend token is already gone.
      }
    }

    clearStoredSession()
    setSession(null)
    setActiveNav('home')
    setAuthMode('login')
    setAuthError('')
    setAuthMessage('You have been logged out. Log in again to open Home.')
  }

  const renderAuthPanel = () => (
    <section className="auth-panel">
      <article className="auth-card">
        <p className="eyebrow">Home access</p>
        <h2>Login or create an account</h2>
        <p className="auth-copy">
          The existing home layout stays in place. When there is no session, Home switches to the
          authentication view first.
        </p>

        <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          <label className="auth-field">
            <span>Login ID</span>
            <input
              name="loginId"
              value={formValues.loginId}
              onChange={handleInputChange}
              placeholder="at least 4 characters"
              autoComplete="username"
              required
              minLength={4}
            />
          </label>

          {authMode === 'signup' ? (
            <label className="auth-field">
              <span>Name</span>
              <input
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="display name"
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleInputChange}
              placeholder="at least 6 characters"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </label>

          {authMessage ? <p className="auth-feedback success">{authMessage}</p> : null}
          {authError ? <p className="auth-feedback error">{authError}</p> : null}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : authMode === 'signup' ? 'Create account' : 'Login'}
          </button>
        </form>
      </article>

      <article className="auth-side-card">
        <p className="eyebrow">Session rule</p>
        <h3>Home button behavior</h3>
        <p>
          No session in the browser means Home opens this panel. An active session brings the user
          back to the original home state immediately.
        </p>
      </article>
    </section>
  )

  const renderHomeContent = () => {
    if (isBootstrapping) {
      return (
        <section className="loading-card">
          <p className="eyebrow">Session check</p>
          <h2>Restoring your home screen</h2>
          <p>Validating the saved session with the backend.</p>
        </section>
      )
    }

    if (!session?.sessionToken) {
      return renderAuthPanel()
    }

    return (
      <>
        <section className="dday-card">
          <div>
            <p className="dday-label">Signed in as {session.user.name}</p>
            <strong className="welcome-text">@{session.user.loginId}</strong>
          </div>
          <div className="dday-count">
            <span className="heart" aria-hidden="true" />
            <strong>Home ready</strong>
          </div>
        </section>

        <section className="section-block compact-block">
          <div className="section-head">
            <h2>Baby album</h2>
            <button type="button" className="chevron-button" aria-label="Open album">
              <span />
            </button>
          </div>

          <div ref={albumRowRef} className="album-row" aria-label="Baby album carousel">
            {albumCards.map((card) => (
              <article key={card.id} className="album-card">
                <img src={card.image} alt={card.alt} className="album-image" />
              </article>
            ))}
          </div>
          <div className="album-progress" aria-hidden="true">
            <span
              className="album-progress-thumb"
              style={{
                width: `${albumProgress.width}%`,
                left: `${albumProgress.left}%`,
              }}
            />
          </div>
        </section>

        <section className="diary-grid">
          {diaryCards.map((card) => (
            <article key={card.title} className={`diary-card ${card.type}`}>
              <div className="diary-header">
                <h3>{card.title}</h3>
                {card.type === 'secondary' ? <span className="mini-mark">AI</span> : null}
              </div>
              <p>{card.body}</p>
              <button type="button" className={`action-chip ${card.type}`}>
                {card.type === 'primary' ? <span className="plus-mark">+</span> : null}
                {card.action}
              </button>
            </article>
          ))}
        </section>

        <section className="section-block compact-block mode-section">
          <div className="section-head">
            <div>
              <h2>Sleep mode</h2>
              <p className="section-copy">
                Keep the existing quick toggle area and reserve it for the next backend connection.
              </p>
            </div>
            <button type="button" className="chevron-button" aria-label="Open sleep mode">
              <span />
            </button>
          </div>

          <div className="sleep-toggle-row">
            <span className="toggle-label">Turn on sleep mode</span>
            <button type="button" className="sleep-toggle" aria-pressed="false">
              <span />
            </button>
          </div>
        </section>

        <section className="mbti-section">
          <h2>Parent style quiz</h2>
          <article className="mbti-card">
            <p>Keep this card as the bottom summary area of the home layout.</p>
            <button type="button" className="measure-button">
              Start quiz
            </button>
          </article>
        </section>
      </>
    )
  }

  const renderSecondaryScreen = () => (
    <section className="placeholder-card">
      <p className="eyebrow">{currentNav.label}</p>
      <h2>{session?.sessionToken ? 'Feature preview' : 'Login required'}</h2>
      <p>
        {session?.sessionToken
          ? 'The rest of the tabs can keep their current placeholders. Press Home to return to the authenticated home screen.'
          : 'Press Home first. Without a session, the app should move to login or sign up before showing Home.'}
      </p>
      {!session?.sessionToken ? (
        <button type="button" className="submit-button secondary" onClick={handleHomeClick}>
          Go to Home login
        </button>
      ) : null}
    </section>
  )

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Mom mode mobile mockup">
        <header className="status-bar">
          <span>2:54</span>
          <span className="status-pill" aria-hidden="true" />
        </header>

        <div className="screen">
          <section className="topbar">
            <button type="button" className="icon-button back-button" aria-label="Go back">
              <span />
            </button>
            <h1>{currentNav.key === 'home' ? 'Mom mode' : currentNav.label}</h1>
            {session?.sessionToken && currentNav.key === 'home' ? (
              <button
                type="button"
                className="icon-button logout-button"
                aria-label="Log out"
                onClick={handleLogout}
              >
                Out
              </button>
            ) : (
              <button type="button" className="icon-button menu-button" aria-label="More">
                <span />
                <span />
                <span />
              </button>
            )}
          </section>

          {activeNav === 'home' ? renderHomeContent() : renderSecondaryScreen()}
        </div>

        <nav className="bottom-nav" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${item.key === activeNav ? 'active' : ''}`}
              aria-current={item.key === activeNav ? 'page' : undefined}
              onClick={() => handleNavClick(item.key)}
            >
              <span className={`nav-icon ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </main>
  )
}

export default App
