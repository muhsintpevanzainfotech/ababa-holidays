import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Typography, Box, Stack, 
    IconButton, Divider, CircularProgress 
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { setUnlocked } from 'store/slices/authSlice';

// assets
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const PasskeyModal = ({ isOpen, onClose, onVerified, title = "Security Verification" }) => {
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const dispatch = useDispatch();

    // Auto-send passkey on open
    useEffect(() => {
        if (isOpen) {
            handleGenerateAndSend(true);
        }
    }, [isOpen]);

    // Countdown timer logic
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleGenerateAndSend = async (isAuto = false) => {
        if (!isAuto && countdown > 0) return;
        
        setSendingEmail(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/settings/generate-passkey`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCountdown(40);
            } else {
                throw new Error(data.message || 'Failed to send passkey');
            }
        } catch (err) {
            setError(err.message || 'Failed to send passkey. Please check your connection.');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!passkey) return setError('Please enter the 6-digit passkey');
        
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/settings/verify-passkey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ passkey })
            });
            const data = await response.json();
            
            if (data.success) {
                setPasskey('');
                const unlockedUntil = new Date(Date.now() + (data.sessionDuration || 5) * 60 * 1000).toISOString();
                dispatch(setUnlocked({ isUnlocked: true, unlockedUntil }));
                onVerified();
            } else {
                throw new Error(data.message || 'Invalid passkey');
            }
        } catch (err) {
            setError(err.message || 'Invalid passkey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">{title}</Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ 
                        width: 64, height: 64, borderRadius: '50%', 
                        bgcolor: 'success.light', color: 'success.dark',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 16px' 
                    }}>
                        <VerifiedUserIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="700">Protected Action</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        This is a sensitive operation. A 6-digit PIN has been sent your email. Please enter it below to proceed.
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="••••••"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value.substring(0, 6))}
                        disabled={loading || sendingEmail}
                        error={!!error}
                        helperText={error}
                        autoFocus
                        inputProps={{ 
                            style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' } 
                        }}
                    />
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        type="submit"
                        disabled={loading || sendingEmail}
                        sx={{ mt: 3, height: 48 }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
                    >
                        {loading ? 'Verifying...' : 'Unlock Identity'}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" display="block" color="textSecondary">
                        Didn't receive the email?
                    </Typography>
                    <Button 
                        size="small" 
                        color="primary" 
                        onClick={() => handleGenerateAndSend(false)}
                        disabled={sendingEmail || loading || countdown > 0}
                        startIcon={sendingEmail ? <CircularProgress size={16} color="inherit" /> : <MailOutlineIcon />}
                        sx={{ mt: 1 }}
                    >
                        {sendingEmail ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Resend PIN'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PasskeyModal;
