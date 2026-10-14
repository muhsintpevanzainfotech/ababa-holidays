import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, ShieldAlert, Trash2, HelpCircle, Info, X } from 'lucide-react';

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
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((titleOrOptions, messageText, customOptions = {}) => {
    let options = {};
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
      options = titleOrOptions;
    } else {
      options = {
        title: titleOrOptions,
        message: messageText,
        ...customOptions
      };
    }

    const title = options.title || 'Are you sure?';
    const message = options.message || 'Please confirm this action.';
    
    // Auto-detect variant if not explicitly provided
    let variant = options.variant;
    if (!variant) {
      const combined = (title + ' ' + message).toLowerCase();
      if (combined.includes('delete') || combined.includes('remove') || combined.includes('destroy') || combined.includes('permanent')) {
        variant = 'danger';
      } else if (combined.includes('verify') || combined.includes('approve') || combined.includes('activate') || combined.includes('unsuspend')) {
        variant = 'success';
      } else if (combined.includes('suspend') || combined.includes('revoke') || combined.includes('reject') || combined.includes('deactivate') || combined.includes('unverify')) {
        variant = 'warning';
      } else {
        variant = 'primary';
      }
    }

    // Auto-detect button text if not explicitly provided
    let confirmText = options.confirmText;
    if (!confirmText) {
      const tLower = title.toLowerCase();
      if (tLower.includes('verify')) {
        confirmText = tLower.includes('unverify') ? 'Unverify Account' : 'Verify Account';
      } else if (tLower.includes('approve')) {
        confirmText = 'Approve';
      } else if (tLower.includes('delete') || tLower.includes('remove')) {
        confirmText = 'Confirm Delete';
      } else if (tLower.includes('suspend')) {
        confirmText = tLower.includes('unsuspend') ? 'Unsuspend' : 'Suspend';
      } else if (tLower.includes('revoke')) {
        confirmText = 'Revoke';
      } else if (variant === 'danger') {
        confirmText = 'Delete';
      } else if (variant === 'success') {
        confirmText = 'Confirm';
      } else {
        confirmText = 'Confirm';
      }
    }

    const cancelText = options.cancelText || 'Cancel';

    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
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

  // Handle ESC key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dialog.isOpen && dialog.onCancel) {
        dialog.onCancel();
      }
    };
    if (dialog.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog.isOpen, dialog.onCancel]);

  const renderIcon = () => {
    switch (dialog.variant) {
      case 'success':
        return <ShieldCheck size={32} />;
      case 'warning':
        return <ShieldAlert size={32} />;
      case 'primary':
      case 'info':
        return <HelpCircle size={32} />;
      case 'danger':
      default:
        return dialog.title.toLowerCase().includes('delete') ? <Trash2 size={32} /> : <AlertTriangle size={32} />;
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialog.isOpen && (
        <div 
          className="confirm-backdrop" 
          onClick={(e) => {
            if (e.target === e.currentTarget && dialog.onCancel) {
              dialog.onCancel();
            }
          }}
        >
          <div className={`confirm-card confirm-card-${dialog.variant}`} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={dialog.onCancel}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              className="confirm-close-btn"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className={`confirm-icon confirm-icon-${dialog.variant}`}>
              {renderIcon()}
            </div>

            <div className="confirm-title">{dialog.title}</div>
            <div className="confirm-message">{dialog.message}</div>

            <div className="confirm-actions">
              <button 
                type="button"
                className="confirm-btn-cancel" 
                onClick={dialog.onCancel}
              >
                {dialog.cancelText}
              </button>
              <button 
                type="button"
                className={`confirm-btn-action confirm-btn-${dialog.variant}`} 
                onClick={dialog.onConfirm}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
