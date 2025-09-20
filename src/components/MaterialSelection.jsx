import { useState, useEffect } from 'react'

const MaterialSelection = ({ projectData, updateProjectData, nextStep, prevStep }) => {
  const [selectedMaterials, setSelectedMaterials] = useState(projectData.materials || [])
  const [customMaterial, setCustomMaterial] = useState({ name: '', category: '', brand: '', price: '' })
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [currentMaterialForPricing, setCurrentMaterialForPricing] = useState(null)
  const [customPrice, setCustomPrice] = useState('')

  // Material database based on project type
  const materialDatabase = {
    wall: [
      { id: 1, name: 'Plasterboard 13mm', category: 'Sheeting', unit: 'm²', coverage: 1, brands: ['Gyprock', 'USG Boral', 'CSR', 'Other'] },
      { id: 2, name: 'Bulk Insulation R2.5', category: 'Insulation', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Pink Batts', 'Other'] },
      { id: 3, name: 'Interior Paint', category: 'Paint', unit: 'L', coverage: 10, brands: ['Dulux', 'British Paints', 'Taubmans', 'Other'] },
      { id: 4, name: 'Common Bricks', category: 'Masonry', unit: 'each', coverage: 48, brands: ['PGH', 'Austral Bricks', 'Brickworks', 'Other'] },
      { id: 5, name: 'Mortar Mix', category: 'Adhesives', unit: 'kg', coverage: 1000, brands: ['Cement Australia', 'Boral', 'Other'] }
    ],
    floor: [
      { id: 6, name: 'Ceramic Tiles 600x600', category: 'Tiles', unit: 'm²', coverage: 1, brands: ['Beaumont', 'National Tiles', 'TileSpace', 'Other'] },
      { id: 7, name: 'Timber Flooring 19mm', category: 'Timber', unit: 'm²', coverage: 1, brands: ['Boral Timber', 'Hurford Hardwood', 'Other'] },
      { id: 8, name: 'Carpet Medium Pile', category: 'Carpet', unit: 'm²', coverage: 1, brands: ['Godfrey Hirst', 'Cavalier Carpets', 'Other'] },
      { id: 9, name: 'Tile Adhesive', category: 'Adhesives', unit: 'kg', coverage: 20, brands: ['Davco', 'Mapei', 'Ardex', 'Other'] },
      { id: 10, name: 'Grout', category: 'Adhesives', unit: 'kg', coverage: 25, brands: ['Davco', 'Mapei', 'Other'] }
    ],
    ceiling: [
      { id: 11, name: 'Plasterboard 10mm', category: 'Sheeting', unit: 'm²', coverage: 1, brands: ['Gyprock', 'USG Boral', 'Other'] },
      { id: 12, name: 'Ceiling Paint', category: 'Paint', unit: 'L', coverage: 12, brands: ['Dulux', 'British Paints', 'Other'] },
      { id: 13, name: 'Cornices 90mm', category: 'Trim', unit: 'm', coverage: 1, brands: ['Gyprock', 'Rondo', 'Other'] }
    ],
    roof: [
      { id: 14, name: 'Colorbond Roofing', category: 'Roofing', unit: 'm²', coverage: 1, brands: ['BlueScope', 'Stramit', 'Other'] },
      { id: 15, name: 'Concrete Tiles', category: 'Roofing', unit: 'm²', coverage: 1, brands: ['Monier', 'Bristile', 'Other'] },
      { id: 16, name: 'Timber Frame 90x35', category: 'Framing', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Other'] },
      { id: 17, name: 'Roof Insulation', category: 'Insulation', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Other'] }
    ],
    room: [
      // Combination of wall, floor, ceiling materials
    ],
    house: [
      // Combination of all materials
    ]
  }

  useEffect(() => {
    // No longer loading saved materials here - moved to separate component
  }, [])

  const getRecommendedMaterials = () => {
    const projectType = projectData.projectType
    if (projectType === 'room') {
      return [...materialDatabase.wall, ...materialDatabase.floor, ...materialDatabase.ceiling]
    }
    if (projectType === 'house') {
      return Object.values(materialDatabase).flat()
    }
    return materialDatabase[projectType] || []
  }

  const toggleMaterial = (material) => {
    const isSelected = selectedMaterials.some(m => m.id === material.id)
    let newSelection
    
    if (isSelected) {
      newSelection = selectedMaterials.filter(m => m.id !== material.id)
    } else {
      newSelection = [...selectedMaterials, { ...material, selectedBrand: material.brands[0] }]
    }
    
    setSelectedMaterials(newSelection)
    updateProjectData('materials', newSelection)
  }

  const updateMaterialBrand = (materialId, brand) => {
    if (brand === 'Other') {
      setCurrentMaterialForPricing(materialId)
      setShowPriceModal(true)
    } else {
      const newSelection = selectedMaterials.map(m => 
        m.id === materialId ? { ...m, selectedBrand: brand, customPrice: null } : m
      )
      setSelectedMaterials(newSelection)
      updateProjectData('materials', newSelection)
    }
  }

  const handleCustomPriceSubmit = () => {
    if (customPrice && currentMaterialForPricing) {
      const newSelection = selectedMaterials.map(m => 
        m.id === currentMaterialForPricing ? { 
          ...m, 
          selectedBrand: 'Other', 
          customPrice: parseFloat(customPrice) 
        } : m
      )
      setSelectedMaterials(newSelection)
      updateProjectData('materials', newSelection)
      setShowPriceModal(false)
      setCustomPrice('')
      setCurrentMaterialForPricing(null)
    }
  }

  const addCustomMaterial = () => {
    if (customMaterial.name && customMaterial.category && customMaterial.price) {
      const newMaterial = {
        id: Date.now(),
        name: customMaterial.name,
        category: customMaterial.category,
        unit: 'each',
        coverage: 1,
        brands: [customMaterial.brand || 'Custom'],
        selectedBrand: customMaterial.brand || 'Custom',
        customPrice: parseFloat(customMaterial.price),
        isCustom: true
      }
      
      const newSelection = [...selectedMaterials, newMaterial]
      setSelectedMaterials(newSelection)
      updateProjectData('materials', newSelection)
      setCustomMaterial({ name: '', category: '', brand: '', price: '' })
    }
  }

  const saveMaterialList = () => {
    const currentSaved = JSON.parse(localStorage.getItem('savedMaterials') || '[]')
    const newSaved = [...currentSaved, {
      id: Date.now(),
      name: `${projectData.projectType} - ${new Date().toLocaleDateString()}`,
      materials: selectedMaterials,
      projectType: projectData.projectType
    }]
    localStorage.setItem('savedMaterials', JSON.stringify(newSaved))
    alert('Material list saved! View it in the Saved Lists tab.')
  }

  const recommendedMaterials = getRecommendedMaterials()
  const categories = [...new Set(recommendedMaterials.map(m => m.category))]

  return (
    <div className="material-selection">
      <h2>🧱 Material Selection</h2>
      
      <div className="project-context">
        <p><strong>Project:</strong> {projectData.projectType} - {projectData.dimensions.volume}m³ ({projectData.dimensions.area}m²)</p>
      </div>

      {/* Material Categories */}
      {categories.map(category => (
        <div key={category} className="material-category">
          <h3>{category}</h3>
          <div className="materials-grid">
            {recommendedMaterials
              .filter(m => m.category === category)
              .map(material => {
                const isSelected = selectedMaterials.some(m => m.id === material.id)
                const selectedMaterial = selectedMaterials.find(m => m.id === material.id)
                
                return (
                  <div key={material.id} className={`material-card ${isSelected ? 'selected' : ''}`}>
                    <div className="material-header" onClick={() => toggleMaterial(material)}>
                      <h4>{material.name}</h4>
                      <span className="unit">per {material.unit}</span>
                    </div>
                    
                    {isSelected && (
                      <div className="brand-selection">
                        <label>Brand:</label>
                        <select
                          value={selectedMaterial?.selectedBrand || material.brands[0]}
                          onChange={(e) => updateMaterialBrand(material.id, e.target.value)}
                        >
                          {material.brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                        {selectedMaterial?.selectedBrand === 'Other' && selectedMaterial?.customPrice && (
                          <p style={{ marginTop: '0.5rem', color: 'var(--success-color)' }}>
                            Custom price: ${selectedMaterial.customPrice} per {material.unit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      ))}

      {/* Custom Material */}
      <div className="custom-material">
        <h3>➕ Add Custom Material</h3>
        <div className="custom-form">
          <input
            type="text"
            placeholder="Material name"
            value={customMaterial.name}
            onChange={(e) => setCustomMaterial(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Category"
            value={customMaterial.category}
            onChange={(e) => setCustomMaterial(prev => ({ ...prev, category: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Brand (optional)"
            value={customMaterial.brand}
            onChange={(e) => setCustomMaterial(prev => ({ ...prev, brand: e.target.value }))}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price per unit ($)"
            value={customMaterial.price}
            onChange={(e) => setCustomMaterial(prev => ({ ...prev, price: e.target.value }))}
          />
          <button onClick={addCustomMaterial} className="btn btn-secondary">
            Add Material
          </button>
        </div>
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <div className="auth-header">
              <h2>Enter Custom Price</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowPriceModal(false)
                  setCustomPrice('')
                  setCurrentMaterialForPricing(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="auth-form">
              <div className="input-group">
                <label>Price per unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Enter price..."
                />
              </div>
              <button 
                className="btn btn-primary auth-submit" 
                onClick={handleCustomPriceSubmit}
                disabled={!customPrice}
              >
                Set Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Materials Summary */}
      {selectedMaterials.length > 0 && (
        <div className="selected-summary">
          <h3>Selected Materials ({selectedMaterials.length})</h3>
          <div className="selected-list">
            {selectedMaterials.map(material => (
              <div key={material.id} className="selected-item">
                <span>
                  {material.name} ({material.selectedBrand})
                  {material.customPrice && ` - $${material.customPrice}`}
                </span>
                <button 
                  onClick={() => toggleMaterial(material)}
                  className="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button onClick={saveMaterialList} className="btn btn-secondary">
            💾 Save Material List
          </button>
        </div>
      )}

      <div className="navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={nextStep}
          disabled={selectedMaterials.length === 0}
        >
          Next: Calculate Quantities →
        </button>
      </div>
    </div>
  )
}

export default MaterialSelection
