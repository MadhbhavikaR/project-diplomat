import React, { useState, useEffect } from 'react'
import './AddCallbackDialogComponent.css'

// Define TypeScript interfaces
interface CallbackInfo {
  shortDescription: string
  detailedDescription: string
  docLink: string
}

interface CallbackNode {
  name: string
  type: string
}

interface AddCallbackDialogProps {
  callbackType: string
  existingCallbackNames?: string[]
  isEditMode?: boolean
  callback?: CallbackNode
  availableCallbackTypes?: string[]
  onAddCallback: (callbackName: string, callbackType: string) => void
  onCancel: () => void
}

// Mock callback information data
const CALLBACK_INFO: Record<string, CallbackInfo> = {
  'function': {
    shortDescription: 'Execute custom functions',
    detailedDescription: 'Function callbacks allow you to execute custom JavaScript functions with parameters.',
    docLink: 'https://developer.example.com/callbacks/function'
  },
  'http': {
    shortDescription: 'Make HTTP requests',
    detailedDescription: 'HTTP callbacks enable making REST API calls to external services.',
    docLink: 'https://developer.example.com/callbacks/http'
  },
  'database': {
    shortDescription: 'Database operations',
    detailedDescription: 'Database callbacks provide access to database query and mutation operations.',
    docLink: 'https://developer.example.com/callbacks/database'
  }
}

const AddCallbackDialogComponent: React.FC<AddCallbackDialogProps> = ({
  callbackType,
  existingCallbackNames = [],
  isEditMode = false,
  callback,
  availableCallbackTypes = [],
  onAddCallback,
  onCancel
}) => {
  const [callbackName, setCallbackName] = useState(callback?.name || '')
  const [selectedCallbackType, setSelectedCallbackType] = useState(callback?.type || callbackType)
  const [isCallbackInfoExpanded, setIsCallbackInfoExpanded] = useState(false)
  const [nameError, setNameError] = useState('')

  // Initialize form values
  useEffect(() => {
    if (isEditMode && callback) {
      setCallbackName(callback.name)
      setSelectedCallbackType(callback.type)
    } else {
      setCallbackName('')
      setSelectedCallbackType(callbackType)
    }
  }, [isEditMode, callback, callbackType])

  const getCallbackInfo = (): CallbackInfo | null => {
    return CALLBACK_INFO[selectedCallbackType] || null
  }

  const toggleCallbackInfo = () => {
    setIsCallbackInfoExpanded(!isCallbackInfoExpanded)
  }

  const validateCallbackName = () => {
    if (!callbackName.trim()) {
      setNameError('Callback name is required')
      return false
    }

    if (existingCallbackNames.includes(callbackName)) {
      setNameError('Callback name already exists')
      return false
    }

    setNameError('')
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateCallbackName()) {
      onAddCallback(callbackName, selectedCallbackType)
    }
  }

  return (
    <div className="add-callback-dialog">
      <h2 className="dialog-title">
        {isEditMode ? 'Edit Callback' : `Add ${selectedCallbackType} Callback`}
      </h2>

      <div className="dialog-content">
        {/* Callback Information Section */}
        {getCallbackInfo() && (
          <div className="callback-info-container">
            <div className="callback-info-header" onClick={toggleCallbackInfo}>
              <span className="callback-info-icon">ℹ️</span>
              <div className="callback-info-title">
                <span>Callback Information</span>
              </div>
              <button 
                className="callback-info-toggle"
                type="button"
                aria-label="Toggle callback information"
                onClick={(e) => { e.stopPropagation(); toggleCallbackInfo() }}
              >
                {isCallbackInfoExpanded ? '▲' : '▼'}
              </button>
            </div>

            {isCallbackInfoExpanded && (
              <div className="callback-info-body expanded">
                <div className="callback-info-content">
                  <div className="callback-info-short">{getCallbackInfo()?.shortDescription}</div>
                  <div className="callback-info-detailed">{getCallbackInfo()?.detailedDescription}</div>
                </div>
                <div className="callback-info-link-container">
                  <a 
                    href={getCallbackInfo()?.docLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="callback-info-link"
                  >
                    🔗 View Official Documentation
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Callback Form */}
        <form onSubmit={handleSubmit} className="callback-form">
          {/* Edit Mode: Callback Type Selector */}
          {isEditMode && availableCallbackTypes.length > 0 && (
            <div className="form-field">
              <label htmlFor="callbackType" className="form-label">Callback Type</label>
              <select
                id="callbackType"
                className="form-select"
                value={selectedCallbackType}
                onChange={(e) => setSelectedCallbackType(e.target.value)}
              >
                {availableCallbackTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {/* Callback Name Input */}
          <div className="form-field">
            <label htmlFor="callbackName" className="form-label">Callback Name</label>
            <input
              id="callbackName"
              type="text"
              className={`form-input ${nameError ? 'error' : ''}`}
              value={callbackName}
              onChange={(e) => setCallbackName(e.target.value)}
              onBlur={validateCallbackName}
              placeholder="Enter callback name"
            />
            {nameError && <div className="error-message">{nameError}</div>}
          </div>

          {/* Dialog Actions */}
          <div className="dialog-actions">
            <button 
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="primary-button"
              disabled={!!nameError || !callbackName.trim()}
            >
              {isEditMode ? 'Save Changes' : 'Add Callback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCallbackDialogComponent