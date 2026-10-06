import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTheme, useColorScheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import api from 'utils/api';

// assets / icons
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import HttpIcon from '@mui/icons-material/Http';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import CategoryIcon from '@mui/icons-material/Category';
import TourIcon from '@mui/icons-material/Tour';
import StarIcon from '@mui/icons-material/Star';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import BusinessIcon from '@mui/icons-material/Business';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ArticleIcon from '@mui/icons-material/Article';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import GavelIcon from '@mui/icons-material/Gavel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

export default function ApiDocumentation() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark' || theme.palette.mode === 'dark';
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [apiKeyData, setApiKeyData] = useState({ apiKey: '', createdAt: '', status: 'Active' });
  const [showKey, setShowKey] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const isStaffMember = Boolean(user?.managedBy || ['vendor-staff', 'staff'].includes((user?.role || '').toLowerCase()));

  const fetchApiKey = async () => {
    try {
      setLoading(true);

      try {
        const profileRes = await api.get('/vendors/profile');
        if (profileRes?.success && profileRes?.data?.profile?.subscription) {
          setSubscription(profileRes.data.profile.subscription);
        }
      } catch (err) {
        console.error('Failed to load profile subscription', err);
      }

      const response = await api.get('/vendors/api-key');
      if (response.success && response.data) {
        setApiKeyData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  const handleCopyKey = () => {
    if (!apiKeyData.apiKey) return;
    navigator.clipboard.writeText(apiKeyData.apiKey);
    setToast({ open: true, message: '📋 API Security Key copied to clipboard!', severity: 'success' });
  };

  const handleRegenerateKey = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/vendors/api-key/generate');
      if (response.success && response.data) {
        setApiKeyData(response.data);
        setToast({ open: true, message: '✨ New API Security Key generated successfully!', severity: 'success' });
        setRegenerateModalOpen(false);
      }
    } catch (error) {
      setToast({ open: true, message: error.message || 'Failed to generate API Key.', severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const currentApiKey = apiKeyData.apiKey || 'ababa_live_sec_demo1234567890abcdef';
  const maskedApiKey = showKey ? currentApiKey : currentApiKey.replace(/(?<=^ababa_live_sec_).*(?=.+$)/, '••••••••••••••••••••');

  const baseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:9000';

  // Complete List of All 11 Vendor Website API Endpoints
  const allEndpoints = [
    {
      id: 1,
      title: 'Promotional Banners & Slides API',
      method: 'GET',
      path: '/api/v1/external/banners',
      icon: <ViewCarouselIcon color="primary" />,
      description: 'Fetch active promotional banners, hero sliders, and offer graphics configured for your vendor website storefront.',
      response: `{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "650f11112222333344445555",
      "title": "Flat 20% Off Early Bird Summer Special",
      "subtitle": "Book before May 30th & Save Big",
      "imageUrl": "uploads/banners/summer_offer.jpg",
      "linkUrl": "/packages/kerala-summer",
      "buttonText": "Explore Offer",
      "status": "Active"
    }
  ]
}`
    },
    {
      id: 2,
      title: 'Blogs & News Articles API',
      method: 'GET',
      path: '/api/v1/external/blogs (or /blogs/:id)',
      icon: <ArticleIcon color="secondary" />,
      description: 'Fetch travel guides, news articles, and blog posts with full HTML body content, featured photos, and tags.',
      response: `{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "650f22223333444455556666",
      "title": "Top 10 Hidden Gem Destinations in Munnar for 2026",
      "slug": "top-10-hidden-gems-munnar",
      "author": "Ababa Travels Editorial",
      "coverImage": "uploads/blogs/munnar-guide.jpg",
      "summary": "Discover offbeat waterfalls and tea estate stays in Munnar.",
      "content": "<p>Full HTML formatted blog article content...</p>",
      "tags": ["Munnar", "Kerala", "Travel Guide"],
      "createdAt": "2026-09-15T08:00:00Z"
    }
  ]
}`
    },
    {
      id: 3,
      title: 'Client Testimonials & Feedback API',
      method: 'GET',
      path: '/api/v1/external/testimonials',
      icon: <FormatQuoteIcon sx={{ color: '#ec4899' }} />,
      description: 'Fetch verified client testimonials, star ratings, photos, and feedback quotes to render on your website.',
      response: `{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "650f33334444555566667777",
      "clientName": "Rajesh & Priya Nair",
      "designation": "Honeymoon Travelers",
      "avatar": "uploads/testimonials/rajesh.jpg",
      "rating": 5,
      "reviewText": "Flawless houseboat booking experience! The crew was welcoming and food was top notch.",
      "location": "Bangalore, India",
      "createdAt": "2026-09-20T14:30:00Z"
    }
  ]
}`
    },
    {
      id: 4,
      title: 'Submit Lead Enquiry API',
      method: 'POST',
      path: '/api/v1/external/enquiries',
      icon: <ContactSupportIcon color="info" />,
      description: 'Submit customer enquiries or package quotation requests from your website direct to your ABABA CRM Inbox.',
      bodyPayload: `{
  "name": "Anjali Menon",
  "email": "anjali@example.com",
  "phone": "+91 9123456789",
  "subject": "Custom Group Tour Enquiry for December",
  "message": "We need a custom package for 15 college friends visiting Kerala.",
  "packageId": "650f9876ef543210abcd1234"
}`,
      response: `{
  "success": true,
  "message": "Enquiry lead submitted successfully",
  "data": {
    "_id": "660b99887766554433221100",
    "name": "Anjali Menon",
    "status": "New",
    "source": "External Website API"
  }
}`
    },
    {
      id: 5,
      title: 'Submit Contact Us Form API',
      method: 'POST',
      path: '/api/v1/external/contact-us',
      icon: <ContactMailIcon color="error" />,
      description: 'Submit general contact form messages from your website contact page into your agency message inbox.',
      bodyPayload: `{
  "name": "Siddharth Verma",
  "email": "siddharth@example.com",
  "phone": "+91 9811223344",
  "subject": "Partnership & Corporate Booking",
  "message": "Hi, we want to discuss annual corporate offsite packages with your agency."
}`,
      response: `{
  "success": true,
  "message": "Contact form message submitted successfully",
  "data": {
    "_id": "660c88776655443322110000",
    "name": "Siddharth Verma",
    "status": "New"
  }
}`
    },
    {
      id: 6,
      title: 'Agency Terms & Policies API',
      method: 'GET',
      path: '/api/v1/external/policies',
      icon: <GavelIcon sx={{ color: '#8b5cf6' }} />,
      description: 'Fetch Terms & Conditions, Cancellation Policy, Refund Policy, and Privacy Policy configured for your agency.',
      response: `{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "650f44445555666677778888",
      "policyType": "Cancellation & Refund Policy",
      "title": "Standard Tour Cancellation Terms",
      "content": "Full refund up to 7 days prior to travel date. 50% refund within 3 to 7 days.",
      "updatedAt": "2026-08-10T12:00:00Z"
    }
  ]
}`
    },
    {
      id: 7,
      title: 'Submit Direct Booking API',
      method: 'POST',
      path: '/api/v1/external/bookings',
      icon: <SendIcon color="success" />,
      description: 'Submit customer package bookings from your website checkout form to generate instant booking records.',
      bodyPayload: `{
  "packageId": "650f9876ef543210abcd1234",
  "customerName": "Rahul Sharma",
  "customerEmail": "rahul@example.com",
  "customerPhone": "+91 9876543210",
  "travelDate": "2026-11-15",
  "numberOfTravelers": 2,
  "notes": "Prefers vegetarian meals on houseboat"
}`,
      response: `{
  "success": true,
  "message": "Booking created successfully via Vendor API Key",
  "data": {
    "_id": "660a11223344556677889900",
    "customId": "BK-2026-0045",
    "totalPrice": 29998,
    "bookingStatus": "Pending",
    "paymentStatus": "Pending"
  }
}`
    },
    {
      id: 8,
      title: 'List All Tour Packages API',
      method: 'GET',
      path: '/api/v1/external/packages (or /packages/:id)',
      icon: <TourIcon color="secondary" />,
      description: 'Fetch all active tour packages published by your agency with prices, duration, itinerary, and photos.',
      response: `{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "650f9876ef543210abcd1234",
      "title": "Kerala 5-Day Luxury Houseboat Tour",
      "regularPrice": 18000,
      "salePrice": 14999,
      "priceType": "Per Person",
      "duration": "5 Days / 4 Nights",
      "location": "Alleppey & Munnar",
      "category": { "title": "Tour Packages" },
      "images": ["uploads/packages/houseboat.jpg"]
    }
  ]
}`
    },
    {
      id: 9,
      title: 'Package Date Availability & Capacity Check API',
      method: 'GET',
      path: '/api/v1/external/availability',
      icon: <EventAvailableIcon sx={{ color: '#10b981' }} />,
      description: 'Check real-time slot availability, remaining seats, and total estimated price for a package on any date.',
      response: `{
  "success": true,
  "data": {
    "packageId": "650f9876ef543210abcd1234",
    "packageTitle": "Kerala 5-Day Luxury Houseboat Tour",
    "targetDate": "2026-11-15",
    "requestedTravelers": 2,
    "isAvailable": true,
    "maxCapacity": 30,
    "totalBookedSlots": 8,
    "remainingSlots": 22,
    "unitPrice": 14999,
    "totalEstimatedPrice": 29998
  }
}`
    },
    {
      id: 10,
      title: 'Agency Profile & Info API',
      method: 'GET',
      path: '/api/v1/external/profile',
      icon: <BusinessIcon color="info" />,
      description: 'Fetch your verified agency profile info, contact details, business type, logo, and address.',
      response: `{
  "success": true,
  "data": {
    "vendorId": "650f1234abcd5678ef901234",
    "companyName": "Ababa Travels & Holidays",
    "description": "Leading travel agency for Kerala tours, houseboat rentals, and hill station packages.",
    "businessType": "Travel Agency",
    "email": "vendor@ababatravels.com",
    "phone": "+91 9876543210",
    "spoc": {
      "name": "Muhammad Muhsin",
      "designation": "Managing Director",
      "email": "vendor@ababatravels.com",
      "phone": "+91 9876543210"
    },
    "contactNumbers": {
      "primaryPhone": "+91 9876543210",
      "customerHelpline": "+91 1800 123 4567",
      "emergencyHelpline": "+91 99950 00999"
    },
    "emails": {
      "primaryEmail": "vendor@ababatravels.com",
      "supportEmail": "support@ababatravels.com",
      "bookingEmail": "bookings@ababatravels.com"
    },
    "operatingHours": "Mon - Sat: 9:00 AM - 8:00 PM",
    "logo": "uploads/vendors/logo.jpg",
    "coverBanner": "uploads/vendors/banner.jpg",
    "address": {
      "street": "Main Road, Near Town Busstand",
      "city": "Malappuram",
      "state": "Kerala",
      "pincode": "673001"
    },
    "websiteUrl": "https://www.ababatravels.com",
    "socialLinks": {
      "instagram": "https://instagram.com/ababatravels",
      "facebook": "https://facebook.com/ababatravels"
    },
    "bankDetails": {
      "accountName": "Ababa Travels Pvt Ltd",
      "accountNumber": "381920194829",
      "bankName": "State Bank of India",
      "ifscCode": "SBIN0001234",
      "branch": "Kozhikode Main Branch"
    },
    "kycStatus": "Verified",
    "isApproved": true,
    "subscriptionPlan": "Pro Plan"
  }
}`
    },
    {
      id: 11,
      title: 'Enabled Services & Categories API',
      method: 'GET',
      path: '/api/v1/external/services',
      icon: <CategoryIcon color="warning" />,
      description: 'Fetch all active services and category modules enabled for your agency (e.g. Tour Packages, Houseboats, Cab Rentals).',
      response: `{
  "success": true,
  "count": 4,
  "data": [
    { "_id": "650a1111", "title": "Tour Packages", "customId": "SRV-TOUR" },
    { "_id": "650a2222", "title": "Houseboat Rentals", "customId": "SRV-BOAT" }
  ]
}`
    }
  ];

  // Integration Code Snippets
  const jsSnippet = `// 1. Fetch Banners & Slides
fetch('${baseUrl}/api/v1/external/banners', {
  headers: { 'x-api-key': '${currentApiKey}' }
})
  .then(res => res.json())
  .then(data => console.log('Banners:', data));

// 2. Fetch Packages
fetch('${baseUrl}/api/v1/external/packages', {
  headers: { 'x-api-key': '${currentApiKey}' }
})
  .then(res => res.json())
  .then(data => console.log('Packages:', data));

// 3. Check Date Slot Availability
fetch('${baseUrl}/api/v1/external/availability?packageId=650f9876ef543210abcd1234&date=2026-11-15&travelers=2', {
  headers: { 'x-api-key': '${currentApiKey}' }
})
  .then(res => res.json())
  .then(data => console.log('Availability Check:', data));

// 4. Submit Website Customer Booking
fetch('${baseUrl}/api/v1/external/bookings', {
  method: 'POST',
  headers: {
    'x-api-key': '${currentApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    packageId: "650f9876ef543210abcd1234",
    customerName: "Rahul Sharma",
    customerEmail: "rahul@example.com",
    customerPhone: "+91 9876543210",
    travelDate: "2026-11-15",
    numberOfTravelers: 2,
    notes: "Booking via website form"
  })
})
  .then(res => res.json())
  .then(data => console.log('Booking Confirmed:', data));`;

  const curlSnippet = `# 1. Fetch Banners
curl -X GET "${baseUrl}/api/v1/external/banners" \\
  -H "x-api-key: ${currentApiKey}"

# 2. Fetch Blogs & News
curl -X GET "${baseUrl}/api/v1/external/blogs" \\
  -H "x-api-key: ${currentApiKey}"

# 3. Check Date Availability
curl -X GET "${baseUrl}/api/v1/external/availability?packageId=650f9876ef543210abcd1234&date=2026-11-15&travelers=2" \\
  -H "x-api-key: ${currentApiKey}"

# 4. Submit Customer Lead Enquiry
curl -X POST "${baseUrl}/api/v1/external/enquiries" \\
  -H "x-api-key: ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Anjali Menon",
    "email": "anjali@example.com",
    "phone": "+919123456789",
    "subject": "Website Query",
    "message": "Interested in Wayanad resort booking"
  }'`;

  const nodeSnippet = `const axios = require('axios');

const API_KEY = '${currentApiKey}';
const BASE_URL = '${baseUrl}/api/v1/external';

async function getVendorWebsiteData() {
  try {
    const banners = await axios.get(\`\${BASE_URL}/banners\`, { headers: { 'x-api-key': API_KEY } });
    const blogs = await axios.get(\`\${BASE_URL}/blogs\`, { headers: { 'x-api-key': API_KEY } });
    const testimonials = await axios.get(\`\${BASE_URL}/testimonials\`, { headers: { 'x-api-key': API_KEY } });
    const packages = await axios.get(\`\${BASE_URL}/packages\`, { headers: { 'x-api-key': API_KEY } });

    console.log('Banners:', banners.data);
    console.log('Blogs:', blogs.data);
    console.log('Testimonials:', testimonials.data);
    console.log('Packages:', packages.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

getVendorWebsiteData();`;

  const pythonSnippet = `import requests

API_KEY = '${currentApiKey}'
BASE_URL = '${baseUrl}/api/v1/external'
headers = { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }

# 1. Fetch Banners & Testimonials
banners = requests.get(f"{BASE_URL}/banners", headers=headers).json()
testimonials = requests.get(f"{BASE_URL}/testimonials", headers=headers).json()

# 2. Check Package Availability
avail = requests.get(f"{BASE_URL}/availability?packageId=650f9876ef543210abcd1234&date=2026-11-15&travelers=2", headers=headers).json()
print("Availability:", avail)`;

  const codeSnippets = [
    { label: 'JavaScript / Fetch', code: jsSnippet },
    { label: 'cURL Terminal', code: curlSnippet },
    { label: 'Node.js (Axios)', code: nodeSnippet },
    { label: 'Python (Requests)', code: pythonSnippet }
  ];

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setToast({ open: true, message: '💻 Code snippet copied to clipboard!', severity: 'info' });
  };

  const apiDocLimit = subscription?.apiDocLimit !== undefined ? subscription.apiDocLimit : -1;
  const isApiDocAllowed = subscription?.apiDocEnabled !== false && apiDocLimit !== 0;

  if (!loading && !isApiDocAllowed) {
    return (
      <Box>
        <SaasHeader title="API & Developer Documentation" subtitle="REST API endpoints and integration keys." />
        <SubscriptionRestrictedCard featureName="API & Developer Documentation" reason={apiDocLimit === 0 ? 'limit' : 'permission'} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <SaasHeader
        title="API & Developer Documentation"
        subtitle="Full suite of Vendor Web Integration APIs for website package listing, customer booking forms, lead enquiries, and reviews."
        actionLabel="Regenerate API Key"
        actionIcon={<RefreshIcon />}
        onActionClick={() => setRegenerateModalOpen(true)}
        disabled={isStaffMember}
        loading={loading}
      />

      {isStaffMember && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>
          🔒 View Only Mode: Vendor Staff members can view API integration documentation. API Key regeneration is restricted to the Primary Vendor Owner.
        </Alert>
      )}

      {/* API SECURITY KEY CARD */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: '16px',
          border: '1.5px solid',
          borderColor: isDarkMode ? 'rgba(99,102,241,0.4)' : 'secondary.light',
          background: isDarkMode
            ? 'linear-gradient(135deg, #111936 0%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #f4f3ff 100%)',
          boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <KeyIcon color="secondary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: isDarkMode ? '#ffffff' : 'secondary.main' }}>
                  Your Vendor API Security Key
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontWeight: 600 }}>
                  Authenticate requests from your custom agency website or mobile app
                </Typography>
              </Box>
            </Stack>
            <StatusBadge label="ACTIVE & READY" status="Completed" />
          </Stack>

          <Divider sx={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'divider' }} />

          {/* API Key Display Field */}
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={maskedApiKey}
                slotProps={{
                  input: {
                    readOnly: true,
                    style: { fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: isDarkMode ? '#77f07f' : '#0f172a' },
                    startAdornment: (
                      <InputAdornment position="start">
                        <SecurityIcon color="secondary" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowKey(!showKey)}>
                          {showKey ? <VisibilityOffIcon fontSize="small" sx={{ color: isDarkMode ? '#cbd5e1' : 'action.active' }} /> : <VisibilityIcon fontSize="small" sx={{ color: isDarkMode ? '#cbd5e1' : 'action.active' }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkMode ? '#090d16 !important' : '#ffffff !important',
                    borderRadius: '12px !important',
                    '& fieldset': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2) !important' : 'divider !important'
                    }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyKey}
                  sx={{ borderRadius: '12px', py: 1.2, fontWeight: 700 }}
                >
                  Copy Key
                </Button>
                {!isStaffMember && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RefreshIcon />}
                    onClick={() => setRegenerateModalOpen(true)}
                    sx={{ borderRadius: '12px', py: 1.2, fontWeight: 700, minWidth: '130px' }}
                  >
                    Regenerate
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Security Best Practices */}
          <Alert severity="info" sx={{ borderRadius: '10px', bgcolor: isDarkMode ? 'rgba(14, 165, 233, 0.15) !important' : undefined, color: isDarkMode ? '#e0f2fe !important' : undefined, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
            <strong>Authentication Header:</strong> Pass your key in header <code>x-api-key: {currentApiKey.slice(0, 20)}...</code> or query string <code>?apiKey=YOUR_KEY</code>.
          </Alert>
        </Stack>
      </Paper>

      {/* SUBSCRIPTION PLAN API ACCESS & LIMITATION ENGINE ALERT */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '14px',
          border: '1.5px solid !important',
          borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.4) !important' : '#bfdbfe !important',
          bgcolor: isDarkMode ? 'rgba(30, 58, 138, 0.35) !important' : '#eff6ff !important'
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SecurityIcon sx={{ color: isDarkMode ? '#60a5fa !important' : 'primary.main' }} fontSize="small" />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: isDarkMode ? '#93c5fd !important' : 'primary.main' }}>
                Subscription Plan API Acceptance & Limitation Engine
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Subscription: Accepted"
                size="small"
                sx={{
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  bgcolor: isDarkMode ? '#059669 !important' : '#10b981 !important',
                  color: '#ffffff !important',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                }}
              />
              <Chip
                label="Quotas: Limited & Unlimited"
                size="small"
                sx={{
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  bgcolor: isDarkMode ? 'rgba(59, 130, 246, 0.25) !important' : '#dbeafe !important',
                  color: isDarkMode ? '#93c5fd !important' : '#1e40af !important',
                  border: '1px solid !important',
                  borderColor: isDarkMode ? 'rgba(147, 197, 253, 0.4) !important' : '#bfdbfe !important'
                }}
              />
            </Stack>
          </Stack>
          <Typography variant="body2" sx={{ color: isDarkMode ? '#cbd5e1 !important' : 'text.secondary' }} fontWeight={500}>
            All 8 external API modules (Banners, Blogs, Testimonials, Enquiries, Contact-Us, Bookings, Packages, Availability) validate vendor subscription acceptance, feature flags, and package quotas (Limited vs Unlimited) in real-time.
          </Typography>
        </Stack>
      </Paper>

      {/* ALL VENDOR API ENDPOINTS DOCUMENTATION */}
      <MainCard
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" fontWeight="800" fontSize="1.2rem" sx={{ color: isDarkMode ? '#ffffff !important' : 'text.primary' }}>
              All Vendor API Endpoints ({allEndpoints.length})
            </Typography>
            <Chip
              label={`All ${allEndpoints.length} APIs Active`}
              size="small"
              sx={{
                fontWeight: 900,
                fontSize: '0.75rem',
                borderRadius: '8px',
                bgcolor: isDarkMode ? '#059669 !important' : '#10b981 !important',
                color: '#ffffff !important',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
              }}
            />
          </Stack>
        }
      >
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8 !important' : 'text.secondary' }}>
            Expand any endpoint below to inspect the request parameters, HTTP headers, request body schema, and sample JSON response structure.
          </Typography>

          {allEndpoints.map((ep) => (
            <Accordion
              key={ep.id}
              sx={{
                borderRadius: '12px !important',
                border: '1px solid !important',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12) !important' : '#e2e8f0 !important',
                bgcolor: isDarkMode ? '#111936 !important' : '#ffffff !important',
                boxShadow: 'none !important',
                '&:before': { display: 'none !important' },
                '&.MuiAccordion-root': {
                  bgcolor: isDarkMode ? '#111936 !important' : '#ffffff !important',
                  color: isDarkMode ? '#ffffff !important' : '#0f172a !important'
                },
                '& .MuiAccordionSummary-root': {
                  bgcolor: isDarkMode ? '#111936 !important' : '#ffffff !important',
                  borderRadius: '12px !important'
                },
                '& .MuiAccordionDetails-root': {
                  bgcolor: isDarkMode ? '#0d1322 !important' : '#f8fafc !important',
                  borderTop: '1px solid !important',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1) !important' : '#e2e8f0 !important'
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: isDarkMode ? '#cbd5e1 !important' : 'action.active' }} />}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                  <Chip
                    label={ep.method}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      fontSize: '0.73rem',
                      minWidth: 55,
                      borderRadius: '6px',
                      bgcolor: ep.method === 'GET'
                        ? (isDarkMode ? '#059669 !important' : '#10b981 !important')
                        : (isDarkMode ? '#2563eb !important' : '#3b82f6 !important'),
                      color: '#ffffff !important',
                      boxShadow: ep.method === 'GET'
                        ? '0 2px 8px rgba(16, 185, 129, 0.35)'
                        : '0 2px 8px rgba(37, 99, 235, 0.35)'
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight="800" sx={{ minWidth: { md: 240 }, color: isDarkMode ? '#ffffff !important' : '#0f172a !important' }}>
                    {ep.title}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: isDarkMode ? '#94a3b8 !important' : 'text.secondary' }}>
                    {ep.path}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#cbd5e1 !important' : 'text.secondary' }} fontWeight={500}>
                    {ep.description}
                  </Typography>

                  {/* Body Payload if POST */}
                  {ep.bodyPayload && (
                    <Box>
                      <Typography variant="caption" fontWeight="800" color="primary.main" display="block" sx={{ mb: 0.5 }}>
                        REQUEST BODY PAYLOAD (JSON):
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', bgcolor: '#090d16 !important', border: '1px solid rgba(255,255,255,0.12) !important', color: '#77f07f !important' }}>
                        <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          <code>{ep.bodyPayload}</code>
                        </pre>
                      </Paper>
                    </Box>
                  )}

                  {/* Response JSON */}
                  <Box>
                    <Typography variant="caption" fontWeight="800" color="success.main" display="block" sx={{ mb: 0.5 }}>
                      SAMPLE RESPONSE (JSON 200 OK):
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', bgcolor: '#090d16 !important', border: '1px solid rgba(255,255,255,0.12) !important', color: '#f1f5f9 !important' }}>
                      <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        <code>{ep.response}</code>
                      </pre>
                    </Paper>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </MainCard>

      {/* INTEGRATION CODE SNIPPETS */}
      <Box sx={{ mt: 3.5 }}>
        <MainCard title="Developer Integration Code Examples" icon={<TerminalIcon />}>
          <Stack spacing={2}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider',
                '& .MuiTab-root': { fontWeight: 700, color: isDarkMode ? '#94a3b8' : 'text.secondary', '&.Mui-selected': { color: isDarkMode ? '#38bdf8' : 'secondary.main' } }
              }}
            >
              {codeSnippets.map((item, idx) => (
                <Tab key={idx} label={item.label} />
              ))}
            </Tabs>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '14px',
                bgcolor: '#090d16',
                color: '#f1f5f9',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.1)',
                position: 'relative'
              }}
            >
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyCode(codeSnippets[activeTab].code)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                Copy Snippet
              </Button>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                  pt: 1
                }}
              >
                <code>{codeSnippets[activeTab].code}</code>
              </Box>
            </Paper>
          </Stack>
        </MainCard>
      </Box>

      {/* REGENERATE CONFIRMATION DIALOG */}
      <Dialog
        open={regenerateModalOpen}
        onClose={() => setRegenerateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Regenerate API Security Key?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Regenerating your API Security Key will immediately invalidate your previous key. Any website integration or mobile application using the old key will lose access until updated with the new key.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRegenerateModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRegenerateKey}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {generating ? 'Generating...' : 'Confirm & Regenerate Key'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST NOTIFICATION */}
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
    </Box>
  );
}
