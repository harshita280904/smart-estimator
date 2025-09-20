import { useState } from 'react'

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
    
    if (formData.abn && !/^\d{2}\s\d{3}\s\d{3}\s\d{3}$/.test(formData.abn)) {
      newErrors.abn = 'ABN format: 12 345 678 901'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    // Simulate signup process
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
    
    // Clear error when user starts typing
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

export default Signup
