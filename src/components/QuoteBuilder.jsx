import { useState, useEffect } from 'react'

const QuoteBuilder = ({ projectData, updateProjectData, prevStep }) => {
  const [companyDetails, setCompanyDetails] = useState({
    name: 'Your Company Name',
    abn: '12 345 678 901',
    address: '123 Trade Street, Sydney NSW 2000',
    phone: '(02) 1234 5678',
    email: 'info@yourcompany.com.au',
    logo: '🏗️'
  })
  
  const [labourCosts, setLabourCosts] = useState({
    enabled: false,
    rate: 75, // per hour
    hours: 0
  })
  
  const [markup, setMarkup] = useState(20) // percentage
  const [gstRate] = useState(10) // GST is 10% in Australia
  const [quote, setQuote] = useState(null)
  const [clientDetails, setClientDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    generateQuote()
  }, [labourCosts, markup])

  const generateQuote = () => {
    const materialCost = projectData.suppliers?.grandTotal || 0
    const labourTotal = labourCosts.enabled ? labourCosts.rate * labourCosts.hours : 0
    const subtotal = materialCost + labourTotal
    const markupAmount = subtotal * (markup / 100)
    const subtotalWithMarkup = subtotal + markupAmount
    const gstAmount = subtotalWithMarkup * (gstRate / 100)
    const total = subtotalWithMarkup + gstAmount

    const newQuote = {
      quoteNumber: `Q${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-AU'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU'),
      project: {
        type: projectData.projectType,
        area: projectData.dimensions.area,
        description: `${projectData.projectType} project - ${projectData.dimensions.area}m²`
      },
      costs: {
        materials: materialCost,
        labour: labourTotal,
        subtotal: subtotal,
        markup: markupAmount,
        markupPercent: markup,
        subtotalWithMarkup: subtotalWithMarkup,
        gst: gstAmount,
        total: total
      },
      materials: projectData.quantities,
      suppliers: projectData.suppliers
    }

    setQuote(newQuote)
    updateProjectData('quote', newQuote)
    
    // Auto-save to history
    saveQuoteToHistory(newQuote)
  }

  const saveQuoteToHistory = (quoteData) => {
    try {
      const existingQuotes = JSON.parse(localStorage.getItem('quotesHistory') || '[]')
      
      // Check if quote already exists (update instead of duplicate)
      const existingIndex = existingQuotes.findIndex(q => q.quoteNumber === quoteData.quoteNumber)
      
      if (existingIndex >= 0) {
        existingQuotes[existingIndex] = {
          ...quoteData,
          updatedAt: new Date().toISOString()
        }
      } else {
        existingQuotes.unshift({
          ...quoteData,
          createdAt: new Date().toISOString()
        })
      }
      
      // Keep only last 50 quotes
      const limitedQuotes = existingQuotes.slice(0, 50)
      
      localStorage.setItem('quotesHistory', JSON.stringify(limitedQuotes))
    } catch (error) {
      console.error('Failed to save quote to history:', error)
    }
  }

  const updateCompanyDetail = (field, value) => {
    setCompanyDetails(prev => ({ ...prev, [field]: value }))
  }

  const updateClientDetail = (field, value) => {
    setClientDetails(prev => ({ ...prev, [field]: value }))
  }

  const updateLabourCost = (field, value) => {
    setLabourCosts(prev => ({ ...prev, [field]: value }))
  }

  const exportToPDF = () => {
    // In a real app, this would generate a proper PDF
    const quoteContent = generateQuoteHTML()
    const printWindow = window.open('', '_blank')
    printWindow.document.write(quoteContent)
    printWindow.document.close()
    printWindow.print()
  }

  const exportToCSV = () => {
    if (!quote) return

    const csvContent = [
      ['TradeQuote Pro - Bill of Quantities'],
      [''],
      ['Quote Number', quote.quoteNumber],
      ['Date', quote.date],
      ['Project', quote.project.description],
      [''],
      ['Item', 'Quantity', 'Unit', 'Unit Price', 'Total Price', 'Supplier'],
      ...Object.entries(projectData.quantities).map(([id, qty]) => {
        const supplierId = projectData.suppliers?.selected[id]
        const supplierPrice = projectData.suppliers?.prices[id]?.[supplierId]
        const supplierName = supplierId ? 
          (supplierId === 'bunnings' ? 'Bunnings Warehouse' :
           supplierId === 'mitre10' ? 'Mitre 10' :
           supplierId === 'tradezone' ? 'TradeZone' :
           'Local Building Supplies') : ''
        
        return [
          qty.material.name,
          qty.finalQuantity,
          qty.unit,
          supplierPrice?.unitPrice || 0,
          supplierPrice?.totalPrice || 0,
          supplierName
        ]
      }),
      [''],
      ['Materials Subtotal', '', '', '', quote.costs.materials],
      ['Labour', '', '', '', quote.costs.labour],
      ['Service Fee (' + quote.costs.markupPercent + '%)', '', '', '', quote.costs.markup],
      ['GST (' + gstRate + '%)', '', '', '', quote.costs.gst],
      ['TOTAL', '', '', '', quote.costs.total]
    ]

    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-${quote.quoteNumber}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateQuoteHTML = () => {
    if (!quote) return ''

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quote ${quote.quoteNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company { text-align: left; }
        .quote-info { text-align: right; }
        .client { margin: 20px 0; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .totals { float: right; width: 300px; }
        .total-row { font-weight: bold; }
        .terms { margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">
          <h1>${companyDetails.logo} ${companyDetails.name}</h1>
          <p>ABN: ${companyDetails.abn}</p>
          <p>${companyDetails.address}</p>
          <p>Phone: ${companyDetails.phone}</p>
          <p>Email: ${companyDetails.email}</p>
        </div>
        <div class="quote-info">
          <h2>QUOTE</h2>
          <p><strong>Quote #:</strong> ${quote.quoteNumber}</p>
          <p><strong>Date:</strong> ${quote.date}</p>
          <p><strong>Valid Until:</strong> ${quote.validUntil}</p>
        </div>
      </div>

      <div class="client">
        <h3>Quote For:</h3>
        <p><strong>${clientDetails.name || 'Client Name'}</strong></p>
        <p>${clientDetails.address || 'Client Address'}</p>
        <p>${clientDetails.phone || 'Client Phone'}</p>
        <p>${clientDetails.email || 'Client Email'}</p>
      </div>

      <div class="section">
        <h3>Project Description</h3>
        <p>${quote.project.description}</p>
      </div>

      <div class="section">
        <h3>Bill of Quantities</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(projectData.quantities).map(([id, qty]) => {
              const supplierId = projectData.suppliers?.selected[id]
              const supplierPrice = projectData.suppliers?.prices[id]?.[supplierId]
              
              return `<tr>
                <td>${qty.material.name}</td>
                <td>${qty.finalQuantity}</td>
                <td>${qty.unit}</td>
                <td>$${supplierPrice?.unitPrice?.toFixed(2) || '0.00'}</td>
                <td>$${supplierPrice?.totalPrice?.toFixed(2) || '0.00'}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <table>
          <tr><td>Materials Subtotal:</td><td>$${quote.costs.materials.toFixed(2)}</td></tr>
          ${quote.costs.labour > 0 ? `<tr><td>Labour:</td><td>$${quote.costs.labour.toFixed(2)}</td></tr>` : ''}
          <tr><td>Subtotal:</td><td>$${quote.costs.subtotal.toFixed(2)}</td></tr>
          <tr><td>Service Fee (${quote.costs.markupPercent}%):</td><td>$${quote.costs.markup.toFixed(2)}</td></tr>
          <tr><td>GST (${gstRate}%):</td><td>$${quote.costs.gst.toFixed(2)}</td></tr>
          <tr class="total-row"><td><strong>TOTAL:</strong></td><td><strong>$${quote.costs.total.toFixed(2)}</strong></td></tr>
        </table>
      </div>

      <div class="terms">
        <h3>Terms & Conditions</h3>
        <ul>
          <li>Quote valid for 30 days from date of issue</li>
          <li>50% deposit required to commence work</li>
          <li>Final payment due on completion</li>
          <li>Materials subject to availability</li>
          <li>Additional charges may apply for variations</li>
        </ul>
      </div>
    </body>
    </html>
    `
  }

  if (!quote) {
    return <div>Generating quote...</div>
  }

  return (
    <div className="quote-builder">
      <h2>📄 Quote Builder</h2>

      {/* Company Details */}
      <div className="company-section">
        <h3>🏢 Company Details</h3>
        <div className="company-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Company Name"
              value={companyDetails.name}
              onChange={(e) => updateCompanyDetail('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="ABN"
              value={companyDetails.abn}
              onChange={(e) => updateCompanyDetail('abn', e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Address"
            value={companyDetails.address}
            onChange={(e) => updateCompanyDetail('address', e.target.value)}
          />
          <div className="form-row">
            <input
              type="text"
              placeholder="Phone"
              value={companyDetails.phone}
              onChange={(e) => updateCompanyDetail('phone', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={companyDetails.email}
              onChange={(e) => updateCompanyDetail('email', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="client-section">
        <h3>👤 Client Details</h3>
        <div className="client-form">
          <input
            type="text"
            placeholder="Client Name"
            value={clientDetails.name}
            onChange={(e) => updateClientDetail('name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Client Address"
            value={clientDetails.address}
            onChange={(e) => updateClientDetail('address', e.target.value)}
          />
          <div className="form-row">
            <input
              type="text"
              placeholder="Client Phone"
              value={clientDetails.phone}
              onChange={(e) => updateClientDetail('phone', e.target.value)}
            />
            <input
              type="email"
              placeholder="Client Email"
              value={clientDetails.email}
              onChange={(e) => updateClientDetail('email', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Labour Costs */}
      <div className="labour-section">
        <h3>👷 Labour Costs</h3>
        <div className="labour-toggle">
          <label>
            <input
              type="checkbox"
              checked={labourCosts.enabled}
              onChange={(e) => updateLabourCost('enabled', e.target.checked)}
            />
            Include labour costs
          </label>
        </div>
        
        {labourCosts.enabled && (
          <div className="labour-inputs">
            <div className="form-row">
              <div className="input-group">
                <label>Hourly Rate (AUD):</label>
                <input
                  type="number"
                  value={labourCosts.rate}
                  onChange={(e) => updateLabourCost('rate', parseFloat(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Estimated Hours:</label>
                <input
                  type="number"
                  value={labourCosts.hours}
                  onChange={(e) => updateLabourCost('hours', parseFloat(e.target.value))}
                />
              </div>
            </div>
            <p className="labour-total">Labour Total: ${(labourCosts.rate * labourCosts.hours).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Service Fee */}
      <div className="markup-section">
        <h3>💰 Service Fee & Pricing</h3>
        <div className="markup-control">
          <label>Service Fee Percentage:</label>
          <input
            type="range"
            min="0"
            max="50"
            value={markup}
            onChange={(e) => setMarkup(parseInt(e.target.value))}
          />
          <span>{markup}%</span>
        </div>
      </div>

      {/* Quote Preview */}
      <div className="quote-preview">
        <h3>📋 Quote Preview</h3>
        
        <div className="quote-header">
          <div className="quote-info">
            <h4>Quote #{quote.quoteNumber}</h4>
            <p>Date: {quote.date}</p>
            <p>Valid Until: {quote.validUntil}</p>
          </div>
          <div className="project-info">
            <h4>Project: {quote.project.description}</h4>
          </div>
        </div>

        <div className="quote-breakdown">
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Materials & Supplies</td>
                <td>${quote.costs.materials.toFixed(2)}</td>
              </tr>
              {quote.costs.labour > 0 && (
                <tr>
                  <td>Labour ({labourCosts.hours} hours @ ${labourCosts.rate}/hr)</td>
                  <td>${quote.costs.labour.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td>Subtotal</td>
                <td>${quote.costs.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Markup ({quote.costs.markupPercent}%)</td>
                <td>${quote.costs.markup.toFixed(2)}</td>
              </tr>
              <tr>
                <td>GST ({gstRate}%)</td>
                <td>${quote.costs.gst.toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td><strong>TOTAL (AUD)</strong></td>
                <td><strong>${quote.costs.total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>📤 Export Options</h3>
        <div className="export-buttons">
          <button className="btn btn-primary" onClick={exportToPDF}>
            📄 Export to PDF
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            📊 Export to CSV
          </button>
        </div>
      </div>

      <div className="navigation">
        <button className="btn btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <div className="success-message">
          <span>✅ Quote generated successfully!</span>
        </div>
      </div>
    </div>
  )
}

export default QuoteBuilder
