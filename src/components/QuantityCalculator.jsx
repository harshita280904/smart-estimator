import { useState, useEffect } from 'react'

const QuantityCalculator = ({ projectData, updateProjectData, nextStep, prevStep }) => {
  const [quantities, setQuantities] = useState(projectData.quantities || {})
  const [wastagePercent, setWastagePercent] = useState(10)
  const [labourRates, setLabourRates] = useState({
    bricklayer: 400, // bricks per day
    painter: 100, // m² per day
    tiler: 20, // m² per day
    carpenter: 50 // m² per day
  })
  const [includeLabour, setIncludeLabour] = useState(false)
  const [pendingConsumables, setPendingConsumables] = useState([])
  const [showConsumablePrompt, setShowConsumablePrompt] = useState(false)

  const updateFinalQuantity = (materialId, newQuantity) => {
    const updatedQuantities = {
      ...quantities,
      [materialId]: {
        ...quantities[materialId],
        finalQuantity: parseFloat(newQuantity) || 0
      }
    }
    setQuantities(updatedQuantities)
    updateProjectData('quantities', updatedQuantities)
  }

  useEffect(() => {
    calculateQuantities()
  }, [projectData.materials, projectData.dimensions, wastagePercent])

  const calculateQuantities = () => {
    const { materials } = projectData
    const { area = 0, length = 0, width = 0, height = 0 } = projectData.dimensions
    const newQuantities = {}

    materials.forEach(material => {
      let baseQuantity = 0
      
      // Calculate base quantity based on material type and coverage
      switch (material.category) {
        case 'Sheeting': // Plasterboard
          if (material.name.includes('wall')) {
            baseQuantity = (length * 2 + width * 2) * height // Wall area
          } else {
            baseQuantity = area // Ceiling area
          }
          break
          
        case 'Paint':
          if (material.name.includes('Interior')) {
            baseQuantity = ((length * 2 + width * 2) * height) / material.coverage
          } else {
            baseQuantity = area / material.coverage
          }
          break
          
        case 'Tiles':
        case 'Timber':
        case 'Carpet':
        case 'Roofing':
          baseQuantity = area
          break
          
        case 'Masonry': // Bricks
          if (material.name.includes('Bricks')) {
            const wallArea = (length * 2 + width * 2) * height
            baseQuantity = wallArea * material.coverage // bricks per m²
          }
          break
          
        case 'Adhesives':
          if (material.name.includes('Mortar')) {
            baseQuantity = area / material.coverage * 1000 // kg
          } else if (material.name.includes('Adhesive')) {
            baseQuantity = area / material.coverage // kg
          } else if (material.name.includes('Grout')) {
            baseQuantity = area / material.coverage // kg
          }
          break
          
        case 'Insulation':
          baseQuantity = area
          break
          
        case 'Framing':
          // Simplified framing calculation - 600mm centers
          baseQuantity = Math.ceil(length / 0.6) * height + Math.ceil(width / 0.6) * height
          break
          
        case 'Trim':
          baseQuantity = (length + width) * 2 // Perimeter
          break
          
        default:
          baseQuantity = area
      }

      // Add wastage
      const quantityWithWastage = baseQuantity * (1 + wastagePercent / 100)
      
      // Round up to reasonable units
      let finalQuantity
      if (material.unit === 'each') {
        finalQuantity = Math.ceil(quantityWithWastage)
      } else if (material.unit === 'kg') {
        finalQuantity = Math.ceil(quantityWithWastage)
      } else if (material.unit === 'L') {
        finalQuantity = Math.ceil(quantityWithWastage)
      } else {
        finalQuantity = Math.ceil(quantityWithWastage * 10) / 10 // Round to 1 decimal
      }

      newQuantities[material.id] = {
        material: material,
        baseQuantity: Math.ceil(baseQuantity * 10) / 10,
        wastage: Math.ceil((quantityWithWastage - baseQuantity) * 10) / 10,
        finalQuantity: finalQuantity,
        unit: material.unit
      }
    })

    // Check for new consumables and prompt user
    const consumables = getConsumables(materials, area)
    const existingConsumableIds = Object.keys(newQuantities).filter(id => 
      newQuantities[id].isConsumable
    )
    const newConsumables = consumables.filter(consumable => 
      !existingConsumableIds.includes(consumable.id)
    )

    if (newConsumables.length > 0) {
      setPendingConsumables(newConsumables)
      setShowConsumablePrompt(true)
    } else {
      // Add existing consumables back
      consumables.forEach(consumable => {
        if (existingConsumableIds.includes(consumable.id)) {
          newQuantities[consumable.id] = consumable
        }
      })
    }

    setQuantities(newQuantities)
    updateProjectData('quantities', newQuantities)
  }

  const acceptConsumables = () => {
    const updatedQuantities = { ...quantities }
    pendingConsumables.forEach(consumable => {
      updatedQuantities[consumable.id] = consumable
    })
    setQuantities(updatedQuantities)
    updateProjectData('quantities', updatedQuantities)
    setShowConsumablePrompt(false)
    setPendingConsumables([])
  }

  const denyConsumables = () => {
    setShowConsumablePrompt(false)
    setPendingConsumables([])
  }

  const removeConsumable = (consumableId) => {
    const updatedQuantities = { ...quantities }
    delete updatedQuantities[consumableId]
    setQuantities(updatedQuantities)
    updateProjectData('quantities', updatedQuantities)
  }

  const getConsumables = (materials, area) => {
    const consumables = []
    
    // Check if we have tiles - add spacers and sealant
    if (materials.some(m => m.category === 'Tiles')) {
      consumables.push({
        id: 'spacers',
        material: { name: 'Tile Spacers 2mm', category: 'Consumables', unit: 'pack' },
        baseQuantity: Math.ceil(area / 10),
        wastage: 0,
        finalQuantity: Math.ceil(area / 10),
        unit: 'pack',
        isConsumable: true
      })
    }
    
    // Check if we have plasterboard - add screws and compound
    if (materials.some(m => m.category === 'Sheeting')) {
      consumables.push({
        id: 'screws',
        material: { name: 'Drywall Screws', category: 'Consumables', unit: 'kg' },
        baseQuantity: Math.ceil(area / 20),
        wastage: 0,
        finalQuantity: Math.ceil(area / 20),
        unit: 'kg',
        isConsumable: true
      })
      
      consumables.push({
        id: 'compound',
        material: { name: 'Joint Compound', category: 'Consumables', unit: 'kg' },
        baseQuantity: Math.ceil(area / 15),
        wastage: 0,
        finalQuantity: Math.ceil(area / 15),
        unit: 'kg',
        isConsumable: true
      })
    }
    
    return consumables
  }

  const calculateLabourDays = (materialId, quantity) => {
    const material = quantities[materialId]?.material
    if (!material) return 0

    switch (material.category) {
      case 'Masonry':
        return Math.ceil(quantity / labourRates.bricklayer)
      case 'Paint':
        return Math.ceil((quantity * material.coverage) / labourRates.painter)
      case 'Tiles':
        return Math.ceil(quantity / labourRates.tiler)
      case 'Sheeting':
      case 'Framing':
        return Math.ceil(quantity / labourRates.carpenter)
      default:
        return Math.ceil(quantity / 20) // Default rate
    }
  }

  const updateWastage = (value) => {
    setWastagePercent(value)
  }

  const updateLabourRate = (trade, rate) => {
    setLabourRates(prev => ({ ...prev, [trade]: rate }))
  }

  return (
    <div className="quantity-calculator">
      <h2>📊 Quantity Calculator</h2>
      
      <div className="project-context">
        <p><strong>Project:</strong> {projectData.projectType} - {projectData.dimensions.area}m²</p>
        <p><strong>Materials Selected:</strong> {projectData.materials.length}</p>
      </div>

      {/* Wastage Control */}
      <div className="wastage-control">
        <h3>🗑️ Wastage Factor</h3>
        <div className="wastage-input">
          <label>Wastage Percentage:</label>
          <input
            type="range"
            min="5"
            max="25"
            value={wastagePercent}
            onChange={(e) => updateWastage(parseInt(e.target.value))}
          />
          <span>{wastagePercent}%</span>
        </div>
        <p className="help-text">Industry standard: 10-15% for most materials</p>
      </div>

      {/* Labour Productivity */}
      <div className="labour-section">
        <h3>👷 Labour Productivity</h3>
        <div className="labour-toggle">
          <label>
            <input
              type="checkbox"
              checked={includeLabour}
              onChange={(e) => setIncludeLabour(e.target.checked)}
            />
            Include labour time estimates
          </label>
        </div>
        
        {includeLabour && (
          <div className="labour-rates">
            <div className="rate-input">
              <label>Bricklayer (bricks/day):</label>
              <input
                type="number"
                value={labourRates.bricklayer}
                onChange={(e) => updateLabourRate('bricklayer', parseInt(e.target.value))}
              />
            </div>
            <div className="rate-input">
              <label>Painter (m²/day):</label>
              <input
                type="number"
                value={labourRates.painter}
                onChange={(e) => updateLabourRate('painter', parseInt(e.target.value))}
              />
            </div>
            <div className="rate-input">
              <label>Tiler (m²/day):</label>
              <input
                type="number"
                value={labourRates.tiler}
                onChange={(e) => updateLabourRate('tiler', parseInt(e.target.value))}
              />
            </div>
            <div className="rate-input">
              <label>Carpenter (m²/day):</label>
              <input
                type="number"
                value={labourRates.carpenter}
                onChange={(e) => updateLabourRate('carpenter', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Consumable Prompt Modal */}
      {showConsumablePrompt && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <div className="auth-header">
              <h2>🔧 Add Recommended Materials?</h2>
            </div>
            <div className="consumable-prompt">
              <p>Based on your selected materials, we recommend adding these consumables:</p>
              <div className="pending-consumables">
                {pendingConsumables.map(consumable => (
                  <div key={consumable.id} className="consumable-item">
                    <span className="consumable-name">{consumable.material.name}</span>
                    <span className="consumable-qty">{consumable.finalQuantity} {consumable.unit}</span>
                  </div>
                ))}
              </div>
              <div className="consumable-actions">
                <button onClick={acceptConsumables} className="btn btn-primary">
                  ✅ Add All
                </button>
                <button onClick={denyConsumables} className="btn btn-secondary">
                  ❌ Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quantities Table */}
      <div className="quantities-table">
        <h3>📋 Bill of Quantities</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
          📝 The quantities have been estimated for you based on your project dimensions. You can edit them if needed.
        </p>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Base Qty</th>
              <th>Wastage</th>
              <th>Final Qty</th>
              <th>Unit</th>
              {includeLabour && <th>Labour Days</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(quantities).map(([id, qty]) => (
              <tr key={id} className={qty.isConsumable ? 'consumable' : ''}>
                <td>
                  {qty.material.name}
                  {qty.isConsumable && <span className="consumable-tag">Auto-added</span>}
                </td>
                <td>{qty.material.category}</td>
                <td>{qty.baseQuantity}</td>
                <td>{qty.wastage}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    value={qty.finalQuantity}
                    onChange={(e) => updateFinalQuantity(id, e.target.value)}
                    style={{
                      width: '80px',
                      padding: '0.25rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}
                  />
                </td>
                <td>{qty.unit}</td>
                {includeLabour && (
                  <td>{calculateLabourDays(id, qty.finalQuantity)}</td>
                )}
                <td>
                  {qty.isConsumable && (
                    <button 
                      onClick={() => removeConsumable(id)}
                      className="btn btn-danger btn-sm"
                      title="Remove consumable"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="calculation-summary">
        <h3>📈 Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="label">Total Materials:</span>
            <span className="value">{Object.keys(quantities).length}</span>
          </div>
          <div className="stat">
            <span className="label">Project Area:</span>
            <span className="value">{projectData.dimensions.area}m²</span>
          </div>
          <div className="stat">
            <span className="label">Wastage Factor:</span>
            <span className="value">{wastagePercent}%</span>
          </div>
          {includeLabour && (
            <div className="stat">
              <span className="label">Est. Labour Days:</span>
              <span className="value">
                {Object.entries(quantities).reduce((total, [id, qty]) => 
                  total + calculateLabourDays(id, qty.finalQuantity), 0
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={nextStep}
          disabled={Object.keys(quantities).length === 0}
        >
          Next: Compare Suppliers →
        </button>
      </div>
    </div>
  )
}

export default QuantityCalculator
