import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialogContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  return context;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setDialog((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialog((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialog.isOpen && (
        <div className="confirm-backdrop">
          <div className="confirm-card">
            <div className="confirm-icon">
              <AlertTriangle size={32} />
            </div>
            <div className="confirm-title">{dialog.title}</div>
            <div className="confirm-message">{dialog.message}</div>
            <div className="confirm-actions">
              <button 
                className="btn" 
                style={{ background: '#f1f5f9', border: 'none' }}
                onClick={dialog.onCancel}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#ef4444', border: 'none' }}
                onClick={dialog.onConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
