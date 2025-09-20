import { useState } fr            <button onClick={onShowSavedLists} className="nav-link nav-btn">History</button>m 'react'

const Header = ({ user, onLogin, onLogout, onShowSavedLists, onGoHome }) => {
  const [showAuthModal, setShowAuthModal] = useState(null) // null, 'login', 'signup'

  const handleAuthClick = (type) => {
    setShowAuthModal(type)
  }

  const closeAuthModal = () => {
    setShowAuthModal(null)
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🔨</span>
            <span className="logo-text">TradeQuote Pro</span>
          </div>
          <nav className="main-nav">
            <button onClick={onShowSavedLists} className="nav-link nav-btn">� History</button>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
        
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-icon">👤</span>
                <span className="user-name">{user.name}</span>
                <span className="user-company">{user.company}</span>
              </div>
              <button onClick={onLogout} className="btn btn-secondary logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                onClick={() => handleAuthClick('login')} 
                className="btn btn-secondary login-btn"
              >
                Log In
              </button>
              <button 
                onClick={() => handleAuthClick('signup')} 
                className="btn btn-primary signup-btn"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Render Auth Modals */}
      {showAuthModal && (
        <>
          {showAuthModal === 'login' && (
            <Login 
              onClose={closeAuthModal}
              onSwitchToSignup={() => setShowAuthModal('signup')}
              onLogin={onLogin}
            />
          )}
          {showAuthModal === 'signup' && (
            <Signup
              onClose={closeAuthModal}
              onSwitchToLogin={() => setShowAuthModal('login')}
              onSignup={onLogin}
            />
          )}
        </>
      )}
    </header>
  )
}

// Import Login and Signup components inline for this demo
const Login = ({ onClose, onSwitchToSignup, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
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

const Signup = ({ onClose, onSwitchToLogin, onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    abn: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    setTimeout(() => {
      onSignup({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        abn: formData.abn,
        phone: formData.phone
      })
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }))
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal signup-modal">
        <div className="auth-header">
          <h2>Join TradeQuote Pro</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(02) 1234 5678"
              />
            </div>
            
            <div className="input-group">
              <label>ABN (Optional)</label>
              <input
                type="text"
                name="abn"
                value={formData.abn}
                onChange={handleChange}
                placeholder="12 345 678 901"
                className={errors.abn ? 'error' : ''}
              />
              {errors.abn && <span className="error-text">{errors.abn}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="input-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="terms-checkbox">
            <label>
              <input type="checkbox" required />
              I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? 
            <button onClick={onSwitchToLogin} className="link-btn">Log in here</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Header
