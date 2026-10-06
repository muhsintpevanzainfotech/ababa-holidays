import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme, useColorScheme } from '@mui/material/styles';
import {
  Grid, Typography, Stack, Box, Button, Chip,
  Snackbar, Alert, CircularProgress, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio, Tooltip
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets / icons
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import LockIcon from '@mui/icons-material/Lock';
import CancelIcon from '@mui/icons-material/Cancel';
import TuneIcon from '@mui/icons-material/Tune';
import SecurityIcon from '@mui/icons-material/Security';

const getAllFeaturesWithLimits = (plan = {}) => {
  const isEnterprise = plan.plan === 'Enterprise';
  const isPro = plan.plan === 'Professional';

  return [
    {
      name: 'Packages Catalog',
      enabled: plan.packagesEnabled !== false,
      limit: plan.packageLimit !== undefined ? plan.packageLimit : (isEnterprise ? -1 : isPro ? 50 : 15),
      unit: 'Max'
    },
    {
      name: 'Booking Management',
      enabled: plan.bookingEnabled !== false,
      limit: plan.bookingLimit !== undefined ? plan.bookingLimit : -1,
      unit: 'Bookings'
    },
    {
      name: 'Staff Sub-Accounts',
      enabled: plan.staffEnabled !== false,
      limit: plan.staffLimit !== undefined ? plan.staffLimit : (isEnterprise ? -1 : isPro ? 10 : 3),
      unit: 'Licenses'
    },
    {
      name: 'Customer Users',
      enabled: plan.userEnabled !== false,
      limit: plan.userLimit !== undefined ? plan.userLimit : (isEnterprise ? -1 : isPro ? 2500 : 500),
      unit: 'Users'
    },
    {
      name: 'Banner Showcase',
      enabled: plan.bannerEnabled !== false,
      limit: plan.bannerLimit !== undefined ? plan.bannerLimit : -1,
      unit: 'Banners'
    },
    {
      name: 'Blogs & News',
      enabled: plan.blogsNewsEnabled !== false,
      limit: plan.blogLimit !== undefined ? plan.blogLimit : -1,
      unit: 'Blogs'
    },
    { name: 'Customer Testimonials', enabled: plan.testimonialEnabled !== false, limit: plan.testimonialLimit },
    { name: 'Enquiries Follow-up', enabled: plan.enquiriesFollowupEnabled !== false, limit: plan.enquiryLimit },
    { name: 'Contact Us Inbox', enabled: plan.contactUsEnabled !== false, limit: plan.contactUsLimit },
    { name: 'Availability Calendar', enabled: plan.availabilityEnabled !== false, limit: plan.availabilityLimit },
    { name: 'CRM Access', enabled: plan.crmEnabled !== false, limit: plan.crmLimit },
    { name: 'Website Module', enabled: plan.websiteEnabled !== false, limit: plan.websiteLimit },
    { name: 'API & Developer Documentation', enabled: plan.apiDocEnabled !== false, limit: plan.apiDocLimit }
  ];
};


const VendorSubscriptionSettings = () => {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const { user } = useSelector((state) => state.auth);
  const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark' || theme.palette.mode === 'dark';

  const authUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  })();

  if (authUser && (authUser.role === 'Vendor-Staff' || authUser.role === 'vendor-staff')) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          backgroundColor: isDarkMode ? '#111936' : '#ffffff',
          mt: 3
        }}
      >
        <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 800 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 3 }}>
          Subscription membership plans & billing upgrades are restricted to the Primary Vendor Account Owner.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.href = '/dashboard'} sx={{ borderRadius: '10px', fontWeight: 700 }}>
          Return to Dashboard
        </Button>
      </Paper>
    );
  }

  // Component States
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [currentPlanName, setCurrentPlanName] = useState('Starter');
  
  // Upgrade Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual');

  // Toast Notification
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Fetch Vendor Profile & Available Plans
  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);

      // 1. Fetch vendor profile to get current subscription status
      const profileRes = await api.get('/vendors/profile');
      if (profileRes.success && profileRes.data) {
        const p = profileRes.data.profile || {};
        const planName = p.subscriptionPlan || (p.subscription?.plan) || 'Starter';
        setCurrentPlanName(planName);
        if (p.subscription) {
          setActiveSubscription(p.subscription);
        }
      }

      // 2. Fetch all system subscription plans
      const plansRes = await api.get('/subscriptions');
      if (plansRes.success && plansRes.data && plansRes.data.length > 0) {
        // Merge system plans with features array
        const fetchedPlans = plansRes.data.map(planObj => ({
          ...planObj,
          isPopular: planObj.plan === 'Professional' || planObj.title?.includes('Professional')
        }));
        setAvailablePlans(fetchedPlans);
      } else {
        setAvailablePlans([]);
      }
    } catch (err) {
      console.error('Failed to load subscription details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [user]);

  // Open Upgrade Modal
  const handleOpenUpgradeModal = (planObj) => {
    setSelectedPlanForUpgrade(planObj);
    setUpgradeModalOpen(true);
  };

  // Confirm & Process Plan Upgrade
  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade || !user) return;

    try {
      setUpgrading(true);
      
      const payload = {
        plan: selectedPlanForUpgrade.plan || selectedPlanForUpgrade.title,
        subscriptionId: selectedPlanForUpgrade._id
      };

      const vendorId = user?._id || user?.id || 'me';
      // Send PUT request to update vendor subscription in backend
      const res = await api.put(`/vendors/${vendorId}/subscription`, payload);

      if (res.success) {
        setToast({
          open: true,
          message: `🎉 Success! Your membership has been upgraded to ${selectedPlanForUpgrade.title || selectedPlanForUpgrade.plan}.`,
          severity: 'success'
        });
        setCurrentPlanName(selectedPlanForUpgrade.plan || selectedPlanForUpgrade.title);
        setUpgradeModalOpen(false);
        fetchSubscriptionDetails();
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setToast({
        open: true,
        message: err.message || 'Failed to update subscription plan. Please try again.',
        severity: 'error'
      });
    } finally {
      setUpgrading(false);
    }
  };

  // Find current active plan object
  const activePlanObj = availablePlans.find(p => 
    p.plan?.toLowerCase() === currentPlanName?.toLowerCase() || 
    p.title?.toLowerCase().includes(currentPlanName?.toLowerCase())
  ) || availablePlans[0] || {};

  return (
    <Grid container spacing={gridSpacing}>
      {/* PAGE HEADER */}
      <Grid size={12}>
        <Box sx={{ mb: 1 }}>
          <Chip
            label="MEMBERSHIP CENTER"
            size="small"
            color="secondary"
            sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '10px', mb: 1, px: 0.5 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
            Vendor <Box component="span" sx={{ color: 'secondary.main' }}>Subscription & Membership Plan</Box>
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Manage your active vendor subscription, package limits, CRM features, staff licenses, and upgrade your tier
          </Typography>
        </Box>
      </Grid>

      {/* SECTION 1: CURRENT ACTIVE SUBSCRIPTION CARD */}
      <Grid size={12}>
        <MainCard border={false} content={false} sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <Box
            sx={{
              p: 3.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.secondary.main} 100%)`,
              color: '#fff'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ md: 8, xs: 12 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 36, color: '#fbbf24' }} />
                  <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900 }}>
                    {currentPlanName} Plan
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon style={{ color: '#fff', fontSize: 16 }} />}
                    label="Active Membership"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, borderRadius: '10px' }}
                  />
                </Stack>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  {activePlanObj.description || 'Your registered agency membership tier on Ababa Travels platform.'}
                </Typography>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                  <Chip
                    icon={<InventoryIcon style={{ color: '#fff', fontSize: 16 }} />}
                    label={`Packages: ${activePlanObj.packageLimit === -1 ? 'Unlimited' : `${activePlanObj.packageLimit || 15} Max`}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}
                  />
                  <Chip
                    icon={<GroupIcon style={{ color: '#fff', fontSize: 16 }} />}
                    label={`Staff Accounts: ${activePlanObj.staffLimit === -1 ? 'Unlimited' : `${activePlanObj.staffLimit || 3} Licenses`}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}
                  />
                  <Chip
                    icon={<SpeedIcon style={{ color: '#fff', fontSize: 16 }} />}
                    label={`Bookings: ${activePlanObj.bookingLimit === -1 ? 'Unlimited' : `${activePlanObj.bookingLimit || 'Unlimited'}`}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}
                  />
                  <Chip
                    icon={<VerifiedIcon style={{ color: '#fff', fontSize: 16 }} />}
                    label="Status: Auto-Renew Active"
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.3)', color: '#fff', fontWeight: 700 }}
                  />
                </Stack>
              </Grid>

              <Grid size={{ md: 4, xs: 12 }} sx={{ textAlign: { md: 'right', xs: 'left' } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    display: 'inline-block',
                    textAlign: 'center',
                    minWidth: 200
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    Plan Investment
                  </Typography>
                  <Typography variant="h1" sx={{ color: '#fff', fontWeight: 900, my: 0.5 }}>
                    ₹{activePlanObj.price?.toLocaleString('en-IN') || '0'}
                    <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                      /year
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700, display: 'block', mt: 0.5 }}>
                    ⚡ Includes All Platform Features
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      </Grid>

      {/* SECTION 2: AVAILABLE PLANS & UPGRADE GRID */}
      <Grid size={12}>
        <Box sx={{ my: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunchIcon color="secondary" /> Choose or Upgrade Your Membership Tier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a higher tier to unlock unlimited package listings, additional staff seats, and feature access permissions
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Grid>

      {loading ? (
        <Grid size={12}>
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
              Fetching membership plans & upgrade options...
            </Typography>
          </Box>
        </Grid>
      ) : (
        availablePlans.map((planObj) => {
          const isCurrentPlan = currentPlanName?.toLowerCase() === planObj.plan?.toLowerCase() ||
                                currentPlanName?.toLowerCase() === planObj.title?.toLowerCase();

          return (
            <Grid key={planObj._id || planObj.plan} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  border: isCurrentPlan ? '2.5px solid' : '1px solid',
                  borderColor: isCurrentPlan ? 'secondary.main' : (planObj.isPopular ? 'primary.main' : 'divider'),
                  bgcolor: 'background.paper',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: planObj.isPopular ? '0 12px 32px rgba(124, 58, 237, 0.12)' : '0 4px 20px rgba(0,0,0,0.03)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08)'
                  }
                }}
              >
                {/* Popular / Active Badges */}
                {isCurrentPlan ? (
                  <Chip
                    icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
                    label="Current Active Plan"
                    color="secondary"
                    size="small"
                    sx={{ position: 'absolute', top: -14, right: 24, fontWeight: 800, px: 1, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                  />
                ) : planObj.isPopular ? (
                  <Chip
                    icon={<AutoAwesomeIcon style={{ fontSize: 16, color: '#fff' }} />}
                    label="Most Popular Choice"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: -14, right: 24, fontWeight: 800, px: 1, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                  />
                ) : null}

                <Box>
                  {/* Plan Icon & Title */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        bgcolor: isCurrentPlan ? 'secondary.light' : 'grey.100',
                        color: isCurrentPlan ? 'secondary.main' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {planObj.plan === 'Enterprise' ? (
                        <WorkspacePremiumIcon fontSize="medium" />
                      ) : planObj.plan === 'Professional' ? (
                        <StarIcon fontSize="medium" />
                      ) : (
                        <CardMembershipIcon fontSize="medium" />
                      )}
                    </Box>

                    <Box>
                      <Typography variant="h3" fontWeight={800}>
                        {planObj.title || `${planObj.plan} Plan`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {planObj.plan === 'Enterprise' ? 'For Corporate Agencies' : planObj.plan === 'Professional' ? 'For Growing Agencies' : 'For Starter Agencies'}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Price Tag */}
                  <Box sx={{ my: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="baseline" spacing={0.5}>
                      <Typography variant="h1" fontWeight={900} sx={{ fontSize: '2.2rem', color: 'text.primary' }}>
                        ₹{planObj.price?.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                        / year
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="success.main" fontWeight={700} sx={{ display: 'block', mt: 0.5 }}>
                      Annual Billing &bull; Full Platform Access Included
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    {planObj.description || 'Comprehensive plan designed to boost your travel agency bookings.'}
                  </Typography>

                  {/* FEATURE PERMISSIONS & RESOURCE LIMITS UNIFIED SECTION */}
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', color: isDarkMode ? '#80deea' : 'secondary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TuneIcon sx={{ fontSize: 14 }} /> Feature Access & Resource Limits
                  </Typography>
                  <Stack spacing={0.8} sx={{ mb: 3 }}>
                    {getAllFeaturesWithLimits(planObj).map((feat, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.75,
                          px: 1.2,
                          borderRadius: '10px',
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
                          border: '1px solid',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {feat.enabled ? (
                            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 16, flexShrink: 0 }} />
                          ) : (
                            <CancelIcon sx={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 16, flexShrink: 0 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: feat.enabled ? 700 : 500, color: feat.enabled ? (isDarkMode ? '#ffffff' : '#0f172a') : (isDarkMode ? '#94a3b8' : '#64748b'), fontSize: '12px' }}>
                            {feat.name}
                          </Typography>
                        </Stack>
                        {feat.enabled ? (
                          feat.limit !== undefined && feat.limit !== null ? (
                            <Chip
                              label={feat.limit === -1 ? 'Unlimited' : `${feat.limit} ${feat.unit || 'Max'}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '10px',
                                fontWeight: 800,
                                bgcolor: feat.limit === -1 
                                  ? (isDarkMode ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7')
                                  : (isDarkMode ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff'),
                                color: feat.limit === -1
                                  ? (isDarkMode ? '#4ade80' : '#15803d')
                                  : (isDarkMode ? '#60a5fa' : '#1d4ed8'),
                                border: '1px solid',
                                borderColor: feat.limit === -1
                                  ? (isDarkMode ? 'rgba(34, 197, 94, 0.5)' : '#86efac')
                                  : (isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#93c5fd')
                              }}
                            />
                          ) : (
                            <Chip
                              label="Enabled"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '10px',
                                fontWeight: 700,
                                bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7',
                                color: isDarkMode ? '#4ade80' : '#15803d',
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.5)' : '#86efac'
                              }}
                            />
                          )
                        ) : (
                          <Chip
                            label="Locked"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '10px',
                              fontWeight: 700,
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                              color: isDarkMode ? '#94a3b8' : '#64748b',
                              border: '1px solid',
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Upgrade Button */}
                <Box sx={{ pt: 2 }}>
                  {isCurrentPlan ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      disabled
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: 'action.hover'
                      }}
                    >
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant={planObj.isPopular ? 'contained' : 'outlined'}
                      color="secondary"
                      onClick={() => handleOpenUpgradeModal(planObj)}
                      startIcon={<RocketLaunchIcon />}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: planObj.isPopular ? '0 6px 18px rgba(124, 58, 237, 0.35)' : 'none'
                      }}
                    >
                      Upgrade to {planObj.plan}
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })
      )}

      {/* SECTION 3: FAQ & SUPPORT */}
      <Grid size={12}>
        <MainCard title="Membership & Upgrade FAQs" icon={<HelpOutlineIcon />}>
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
                  How fast is the plan upgrade activated?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plan upgrades are applied instantly to your vendor account upon confirmation. New package limits, staff licenses, and feature permissions become immediately available in your Vendor Dashboard.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
                  Can I change my membership plan later?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, you can upgrade to a higher membership tier at any time. For custom enterprise requirements or billing assistance, reach out to our vendor support desk at support@ababatravels.com.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* UPGRADE PLAN DIALOG MODAL */}
      <Dialog
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            bgcolor: isDarkMode ? '#111936' : '#ffffff',
            color: isDarkMode ? '#ffffff' : 'text.primary'
          }
        }}
      >
        {selectedPlanForUpgrade && (
          <>
            <DialogTitle sx={{ pb: 1, color: isDarkMode ? '#ffffff' : 'text.primary' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <RocketLaunchIcon color="secondary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h3" fontWeight={800} sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}>
                    Confirm Upgrade to {selectedPlanForUpgrade.title || selectedPlanForUpgrade.plan}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#cbd5e1' : 'text.secondary' }}>
                    Review your membership tier upgrade details
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>

            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider' }} />

            <DialogContent sx={{ py: 3 }}>
              <Stack spacing={2.5}>
                {/* Plan Summary Box */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: isDarkMode ? 'rgba(124, 58, 237, 0.18)' : 'secondary.light',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(124, 58, 237, 0.35)' : 'secondary.200'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ color: isDarkMode ? '#b388ff' : 'secondary.main' }}>
                        {selectedPlanForUpgrade.title || `${selectedPlanForUpgrade.plan} Plan`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? '#cbd5e1' : 'text.secondary' }}>
                        Includes {selectedPlanForUpgrade.packageLimit === -1 ? 'Unlimited' : selectedPlanForUpgrade.packageLimit} Package Listings &bull; {selectedPlanForUpgrade.staffLimit === -1 ? 'Unlimited' : selectedPlanForUpgrade.staffLimit} Staff Accounts
                      </Typography>
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ color: isDarkMode ? '#b388ff' : 'secondary.main' }}>
                      ₹{selectedPlanForUpgrade.price?.toLocaleString('en-IN')}
                      <Typography component="span" variant="caption" sx={{ color: isDarkMode ? '#cbd5e1' : 'text.secondary' }}>/yr</Typography>
                    </Typography>
                  </Stack>
                </Paper>

                {/* UNIFIED FEATURE PERMISSIONS & RESOURCE LIMITS SUMMARY */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: isDarkMode ? '#b388ff' : 'secondary.main' }}>
                    <TuneIcon fontSize="small" /> Unlocked Features & Resource Limits:
                  </Typography>
                  <Grid container spacing={1}>
                    {getAllFeaturesWithLimits(selectedPlanForUpgrade).map((f, i) => (
                      <Grid key={i} size={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                            {f.enabled ? (
                              <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 15, flexShrink: 0 }} />
                            ) : (
                              <CancelIcon sx={{ color: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 15, flexShrink: 0 }} />
                            )}
                            <Typography variant="caption" noWrap fontWeight={f.enabled ? 700 : 500} sx={{ color: f.enabled ? (isDarkMode ? '#ffffff' : '#0f172a') : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                              {f.name}
                            </Typography>
                          </Stack>
                          {f.enabled ? (
                            f.limit !== undefined && f.limit !== null ? (
                              <Chip
                                label={f.limit === -1 ? '∞' : `${f.limit}`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '9.5px',
                                  fontWeight: 800,
                                  ml: 0.5,
                                  bgcolor: f.limit === -1 
                                    ? (isDarkMode ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7')
                                    : (isDarkMode ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff'),
                                  color: f.limit === -1
                                    ? (isDarkMode ? '#4ade80' : '#15803d')
                                    : (isDarkMode ? '#60a5fa' : '#1d4ed8'),
                                  border: '1px solid',
                                  borderColor: f.limit === -1
                                    ? (isDarkMode ? 'rgba(34, 197, 94, 0.5)' : '#86efac')
                                    : (isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#93c5fd')
                                }}
                              />
                            ) : (
                              <Chip
                                label="Active"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  ml: 0.5,
                                  bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7',
                                  color: isDarkMode ? '#4ade80' : '#15803d',
                                  border: '1px solid',
                                  borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.5)' : '#86efac'
                                }}
                              />
                            )
                          ) : (
                            <Chip
                              label="Locked"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '9px',
                                fontWeight: 600,
                                ml: 0.5,
                                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                                color: isDarkMode ? '#94a3b8' : '#64748b',
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'
                              }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Billing Cycle Option */}
                <Box sx={{ pt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                    Billing Cycle:
                  </Typography>
                  <RadioGroup value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                    <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: '12px' }}>
                      <FormControlLabel
                        value="annual"
                        control={<Radio color="secondary" />}
                        label={
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>Annual Billing (Recommended - Save 20%)</Typography>
                            <Typography variant="caption" color="text.secondary">₹{selectedPlanForUpgrade.price?.toLocaleString('en-IN')} billed annually</Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                onClick={() => setUpgradeModalOpen(false)}
                disabled={upgrading}
                sx={{ fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleConfirmUpgrade}
                disabled={upgrading}
                startIcon={upgrading ? <CircularProgress size={18} color="inherit" /> : <RocketLaunchIcon />}
                sx={{ borderRadius: '10px', px: 3, fontWeight: 800, boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)' }}
              >
                {upgrading ? 'Upgrading Plan...' : 'Confirm & Upgrade Now'}
              </Button>
            </DialogActions>
          </>
        )}
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

export default VendorSubscriptionSettings;
