import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';

const ActionDropdown = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className="action-btn" 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ background: isOpen ? 'var(--bg-main)' : 'white' }}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {actions.map((action, index) => (
            action.divider ? (
              <div key={index} style={{ height: '1px', background: 'var(--border)', margin: '4px 6px' }} />
            ) : (
              <button
                key={index}
                className={`dropdown-item ${action.variant || ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
