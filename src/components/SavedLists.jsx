import { useState, useEffect } from 'react'

const SavedLists = ({ projectData, updateProjectData, onLoadMaterials }) => {
  const [savedMaterials, setSavedMaterials] = useState([])
  const [savedQuotes, setSavedQuotes] = useState([])
  const [quotesHistory, setQuotesHistory] = useState([])
  const [activeTab, setActiveTab] = useState('history')

  useEffect(() => {
    // Load saved materials, quotes, and history from localStorage
    const savedMaterialLists = JSON.parse(localStorage.getItem('savedMaterials') || '[]')
    const savedQuotesList = JSON.parse(localStorage.getItem('savedQuotes') || '[]')
    const historyQuotes = JSON.parse(localStorage.getItem('quotesHistory') || '[]')
    setSavedMaterials(savedMaterialLists)
    setSavedQuotes(savedQuotesList)
    setQuotesHistory(historyQuotes)
  }, [])

  const loadSavedMaterials = (savedList) => {
    onLoadMaterials(savedList.materials)
    alert(`Loaded material list: ${savedList.name}`)
  }

  const loadSavedQuote = (savedQuote) => {
    // Load entire project data from saved quote
    updateProjectData('dimensions', savedQuote.projectData.dimensions)
    updateProjectData('projectType', savedQuote.projectData.projectType)
    updateProjectData('materials', savedQuote.projectData.materials)
    updateProjectData('quantities', savedQuote.projectData.quantities)
    updateProjectData('suppliers', savedQuote.projectData.suppliers)
    updateProjectData('quote', savedQuote.projectData.quote)
    alert(`Loaded quote: ${savedQuote.name}`)
  }

  const loadHistoryQuote = (historyQuote) => {
    // Load project data from history quote
    updateProjectData('dimensions', {
      area: historyQuote.project.area,
      volume: historyQuote.project.volume
    })
    updateProjectData('projectType', historyQuote.project.type)
    if (historyQuote.materials) {
      updateProjectData('quantities', historyQuote.materials)
    }
    if (historyQuote.suppliers) {
      updateProjectData('suppliers', historyQuote.suppliers)
    }
    alert(`Loaded quote from history: ${historyQuote.quoteNumber}`)
  }

  const deleteHistoryQuote = (quoteNumber) => {
    const updated = quotesHistory.filter(quote => quote.quoteNumber !== quoteNumber)
    setQuotesHistory(updated)
    localStorage.setItem('quotesHistory', JSON.stringify(updated))
  }

  const deleteSavedItem = (type, id) => {
    if (type === 'materials') {
      const updated = savedMaterials.filter(item => item.id !== id)
      setSavedMaterials(updated)
      localStorage.setItem('savedMaterials', JSON.stringify(updated))
    } else if (type === 'quotes') {
      const updated = savedQuotes.filter(item => item.id !== id)
      setSavedQuotes(updated)
      localStorage.setItem('savedQuotes', JSON.stringify(updated))
    }
  }

  const saveCurrentProject = () => {
    const newQuote = {
      id: Date.now(),
      name: `Quote - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      projectData: { ...projectData },
      createdAt: new Date().toISOString()
    }
    
    const updated = [...savedQuotes, newQuote]
    setSavedQuotes(updated)
    localStorage.setItem('savedQuotes', JSON.stringify(updated))
    alert('Current project saved as quote!')
  }

  return (
    <div className="saved-lists">
      <h2>� History & Saved Lists</h2>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📈 Quote History ({quotesHistory.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📋 Material Lists ({savedMaterials.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          📄 Manual Saves ({savedQuotes.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="tab-header">
              <h3>Quote History</h3>
              <p>Automatically saved quotes from completed projects</p>
            </div>
            
            {quotesHistory.length === 0 ? (
              <div className="empty-state">
                <p>No quote history yet.</p>
                <p>Complete a quote in the Quote Builder to see it appear here automatically.</p>
              </div>
            ) : (
              <div className="saved-items-grid">
                {quotesHistory.map(quote => (
                  <div key={quote.quoteNumber} className="saved-item-card">
                    <div className="item-header">
                      <h4>Quote {quote.quoteNumber}</h4>
                      <span className="created-date">{quote.date}</span>
                    </div>
                    
                    <div className="item-details">
                      <p><strong>Project:</strong> {quote.project.type}</p>
                      <p><strong>Area:</strong> {quote.project.area}m²</p>
                      <p><strong>Total Cost:</strong> ${quote.costs.total.toFixed(2)}</p>
                      <p><strong>Materials:</strong> ${quote.costs.materials.toFixed(2)}</p>
                      <p><strong>Service Fee:</strong> ${quote.costs.markup.toFixed(2)} ({quote.costs.markupPercent}%)</p>
                      {quote.createdAt && (
                        <p><strong>Created:</strong> {new Date(quote.createdAt).toLocaleString()}</p>
                      )}
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        onClick={() => loadHistoryQuote(quote)}
                        className="btn btn-primary btn-sm"
                      >
                        Load Quote
                      </button>
                      <button 
                        onClick={() => deleteHistoryQuote(quote.quoteNumber)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="materials-tab">
            <div className="tab-header">
              <h3>Material Lists</h3>
              <p>Saved material combinations for different project types</p>
            </div>
            
            {savedMaterials.length === 0 ? (
              <div className="empty-state">
                <p>No saved material lists yet.</p>
                <p>Save a material list from the Material Selection step to see it here.</p>
              </div>
            ) : (
              <div className="saved-items-grid">
                {savedMaterials.map(saved => (
                  <div key={saved.id} className="saved-item-card">
                    <div className="item-header">
                      <h4>{saved.name}</h4>
                      <span className="project-type">{saved.projectType}</span>
                    </div>
                    
                    <div className="item-details">
                      <p><strong>Materials:</strong> {saved.materials.length} items</p>
                      <div className="material-preview">
                        {saved.materials.slice(0, 3).map(material => (
                          <span key={material.id} className="material-tag">
                            {material.name}
                          </span>
                        ))}
                        {saved.materials.length > 3 && (
                          <span className="more-tag">+{saved.materials.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        onClick={() => loadSavedMaterials(saved)}
                        className="btn btn-primary btn-sm"
                      >
                        Load List
                      </button>
                      <button 
                        onClick={() => deleteSavedItem('materials', saved.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="quotes-tab">
            <div className="tab-header">
              <h3>Saved Quotes</h3>
              <p>Complete project quotes with all calculations</p>
              {Object.keys(projectData.dimensions).length > 0 && (
                <button onClick={saveCurrentProject} className="btn btn-secondary">
                  💾 Save Current Project
                </button>
              )}
            </div>
            
            {savedQuotes.length === 0 ? (
              <div className="empty-state">
                <p>No saved quotes yet.</p>
                <p>Complete a quote in the Quote Builder step to save it here.</p>
              </div>
            ) : (
              <div className="saved-items-grid">
                {savedQuotes.map(saved => (
                  <div key={saved.id} className="saved-item-card">
                    <div className="item-header">
                      <h4>{saved.name}</h4>
                      <span className="created-date">
                        {new Date(saved.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="item-details">
                      <p><strong>Project:</strong> {saved.projectData.projectType}</p>
                      <p><strong>Area:</strong> {saved.projectData.dimensions.area}m²</p>
                      {saved.projectData.dimensions.volume && (
                        <p><strong>Volume:</strong> {saved.projectData.dimensions.volume}m³</p>
                      )}
                      <p><strong>Materials:</strong> {saved.projectData.materials?.length || 0} items</p>
                      {saved.projectData.suppliers?.grandTotal && (
                        <p><strong>Total:</strong> ${saved.projectData.suppliers.grandTotal.toFixed(2)}</p>
                      )}
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        onClick={() => loadSavedQuote(saved)}
                        className="btn btn-primary btn-sm"
                      >
                        Load Quote
                      </button>
                      <button 
                        onClick={() => deleteSavedItem('quotes', saved.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedLists
