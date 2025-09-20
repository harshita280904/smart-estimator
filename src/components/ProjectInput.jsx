import { useState } from 'react'

const ProjectInput = ({ projectData, updateProjectData, nextStep }) => {
  const [dimensions, setDimensions] = useState(projectData.dimensions || {})
  const [projectType, setProjectType] = useState(projectData.projectType || '')
  const [manualInput, setManualInput] = useState(true)

  const projectTypes = [
    { id: 'wall', name: 'Wall Construction', icon: '🧱' },
    { id: 'floor', name: 'Flooring', icon: '🏠' },
    { id: 'ceiling', name: 'Ceiling Work', icon: '🔝' },
    { id: 'roof', name: 'Roofing', icon: '🏠' },
    { id: 'room', name: 'Whole Room', icon: '🏘️' },
    { id: 'house', name: 'Whole House', icon: '🏡' }
  ]

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
      // Simulate file processing
      alert(`File "${file.name}" uploaded successfully! In the full version, this would extract dimensions using AI.`)
      setManualInput(false)
      // Mock extracted dimensions
      const mockDimensions = {
        length: 5.5,
        width: 4.2,
        height: 2.7,
        area: 23.1,
        volume: 62.37
      }
      setDimensions(mockDimensions)
      updateProjectData('dimensions', mockDimensions)
    }
  }

  const calculateArea = () => {
    if (dimensions.length && dimensions.width) {
      const area = dimensions.length * dimensions.width
      handleDimensionChange('area', area)
    }
  }

  const calculateVolume = () => {
    if (dimensions.length && dimensions.width && dimensions.height) {
      const volume = dimensions.length * dimensions.width * dimensions.height
      handleDimensionChange('volume', volume)
    }
  }

  const canProceed = () => {
    if (!projectType || !dimensions.length || !dimensions.width) return false;
    
    // For wall, room, and house projects, we need height
    if (['wall', 'room', 'house'].includes(projectType)) {
      return dimensions.height > 0;
    }
    
    // For floor, ceiling, and roof projects, we only need length and width
    return true;
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
          <h3>Upload Plans or Enter Dimensions</h3>
          
          <div className="upload-section">
            <label htmlFor="file-upload" className="upload-btn">
              📄 Upload PDF/CAD Plans
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.dwg,.dxf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <p className="upload-help">Supported: PDF, DWG, DXF files</p>
          </div>

          <div className="divider">OR</div>

          <div className="manual-input">
            <h4>Manual Dimension Entry</h4>
            <div className="dimension-grid">
              <div className="input-group">
                <label>Length (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dimensions.length || ''}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  onBlur={() => { calculateArea(); calculateVolume(); }}
                />
              </div>
              
              <div className="input-group">
                <label>Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dimensions.width || ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  onBlur={() => { calculateArea(); calculateVolume(); }}
                />
              </div>
              
              {['wall', 'room', 'house'].includes(projectType) && (
                <div className="input-group">
                  <label>Height (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dimensions.height || ''}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    onBlur={() => { calculateArea(); calculateVolume(); }}
                  />
                </div>
              )}
            </div>

            <div className="calculated-fields">
              <div className="input-group">
                <label>Area (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dimensions.area || ''}
                  readOnly
                  style={{ backgroundColor: '#1e293b', cursor: 'not-allowed' }}
                />
              </div>

              {['wall', 'room', 'house'].includes(projectType) && (
                <div className="input-group">
                  <label>Volume (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dimensions.volume || ''}
                    readOnly
                    style={{ backgroundColor: '#1e293b', cursor: 'not-allowed' }}
                  />
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
          <p><strong>Dimensions:</strong> {dimensions.length}m × {dimensions.width}m × {dimensions.height}m</p>
          <p><strong>Total Area:</strong> {dimensions.area}m²</p>
          <p><strong>Total Volume:</strong> {dimensions.volume}m³</p>
        </div>
      )}

      <div className="navigation">
        <button
          className="btn btn-primary"
          onClick={nextStep}
          disabled={!canProceed()}
        >
          Next: Select Materials →
        </button>
      </div>
    </div>
  )
}

export default ProjectInput
