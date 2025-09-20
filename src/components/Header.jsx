import { useState } from 'react'

const Header = ({ user, onLogin, onLogout, onShowSavedLists, onGoHome }) => {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">🔨</span>
            <span className="logo-text">TradeQuote Pro</span>
          </div>
          <nav className="main-nav">
            <button onClick={onShowSavedLists} className="nav-link nav-btn">History</button>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
        
        <div className="header-right">
          {/* Auth buttons and modals removed */}
        </div>
      </div>
    </header>
  )
}

export default Header
