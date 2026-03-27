import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FilterSelect = ({ options, value, onChange, placeholder = 'Select Option', width = '200px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];

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
        className="filter-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: isOpen ? 'var(--primary)' : 'var(--border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedOption?.icon}
          {selectedOption?.color && (
            <div className="status-dot" style={{ backgroundColor: selectedOption.color }} />
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--text-muted)', 
            transition: '0.3s', 
            transform: isOpen ? 'rotate(180deg)' : 'none' 
          }} 
        />
      </button>

      {isOpen && (
        <div className="filter-select-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              className={`filter-select-item ${value === option.value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {option.icon}
                {option.color && (
                  <div className="status-dot" style={{ backgroundColor: option.color }} />
                )}
                <span>{option.label}</span>
              </div>
              {value === option.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
