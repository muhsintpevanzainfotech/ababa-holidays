import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FilterSelect = ({ options, value, onChange, placeholder = 'Select Option', width = '200px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedOption = options?.find(opt => opt.value === value) || options?.[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`filter-select-container ${isOpen ? 'is-open' : ''}`} ref={dropdownRef} style={{ width }}>
      <button 
        type="button"
        className={`filter-select-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="filter-select-value">
          {selectedOption?.icon}
          {selectedOption?.color && (
            <div className="status-dot" style={{ backgroundColor: selectedOption.color }} />
          )}
          <span className="filter-select-text">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`filter-select-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="filter-select-dropdown custom-dropdown-scroll" style={{ overflowX: 'hidden' }}>
          {!options || options.length === 0 ? (
            <div className="filter-select-empty">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`filter-select-item ${value === option.value ? 'active' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{ overflowX: 'hidden' }}
              >
                <div className="filter-select-item-content" style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                  {option.icon}
                  {option.color && (
                    <div className="status-dot" style={{ backgroundColor: option.color }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
                </div>
                {value === option.value && <Check size={14} className="filter-select-check" style={{ flexShrink: 0, marginLeft: '8px' }} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;

