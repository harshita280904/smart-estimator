import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ProjectInput from './components/ProjectInput'
import MaterialSelection from './components/MaterialSelection'
import QuantityCalculator from './components/QuantityCalculator'
import SupplierComparison from './components/SupplierComparison'
import QuoteBuilder from './components/QuoteBuilder'
import SavedLists from './components/SavedLists'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState(null)
  const [showSavedLists, setShowSavedLists] = useState(false)
  const [projectData, setProjectData] = useState({
    dimensions: {},
    projectType: '',
    materials: [],
    quantities: {},
    suppliers: [],
    quote: null
  })

  const steps = [
    { id: 1, title: 'Project Input', component: ProjectInput },
    { id: 2, title: 'Material Selection', component: MaterialSelection },
    { id: 3, title: 'Quantity Calculator', component: QuantityCalculator },
    { id: 4, title: 'Supplier Comparison', component: SupplierComparison },
    { id: 5, title: 'Quote Builder', component: QuoteBuilder }
  ]

  const updateProjectData = (key, value) => {
    setProjectData(prev => ({ ...prev, [key]: value }))
  }

  const loadMaterialsFromSaved = (materials) => {
    updateProjectData('materials', materials)
    setShowSavedLists(false)
    setCurrentStep(2) // Go to Material Selection step
  }

  // Function to check if a step is completed
  const isStepCompleted = (stepId) => {
    switch (stepId) {
      case 1: // Project Input
        return projectData.projectType && projectData.dimensions && 
               (projectData.dimensions.area > 0 || 
                (projectData.dimensions.length > 0 && projectData.dimensions.width > 0))
      case 2: // Material Selection
        return projectData.materials && projectData.materials.length > 0
      case 3: // Quantity Calculator
        return projectData.quantities && Object.keys(projectData.quantities).length > 0
      case 4: // Supplier Comparison
        return projectData.suppliers && projectData.suppliers.length > 0
      case 5: // Quote Builder
        return true // Last step, always accessible if previous steps are complete
      default:
        return false
    }
  }

  // Function to check if user can navigate to a step
  const canNavigateToStep = (stepId) => {
    if (stepId === 1) return true // First step always accessible
    
    // Check if all previous steps are completed
    for (let i = 1; i < stepId; i++) {
      if (!isStepCompleted(i)) {
        return false
      }
    }
    return true
  }

  const handleStepClick = (stepId) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleGoHome = () => {
    setCurrentStep(1)
    setShowSavedLists(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const CurrentComponent = steps[currentStep - 1].component

  // Show SavedLists if requested
  if (showSavedLists) {
    return (
      <div className="app">
        <Header 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onShowSavedLists={() => setShowSavedLists(true)}
          onGoHome={handleGoHome}
        />

        <div className="app-container">
          <div className="app-header">
            <h1>🔨 TradeQuote Pro</h1>
            <p>Professional Price Estimation Tool for Australian Tradesmen</p>
          </div>

          <main className="main-content">
            <SavedLists 
              projectData={projectData}
              updateProjectData={updateProjectData}
              onLoadMaterials={loadMaterialsFromSaved}
            />
            <div className="navigation">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSavedLists(false)}
              >
                ← Back to Estimator
              </button>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onShowSavedLists={() => setShowSavedLists(true)}
        onGoHome={handleGoHome}
      />

      <div className="app-container">
        <div className="app-header">
          <h1>🔨 TradeQuote Pro</h1>
          <p>Professional Price Estimation Tool for Australian Tradesmen</p>
        </div>

        <nav className="step-nav">
          {steps.map(step => {
            const isCompleted = isStepCompleted(step.id)
            const canNavigate = canNavigateToStep(step.id)
            const isActive = currentStep === step.id
            
            return (
              <div 
                key={step.id} 
                className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!canNavigate ? 'disabled' : ''}`}
                onClick={() => handleStepClick(step.id)}
                style={{ 
                  cursor: canNavigate ? 'pointer' : 'not-allowed',
                  opacity: canNavigate ? 1 : 0.5 
                }}
              >
                <span className="step-number">{step.id}</span>
                <span className="step-title">{step.title}</span>
              </div>
            )
          })}
        </nav>

        <main className="main-content">
          <CurrentComponent 
            projectData={projectData}
            updateProjectData={updateProjectData}
            nextStep={nextStep}
            prevStep={prevStep}
            currentStep={currentStep}
          />
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default App
