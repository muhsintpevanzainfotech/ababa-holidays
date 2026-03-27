import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children, size = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className={`drawer-content ${isOpen ? 'open' : ''} ${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
          <button className="drawer-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
