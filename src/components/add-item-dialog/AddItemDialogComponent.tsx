/**
 * Add Item Dialog Component
 * 
 * A dialog component for creating new items (apps) with validation.
 * This component handles the creation of new applications with proper
 * name validation and integration with the agent service.
 */

import React, { useState, useEffect } from 'react';
import './AddItemDialogComponent.css';

// Define TypeScript interfaces
interface AddItemDialogProps {
  isOpen: boolean;
  existingItemNames: string[];
  onCreateItem: (itemName: string) => void;
  onCancel: () => void;
}

// Name validation regex patterns
const NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const STARTS_WITH_LETTER_OR_UNDERSCORE = /^[a-zA-Z_]/;

const AddItemDialogComponent: React.FC<AddItemDialogProps> = ({
  isOpen,
  existingItemNames,
  onCreateItem,
  onCancel
}) => {
  const [itemName, setItemName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setValidationError('');
    }
  }, [isOpen]);

  const validateItemName = (name: string): boolean => {
    const trimmedName = name.trim();

    // Check if empty
    if (!trimmedName) {
      setValidationError('Item name is required');
      return false;
    }

    // Check if starts with letter or underscore
    if (!STARTS_WITH_LETTER_OR_UNDERSCORE.test(trimmedName)) {
      setValidationError('Item name must start with a letter or underscore');
      return false;
    }

    // Check if contains only allowed characters
    if (!NAME_PATTERN.test(trimmedName)) {
      setValidationError('Item name can only contain letters, digits, and underscores');
      return false;
    }

    // Check if name already exists
    if (existingItemNames.includes(trimmedName)) {
      setValidationError('Item name already exists. Please choose a different name.');
      return false;
    }

    // Name is valid
    setValidationError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemName(value);
    
    // Validate as user types (but don't show error until blur or submit)
    if (value.trim()) {
      validateItemName(value);
    } else {
      setValidationError('');
    }
  };

  const handleInputBlur = () => {
    if (itemName.trim()) {
      validateItemName(itemName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateItemName(itemName)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const trimmedName = itemName.trim();
      onCreateItem(trimmedName);
    } catch (error) {
      setValidationError('Something went wrong, please try again');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isValid = () => {
    return NAME_PATTERN.test(itemName.trim()) && 
           !existingItemNames.includes(itemName.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="add-item-dialog">
      <h2 className="dialog-title">Create a new app</h2>
      
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-field">
          <input
            type="text"
            id="itemName"
            className={`form-input ${validationError ? 'error' : ''}`}
            value={itemName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder="Enter app name"
            autoFocus
            disabled={isSubmitting}
          />
          
          {validationError && (
            <div className="validation-hint error-message">
              {validationError}
            </div>
          )}
          
          {!validationError && itemName && !isValid() && (
            <div className="validation-hint">
              Start with a letter or underscore, and contain only letters, digits, and underscores.
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={!isValid() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemDialogComponent;