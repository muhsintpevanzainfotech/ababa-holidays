import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Grid, Typography, Stack, Box, Switch, Button, Chip, 
  TextField, Snackbar, Alert, CircularProgress
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
import PhishingIcon from '@mui/icons-material/Phishing';

const SecuritySettings = () => {
    const theme = useTheme();

    const [saving, setSaving] = useState(false);
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [smsSecurityOtp, setSmsSecurityOtp] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setToast({ open: true, message: 'New passwords do not match', severity: 'error' });
            return;
        }
        try {
            setSaving(true);
            await api.put('/auth/updatepassword', {
                currentPassword: currentPassword,
                newPassword: newPassword
            });
            setToast({ open: true, message: 'Security password updated successfully!', severity: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setToast({ open: true, message: err.message || 'Failed to update password', severity: 'error' });
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
                            type="password"
                            label="Current Password *" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            variant="outlined" 
                          />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                          <TextField 
                            fullWidth 
                            type="password"
                            label="New Password *" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            variant="outlined" 
                          />
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                          <TextField 
                            fullWidth 
                            type="password"
                            label="Confirm New Password *" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            variant="outlined" 
                          />
                        </Grid>
                        <Grid size={12}>
                          <Button 
                            variant="contained" 
                            color="secondary"
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
                            onClick={handlePasswordChange}
                            disabled={saving}
                            sx={{ borderRadius: '12px', px: 3.5, py: 1.2, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                          >
                            {saving ? 'Updating Password...' : 'Update Password Now'}
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
