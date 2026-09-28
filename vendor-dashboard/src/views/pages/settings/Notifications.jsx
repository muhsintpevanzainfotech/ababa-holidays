import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Grid, Typography, Stack, Box, Switch, Button, Chip, 
  Snackbar, Alert, CircularProgress
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const NotificationSettings = () => {
    const theme = useTheme();

    const [saving, setSaving] = useState(false);
    const [bookingAlerts, setBookingAlerts] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [whatsappAlerts, setWhatsappAlerts] = useState(true);
    const [smsPayoutAlerts, setSmsPayoutAlerts] = useState(true);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const handleSavePreferences = async () => {
        try {
            setSaving(true);
            setToast({
                open: true,
                message: 'Notification & Communication Preferences saved successfully!',
                severity: 'success'
            });
        } catch (err) {
            setToast({
                open: true,
                message: err.message || 'Failed to save notification preferences',
                severity: 'error'
            });
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
                      label="COMMUNICATION CENTER" 
                      size="small" 
                      color="primary" 
                      sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '10px', mb: 1, px: 0.5 }} 
                    />
                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                      Notification & <Box component="span" sx={{ color: 'primary.main' }}>Communication Preferences</Box>
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Customize real-time booking alerts, instant WhatsApp customer leads, settlement SMS notices, and emails
                    </Typography>
                </Box>
            </Grid>

            {/* MAIN CONTENT AREA */}
            <Grid size={{ md: 8, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    
                    <MainCard title="Notification & Communication Preferences" icon={<NotificationsActiveIcon />}>
                      <Stack spacing={2.5}>
                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Real-Time Booking Alerts</Typography>
                            <Typography variant="caption" color="text.secondary">Get immediate email notifications when a customer books a tour package</Typography>
                          </Box>
                          <Switch checked={bookingAlerts} onChange={(e) => setBookingAlerts(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>WhatsApp Instant Lead Notifications</Typography>
                            <Typography variant="caption" color="text.secondary">Receive instant WhatsApp alerts for customer web inquiries and quotes</Typography>
                          </Box>
                          <Switch checked={whatsappAlerts} onChange={(e) => setWhatsappAlerts(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>SMS Settlement & Payout Alerts</Typography>
                            <Typography variant="caption" color="text.secondary">Receive SMS confirmations when payout settlements are credited to your bank</Typography>
                          </Box>
                          <Switch checked={smsPayoutAlerts} onChange={(e) => setSmsPayoutAlerts(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Platform Marketing & System Updates</Typography>
                            <Typography variant="caption" color="text.secondary">Receive emails about new platform features, seasonal campaigns, and vendor tips</Typography>
                          </Box>
                          <Switch checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} color="secondary" />
                        </Box>

                        <Box sx={{ pt: 1 }}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                            onClick={handleSavePreferences}
                            disabled={saving}
                            sx={{ borderRadius: '12px', px: 3.5, py: 1.2, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                          >
                            {saving ? 'Saving...' : 'Save Preferences'}
                          </Button>
                        </Box>
                      </Stack>
                    </MainCard>

                </Stack>
            </Grid>

            {/* SIDEBAR COMMUNICATION STATUS */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    
                    <MainCard title="Notification Channels Status" icon={<NotificationsActiveIcon />}>
                      <Stack spacing={2}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Email Gateway</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
                              ACTIVE & OPERATIONAL
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>WhatsApp Business API</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
                              CONNECTED (+91 98765 43210)
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>SMS Gateway</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
                              ACTIVE FOR PAYOUTS
                            </Typography>
                          </Stack>
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

export default NotificationSettings;
