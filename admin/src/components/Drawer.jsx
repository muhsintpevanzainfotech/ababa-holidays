import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, subtitle, children, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div 
        className={`drawer-content ${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Glass Header Banner */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="drawer-badge-pill">
                <Sparkles size={11} /> CONFIGURATION PANEL
              </span>
            </div>
            <h2 className="drawer-title">{title}</h2>
            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
          </div>
          
          <button className="drawer-close" onClick={onClose} title="Close Panel (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
