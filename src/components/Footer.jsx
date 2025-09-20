const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🔨</span>
              <span className="logo-text">TradeQuote Pro</span>
            </div>
            <p className="footer-description">
              Professional price estimation tool for Australian tradesmen. 
              Streamline your quoting process and grow your business.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="Instagram">📷</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#api">API Access</a></li>
              <li><a href="#mobile">Mobile App</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#tutorials">Video Tutorials</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#templates">Quote Templates</a></li>
              <li><a href="#calculator">Material Calculator</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#press">Press Kit</a></li>
              <li><a href="#partners">Partners</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="tel:1300-123-456">📞 1300 123 456</a></li>
              <li><a href="mailto:support@tradequotepro.com.au">✉️ Support Email</a></li>
              <li><a href="#live-chat">💬 Live Chat</a></li>
              <li><a href="#training">Training Sessions</a></li>
            </ul>
            <div className="business-hours">
              <h5>Business Hours</h5>
              <p>Mon-Fri: 8:00 AM - 6:00 PM AEST</p>
              <p>Sat: 9:00 AM - 1:00 PM AEST</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2025 TradeQuote Pro. All rights reserved.</p>
            <div className="legal-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
              <a href="#security">Security</a>
            </div>
          </div>
          
          <div className="footer-bottom-right">
            <div className="australian-made">
              <span className="flag">🇦🇺</span>
              <span>Proudly Australian Made</span>
            </div>
            <div className="certifications">
              <span className="cert">SSL Secured</span>
              <span className="cert">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
