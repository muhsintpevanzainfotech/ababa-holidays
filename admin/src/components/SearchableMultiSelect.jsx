import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

const SearchableMultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Search and select items...',
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    (opt.label || opt.name || opt.title || String(opt))
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleToggleOption = (optValue) => {
    if (selectedValues.includes(optValue)) {
      onChange(selectedValues.filter(v => v !== optValue));
    } else {
      onChange([...selectedValues, optValue]);
    }
  };

  const handleRemove = (optValue, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== optValue));
  };

  return (
    <div className="form-group searchable-multiselect-group" ref={dropdownRef} style={{ position: 'relative', zIndex: isOpen ? 9999 : 1 }}>
      {label && (
        <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px', display: 'block' }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {/* Selected Tags Display & Search Box Trigger */}
      <div
        className="form-control"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          minHeight: '44px',
          height: 'auto',
          padding: '6px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--bg-main, #0f172a)',
          borderColor: isOpen ? 'var(--primary, #a855f7)' : 'var(--border, rgba(255,255,255,0.1))',
          boxShadow: isOpen ? '0 0 10px rgba(168,85,247,0.25)' : 'none'
        }}
      >
        {selectedValues.length === 0 ? (
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '13px' }}>{placeholder}</span>
        ) : (
          selectedValues.map(val => {
            const opt = options.find(o => {
              const oVal = o.value !== undefined ? o.value : (o._id !== undefined ? o._id : o.id);
              return oVal === val;
            });
            const displayLabel = opt ? (opt.label || opt.title || opt.name) : val;
            return (
              <span
                key={val}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  color: '#c084fc',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {displayLabel}
                <X
                  size={12}
                  style={{ cursor: 'pointer', opacity: 0.8 }}
                  onClick={(e) => handleRemove(val, e)}
                />
              </span>
            );
          })
        )}
        <ChevronDown size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted, #94a3b8)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {/* Dropdown Menu with Search Input */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          backgroundColor: '#121222',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '12px',
          padding: '10px',
          zIndex: 9999,
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          overflow: 'hidden'
        }}>
          {/* Search Bar inside Dropdown */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
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

          {/* Options List */}
          <div className="custom-dropdown-scroll" style={{ maxHeight: '360px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                No matching items found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const optVal = opt.value !== undefined ? opt.value : (opt._id !== undefined ? opt._id : opt.id);
                const isChecked = selectedValues.includes(optVal);
                return (
                  <div
                    key={optVal}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOption(optVal);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: isChecked ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                      color: isChecked ? '#fff' : 'var(--text-main, #e2e8f0)',
                      transition: 'background 0.2s',
                      overflowX: 'hidden'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{opt.label || opt.title || opt.name}</span>
                    {isChecked && <Check size={14} style={{ color: 'var(--primary, #a855f7)', flexShrink: 0, marginLeft: '8px' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableMultiSelect;
