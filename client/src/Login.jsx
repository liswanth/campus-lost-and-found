import { useState } from 'react'

function Login({ goToRegister, onLogin }) {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (response.ok) {

        // Save user
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        )

        // Save JWT token
        localStorage.setItem(
          'token',
          data.token
        )

        // Send BOTH user and token to App.jsx
        onLogin(
          data.user,
          data.token
        )

        alert('Login successful!')

      } else {

        alert(
          data.message || 'Login failed'
        )

      }

    } catch (error) {

      console.log('Login Error:', error)

      alert(
        'Cannot connect to the backend server!'
      )

    }

    setLoading(false)
  }

  return (

    <section className="auth-section">

      <div className="auth-container">

        <h2>
          👋 Welcome Back
        </h2>

        <p className="auth-subtitle">
          Login to Campus Lost & Found
        </p>


        <form onSubmit={handleSubmit}>

          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

        </form>


        <p className="auth-switch">

          Don't have an account?

          <button
            type="button"
            onClick={goToRegister}
          >
            Register
          </button>

        </p>

      </div>

    </section>

  )
}

export default Login