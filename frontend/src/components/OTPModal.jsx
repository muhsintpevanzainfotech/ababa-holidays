import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';

const OTPModal = ({ isOpen, onClose, onVerify, onResend, email, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(otp.join(''));
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    onResend();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="scale-up" style={{ background: 'var(--bg-card)', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '32px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Two-Step Verification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            Enter the 6-digit code sent to <br />
            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                style={{ 
                  width: '45px', height: '54px', textAlign: 'center', fontSize: '20px', fontWeight: '700',
                  borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-main)',
                  outline: 'none', transition: '0.2s', color: 'var(--primary)'
                }}
                className="otp-input"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || otp.join('').length < 6}
            style={{ width: '100%', height: '52px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', marginBottom: '24px' }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {canResend ? (
              <button 
                type="button" 
                onClick={handleResend}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
              >
                <RefreshCw size={14} /> Resend Code
              </button>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Resend code in <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{timer}s</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
