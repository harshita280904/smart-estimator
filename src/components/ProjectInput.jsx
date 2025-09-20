import { useEffect, useMemo, useState } from 'react'

const ProjectInput = ({ projectData, updateProjectData, nextStep }) => {
  const [dimensions, setDimensions] = useState(projectData.dimensions || {})
  const [projectType, setProjectType] = useState(projectData.projectType || '')
  const [manualInput, setManualInput] = useState(true)

  const projectTypes = useMemo(() => ([
    { id: 'wall',   name: 'Wall Construction', icon: '🧱' },
    { id: 'floor',  name: 'Flooring',          icon: '🏠' },
    { id: 'ceiling',name: 'Ceiling Work',      icon: '🔝' },
    { id: 'roof',   name: 'Roofing',           icon: '🏠' },
    { id: 'room',   name: 'Whole Room',        icon: '🏘️' },
    { id: 'house',  name: 'Whole House',       icon: '🏡' }
  ]), [])

  const handleDimensionChange = (key, value) => {
    const newDimensions = { ...dimensions, [key]: parseFloat(value) || 0 }
    setDimensions(newDimensions)
    updateProjectData('dimensions', newDimensions)
  }

  const handleProjectTypeChange = (type) => {
    setProjectType(type)
    updateProjectData('projectType', type)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      alert(`File "${file.name}" uploaded successfully!`)
      setManualInput(false)
      const mock = { length: 5.5, width: 4.2, height: 2.7, area: 23.1, volume: 62.37 }
      setDimensions(mock)
      updateProjectData('dimensions', mock)
    }
  }

  // --- RoomPlan deep-link ---
  const handleStartRoomPlanScan = () => {
    // Use current page as callback, but strip old params
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    const callbackUrl = url.toString()

    const params = new URLSearchParams({
      cb: callbackUrl,
      projectType: projectType || 'wall'
    })

    window.location.href = `roomscan://scan?${params.toString()}`
  }

  // Dev helper
  const simulateRoomPlanReturn = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('source', 'roomplan')
    url.searchParams.set('projectType', projectType || 'wall')
    url.searchParams.set('length_m', '3.84')
    url.searchParams.set('width_m',  projectType === 'wall' ? '' : '4.12')
    url.searchParams.set('height_m', ['wall','room','house'].includes(projectType) ? '2.40' : '')
    url.searchParams.set('timestamp', String(Date.now()))
    window.history.replaceState({}, '', url.toString())
    parseRoomPlanParams()
  }

  const parseRoomPlanParams = () => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('source') !== 'roomplan') return

    // project type from URL (if provided)
    const pt = sp.get('projectType')
    const effectiveType = pt || projectType
    if (pt && pt !== projectType) {
      setProjectType(pt)
      updateProjectData('projectType', pt)
    }

    const f = (k) => {
      const v = sp.get(k)
      return v == null || v === '' ? undefined : parseFloat(v)
    }
    const length = f('length_m')
    const width  = f('width_m')
    const height = f('height_m')

    const newDims = { ...dimensions }
    if (typeof length === 'number' && !Number.isNaN(length)) newDims.length = length
    if (typeof width  === 'number' && !Number.isNaN(width))  newDims.width  = width
    if (typeof height === 'number' && !Number.isNaN(height)) newDims.height = height

    // compute area/volume
    if (effectiveType === 'wall') {
      if (newDims.length && newDims.height) newDims.area = +(newDims.length * newDims.height).toFixed(2)
    } else {
      if (newDims.length && newDims.width)  newDims.area = +(newDims.length * newDims.width).toFixed(2)
    }
    if (['room','house'].includes(effectiveType)) {
      if (newDims.length && newDims.width && newDims.height) {
        newDims.volume = +(newDims.length * newDims.width * newDims.height).toFixed(2)
      }
    }

    setManualInput(false)
    setDimensions(newDims)
    updateProjectData('dimensions', newDims)

    // clean URL so refresh doesn’t reapply
    const clean = new URL(window.location.href)
    ;['source','projectType','length_m','width_m','height_m','timestamp']
      .forEach(k => clean.searchParams.delete(k))
    window.history.replaceState({}, '', clean.toString())
  }

  // Parse on mount + on URL change + on focus
  useEffect(() => {
    parseRoomPlanParams()

    const onPop = () => parseRoomPlanParams()
    const onFocus = () => parseRoomPlanParams()

    window.addEventListener('popstate', onPop)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('focus', onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType])

  const calculateArea = () => {
    if (projectType === 'wall') {
      if (dimensions.length && dimensions.height) {
        handleDimensionChange('area', dimensions.length * dimensions.height)
      }
    } else {
      if (dimensions.length && dimensions.width) {
        handleDimensionChange('area', dimensions.length * dimensions.width)
      }
    }
  }

  const calculateVolume = () => {
    if (['room','house'].includes(projectType)) {
      if (dimensions.length && dimensions.width && dimensions.height) {
        handleDimensionChange('volume', dimensions.length * dimensions.width * dimensions.height)
      }
    }
  }

  const canProceed = () => {
    if (!projectType) return false
    if (projectType === 'wall') {
      return dimensions.length > 0 && dimensions.height > 0
    } else if (['room','house'].includes(projectType)) {
      return dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0
    } else {
      return dimensions.length > 0 && dimensions.width > 0
    }
  }

  return (
    <div className="project-input">
      <h2>📐 Project Setup</h2>

      <div className="project-type-section">
        <h3>Select Project Type</h3>
        <div className="project-types">
          {projectTypes.map(type => (
            <div
              key={type.id}
              className={`project-type-card ${projectType === type.id ? 'selected' : ''}`}
              onClick={() => handleProjectTypeChange(type.id)}
            >
              <span className="project-icon">{type.icon}</span>
              <span className="project-name">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {projectType && (
        <div className="input-section">
          <h3>Upload/Scan or Enter Dimensions</h3>

          <div className="scan-section" style={{ marginBottom: 16 }}>
            <button type="button" className="btn" onClick={handleStartRoomPlanScan}>
              📱 Scan with iPhone (RoomPlan)
            </button>
            <button type="button" className="btn btn-secondary" onClick={simulateRoomPlanReturn} style={{ marginLeft: 8 }}>
              🧪 Simulate RoomPlan Return
            </button>
            <p className="upload-help" style={{ marginTop: 6 }}>
              After scanning, the app returns here and auto-fills length/width/height.
            </p>
          </div>

          <div className="divider">OR</div>

          <div className="upload-section">
            <label htmlFor="file-upload" className="upload-btn">📄 Upload PDF/CAD Plans</label>
            <input id="file-upload" type="file" accept=".pdf,.dwg,.dxf" onChange={handleFileUpload} style={{ display: 'none' }} />
            <p className="upload-help">Supported: PDF, DWG, DXF files</p>
          </div>

          <div className="divider">OR</div>

          <div className="manual-input">
            <h4>Manual Dimension Entry</h4>
            <div className="dimension-grid">
              <div className="input-group">
                <label>Length (m)</label>
                <input
                  type="number" step="0.01"
                  value={dimensions.length ?? ''}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  onBlur={() => { calculateArea(); calculateVolume(); }}
                />
              </div>

              {projectType !== 'wall' && (
                <div className="input-group">
                  <label>Width (m)</label>
                  <input
                    type="number" step="0.01"
                    value={dimensions.width ?? ''}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    onBlur={() => { calculateArea(); calculateVolume(); }}
                  />
                </div>
              )}

              {['wall','room','house'].includes(projectType) && (
                <div className="input-group">
                  <label>Height (m)</label>
                  <input
                    type="number" step="0.01"
                    value={dimensions.height ?? ''}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    onBlur={() => { calculateArea(); calculateVolume(); }}
                  />
                </div>
              )}
            </div>

            <div className="calculated-fields">
              <div className="input-group">
                <label>Area (m²)</label>
                <input type="number" step="0.01" value={dimensions.area ?? ''} readOnly style={{ backgroundColor: '#1e293b', cursor: 'not-allowed' }} />
              </div>

              {['room','house'].includes(projectType) && (
                <div className="input-group">
                  <label>Volume (m³)</label>
                  <input type="number" step="0.01" value={dimensions.volume ?? ''} readOnly style={{ backgroundColor: '#1e293b', cursor: 'not-allowed' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(dimensions.area > 0 || dimensions.volume > 0) && (
        <div className="summary">
          <h4>Project Summary</h4>
          <p><strong>Type:</strong> {projectTypes.find(t => t.id === projectType)?.name || 'Not selected'}</p>
          <p><strong>Dimensions:</strong>
            {projectType === 'wall'
              ? `${dimensions.length}m × ${dimensions.height}m`
              : `${dimensions.length}m × ${dimensions.width}m${dimensions.height ? ` × ${dimensions.height}m` : ''}`
            }
          </p>
          <p><strong>Total Area:</strong> {dimensions.area}m²</p>
          {['room','house'].includes(projectType) && <p><strong>Total Volume:</strong> {dimensions.volume}m³</p>}
        </div>
      )}

      <div className="navigation">
        <button className="btn btn-primary" onClick={nextStep} disabled={!canProceed()}>
          Next: Select Materials →
        </button>
      </div>
    </div>
  )
}

export default ProjectInput
