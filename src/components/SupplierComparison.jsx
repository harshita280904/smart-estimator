import { useState, useEffect } from 'react'

const SupplierComparison = ({ projectData, updateProjectData, nextStep, prevStep }) => {
  const [supplierPrices, setSupplierPrices] = useState({})
  const [selectedSuppliers, setSelectedSuppliers] = useState({})
  const [sortBy, setSortBy] = useState('cheapest') // cheapest, fastest, preferred
  const [deliveryPostcode, setDeliveryPostcode] = useState('2000')

  // Mock supplier database
  const suppliers = {
    bunnings: {
      name: 'Bunnings Warehouse',
      logo: '🔨',
      deliveryFee: 50,
      deliveryDays: 2,
      rating: 4.2,
      locations: ['Nationwide']
    },
    mitre10: {
      name: 'Mitre 10',
      logo: '🏪',
      deliveryFee: 45,
      deliveryDays: 1,
      rating: 4.0,
      locations: ['Nationwide']
    },
    tradezone: {
      name: 'TradeZone',
      logo: '🏭',
      deliveryFee: 30,
      deliveryDays: 3,
      rating: 4.5,
      locations: ['Major Cities']
    },
    localsupplier: {
      name: 'Local Building Supplies',
      logo: '🏢',
      deliveryFee: 25,
      deliveryDays: 1,
      rating: 4.3,
      locations: ['Local Area']
    }
  }

  useEffect(() => {
    generateSupplierPrices()
  }, [projectData.quantities])

  const generateSupplierPrices = () => {
    const prices = {}
    const { quantities } = projectData

    Object.entries(quantities).forEach(([materialId, qty]) => {
      prices[materialId] = {}
      
      // Skip supplier comparison for custom materials
      if (qty.material.isCustom || qty.material.customPrice) {
        // Use the custom price directly
        const customPrice = qty.material.customPrice || 0
        prices[materialId]['custom'] = {
          unitPrice: customPrice,
          totalPrice: Math.round(customPrice * qty.finalQuantity * 100) / 100,
          availability: 'Available',
          leadTime: 0,
          isCustom: true
        }
        return
      }
      
      // Generate realistic prices for each supplier for non-custom materials
      const basePrice = getBasePriceForMaterial(qty.material)
      
      Object.keys(suppliers).forEach(supplierId => {
        // Add some variation to prices (+/- 20%)
        const variation = 0.8 + Math.random() * 0.4
        const unitPrice = Math.round(basePrice * variation * 100) / 100
        const totalPrice = Math.round(unitPrice * qty.finalQuantity * 100) / 100
        
        prices[materialId][supplierId] = {
          unitPrice,
          totalPrice,
          availability: Math.random() > 0.1 ? 'In Stock' : 'Order Required',
          leadTime: Math.random() > 0.8 ? 7 : suppliers[supplierId].deliveryDays
        }
      })
    })

    setSupplierPrices(prices)
    
    // Auto-select cheapest suppliers initially or custom for custom materials
    const autoSelected = {}
    Object.entries(prices).forEach(([materialId, materialPrices]) => {
      if (materialPrices.custom?.isCustom) {
        autoSelected[materialId] = 'custom'
      } else {
        const cheapestSupplier = Object.entries(materialPrices).reduce((min, [supplierId, price]) => 
          price.totalPrice < materialPrices[min]?.totalPrice ? supplierId : min
        , Object.keys(materialPrices)[0])
        
        autoSelected[materialId] = cheapestSupplier
      }
    })
    
    setSelectedSuppliers(autoSelected)
  }

  const getBasePriceForMaterial = (material) => {
    // Realistic Australian prices (AUD)
    const priceMap = {
      'Plasterboard': 25, // per m²
      'Bulk Insulation': 15, // per m²
      'Interior Paint': 45, // per L
      'Common Bricks': 1.2, // per brick
      'Mortar Mix': 0.8, // per kg
      'Ceramic Tiles': 35, // per m²
      'Timber Flooring': 85, // per m²
      'Carpet': 40, // per m²
      'Tile Adhesive': 1.5, // per kg
      'Grout': 2.0, // per kg
      'Ceiling Paint': 42, // per L
      'Cornices': 12, // per m
      'Colorbond Roofing': 18, // per m²
      'Concrete Tiles': 12, // per m²
      'Timber Frame': 8, // per m
      'Roof Insulation': 16, // per m²
      'Tile Spacers': 15, // per pack
      'Drywall Screws': 8, // per kg
      'Joint Compound': 6 // per kg
    }

    // Find matching price by material name keywords
    for (const [key, price] of Object.entries(priceMap)) {
      if (material.name.includes(key)) {
        return price
      }
    }
    
    return 20 // Default price
  }

  const selectSupplier = (materialId, supplierId) => {
    setSelectedSuppliers(prev => ({
      ...prev,
      [materialId]: supplierId
    }))
  }

  const optimizeSelection = (criteria) => {
    setSortBy(criteria)
    const optimized = {}
    
    Object.entries(supplierPrices).forEach(([materialId, materialPrices]) => {
      let bestSupplier = Object.keys(materialPrices)[0]
      
      switch (criteria) {
        case 'cheapest':
          bestSupplier = Object.entries(materialPrices).reduce((min, [supplierId, price]) => 
            price.totalPrice < materialPrices[min]?.totalPrice ? supplierId : min
          , bestSupplier)
          break
          
        case 'fastest':
          bestSupplier = Object.entries(materialPrices).reduce((min, [supplierId, price]) => 
            price.leadTime < materialPrices[min]?.leadTime ? supplierId : min
          , bestSupplier)
          break
          
        case 'preferred':
          // Prefer local suppliers, then TradeZone, then others
          const preference = ['localsupplier', 'tradezone', 'mitre10', 'bunnings']
          bestSupplier = preference.find(supplierId => materialPrices[supplierId]) || bestSupplier
          break
      }
      
      optimized[materialId] = bestSupplier
    })
    
    setSelectedSuppliers(optimized)
  }

  const calculateTotals = () => {
    const totals = {}
    let grandTotal = 0
    let totalDelivery = 0
    const usedSuppliers = new Set()

    Object.entries(selectedSuppliers).forEach(([materialId, supplierId]) => {
      const price = supplierPrices[materialId]?.[supplierId]
      if (price) {
        if (price.isCustom) {
          // Handle custom materials separately
          if (!totals['custom']) {
            totals['custom'] = { materials: 0, delivery: 0, total: 0 }
          }
          totals['custom'].materials += price.totalPrice
        } else {
          // Handle regular suppliers
          if (!totals[supplierId]) {
            totals[supplierId] = { materials: 0, delivery: 0, total: 0 }
          }
          totals[supplierId].materials += price.totalPrice
          usedSuppliers.add(supplierId)
        }
      }
    })

    // Add delivery fees (one per supplier, no delivery for custom)
    usedSuppliers.forEach(supplierId => {
      const deliveryFee = suppliers[supplierId].deliveryFee
      totals[supplierId].delivery = deliveryFee
      totals[supplierId].total = totals[supplierId].materials + deliveryFee
      grandTotal += totals[supplierId].total
      totalDelivery += deliveryFee
    })

    // Add custom materials total (no delivery)
    if (totals['custom']) {
      totals['custom'].total = totals['custom'].materials
      grandTotal += totals['custom'].total
    }

    return { totals, grandTotal, totalDelivery }
  }

  const { totals, grandTotal, totalDelivery } = calculateTotals()

  const proceedToQuote = () => {
    updateProjectData('suppliers', {
      selected: selectedSuppliers,
      prices: supplierPrices,
      totals: totals,
      grandTotal: grandTotal
    })
    nextStep()
  }

  return (
    <div className="supplier-comparison">
      <h2>🏪 Supplier Comparison</h2>
      
      <div className="project-context">
        <p><strong>Materials to Source:</strong> {Object.keys(projectData.quantities).length}</p>
        <div className="delivery-info">
          <label>Delivery Postcode:</label>
          <input
            type="text"
            value={deliveryPostcode}
            onChange={(e) => setDeliveryPostcode(e.target.value)}
            placeholder="2000"
          />
        </div>
      </div>

      {/* Optimization Controls */}
      <div className="optimization-controls">
        <h3>🎯 Optimize Selection</h3>
        <div className="optimize-options">
          <label>
            <input
              type="radio"
              name="optimization"
              value="cheapest"
              checked={sortBy === 'cheapest'}
              onChange={(e) => optimizeSelection(e.target.value)}
            />
            💰 Cheapest Total
          </label>
          <label>
            <input
              type="radio"
              name="optimization"
              value="fastest"
              checked={sortBy === 'fastest'}
              onChange={(e) => optimizeSelection(e.target.value)}
            />
            ⚡ Fastest Delivery
          </label>
          <label>
            <input
              type="radio"
              name="optimization"
              value="preferred"
              checked={sortBy === 'preferred'}
              onChange={(e) => optimizeSelection(e.target.value)}
            />
            ⭐ Preferred Suppliers
          </label>
        </div>
      </div>

      {/* Material-by-Material Comparison */}
      <div className="material-comparisons">
        {Object.entries(projectData.quantities).map(([materialId, qty]) => {
          const materialPrices = supplierPrices[materialId] || {}
          const isCustomMaterial = qty.material.isCustom || qty.material.customPrice
          
          return (
            <div key={materialId} className="material-comparison">
              <h4>{qty.material.name}</h4>
              <p className="quantity">Quantity: {qty.finalQuantity} {qty.unit}</p>
              
              {isCustomMaterial ? (
                <div className="custom-material-display">
                  <div className="supplier-option selected">
                    <div className="supplier-header">
                      <span className="supplier-logo">🏷️</span>
                      <span className="supplier-name">Custom Material</span>
                      <span className="selected-badge">✓</span>
                    </div>
                    
                    <div className="price-info">
                      <div className="unit-price">${materialPrices.custom?.unitPrice || 0}/{qty.unit}</div>
                      <div className="total-price">${materialPrices.custom?.totalPrice || 0} total</div>
                    </div>
                    
                    <div className="supplier-details">
                      <span className="availability in-stock">Available</span>
                      <span className="delivery">Custom Pricing</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="supplier-options">
                  {Object.entries(suppliers).map(([supplierId, supplier]) => {
                    const price = materialPrices[supplierId]
                    const isSelected = selectedSuppliers[materialId] === supplierId
                    
                    if (!price) return null
                    
                    return (
                      <div
                        key={supplierId}
                        className={`supplier-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectSupplier(materialId, supplierId)}
                      >
                        <div className="supplier-header">
                          <span className="supplier-logo">{supplier.logo}</span>
                          <span className="supplier-name">{supplier.name}</span>
                          {isSelected && <span className="selected-badge">✓</span>}
                        </div>
                        
                        <div className="price-info">
                          <div className="unit-price">${price.unitPrice}/{qty.unit}</div>
                          <div className="total-price">${price.totalPrice} total</div>
                        </div>
                        
                        <div className="supplier-details">
                          <span className={`availability ${price.availability === 'In Stock' ? 'in-stock' : 'order-required'}`}>
                            {price.availability}
                          </span>
                          <span className="delivery">{price.leadTime} day{price.leadTime !== 1 ? 's' : ''}</span>
                          <span className="rating">★ {supplier.rating}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>📋 Order Summary</h3>
        
        {Object.entries(totals).map(([supplierId, total]) => (
          <div key={supplierId} className="supplier-total">
            <div className="supplier-header">
              <span>
                {supplierId === 'custom' ? '🏷️ Custom Materials' : `${suppliers[supplierId].logo} ${suppliers[supplierId].name}`}
              </span>
            </div>
            <div className="cost-breakdown">
              <div className="cost-line">
                <span>Materials:</span>
                <span>${total.materials.toFixed(2)}</span>
              </div>
              {supplierId !== 'custom' && (
                <div className="cost-line">
                  <span>Delivery:</span>
                  <span>${total.delivery.toFixed(2)}</span>
                </div>
              )}
              <div className="cost-line total">
                <span><strong>Subtotal:</strong></span>
                <span><strong>${total.total.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="grand-total">
          <div className="total-line">
            <span><strong>Total Materials Cost:</strong></span>
            <span><strong>${(grandTotal - totalDelivery).toFixed(2)}</strong></span>
          </div>
          <div className="total-line">
            <span><strong>Total Delivery:</strong></span>
            <span><strong>${totalDelivery.toFixed(2)}</strong></span>
          </div>
          <div className="total-line grand">
            <span><strong>GRAND TOTAL:</strong></span>
            <span><strong>${grandTotal.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Savings Information */}
      <div className="savings-info">
        <p><strong>💡 Tip:</strong> Current selection saves you money compared to single-supplier ordering</p>
      </div>

      <div className="navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={proceedToQuote}
        >
          Next: Generate Quote →
        </button>
      </div>
    </div>
  )
}

export default SupplierComparison
