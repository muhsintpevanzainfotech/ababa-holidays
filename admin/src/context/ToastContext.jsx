import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'success', duration = 4000) => {
    let finalTitle = title;
    let finalMessage = message;
    let finalType = type;
    let finalDuration = duration;

    // Support 2-argument signature: showToast(title, type, duration)
    if (['success', 'error', 'info', 'warning'].includes(message)) {
      finalType = message;
      finalMessage = '';
      if (typeof type === 'number') {
        finalDuration = type;
      }
    }

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title: finalTitle, message: finalMessage, type: finalType }]);

    setTimeout(() => {
      removeToast(id);
    }, finalDuration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => 
      prev.map(t => t.id === id ? { ...t, fading: true } : t)
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'info':
        return <Info size={20} color="#3b82f6" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <CheckCircle size={20} color="#10b981" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast ${toast.type || 'success'} ${toast.fading ? 'fade-out' : ''}`}
          >
            <div className={`toast-icon-wrapper ${toast.type || 'success'}`}>
              {renderIcon(toast.type)}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button 
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              title="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
