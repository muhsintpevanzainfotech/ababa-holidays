import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, X, Mail, Loader2, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useDispatch } from 'react-redux';
import { setUnlocked } from '../store/slices/globalSlice';

const PasskeyModal = ({ isOpen, onClose, onVerified, title = "Security Verification" }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  
  // Auto-send passkey on open
  React.useEffect(() => {
    if (isOpen) {
      handleGenerateAndSend(true);
    }
  }, [isOpen]);

  // Countdown timer logic
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passkey) return setError('Please enter the passkey');
    
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/settings/verify-passkey', { passkey });
      if (data.success) {
        setPasskey('');
        const unlockedUntil = new Date(Date.now() + (data.sessionDuration || 5) * 60 * 1000).toISOString();
        dispatch(setUnlocked({ isUnlocked: true, unlockedUntil }));
        onVerified();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndSend = async (isAuto = false) => {
    if (!isAuto && countdown > 0) return;
    
    // Only ask for confirmation if manually clicked
    if (!isAuto && !window.confirm('This will invalidate your current passkey and send a new 6-digit PIN to your email. Continue?')) {
      return;
    }

    setSendingEmail(true);
    setError('');
    try {
      const { data } = await api.post('/settings/generate-passkey');
      if (data.success) {
        setCountdown(40);
        if (!isAuto) alert('A new passkey has been sent to your email successfully!');
      }
    } catch (err) {
      setError('Failed to send email. Please check your internet or server configuration.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
    }}>
      <div className="card" style={{ width: '400px', padding: '32px', position: 'relative', border: '1px solid var(--border)' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
          }}>
            <ShieldCheck size={32} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{title}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
            This action is protected. Please enter the administrator passkey sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Administrator Passkey</label>
            <input 
              type="password" 
              className="form-control" 
              autoFocus
              placeholder="••••••"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', height: '56px' }}
              disabled={loading || sendingEmail}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', textAlign: 'center', fontWeight: '600' }}>{error}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', marginTop: '16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={loading || sendingEmail}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Identity'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Forgot or don't have a passkey?</p>
          <button 
            type="button" 
            onClick={() => handleGenerateAndSend(false)}
            disabled={sendingEmail || loading || countdown > 0}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', background: 'var(--bg-main)',
              color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)', 
              border: `1px solid ${countdown > 0 ? 'var(--border)' : 'var(--primary)'}`,
              fontSize: '13px', fontWeight: '600', cursor: countdown > 0 ? 'default' : 'pointer'
            }}
          >
            {sendingEmail ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
            {sendingEmail ? 'Sending...' : countdown > 0 ? `Resend Passkey (${countdown}s)` : 'Resend Passkey'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasskeyModal;
