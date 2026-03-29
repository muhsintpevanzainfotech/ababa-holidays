import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FormSelect = ({ label, options, value, onChange, placeholder = 'Select an option', required = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);

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
    <div className="form-group" style={{ position: 'relative', opacity: disabled ? 0.7 : 1 }} ref={dropdownRef}>
      {label && <label>{label}{required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}</label>}
      <div 
        className={`form-control ${isOpen ? 'is-open' : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          cursor: disabled ? 'default' : 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          background: disabled ? 'var(--bg-main)' : 'white',
          height: '42px',
          padding: '0 16px'
        }}
      >
        <span style={{ color: selectedOption ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {!disabled && (
          <ChevronDown 
            size={16} 
            style={{ 
              color: 'var(--text-muted)', 
              transition: '0.3s', 
              transform: isOpen ? 'rotate(180deg)' : 'none' 
            }} 
          />
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '6px'
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: value === option.value ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                color: value === option.value ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '14px',
                fontWeight: value === option.value ? '600' : '500',
                transition: 'all 0.2s',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) e.target.style.background = 'var(--bg-main)';
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) e.target.style.background = 'transparent';
              }}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormSelect;
