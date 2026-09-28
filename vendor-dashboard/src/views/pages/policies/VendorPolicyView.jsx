import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Typography,
  Stack,
  Box,
  Paper,
  Tabs,
  Tab,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// icons
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import PolicyIcon from '@mui/icons-material/Policy';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShieldCheckIcon from '@mui/icons-material/VerifiedUser';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

// Default Fallback Policy Content created by Admin for Vendors
const DEFAULT_VENDOR_POLICIES = {
  'Privacy Policy': {
    title: 'Vendor Partner Privacy Policy',
    updatedAt: new Date().toISOString(),
    content: `
      <h3>1. Information We Collect from Vendor Partners</h3>
      <p>Ababa Travels respects the privacy of our partner agencies and vendors. As a registered vendor on our platform, we collect business information including company registration details, tax identification numbers, banking details for payment processing, primary contact information, and service listing details.</p>

      <h3>2. How We Use Vendor Data</h3>
      <p>Your information is used strictly to establish and manage your vendor account, process customer bookings, disburse payments, communicate booking requests, ensure compliance with travel industry regulations, and improve our platform service offerings.</p>

      <h3>3. Data Protection and Confidentiality</h3>
      <p>All vendor credentials, financial transactions, and operational statistics are protected using enterprise-grade encryption. We do not sell, lease, or share your proprietary business data with third parties except as required for booking fulfillment or regulatory compliance.</p>

      <h3>4. Customer Data Access & Compliance</h3>
      <p>As a vendor, you will receive customer information necessary to perform booked travel services. You agree to process such traveler personal data strictly in compliance with applicable data privacy laws and solely for servicing the relevant booking.</p>

      <h3>5. Administrative Updates & Contact</h3>
      <p>This privacy policy is governed and updated periodically by Ababa Travels Administration. For privacy inquiries or data rights requests, contact our legal team at <a href="mailto:privacy@ababatravels.com">privacy@ababatravels.com</a>.</p>
    `
  },
  'Terms & Conditions': {
    title: 'Vendor Partner Terms of Service',
    updatedAt: new Date().toISOString(),
    content: `
      <h3>1. Vendor Partnership Agreement</h3>
      <p>By registering and operating as a travel vendor on Ababa Travels, you agree to abide by these Terms of Service. This agreement governs your listing of travel packages, vehicle rentals, hotel stays, and related tourism services on our platform.</p>

      <h3>2. Quality Standards & Service Delivery</h3>
      <p>Vendors are required to maintain high standards of service delivery, safety, and accuracy in all published listings. Package details, pricing, inclusions, and availability schedules must be kept updated at all times.</p>

      <h3>3. Booking Fulfillment & Payments</h3>
      <p>Upon receiving a confirmed booking from a customer via Ababa Travels, vendors must honor the reservation according to the specified inclusions. Payouts and commission structures will be processed as per your active vendor commission agreement with Admin.</p>

      <h3>4. Cancellations & Disputes</h3>
      <p>Vendors agree to comply with the platform's standardized cancellation and refund guidelines. Any disputes between travelers and vendors will be arbitrated by Ababa Travels Administration, whose decision shall be final.</p>

      <h3>5. Termination & Compliance</h3>
      <p>Ababa Travels reserves the right to suspend or terminate vendor accounts that violate quality standards, engage in fraudulent activity, or breach platform guidelines established by Admin.</p>
    `
  },
  'Refund & Cancellation': {
    title: 'Vendor Refund & Cancellation Guidelines',
    updatedAt: new Date().toISOString(),
    content: `
      <h3>1. Standard Cancellation Policy Framework</h3>
      <p>Vendors must adhere to standard cancellation slabs defined by Ababa Travels Administration to ensure transparent traveler experiences across all agency listings.</p>

      <h3>2. Traveler Refund Processing</h3>
      <p>When a traveler cancels an eligible booking, refund calculations will be determined automatically based on the cancellation timestamp and published package rules. Vendor payouts will be adjusted accordingly.</p>

      <h3>3. Emergency & Force Majeure Cancellations</h3>
      <p>In cases of natural disasters, severe weather alerts, or government travel advisories, Ababa Travels Administration may initiate emergency cancellations with full or partial refunds to travelers in accordance with platform safety protocols.</p>
    `
  }
};

const VendorPolicyView = ({ defaultType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Determine active tab type from props, path, or search query
  const getInitialType = () => {
    if (defaultType) return defaultType;
    const typeQuery = searchParams.get('type');
    if (typeQuery === 'privacy-policy' || location.pathname.includes('privacy-policy')) return 'Privacy Policy';
    if (typeQuery === 'terms-conditions' || location.pathname.includes('terms-of-service')) return 'Terms & Conditions';
    if (typeQuery === 'refund-cancellation') return 'Refund & Cancellation';
    return 'Privacy Policy';
  };

  const [activeType, setActiveType] = useState(getInitialType);
  const [fetching, setFetching] = useState(true);
  const [policyData, setPolicyData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync activeType if location or searchParams change
  useEffect(() => {
    const updatedType = getInitialType();
    setActiveType(updatedType);
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const fetchVendorPolicy = async () => {
      setFetching(true);
      try {
        const response = await api.get('/policies', {
          params: {
            target: 'Vendor',
            type: activeType,
            isGlobal: 'true'
          }
        });

        if (response?.success && response?.data?.length > 0) {
          // Find matching policy created by Admin for Vendors
          const found = response.data.find(p => p.target === 'Vendor' && p.type === activeType) || response.data[0];
          setPolicyData(found);
        } else {
          setPolicyData(null);
        }
      } catch (error) {
        console.error('Failed to load vendor policy from server:', error);
        setPolicyData(null);
      } finally {
        setFetching(false);
      }
    };

    fetchVendorPolicy();
  }, [activeType]);

  const handleTabChange = (event, newValue) => {
    setActiveType(newValue);
    let typeParam = 'privacy-policy';
    if (newValue === 'Terms & Conditions') typeParam = 'terms-conditions';
    if (newValue === 'Refund & Cancellation') typeParam = 'refund-cancellation';
    setSearchParams({ type: typeParam });
  };

  const activePolicy = policyData || DEFAULT_VENDOR_POLICIES[activeType] || DEFAULT_VENDOR_POLICIES['Privacy Policy'];

  const handleCopy = () => {
    if (activePolicy?.content) {
      const cleanText = activePolicy.content.replace(/<[^>]+>/g, '');
      navigator.clipboard.writeText(`${activePolicy.title}\n\n${cleanText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Grid container spacing={gridSpacing}>
      {/* Page Header & Breadcrumbs */}
      <Grid size={12}>
        <Box sx={{ mb: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 1.5 }}>
            <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" fontWeight={600}>
              Vendor Legal & Policies
            </Typography>
          </Breadcrumbs>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ShieldCheckIcon color="secondary" sx={{ fontSize: 32 }} />
                <Typography variant="h2" fontWeight="800">
                  {activeType}
                </Typography>
                <Chip
                  icon={<AdminPanelSettingsIcon style={{ fontSize: 16 }} />}
                  label="Official Admin Policy"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                Official terms, guidelines, and privacy policies set by Ababa Travels Administration for partner vendors
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Copy Policy Text">
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Tooltip>
              <Tooltip title="Print Document">
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)' }}
                >
                  Print
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Grid>

      {/* Tabs & Search Bar Header */}
      <Grid size={12}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Tabs
            value={activeType}
            onChange={handleTabChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="Privacy Policy"
              icon={<SecurityIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Privacy Policy"
              sx={{ fontWeight: 700, borderRadius: '10px' }}
            />
            <Tab
              value="Terms & Conditions"
              icon={<GavelIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Terms of Service"
              sx={{ fontWeight: 700, borderRadius: '10px' }}
            />
            <Tab
              value="Refund & Cancellation"
              icon={<PolicyIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Refund & Cancellation"
              sx={{ fontWeight: 700, borderRadius: '10px' }}
            />
          </Tabs>

          <TextField
            placeholder={`Search within ${activeType}...`}
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', md: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
          />
        </Paper>
      </Grid>

      {/* Main Document Content */}
      <Grid size={12}>
        <MainCard content={false}>
          {fetching ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CircularProgress color="secondary" size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
                Loading policy document from server...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              {/* Document Header Info */}
              <Box
                sx={{
                  pb: 3,
                  mb: 4,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { sm: 'center' },
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="h2" fontWeight="900" sx={{ color: 'text.primary', mb: 0.5 }}>
                    {activePolicy.title || `${activeType} for Vendors`}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Target: Registered Vendors" size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                    <Chip label="Scope: Platform Global" size="small" variant="outlined" color="secondary" sx={{ fontWeight: 600 }} />
                  </Stack>
                </Box>

                <Box sx={{ textAlign: { sm: 'right' } }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Last Updated by Admin
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="700">
                    {activePolicy.updatedAt
                      ? new Date(activePolicy.updatedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Current Version'}
                  </Typography>
                </Box>
              </Box>

              {!policyData && (
                <Alert severity="info" sx={{ mb: 4, borderRadius: '12px' }}>
                  <strong>Standard Admin Policy:</strong> This document represents the standard platform policy for partner vendors. Administrators can update or customize this policy at any time through the Admin Management Console.
                </Alert>
              )}

              {/* Rendered Policy Content */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 4 },
                  borderRadius: '16px',
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 400
                }}
              >
                <Box
                  className="vendor-policy-rendered-html"
                  dangerouslySetInnerHTML={{
                    __html: activePolicy.content || '<p>No policy content provided by Admin.</p>'
                  }}
                  sx={{
                    fontSize: '15px',
                    lineHeight: 1.9,
                    color: 'text.primary',
                    '& h1, & h2, & h3, & h4': {
                      fontWeight: 800,
                      color: 'text.primary',
                      mt: 3,
                      mb: 1.5,
                      fontFamily: 'inherit'
                    },
                    '& h3': {
                      fontSize: '1.25rem',
                      borderLeft: '4px solid',
                      borderColor: 'secondary.main',
                      pl: 1.5,
                      py: 0.2
                    },
                    '& p': {
                      mb: 2,
                      color: 'text.secondary'
                    },
                    '& ul, & ol': {
                      pl: 3,
                      mb: 2,
                      '& li': {
                        mb: 1,
                        color: 'text.secondary'
                      }
                    },
                    '& a': {
                      color: 'secondary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }
                  }}
                />
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  &copy; {new Date().getFullYear()} Ababa Travels. All rights reserved. Admin Policy Document for Partner Vendors.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/platform/policies"
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 700 }}
                >
                  Manage Customer Policies &rarr;
                </Button>
              </Stack>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VendorPolicyView;
