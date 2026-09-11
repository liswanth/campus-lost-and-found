import { useState } from 'react'

function Register({ goToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        alert('Registration successful!')

        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })

        goToLogin()
      } else {
        alert(data.message || 'Registration failed')
      }

    } catch (error) {
      console.log('Registration Error:', error)
      alert('Cannot connect to the backend server!')
    }

    setLoading(false)
  }

  return (
    <section className="auth-section">
      <div className="auth-container">

        <h2>🎓 Create Account</h2>

        <p className="auth-subtitle">
          Join Campus Lost & Found
        </p>

        <form onSubmit={handleSubmit}>

          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?
          <button type="button" onClick={goToLogin}>
            Login
          </button>
        </p>

      </div>
    </section>
  )
}

export default Register