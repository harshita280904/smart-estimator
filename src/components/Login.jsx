import { useState } from 'react'

const Login = ({ onClose, onSwitchToSignup, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    setTimeout(() => {
      onLogin({
        name: 'John Smith',
        email: formData.email,
        company: 'Smith Construction',
        abn: '12 345 678 901'
      })
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? 
            <button onClick={onSwitchToSignup} className="link-btn">Sign up here</button>
          </p>
          <a href="#" className="forgot-password">Forgot your password?</a>
        </div>
      </div>
    </div>
  )
}

export default Login
