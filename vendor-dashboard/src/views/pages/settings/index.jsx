import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Stack, Box, Avatar, TextField, Switch, FormControlLabel, Divider, Button, Chip } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import User1 from 'assets/images/users/user-round.svg';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';

const VendorSettings = () => {
    const theme = useTheme();
    const { user } = useSelector((state) => state.auth);
    
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Typography variant="h3">Account Settings</Typography>
                <Typography variant="subtitle2">Manage your vendor profile and personal preferences</Typography>
            </Grid>

            {/* Profile Section */}
            <Grid size={{ md: 4, xs: 12 }}>
                <MainCard border={false} sx={{ textAlign: 'center', p: 2 }}>
                    <Stack spacing={2} sx={{ alignItems: 'center' }}>
                        <Avatar 
                            src={User1} 
                            sx={{ width: 100, height: 100, borderRadius: '14px', border: '4px solid', borderColor: 'primary.light' }} 
                        />
                        <Box>
                            <Typography variant="h4">{user?.name || 'Ababa Vendor'}</Typography>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{user?.email || 'vendor@example.com'}</Typography>
                        </Box>
                        <Chip label={user?.role || 'Service Vendor'} color="secondary" size="small" sx={{ borderRadius: '8px' }} />
                        <Divider sx={{ width: '100%', my: 1 }} />
                        <Typography variant="caption" sx={{ display: 'block', px: 2 }}>
                            Your profile is visible to the Admin for approval and verification purposes.
                        </Typography>
                    </Stack>
                </MainCard>
            </Grid>

            {/* Details Form Section */}
            <Grid size={{ md: 8, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    <MainCard title="General Vendor Details" icon={<PersonIcon />}>
                        <Grid container spacing={2}>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField fullWidth label="Full Name" defaultValue={user?.name} variant="outlined" />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField fullWidth label="Email Address" defaultValue={user?.email} disabled variant="outlined" />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField fullWidth label="Contact Number" placeholder="+91 XXXX XXX XXX" variant="outlined" />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField fullWidth label="Business Location" placeholder="e.g. Kozhikode, Kerala" variant="outlined" />
                            </Grid>
                            <Grid size={12}>
                                <TextField fullWidth multiline rows={3} label="Business Bio / Description" placeholder="Briefly describe your services..." variant="outlined" />
                            </Grid>
                            <Grid size={12}>
                                <Button variant="contained" color="secondary" startIcon={<SaveIcon />}>Update Profile</Button>
                            </Grid>
                        </Grid>
                    </MainCard>

                    <MainCard title="Notification Preferences" icon={<NotificationsActiveIcon />}>
                        <Stack spacing={2}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1">System Notifications</Typography>
                                    <Typography variant="caption">Get alerts for new bookings and status changes</Typography>
                                </Box>
                                <Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} color="secondary" />
                            </Box>

                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1">Marketing Communications</Typography>
                                    <Typography variant="caption">Receive emails about new platform features and tips</Typography>
                                </Box>
                                <Switch checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} color="secondary" />
                            </Box>
                        </Stack>
                    </MainCard>

                    <MainCard title="Security & Access" icon={<SecurityIcon />}>
                        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                            <Grid size={{ sm: 8, xs: 12 }}>
                                <Typography variant="subtitle1">Two-Step Verification</Typography>
                                <Typography variant="caption">Request OTP on your registered email for sensitive changes</Typography>
                            </Grid>
                            <Grid size={{ sm: 4, xs: 12 }} sx={{ textAlign: { sm: 'right', xs: 'left' } }}>
                                <Button variant="outlined" size="small">Configure</Button>
                            </Grid>
                        </Grid>
                    </MainCard>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default VendorSettings;
