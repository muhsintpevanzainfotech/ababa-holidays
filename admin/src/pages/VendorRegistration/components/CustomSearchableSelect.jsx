import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search, Globe, MapPin } from 'lucide-react';

export const CustomSearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select Option',
  searchPlaceholder = 'Search...',
  disabled = false,
  hasError = false,
  icon: DefaultIcon = Globe
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '48px',
          padding: '0 16px',
          borderRadius: '12px',
          border: `1px solid ${
            hasError
              ? 'var(--danger, #ef4444)'
              : isOpen
              ? 'var(--primary, #3b82f6)'
              : 'var(--border, #e2e8f0)'
          }`,
          background: hasError
            ? 'rgba(239, 68, 68, 0.02)'
            : 'var(--bg-card, #ffffff)',
          color: selectedOption ? 'var(--text-main, #0f172a)' : 'var(--text-muted, #94a3b8)',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <DefaultIcon size={18} style={{ color: selectedOption ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* DROPDOWN MENU POPOVER */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: '240px',
            zIndex: 9999,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* SEARCH BOX */}
          {options.length > 4 && (
            <div
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--border, #f1f5f9)',
                background: 'var(--bg-main, #f8fafc)',
                position: 'relative'
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #e2e8f0)',
                  background: 'var(--bg-card, #ffffff)',
                  color: 'var(--text-main, #0f172a)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* OPTIONS LIST */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '6px 0'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}
              >
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: isSelected ? '700' : '600',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main, #0f172a)',
                      background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {opt.icon}
                      <span style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
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

export default CustomSearchableSelect;
