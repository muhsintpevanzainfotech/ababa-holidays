import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => 
      prev.map(t => t.id === id ? { ...t, fading: true } : t)
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast ${toast.type} ${toast.fading ? 'fade-out' : ''}`}
          >
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <CheckCircle size={20} color="#22c55e" />
              ) : (
                <AlertCircle size={20} color="#ef4444" />
              )}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
