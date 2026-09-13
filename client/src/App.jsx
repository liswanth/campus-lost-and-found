import { useState } from 'react'
import './App.css'

import LostItemForm from './LostItemForm'
import FoundItemForm from './FoundItemForm'
import LostItems from './LostItems'
import FoundItems from './FoundItems'
import Login from './Login'
import Register from './Register'
import MyReports from './MyReports'

function App() {
  const [page, setPage] = useState('home')

  const [token, setToken] = useState(() =>
    localStorage.getItem('token')
  )

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const scrollTo = (id) => {
    setPage('home')

    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 50)
  }

  const handleLogin = (loggedInUser, loginToken) => {
    setUser(loggedInUser)
    setToken(loginToken)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    localStorage.setItem('token', loginToken)
    setPage('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setPage('home')
  }

  const openMyReports = () => {
    if (!token) {
      setPage('login')
      return
    }
    setPage('my-reports')
  }

  const renderNavbar = (showLinks = true) => (
    <nav className="navbar">
      <button
        className="logo"
        onClick={() => setPage('home')}
        type="button"
      >
        🎓 Campus Lost & Found
      </button>

      {showLinks && (
        <div className="nav-links">
          <button type="button" onClick={() => scrollTo('home')}>Home</button>
          <button type="button" onClick={() => scrollTo('items')}>Lost Items</button>
          <button type="button" onClick={() => scrollTo('found-items')}>Found Items</button>
          <button type="button" onClick={() => scrollTo('about')}>About</button>
        </div>
      )}

      {user && token ? (
        <div className="user-area">
          <span className="welcome-user">👋 {user.name}</span>
          <button className="my-reports-btn" onClick={openMyReports} type="button">
            📋 My Reports
          </button>
          <button className="logout-btn" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      ) : (
        <button className="login-btn" onClick={() => setPage('login')} type="button">
          Login
        </button>
      )}
    </nav>
  )

  if (page === 'login') {
    return (
      <div className="app">
        {renderNavbar(false)}
        <Login
          goToRegister={() => setPage('register')}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (page === 'register') {
    return (
      <div className="app">
        {renderNavbar(false)}
        <Register goToLogin={() => setPage('login')} />
      </div>
    )
  }

  if (page === 'my-reports') {
    return (
      <div className="app">
        {renderNavbar(true)}
        <MyReports token={token} />
      </div>
    )
  }

  return (
    <div className="app">
      {renderNavbar(true)}

      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="small-title">CAMPUS LOST & FOUND</p>
          <h1>
            Lost Something?
            <br />
            <span>We'll Help You Find It.</span>
          </h1>
          <p className="hero-text">
            A simple and secure platform for students to report lost items,
            discover found belongings, and reconnect with what matters.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => scrollTo('items')} type="button">
              🔍 Find Lost Item
            </button>
            <button className="secondary-btn" onClick={() => scrollTo('found')} type="button">
              ➕ Report Found Item
            </button>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="section-heading centered">
          <p className="section-label">BROWSE</p>
          <h2>Browse by Category</h2>
          <p>Quickly explore the most common campus belongings.</p>
        </div>

        <div className="category-container">
          <div className="category-card"><div className="category-icon">📱</div><h3>Electronics</h3><p>Phones, laptops, chargers and more</p></div>
          <div className="category-card"><div className="category-icon">📚</div><h3>Books</h3><p>Textbooks, notebooks and study materials</p></div>
          <div className="category-card"><div className="category-icon">🎒</div><h3>Personal</h3><p>Wallets, bags, IDs and everyday items</p></div>
          <div className="category-card"><div className="category-icon">👕</div><h3>Clothing</h3><p>Jackets, uniforms and accessories</p></div>
        </div>
      </section>

      <div id="items">
        <LostItems />
      </div>

      <div id="found-items">
        <FoundItems />
      </div>

      <section id="report" className="report-section">
        <div className="section-heading centered">
          <p className="section-label">REPORT</p>
          <h2>Help the Campus Community</h2>
          <p>Report an item so the right person can find it.</p>
        </div>

        {user && token ? (
          <>
            <div id="lost">
              <LostItemForm token={token} />
            </div>
            <div id="found">
              <FoundItemForm token={token} />
            </div>
          </>
        ) : (
          <div className="login-required">
            <div className="login-required-icon">🔐</div>
            <h2>Login Required</h2>
            <p>Please login before reporting a lost or found item.</p>
            <button onClick={() => setPage('login')} type="button">Login</button>
          </div>
        )}
      </section>

      <section className="how-section">
        <div className="section-heading centered">
          <p className="section-label">PROCESS</p>
          <h2>How It Works</h2>
        </div>

        <div className="steps">
          <div className="step"><div className="step-number">1</div><h3>Report</h3><p>Report an item you lost or found on campus.</p></div>
          <div className="step"><div className="step-number">2</div><h3>Search</h3><p>Search by item, description, location or category.</p></div>
          <div className="step"><div className="step-number">3</div><h3>Reconnect</h3><p>Use the contact details to arrange a safe return.</p></div>
        </div>
      </section>

      <footer id="about">
        <div className="footer-inner">
          <h3>🎓 Campus Lost & Found</h3>
          <p>Helping students reconnect with their lost belongings.</p>
          <p className="copyright">© 2026 Campus Lost & Found · Built for campus community.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
