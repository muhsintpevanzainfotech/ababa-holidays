import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const FormSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  required = false, 
  disabled = false,
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  
  const selectedOption = options?.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldShowSearch = searchable || options.length > 5;

  const filteredOptions = options.filter(opt =>
    (opt.label || String(opt.value || ''))
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`form-group form-select-group ${disabled ? 'disabled' : ''}`} 
      ref={dropdownRef}
      style={{ position: 'relative', zIndex: isOpen ? 9999 : 1 }}
    >
      {label && (
        <label className="form-select-label" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
          {label}{required && <span className="required-star" style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <div 
        className={`form-control form-select-trigger ${isOpen ? 'is-open' : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '44px',
          padding: '0 14px',
          borderRadius: '10px',
          border: isOpen ? '1px solid var(--primary, #a855f7)' : '1px solid var(--border, rgba(255,255,255,0.1))',
          backgroundColor: 'var(--bg-main, #0f172a)',
          boxShadow: isOpen ? '0 0 12px rgba(168,85,247,0.25)' : 'none',
          transition: 'all 0.2s ease'
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={`form-select-value ${!selectedOption ? 'placeholder' : ''}`} style={{ fontSize: '13px', color: selectedOption ? 'var(--text-main, #fff)' : 'var(--text-muted, #94a3b8)', fontWeight: selectedOption ? '600' : '400' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {!disabled && (
          <ChevronDown 
            size={16} 
            className={`form-select-chevron ${isOpen ? 'open' : ''}`}
            style={{ color: 'var(--text-muted, #94a3b8)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        )}
      </div>

      {isOpen && (
        <div 
          className="form-select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#121222',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '12px',
            padding: '8px',
            zIndex: 99999,
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden'
          }}
        >
          {shouldShowSearch && (
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div className="custom-dropdown-scroll" style={{ maxHeight: '360px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.length === 0 ? (
              <div className="form-select-empty" style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                No matching options
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`form-select-item ${value === option.value ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '13px',
                    backgroundColor: value === option.value ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
                    color: value === option.value ? '#c084fc' : 'var(--text-main, #e2e8f0)',
                    fontWeight: value === option.value ? '600' : '400',
                    transition: 'background 0.15s ease',
                    overflowX: 'hidden'
                  }}
                >
                  <span className="form-select-item-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{option.label}</span>
                  {value === option.value && <Check size={14} className="form-select-check" style={{ color: 'var(--primary, #a855f7)', flexShrink: 0, marginLeft: '8px' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSelect;
