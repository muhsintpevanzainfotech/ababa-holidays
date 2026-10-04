import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { 
  Grid, Typography, Stack, Box, Switch, Button, Chip, 
  TextField, Snackbar, Alert, CircularProgress, InputAdornment, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import ShieldIcon from '@mui/icons-material/Shield';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import KeyIcon from '@mui/icons-material/Key';

const SecuritySettings = () => {
    const theme = useTheme();
    const { user } = useSelector((state) => state.auth);

    const [saving, setSaving] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [smsSecurityOtp, setSmsSecurityOtp] = useState(true);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password Visibility (Eye Toggles)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Modal & Timer State
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes timer (300 seconds)
    const [canResend, setCanResend] = useState(false);

    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    // 5-Minute Timer Countdown Effect
    useEffect(() => {
        let interval = null;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [otpSent, timer]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initiate Change Password -> Open OTP Verification Modal
    const handleInitiatePasswordChange = async () => {
        if (!currentPassword) {
            setToast({ open: true, message: 'Please enter your current password', severity: 'error' });
            return;
        }
        if (!newPassword) {
            setToast({ open: true, message: 'Please enter a new password', severity: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setToast({ open: true, message: 'New password must be at least 6 characters long', severity: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setToast({ open: true, message: 'New passwords do not match', severity: 'error' });
            return;
        }

        // Send OTP for password update verification
        await sendSecurityOtp();
    };

    const sendSecurityOtp = async () => {
        const userEmail = user?.email;
        if (!userEmail) {
            setToast({ open: true, message: 'Vendor email address is required', severity: 'error' });
            return;
        }

        try {
            setOtpSending(true);
            // Valid backend endpoint for sending password reset OTP
            await api.post('/auth/forgotpassword', { email: userEmail });

            setOtpSent(true);
            setTimer(300);
            setCanResend(false);
            setOtpOpen(true);
            setToast({ open: true, message: `Verification OTP code sent to ${userEmail}!`, severity: 'info' });
        } catch (err) {
            const errText = err?.response?.data?.message || err?.message || 'Failed to send OTP code. Please try again.';
            setToast({ open: true, message: errText, severity: 'error' });
        } finally {
            setOtpSending(false);
        }
    };

    // Final Confirm & Submit Password Update with OTP
    const handleConfirmPasswordChange = async () => {
        if (!otpCode || otpCode.trim().length < 4) {
            setToast({ open: true, message: 'Please enter the verification OTP code', severity: 'error' });
            return;
        }
        const userEmail = user?.email;

        try {
            setSaving(true);
            // Valid backend endpoint: PUT /auth/resetpassword { email, otp, password }
            try {
                await api.put('/auth/resetpassword', {
                    email: userEmail,
                    otp: otpCode.trim(),
                    password: newPassword
                });
            } catch (firstErr) {
                // Secondary fallback if backend configured /auth/updatepassword
                await api.put('/auth/updatepassword', {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    otp: otpCode.trim()
                });
            }

            setToast({ open: true, message: 'Security password updated successfully!', severity: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOtpCode('');
            setOtpOpen(false);
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update password. Please check your OTP code & current password.';
            setToast({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Grid container spacing={gridSpacing}>
            {/* PAGE HEADER */}
            <Grid size={12}>
                <Box sx={{ mb: 1 }}>
                    <Chip 
                      label="SECURITY CENTER" 
                      size="small" 
                      color="secondary" 
                      sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '10px', mb: 1, px: 0.5 }} 
                    />
                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                      2-Step Verification & <Box component="span" sx={{ color: 'secondary.main' }}>Security Protocols</Box>
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Configure 2-Factor Authentication, login OTP policies, transaction security rules, and account passwords
                    </Typography>
                </Box>
            </Grid>

            {/* MAIN CONTENT AREA */}
            <Grid size={{ md: 8, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    
                    {/* SECTION 1: 2-STEP VERIFICATION */}
                    <MainCard title="2-Step Verification & Security Protocols" icon={<ShieldIcon />}>
                      <Stack spacing={2.5}>
                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>2-Factor Email OTP Verification</Typography>
                            <Typography variant="caption" color="text.secondary">Require email OTP verification code when logging in from new devices</Typography>
                          </Box>
                          <Switch checked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>SMS Security Payout OTP</Typography>
                            <Typography variant="caption" color="text.secondary">Require SMS OTP approval before executing bank account detail updates or payout transfers</Typography>
                          </Box>
                          <Switch checked={smsSecurityOtp} onChange={(e) => setSmsSecurityOtp(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Automatic Session Timeout</Typography>
                            <Typography variant="caption" color="text.secondary">Automatically sign out after 30 minutes of inactivity to protect your vendor session</Typography>
                          </Box>
                          <Chip label="ENABLED (30M)" color="primary" size="small" sx={{ fontWeight: 800 }} />
                        </Box>
                      </Stack>
                    </MainCard>

                    {/* SECTION 2: PASSWORD CHANGE */}
                    <MainCard title="Change Account Security Password" icon={<LockResetIcon />}>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <TextField 
                            fullWidth 
                            type={showCurrentPassword ? 'text' : 'password'}
                            label="Current Password *" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            variant="outlined"
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle current password visibility"
                                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                          <TextField 
                            fullWidth 
                            type={showNewPassword ? 'text' : 'password'}
                            label="New Password *" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            variant="outlined"
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle new password visibility"
                                      onClick={() => setShowNewPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                          <TextField 
                            fullWidth 
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm New Password *" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            variant="outlined"
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle confirm password visibility"
                                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={12}>
                          <Button 
                            variant="contained" 
                            color="secondary"
                            startIcon={otpSending ? <CircularProgress size={18} color="inherit" /> : <KeyIcon />}
                            onClick={handleInitiatePasswordChange}
                            disabled={otpSending || saving}
                            sx={{ borderRadius: '12px', px: 3.5, py: 1.2, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                          >
                            {otpSending ? 'Sending Verification OTP...' : 'Send OTP & Update Password'}
                          </Button>
                        </Grid>
                      </Grid>
                    </MainCard>

                </Stack>
            </Grid>

            {/* SIDEBAR SECURITY HEALTH */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    
                    <MainCard title="Security & Vendor Reference" icon={<SecurityIcon />}>
                      <Stack spacing={2}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Account Security Rating</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.dark' }}>
                              EXCELLENT (98%)
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Verification Protocol</Typography>
                          <Typography variant="caption" sx={{ display: 'block', my: 0.5 }}>
                            2-Step Email OTP protection is active on login and sensitive updates.
                          </Typography>
                          <Chip label="2FA ACTIVE" color="success" size="small" sx={{ mt: 1, fontWeight: 800 }} />
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Phishing Protection</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Always verify URL domain is ababatravels.com before entering credentials.
                          </Typography>
                        </Box>
                      </Stack>
                    </MainCard>

                </Stack>
            </Grid>

            {/* OTP VERIFICATION DIALOG */}
            <Dialog 
              open={otpOpen} 
              onClose={() => setOtpOpen(false)}
              PaperProps={{
                sx: { borderRadius: '20px', p: 1, maxWidth: 440, width: '100%' }
              }}
            >
              <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MarkEmailReadIcon color="secondary" fontSize="large" />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Enter Verification OTP</Typography>
                  <Typography variant="caption" color="text.secondary">Step 2 of Security Password Change</Typography>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  A 6-digit security OTP code was sent to your registered email address <strong>{user?.email || 'account'}</strong>.
                </Typography>
                
                <TextField
                  fullWidth
                  autoFocus
                  label="Enter 6-Digit Security OTP *"
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  variant="outlined"
                  slotProps={{
                    input: {
                      sx: { fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 800 }
                    }
                  }}
                />

                {/* 5-MINUTE COUNTDOWN TIMER */}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Resend Code In:
                  </Typography>
                  {timer > 0 ? (
                    <Chip 
                      label={formatTimer(timer)} 
                      color="secondary" 
                      size="small" 
                      sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.85rem' }} 
                    />
                  ) : (
                    <Button 
                      size="small" 
                      color="secondary" 
                      onClick={sendSecurityOtp}
                      disabled={otpSending}
                      sx={{ fontWeight: 800, textTransform: 'none' }}
                    >
                      Resend Security OTP
                    </Button>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button 
                  onClick={() => setOtpOpen(false)} 
                  color="inherit" 
                  sx={{ fontWeight: 700, borderRadius: '10px' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmPasswordChange} 
                  variant="contained" 
                  color="secondary"
                  disabled={saving || !otpCode}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LockResetIcon />}
                  sx={{ fontWeight: 800, borderRadius: '10px', px: 3 }}
                >
                  {saving ? 'Verifying...' : 'Verify & Change Password'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* SNACKBAR NOTIFICATIONS */}
            <Snackbar 
              open={toast.open} 
              autoHideDuration={4000} 
              onClose={() => setToast(prev => ({ ...prev, open: false }))}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={() => setToast(prev => ({ ...prev, open: false }))} 
                severity={toast.severity} 
                variant="filled"
                sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}
              >
                {toast.message}
              </Alert>
            </Snackbar>
        </Grid>
    );
};

export default SecuritySettings;
