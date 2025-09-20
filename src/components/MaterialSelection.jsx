import { useState, useEffect } from 'react'

const MaterialSelection = ({ projectData, updateProjectData, nextStep, prevStep }) => {
  const [selectedMaterials, setSelectedMaterials] = useState(projectData.materials || [])
  const [customMaterial, setCustomMaterial] = useState({ name: '', category: '', brand: '', price: '' })
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [currentMaterialForBranding, setCurrentMaterialForBranding] = useState(null)
  const [customBrandName, setCustomBrandName] = useState('')

  // Material database based on project type
  const materialDatabase = {
    wall: [
      // Framing
      { id: 1, name: 'Timber Studs 90x45mm', category: 'Framing', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Hyne Timber', 'Other'] },
      { id: 2, name: 'Steel Studs 64mm', category: 'Framing', unit: 'm', coverage: 1, brands: ['Rondo', 'CSR Bradford', 'Knauf', 'Other'] },
      { id: 3, name: 'Steel Tracks 64mm', category: 'Framing', unit: 'm', coverage: 1, brands: ['Rondo', 'CSR Bradford', 'Knauf', 'Other'] },
      { id: 4, name: 'Top & Bottom Plates 90x45mm', category: 'Framing', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Hyne Timber', 'Other'] },
      { id: 5, name: 'Noggings/Blocking 90x45mm', category: 'Framing', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Other'] },
      
      // Sheathing / Surface
      { id: 6, name: 'Plasterboard 13mm', category: 'Sheathing', unit: 'm²', coverage: 1, brands: ['Gyprock', 'USG Boral', 'CSR', 'Other'] },
      { id: 7, name: 'Joint Compound (Base)', category: 'Sheathing', unit: 'kg', coverage: 25, brands: ['USG Boral', 'Gyprock', 'Davco', 'Other'] },
      { id: 8, name: 'Joint Compound (Finish)', category: 'Sheathing', unit: 'kg', coverage: 30, brands: ['USG Boral', 'Gyprock', 'Davco', 'Other'] },
      { id: 9, name: 'Joint Tape (Mesh)', category: 'Sheathing', unit: 'm', coverage: 1, brands: ['USG Boral', 'Gyprock', 'Other'] },
      { id: 10, name: 'Joint Tape (Paper)', category: 'Sheathing', unit: 'm', coverage: 1, brands: ['USG Boral', 'Gyprock', 'Other'] },
      { id: 11, name: 'Corner Beads/Angle Trims', category: 'Sheathing', unit: 'm', coverage: 1, brands: ['Rondo', 'USG Boral', 'Gyprock', 'Other'] },
      
      // Insulation
      { id: 12, name: 'Acoustic Insulation Batts R1.5', category: 'Insulation', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Pink Batts', 'Other'] },
      { id: 13, name: 'Thermal Insulation Batts R2.5', category: 'Insulation', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Pink Batts', 'Other'] },
      
      // Fixings & Adhesives
      { id: 14, name: 'Drywall Screws 25mm', category: 'Fixings', unit: 'box', coverage: 1000, brands: ['Ramset', 'DeWalt', 'Makita', 'Other'] },
      { id: 15, name: 'Drywall Nails 30mm', category: 'Fixings', unit: 'kg', coverage: 1, brands: ['Ramset', 'Paslode', 'Other'] },
      { id: 16, name: 'Construction Adhesive', category: 'Adhesives', unit: 'tube', coverage: 10, brands: ['Sikaflex', 'Selleys', 'Bostik', 'Other'] },
      
      // Finish
      { id: 17, name: 'Primer/Sealer', category: 'Paint', unit: 'L', coverage: 12, brands: ['Dulux', 'British Paints', 'Taubmans', 'Other'] },
      { id: 18, name: 'Interior Paint', category: 'Paint', unit: 'L', coverage: 10, brands: ['Dulux', 'British Paints', 'Taubmans', 'Other'] },
      { id: 19, name: 'Skim/Plaster Coat', category: 'Paint', unit: 'kg', coverage: 20, brands: ['Gyprock', 'USG Boral', 'Other'] },
      
      // Masonry Alternative
      { id: 20, name: 'Common Bricks', category: 'Masonry', unit: 'each', coverage: 48, brands: ['PGH', 'Austral Bricks', 'Brickworks', 'Other'] },
      { id: 21, name: 'Concrete Blocks', category: 'Masonry', unit: 'each', coverage: 12.5, brands: ['Besser', 'Adbri Masonry', 'Other'] },
      { id: 22, name: 'Mortar Mix', category: 'Masonry', unit: 'kg', coverage: 1000, brands: ['Cement Australia', 'Boral', 'Other'] },
      { id: 23, name: 'Sand (Bricklaying)', category: 'Masonry', unit: 'm³', coverage: 1, brands: ['Local Quarry', 'Boral', 'Other'] },
      { id: 24, name: 'Cement', category: 'Masonry', unit: 'bag', coverage: 20, brands: ['Cement Australia', 'Adelaide Brighton', 'Other'] },
      { id: 25, name: 'Lime', category: 'Masonry', unit: 'bag', coverage: 40, brands: ['Graymont', 'Adelaide Brighton', 'Other'] }
    ],
    floor: [
      // Base
      { id: 26, name: 'Moisture Barrier/DPM', category: 'Base', unit: 'm²', coverage: 1, brands: ['Visqueen', 'Polyethylene Products', 'Other'] },
      { id: 27, name: 'Levelling Compound', category: 'Base', unit: 'kg', coverage: 20, brands: ['Mapei', 'Ardex', 'Davco', 'Other'] },
      { id: 28, name: 'Floor Screed', category: 'Base', unit: 'm³', coverage: 1, brands: ['Boral', 'Cement Australia', 'Other'] },
      
      // Underlayment
      { id: 29, name: 'Floor Underlay/Acoustic Layer', category: 'Underlayment', unit: 'm²', coverage: 1, brands: ['Roberts', 'Dunlop Flooring', 'Mapei', 'Other'] },
      { id: 30, name: 'Cement Sheet Underlay', category: 'Underlayment', unit: 'm²', coverage: 1, brands: ['Hardiebacker', 'Hebel', 'Other'] },
      
      // Tile Finishes
      { id: 31, name: 'Ceramic Tiles 600x600mm', category: 'Tiles', unit: 'm²', coverage: 1, brands: ['Beaumont', 'National Tiles', 'TileSpace', 'Other'] },
      { id: 32, name: 'Porcelain Tiles 600x600mm', category: 'Tiles', unit: 'm²', coverage: 1, brands: ['Beaumont', 'National Tiles', 'TileSpace', 'Other'] },
      { id: 33, name: 'Tile Adhesive', category: 'Tiles', unit: 'kg', coverage: 20, brands: ['Davco', 'Mapei', 'Ardex', 'Other'] },
      { id: 34, name: 'Grout', category: 'Tiles', unit: 'kg', coverage: 25, brands: ['Davco', 'Mapei', 'Other'] },
      { id: 35, name: 'Tile Trims', category: 'Tiles', unit: 'm', coverage: 1, brands: ['Schluter', 'Genesis', 'Other'] },
      
      // Timber Finishes
      { id: 36, name: 'Solid Timber Flooring 19mm', category: 'Timber', unit: 'm²', coverage: 1, brands: ['Boral Timber', 'Hurford Hardwood', 'Other'] },
      { id: 37, name: 'Engineered Timber Flooring', category: 'Timber', unit: 'm²', coverage: 1, brands: ['Quick-Step', 'Boral Timber', 'Other'] },
      { id: 38, name: 'Timber Underlay', category: 'Timber', unit: 'm²', coverage: 1, brands: ['Roberts', 'Dunlop Flooring', 'Other'] },
      { id: 39, name: 'Flooring Nails/Staples', category: 'Timber', unit: 'box', coverage: 1000, brands: ['Paslode', 'Stanley Bostitch', 'Other'] },
      { id: 40, name: 'Flooring Glue', category: 'Timber', unit: 'L', coverage: 10, brands: ['Bostik', 'Sika', 'Other'] },
      { id: 41, name: 'Timber Sealer', category: 'Timber', unit: 'L', coverage: 12, brands: ['Feast Watson', 'Cabots', 'Other'] },
      
      // Carpet Finishes
      { id: 42, name: 'Carpet Medium Pile', category: 'Carpet', unit: 'm²', coverage: 1, brands: ['Godfrey Hirst', 'Cavalier Carpets', 'Other'] },
      { id: 43, name: 'Carpet Heavy Pile', category: 'Carpet', unit: 'm²', coverage: 1, brands: ['Godfrey Hirst', 'Cavalier Carpets', 'Other'] },
      { id: 44, name: 'Carpet Underlay', category: 'Carpet', unit: 'm²', coverage: 1, brands: ['Dunlop Underlay', 'Tontine', 'Other'] },
      { id: 45, name: 'Carpet Trims', category: 'Carpet', unit: 'm', coverage: 1, brands: ['Genesis', 'Carpet Court', 'Other'] },
      
      // Vinyl/Hybrid Finishes
      { id: 46, name: 'Vinyl Planks', category: 'Vinyl', unit: 'm²', coverage: 1, brands: ['Karndean', 'Polyflor', 'Armstrong', 'Other'] },
      { id: 47, name: 'Hybrid Planks', category: 'Vinyl', unit: 'm²', coverage: 1, brands: ['Hybrid Flooring', 'Aqua-Step', 'Other'] },
      { id: 48, name: 'Vinyl Underlay', category: 'Vinyl', unit: 'm²', coverage: 1, brands: ['Roberts', 'Dunlop Flooring', 'Other'] },
      { id: 49, name: 'Vinyl Adhesive', category: 'Vinyl', unit: 'L', coverage: 15, brands: ['Mapei', 'Roberts', 'Other'] }
    ],
    roof: [
      // Structural
      { id: 50, name: 'Roof Trusses', category: 'Structural', unit: 'each', coverage: 1, brands: ['Multinail', 'MiTek', 'Pryda', 'Other'] },
      { id: 51, name: 'Timber Rafters 190x45mm', category: 'Structural', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Other'] },
      { id: 52, name: 'Timber Battens 38x25mm', category: 'Structural', unit: 'm', coverage: 1, brands: ['Boral Timber', 'Carter Holt Harvey', 'Other'] },
      { id: 53, name: 'Steel Purlins C150', category: 'Structural', unit: 'm', coverage: 1, brands: ['Lysaght', 'Stramit', 'Other'] },
      { id: 54, name: 'Roof Bracing/Strapping', category: 'Structural', unit: 'm', coverage: 1, brands: ['Pryda', 'Simpson Strong-Tie', 'Other'] },
      { id: 55, name: 'Fascia Boards 190x25mm', category: 'Structural', unit: 'm', coverage: 1, brands: ['Boral Timber', 'James Hardie', 'Other'] },
      { id: 56, name: 'Soffit Boards', category: 'Structural', unit: 'm²', coverage: 1, brands: ['James Hardie', 'CSR', 'Other'] },
      
      // Metal Roofing
      { id: 57, name: 'Colorbond Roofing Sheets', category: 'Metal Roofing', unit: 'm²', coverage: 1, brands: ['BlueScope', 'Lysaght', 'Other'] },
      { id: 58, name: 'Zincalume Roofing Sheets', category: 'Metal Roofing', unit: 'm²', coverage: 1, brands: ['BlueScope', 'Lysaght', 'Other'] },
      { id: 59, name: 'Corrugated Iron Sheets', category: 'Metal Roofing', unit: 'm²', coverage: 1, brands: ['Stramit', 'Lysaght', 'Other'] },
      
      // Tile Roofing
      { id: 60, name: 'Concrete Roof Tiles', category: 'Tile Roofing', unit: 'm²', coverage: 1, brands: ['Monier', 'Bristile', 'Boral', 'Other'] },
      { id: 61, name: 'Terracotta Roof Tiles', category: 'Tile Roofing', unit: 'm²', coverage: 1, brands: ['Monier', 'Bristile', 'Other'] },
      { id: 62, name: 'Slate Tiles', category: 'Tile Roofing', unit: 'm²', coverage: 1, brands: ['Australian Slate', 'Welsh Slate', 'Other'] },
      
      // Moisture & Thermal
      { id: 63, name: 'Roof Sarking/Underlayment', category: 'Moisture & Thermal', unit: 'm²', coverage: 1, brands: ['Bradford', 'Kingspan', 'Other'] },
      { id: 64, name: 'Roof Insulation Batts R3.5', category: 'Moisture & Thermal', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Pink Batts', 'Other'] },
      { id: 65, name: 'Roof Insulation Batts R6.0', category: 'Moisture & Thermal', unit: 'm²', coverage: 1, brands: ['Knauf', 'Bradford', 'Pink Batts', 'Other'] },
      { id: 66, name: 'Rigid Insulation Boards', category: 'Moisture & Thermal', unit: 'm²', coverage: 1, brands: ['Kingspan', 'Bradford Polymax', 'Other'] },
      { id: 67, name: 'Vapour Barrier', category: 'Moisture & Thermal', unit: 'm²', coverage: 1, brands: ['Visqueen', 'Bradford', 'Other'] },
      
      // Fixings & Flashings
      { id: 68, name: 'Roofing Screws (Metal)', category: 'Fixings', unit: 'box', coverage: 100, brands: ['Buildex', 'Ramset', 'Other'] },
      { id: 69, name: 'Roofing Nails (Tiles)', category: 'Fixings', unit: 'kg', coverage: 1, brands: ['Paslode', 'Ramset', 'Other'] },
      { id: 70, name: 'Lead Flashings', category: 'Fixings', unit: 'm', coverage: 1, brands: ['Stratco', 'Lysaght', 'Other'] },
      { id: 71, name: 'Aluminium Flashings', category: 'Fixings', unit: 'm', coverage: 1, brands: ['Stratco', 'Lysaght', 'Other'] },
      { id: 72, name: 'Valley Gutters', category: 'Fixings', unit: 'm', coverage: 1, brands: ['Stratco', 'Lysaght', 'Other'] },
      { id: 73, name: 'Ridge Caps', category: 'Fixings', unit: 'm', coverage: 1, brands: ['Monier', 'Bristile', 'Lysaght', 'Other'] },
      { id: 74, name: 'Hip Caps', category: 'Fixings', unit: 'm', coverage: 1, brands: ['Monier', 'Bristile', 'Lysaght', 'Other'] },
      
      // Drainage & Vents  
      { id: 75, name: 'Gutters 150mm', category: 'Drainage', unit: 'm', coverage: 1, brands: ['Stratco', 'Lysaght', 'Other'] },
      { id: 76, name: 'Downpipes 90mm', category: 'Drainage', unit: 'm', coverage: 1, brands: ['Stratco', 'Lysaght', 'Other'] },
      { id: 77, name: 'Gutter Guards', category: 'Drainage', unit: 'm', coverage: 1, brands: ['Leafbusters', 'Gutter-Vac', 'Other'] },
      { id: 78, name: 'Whirlybird Vents', category: 'Ventilation', unit: 'each', coverage: 1, brands: ['Edmonds', 'Bradford', 'Other'] },
      { id: 79, name: 'Ridge Vents', category: 'Ventilation', unit: 'm', coverage: 1, brands: ['Edmonds', 'Bradford', 'Other'] },
      { id: 80, name: 'Eave Vents', category: 'Ventilation', unit: 'm', coverage: 1, brands: ['Edmonds', 'Bradford', 'Other'] }
    ],
    ceiling: [
      { id: 81, name: 'Plasterboard 10mm', category: 'Sheeting', unit: 'm²', coverage: 1, brands: ['Gyprock', 'USG Boral', 'Other'] },
      { id: 82, name: 'Ceiling Paint', category: 'Paint', unit: 'L', coverage: 12, brands: ['Dulux', 'British Paints', 'Other'] },
      { id: 83, name: 'Cornices 90mm', category: 'Trim', unit: 'm', coverage: 1, brands: ['Gyprock', 'Rondo', 'Other'] }
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
      setCurrentMaterialForBranding(materialId)
      setShowBrandModal(true)
    } else {
      const newSelection = selectedMaterials.map(m => 
        m.id === materialId ? { ...m, selectedBrand: brand, customBrandName: null } : m
      )
      setSelectedMaterials(newSelection)
      updateProjectData('materials', newSelection)
    }
  }

  const handleCustomBrandSubmit = () => {
    if (customBrandName && currentMaterialForBranding) {
      const newSelection = selectedMaterials.map(m => 
        m.id === currentMaterialForBranding ? { 
          ...m, 
          selectedBrand: 'Other', 
          customBrandName: customBrandName 
        } : m
      )
      setSelectedMaterials(newSelection)
      updateProjectData('materials', newSelection)
      setShowBrandModal(false)
      setCustomBrandName('')
      setCurrentMaterialForBranding(null)
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
                        {selectedMaterial?.selectedBrand === 'Other' && selectedMaterial?.customBrandName && (
                          <p style={{ marginTop: '0.5rem', color: 'var(--success-color)' }}>
                            Brand: {selectedMaterial.customBrandName}
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

      {/* Brand Name Modal */}
      {showBrandModal && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <div className="auth-header">
              <h2>Enter Brand Name</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowBrandModal(false)
                  setCustomBrandName('')
                  setCurrentMaterialForBranding(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="auth-form">
              <div className="input-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  placeholder="Enter brand name..."
                />
              </div>
              <button 
                className="btn btn-primary auth-submit" 
                onClick={handleCustomBrandSubmit}
                disabled={!customBrandName}
              >
                Set Brand
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
                  style={{ maxWidth: '80px' }}
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
