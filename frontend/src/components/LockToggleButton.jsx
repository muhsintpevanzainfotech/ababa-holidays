import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, Unlock, Clock } from 'lucide-react';
import { lockSession } from '../store/slices/globalSlice';
import { useToast } from '../context/ToastContext';

const LockToggleButton = ({ onUnlockClick }) => {
  const dispatch = useDispatch();
  const { isUnlocked, unlockedUntil } = useSelector((state) => state.global);
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!isUnlocked || !unlockedUntil) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(unlockedUntil).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(interval);
  }, [isUnlocked, unlockedUntil]);

  const handleToggle = () => {
    if (isUnlocked) {
      dispatch(lockSession());
      showToast('Locked', 'Modifications are now protected.', 'success');
    } else {
      onUnlockClick();
    }
  };

  return (
    <button 
      className={`btn ${!isUnlocked ? 'btn-outline' : 'btn-success'}`} 
      onClick={handleToggle}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '8px',
        border: '1px solid var(--border)', 
        background: !isUnlocked ? 'transparent' : 'rgba(34, 197, 94, 0.1)',
        color: !isUnlocked ? 'var(--text-muted)' : '#22c55e', 
        borderRadius: '12px', padding: '0 16px', height: '44px', fontWeight: '700',
        minWidth: isUnlocked ? '140px' : 'auto',
        transition: 'all 0.3s ease'
      }}
    >
      {!isUnlocked ? <Lock size={18} /> : <Unlock size={18} />}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {!isUnlocked ? 'Locked' : 'Unlocked'}
        {isUnlocked && timeLeft && (
          <span style={{ 
            fontSize: '11px', 
            background: 'rgba(34, 197, 94, 0.2)', 
            padding: '2px 6px', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '4px',
            fontFamily: 'monospace'
          }}>
            <Clock size={10} />
            {timeLeft}
          </span>
        )}
      </span>
    </button>
  );
};

export default LockToggleButton;
