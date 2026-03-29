import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { lockSession } from '../store/slices/globalSlice';
import { useToast } from '../context/ToastContext';

const SecurityMonitor = () => {
  const dispatch = useDispatch();
  const { isUnlocked, unlockedUntil } = useSelector((state) => state.global);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isUnlocked || !unlockedUntil) return;

    const checkExpiry = () => {
      const now = new Date();
      const expiry = new Date(unlockedUntil);

      if (now >= expiry) {
        dispatch(lockSession());
        showToast('Session Expired', 'The security session has ended. Sections are now locked.', 'info');
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkExpiry, 5000);

    // Initial check
    checkExpiry();

    return () => clearInterval(interval);
  }, [isUnlocked, unlockedUntil, dispatch, showToast]);

  return null;
};

export default SecurityMonitor;
