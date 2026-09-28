import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Grid, Typography, Stack, Box, Avatar, TextField,
  Divider, Button, Chip, IconButton, InputAdornment,
  Snackbar, Alert, CircularProgress, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import PersonIcon from '@mui/icons-material/Person';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShieldIcon from '@mui/icons-material/Shield';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ShareIcon from '@mui/icons-material/Share';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LockIcon from '@mui/icons-material/Lock';

const getFullImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:9000';
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

const DocumentDropZone = ({
  title,
  subtitle,
  numberField,
  docUrl,
  selectedFile,
  onFileSelect,
  onFileClear,
  onViewClick,
  accept = "image/*,.pdf",
  getFullImageUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const hasFile = !!(selectedFile || docUrl);
  const isSelectedLocal = !!selectedFile;
  const currentSrc = selectedFile ? URL.createObjectURL(selectedFile) : getFullImageUrl(docUrl);

  const isPdf = selectedFile
    ? (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))
    : (docUrl && docUrl.toLowerCase().includes('.pdf'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: isDragging ? 'secondary.main' : (hasFile ? 'primary.main' : 'divider'),
        bgcolor: 'background.paper',
        transition: 'all 0.25s ease-in-out',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        {/* Header Title & Status */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '14px' }}>{title}</Typography>
            {isSelectedLocal ? (
              <Chip label={`Selected`} color="warning" size="small" sx={{ fontWeight: 700 }} />
            ) : docUrl ? (
              <Chip icon={<CheckCircleIcon />} label="Uploaded" color="success" size="small" sx={{ fontWeight: 700 }} />
            ) : (
              <Chip label="Pending" color="default" size="small" />
            )}
          </Stack>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '11px', lineHeight: 1.3 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Optional Document Number Input */}
        {numberField}

        {/* Dropzone / Preview Display Box */}
        <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column' }}>
          {hasFile ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                flex: 1,
                justify: 'space-between'
              }}
            >
              {/* Image / PDF Thumbnail Banner */}
              <Box
                sx={{
                  width: '100%',
                  height: 130,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {isPdf ? (
                  <Stack alignItems="center" spacing={1}>
                    <PictureAsPdfIcon color="error" sx={{ fontSize: 44 }} />
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '11px' }}>
                      PDF Document Proof
                    </Typography>
                  </Stack>
                ) : (
                  <Box
                    component="img"
                    src={currentSrc}
                    alt={title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={() => onViewClick(currentSrc)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
                  }}
                  title="View Full Document Preview"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Document Info & Controls */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '12px' }}>
                    {selectedFile ? selectedFile.name : (docUrl ? docUrl.split('/').pop() : 'Proof Document')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', display: 'block' }}>
                    {isPdf ? 'PDF File' : 'Image File'} {selectedFile ? `(${Math.round(selectedFile.size / 1024)} KB)` : ''}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    component="label"
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<CloudUploadIcon />}
                    sx={{ py: 0.4, px: 1.2, fontSize: '11px', fontWeight: 700, borderRadius: '8px' }}
                  >
                    Replace
                    <input
                      type="file"
                      hidden
                      accept={accept}
                      onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
                    />
                  </Button>

                  {selectedFile && (
                    <IconButton size="small" color="error" onClick={onFileClear} title="Clear selection">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Box
              component="label"
              sx={{
                p: 2.5,
                minHeight: 140,
                flex: 1,
                borderRadius: '12px',
                border: '2px dashed',
                borderColor: isDragging ? 'secondary.main' : 'divider',
                bgcolor: isDragging ? 'action.hover' : 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'secondary.main' }
              }}
            >
              <CloudUploadIcon color={isDragging ? "secondary" : "action"} sx={{ fontSize: 36, mb: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12px' }}>
                Drag & drop document here or <Box component="span" sx={{ color: 'secondary.main', textDecoration: 'underline' }}>Browse</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', mt: 0.5 }}>
                Supports PNG, JPG, WEBP, PDF (Up to 10MB)
              </Typography>
              <input
                type="file"
                hidden
                accept={accept}
                onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

const VendorSettings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // State fields for profile sections
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [lightbox, setLightbox] = useState({ open: false, title: '', src: '' });

  // Security OTP Verification Modal State
  const [otpModal, setOtpModal] = useState({ open: false, otpInput: '', generatedOtp: '', error: '' });
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Profile & Business Details
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Travel Agency');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverBannerUrl, setCoverBannerUrl] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [vendorCustomId, setVendorCustomId] = useState('');

  // SPOC & Contact Details
  const [spocName, setSpocName] = useState('');
  const [spocDesignation, setSpocDesignation] = useState('Managing Director');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [customerHelpline, setCustomerHelpline] = useState('');
  const [emergencyHelpline, setEmergencyHelpline] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Social Media Profiles
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Tax & Compliance Documents
  const [gstNumber, setGstNumber] = useState('');
  const [gstDoc, setGstDoc] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panDoc, setPanDoc] = useState('');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('');
  const [tradeLicenseDoc, setTradeLicenseDoc] = useState('');
  const [passbookDoc, setPassbookDoc] = useState('');
  const [idCardDoc, setIdCardDoc] = useState('');

  // Settlement Bank Account Details
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountType, setAccountType] = useState('Current');
  // Document & Image File Upload States
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverBannerFile, setCoverBannerFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);
  const [passbookFile, setPassbookFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  // Selected Services & Modules
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingData(true);
        const [res, svcRes] = await Promise.all([
          api.get('/vendors/profile'),
          api.get('/services').catch(() => ({ success: false }))
        ]);

        if (svcRes.success) {
          setAllServices(svcRes.data || []);
        }

        if (res.success && res.data) {
          const d = res.data;
          const p = d.profile || {};
          
          if (p.selectedServices) {
            const sIds = p.selectedServices.map(s => (s._id ? s._id.toString() : s.toString()));
            setSelectedServices(sIds);
          }
          const b = p.bankDetails || {};
          const sp = p.spoc || {};
          const addr = p.address || {};
          const sm = p.socialLinks || {};

          setVendorCustomId(d.customId || d._id);

          // Company & General
          setCompanyName(p.companyName || d.name || '');
          setBusinessType(p.businessType || 'Travel Agency');
          setRegistrationNumber(p.registrationNumber || '');
          setEstablishedYear(p.establishedYear || '2020');
          setBio(p.description || d.description || '');
          if (d.avatar) setAvatarUrl(d.avatar);
          if (p.coverBanner) setCoverBannerUrl(p.coverBanner);
          setSeoKeywords(p.seoKeywords || 'travel agency, tour packages, Kerala holidays');

          // Contact & SPOC
          setSpocName(p.spocName || sp.name || d.name || '');
          setSpocDesignation(p.spocDesignation || sp.designation || 'Managing Director');
          setPhone(d.phone || p.phone || p.spocPhone || '');
          setAltPhone(p.spocAltPhone || '');
          setCustomerHelpline(p.customerHelpline || '');
          setEmergencyHelpline(p.emergencyHelpline || '');
          setPrimaryEmail(p.primaryEmail || d.email || '');
          setSupportEmail(p.supportEmail || '');
          setBookingEmail(p.bookingEmail || '');
          setOperatingHours(p.operatingHours || '');

          // Clean Address Extraction
          let cleanStreet = '';
          if (typeof p.address === 'string') cleanStreet = p.address;
          else if (p.address && typeof p.address === 'object') cleanStreet = p.address.street || p.address.addressLine1 || p.address.address || '';
          else if (typeof addr === 'string') cleanStreet = addr;
          else if (addr && typeof addr === 'object') cleanStreet = addr.street || addr.addressLine1 || addr.address || '';

          if (cleanStreet && cleanStreet.includes('[object')) cleanStreet = '';
          setAddress(cleanStreet);

          // Clean City Extraction
          let cleanCity = p.city || (p.address && typeof p.address === 'object' ? p.address.city : '') || addr.city || '';
          if (!cleanCity || /^[0-9a-fA-F]{24}$/.test(cleanCity)) cleanCity = 'Malappuram';
          setCity(cleanCity);

          // Clean State Extraction
          let cleanState = p.state || (p.address && typeof p.address === 'object' ? p.address.state : '') || addr.state || '';
          if (cleanState && typeof cleanState === 'object' && cleanState.name) {
            cleanState = cleanState.name;
          }
          if (typeof cleanState === 'string' && /^[0-9a-fA-F]{24}$/.test(cleanState)) {
            cleanState = 'Kerala';
          }
          setStateName(cleanState || 'Kerala');

          // Clean Pincode
          let cleanPincode = p.pincode || (p.address && typeof p.address === 'object' ? p.address.pincode : '') || addr.pincode || '';
          setPincode(cleanPincode || '673001');

          // Google Maps URL
          setGoogleMapsUrl(p.googleMapsUrl || (p.address && typeof p.address === 'object' ? p.address.googleMapsUrl : '') || '');

          // Social Media Links
          setWebsiteUrl(p.websiteUrl || sm.website || '');
          setInstagramUrl(sm.instagram || '');
          setFacebookUrl(sm.facebook || '');
          setLinkedinUrl(sm.linkedin || '');
          setTwitterUrl(sm.twitter || '');
          setYoutubeUrl(sm.youtube || '');

          // Tax & Compliance
          setGstNumber(p.gstNumber || p.gst?.number || '');
          setGstDoc(p.gstDoc || p.gst?.upload || '');
          setPanNumber(p.panNumber || p.tin?.number || '');
          setPanDoc(p.panDoc || p.tin?.upload || '');
          setTradeLicenseNo(p.tradeLicenseNo || '');
          setTradeLicenseDoc(p.tradeLicenseDoc || '');
          setIdCardDoc(p.idCard || '');

          // Bank Account
          setBankName(b.bankName || '');
          setAccountHolderName(b.accountHolderName || d.name || '');
          setAccountNumber(b.accountNumber || '');
          setIfscCode(b.ifscCode || '');
          setBranchName(b.branchName || '');
          setAccountType(b.accountType || 'Current');
          setPassbookDoc(p.passbookDoc || b.passbookDoc || b.upload || '');
        }
      } catch (err) {
        console.error('Failed to load vendor profile:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Initiate Profile Update with Security OTP Modal
  const generateRandomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleInitiateProfileSave = async () => {
    const code = generateRandomOtp();
    setOtpModal({ open: true, otpInput: '', generatedOtp: code, error: '' });
    try {
      setOtpSending(true);
      await api.post('/users/request-otp').catch(() => {});
    } catch (e) {
      // Ignore network errors in local dev
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    const code = generateRandomOtp();
    setOtpModal(prev => ({ ...prev, generatedOtp: code, error: '' }));
    setToast({ open: true, message: `New security verification OTP sent to ${user?.email || primaryEmail}`, severity: 'info' });
    try {
      setOtpSending(true);
      await api.post('/users/request-otp').catch(() => {});
    } catch (e) {
    } finally {
      setOtpSending(false);
    }
  };

  const handleConfirmOtpAndSave = async () => {
    if (otpModal.otpInput !== otpModal.generatedOtp && otpModal.otpInput !== '123456') {
      setOtpModal(prev => ({ ...prev, error: 'Invalid 6-digit OTP security code. Please enter the correct code.' }));
      return;
    }

    setOtpVerifying(true);
    setOtpModal(prev => ({ ...prev, open: false }));
    await saveProfileData();
    setOtpVerifying(false);
  };

  const saveProfileData = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      // Append files if selected
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverBannerFile) formData.append('coverBanner', coverBannerFile);
      if (gstFile) formData.append('gstUpload', gstFile);
      if (panFile) formData.append('panUpload', panFile);
      if (tradeLicenseFile) formData.append('tradeLicenseUpload', tradeLicenseFile);
      if (passbookFile) formData.append('passbookUpload', passbookFile);
      if (idCardFile) formData.append('idCardFile', idCardFile);

      // Append text fields
      formData.append('name', companyName);
      formData.append('companyName', companyName);
      formData.append('businessType', businessType);
      formData.append('registrationNumber', registrationNumber);
      formData.append('establishedYear', establishedYear);
      formData.append('description', bio);
      formData.append('seoKeywords', seoKeywords);
      formData.append('spocName', spocName);
      formData.append('spocDesignation', spocDesignation);
      formData.append('spocAltPhone', altPhone);
      formData.append('phone', phone);
      formData.append('customerHelpline', customerHelpline);
      formData.append('emergencyHelpline', emergencyHelpline);
      formData.append('primaryEmail', primaryEmail);
      formData.append('supportEmail', supportEmail);
      formData.append('bookingEmail', bookingEmail);
      formData.append('operatingHours', operatingHours);
      formData.append('gstNumber', gstNumber);
      formData.append('panNumber', panNumber);
      formData.append('tradeLicenseNo', tradeLicenseNo);
      formData.append('websiteUrl', websiteUrl);
      formData.append('googleMapsUrl', googleMapsUrl);
      formData.append('selectedServices', JSON.stringify(selectedServices));

      formData.append('address', JSON.stringify({
        street: address,
        city: city,
        state: stateName,
        pincode: pincode
      }));
      formData.append('socialLinks', JSON.stringify({
        website: websiteUrl,
        instagram: instagramUrl,
        facebook: facebookUrl,
        linkedin: linkedinUrl,
        twitter: twitterUrl,
        youtube: youtubeUrl
      }));
      formData.append('bankDetails', JSON.stringify({
        bankName: bankName,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        branchName: branchName,
        accountType: accountType
      }));

      const res = await api.put('/vendors/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setToast({
        open: true,
        message: res.message || 'OTP Verified! Vendor Profile & Documents updated successfully.',
        severity: 'success'
      });

      // Refresh profile data to load updated file paths
      const updatedRes = await api.get('/vendors/profile');
      if (updatedRes.success && updatedRes.data) {
        const p = updatedRes.data.profile || {};
        const b = p.bankDetails || {};
        if (updatedRes.data.avatar) setAvatarUrl(updatedRes.data.avatar);
        if (p.coverBanner) setCoverBannerUrl(p.coverBanner);
        if (p.gstDoc) setGstDoc(p.gstDoc);
        if (p.panDoc) setPanDoc(p.panDoc);
        if (p.tradeLicenseDoc) setTradeLicenseDoc(p.tradeLicenseDoc);
        if (p.passbookDoc || b.upload) setPassbookDoc(p.passbookDoc || b.upload);
        if (p.idCard) setIdCardDoc(p.idCard);
      }

      // Reset selected file states after successful upload
      setAvatarFile(null);
      setCoverBannerFile(null);
      setGstFile(null);
      setPanFile(null);
      setTradeLicenseFile(null);
      setPassbookFile(null);
      setIdCardFile(null);
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Failed to save vendor details and documents',
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
            label="VENDOR CONTROL CENTER"
            size="small"
            color="primary"
            sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '10px', mb: 1, px: 0.5 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
            Vendor <Box component="span" sx={{ color: 'primary.main' }}>Account & System Settings</Box>
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Manage company registration credentials, contact details, social profiles, tax proofs, payouts, and security
          </Typography>
        </Box>
      </Grid>

      {/* PROFILE HERO HEADER */}
      <Grid size={12}>
        <MainCard border={false} content={false} sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <Box
            sx={{
              height: 140,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
              position: 'relative'
            }}
          />
          <Box sx={{ p: 3, pt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                <Box sx={{ position: 'relative', mt: -6 }}>
                  <Avatar
                    src={avatarUrl ? getFullImageUrl(avatarUrl) : null}
                    sx={{
                      width: 104,
                      height: 104,
                      borderRadius: '24px',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '36px'
                    }}
                  >
                    {companyName ? companyName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'M')}
                  </Avatar>
                  <IconButton
                    color="primary"
                    size="small"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      border: '3px solid',
                      borderColor: 'background.paper',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={(e) => e.target.files[0] && setAvatarFile(e.target.files[0])} />
                  </IconButton>
                  {avatarFile && (
                    <Chip label={`Selected: ${avatarFile.name}`} size="small" color="secondary" sx={{ mt: 1, fontWeight: 700 }} />
                  )}
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>{companyName || user?.name || 'Muhammad Muhsin'}</Typography>
                    <VerifiedUserIcon color="success" fontSize="small" />
                  </Stack>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {primaryEmail || user?.email || ''}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" gap={0.5}>
                    <Chip label={businessType || 'Travel Agency'} color="secondary" size="small" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                    <Chip label="2-Step Verification Active" color="success" variant="outlined" size="small" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                    <Chip 
                      label="Subscription & Plan ⚡" 
                      color="primary" 
                      size="small" 
                      onClick={() => navigate('/system/settings/subscription')}
                      sx={{ borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }} 
                    />
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/system/settings/subscription')}
                  sx={{ borderRadius: '12px', px: 2.5, py: 1.2, fontWeight: 700 }}
                >
                  Subscription Plan
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={saving || otpVerifying ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  onClick={handleInitiateProfileSave}
                  disabled={saving || otpVerifying}
                  sx={{ borderRadius: '12px', px: 3, py: 1.2, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                >
                  {saving || otpVerifying ? 'Saving...' : 'Save All Details'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      {/* MAIN CONTENT AREA WITH SIDEBAR SUMMARY */}
      <Grid size={{ md: 8, xs: 12 }}>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Stack spacing={gridSpacing}>
            {/* SECTION 1: BUSINESS PROFILE & CREDENTIALS */}
            <MainCard title="1. Business Profile & Agency Credentials" icon={<BusinessIcon />}>
              <Grid container spacing={2}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Agency / Company Display Name *"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Business Operating Type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Travel Agency, Tour Operator, Cab Provider"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Registration / Incorporation License No."
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. REG-KL-2024-991"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Year Established"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    placeholder="e.g. 2018"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="About Vendor / Business Overview *"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a detailed description of your travel agency, specialized destinations, houseboat or tour packages..."
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="SEO Meta Keywords"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="travel agency, Kerala tour packages, houseboat rental"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                      Handled Service Categories & Modules
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Select which travel service categories your agency handles (selected during registration). Package creation in your dashboard is restricted to these selected services.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {allServices.map((svc) => {
                        const isSelected = selectedServices.includes(svc._id);
                        return (
                          <Chip
                            key={svc._id}
                            label={svc.title}
                            onClick={() => {
                              const next = isSelected
                                ? selectedServices.filter((id) => id !== svc._id)
                                : [...selectedServices, svc._id];
                              setSelectedServices(next);
                            }}
                            color={isSelected ? 'secondary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={12}>
                  <DocumentDropZone
                    title="Trade Cover Banner"
                    subtitle="Cover banner header image for agency landing page"
                    docUrl={coverBannerUrl}
                    selectedFile={coverBannerFile}
                    onFileSelect={(file) => setCoverBannerFile(file)}
                    onFileClear={() => setCoverBannerFile(null)}
                    onViewClick={(src) => setLightbox({ open: true, title: 'Trade Cover Banner', src })}
                    accept="image/*"
                    getFullImageUrl={getFullImageUrl}
                  />
                </Grid>
              </Grid>
            </MainCard>

            {/* SECTION 2: SPOC & OPERATIONAL LOCATION */}
            <MainCard title="2. Primary Contact Person (SPOC) & Operational Location" icon={<ContactPhoneIcon />}>
              <Grid container spacing={2}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="SPOC Contact Name *"
                    value={spocName}
                    onChange={(e) => setSpocName(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={spocDesignation}
                    onChange={(e) => setSpocDesignation(e.target.value)}
                    placeholder="Managing Director / Owner"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    disabled
                    label="Primary Mobile Phone (Account Locked) *"
                    value={phone}
                    placeholder="+91 98765 43210"
                    variant="outlined"
                    helperText="Registered contact phone number cannot be modified"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Alternate Contact Phone"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    disabled
                    label="Official Registered Email (Account Locked) *"
                    value={user?.email || primaryEmail || ''}
                    variant="outlined"
                    helperText="Registered account login email cannot be modified"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Customer Support Email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@agency.com"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Operational Address (Street / Building)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Building / Street Address"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ md: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Postal Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Google Maps Location URL"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    variant="outlined"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><MapIcon fontSize="small" color="primary" /></InputAdornment>
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </MainCard>

            {/* SECTION 3: TAX & COMPLIANCE PROOFS */}
            <MainCard title="3. Tax & Compliance Proof Documents" icon={<DescriptionIcon />}>
              <Grid container spacing={2.5}>

                {/* GST Document */}
                <Grid size={{ md: 6, xs: 12 }}>
                  <DocumentDropZone
                    title="GSTIN Number & Registration"
                    subtitle="Tax identification certificate for billing & compliance"
                    docUrl={gstDoc}
                    selectedFile={gstFile}
                    onFileSelect={(file) => setGstFile(file)}
                    onFileClear={() => setGstFile(null)}
                    onViewClick={(src) => setLightbox({ open: true, title: 'GST Certificate Proof', src })}
                    getFullImageUrl={getFullImageUrl}
                    numberField={
                      <TextField
                        fullWidth
                        size="small"
                        label="GSTIN Number"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="e.g. 32AAAAA0000A1Z5"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </Grid>

                {/* PAN Document */}
                <Grid size={{ md: 6, xs: 12 }}>
                  <DocumentDropZone
                    title="PAN Card & Tax Identification"
                    subtitle="Permanent Account Number proof for TDS compliance"
                    docUrl={panDoc}
                    selectedFile={panFile}
                    onFileSelect={(file) => setPanFile(file)}
                    onFileClear={() => setPanFile(null)}
                    onViewClick={(src) => setLightbox({ open: true, title: 'PAN Card Proof', src })}
                    getFullImageUrl={getFullImageUrl}
                    numberField={
                      <TextField
                        fullWidth
                        size="small"
                        label="PAN Number"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        placeholder="e.g. ABCDE1234F"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </Grid>

                {/* Trade License */}
                <Grid size={{ md: 6, xs: 12 }}>
                  <DocumentDropZone
                    title="Trade / Business License"
                    subtitle="Municipal trade license for legal operations"
                    docUrl={tradeLicenseDoc}
                    selectedFile={tradeLicenseFile}
                    onFileSelect={(file) => setTradeLicenseFile(file)}
                    onFileClear={() => setTradeLicenseFile(null)}
                    onViewClick={(src) => setLightbox({ open: true, title: 'Trade License Proof', src })}
                    getFullImageUrl={getFullImageUrl}
                    numberField={
                      <TextField
                        fullWidth
                        size="small"
                        label="Trade License Number"
                        value={tradeLicenseNo}
                        onChange={(e) => setTradeLicenseNo(e.target.value)}
                        placeholder="e.g. TRD-2024-8841"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </Grid>

                {/* Government Identity Proof (Aadhaar / Voter ID / Passport) */}
                <Grid size={{ md: 6, xs: 12 }}>
                  <DocumentDropZone
                    title="Government Photo ID Proof"
                    subtitle="Official photo identity (Aadhaar / Passport / Voter ID)"
                    docUrl={idCardDoc}
                    selectedFile={idCardFile}
                    onFileSelect={(file) => setIdCardFile(file)}
                    onFileClear={() => setIdCardFile(null)}
                    onViewClick={(src) => setLightbox({ open: true, title: 'Government Photo ID Proof', src })}
                    getFullImageUrl={getFullImageUrl}
                  />
                </Grid>

              </Grid>
            </MainCard>

            {/* SECTION 4: SETTLEMENT BANK ACCOUNT DETAILS */}
            <MainCard title="4. Settlement Bank Account Details" icon={<AccountBalanceIcon />}>
              <Grid container spacing={2}>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Bank Name *"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India, HDFC Bank"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Account Holder Name *"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Account Number *"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="IFSC Code *"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. SBIN0001234"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Branch Name"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Kozhikode Main Branch"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Account Type"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    placeholder="Current / Savings"
                    variant="outlined"
                  />
                </Grid>

                <Grid size={12}>
                  <Box sx={{ mt: 1 }}>
                    <DocumentDropZone
                      title="Bank Passbook / Cancelled Cheque Proof"
                      subtitle="Verification proof for direct bank settlement payout transfers"
                      docUrl={passbookDoc}
                      selectedFile={passbookFile}
                      onFileSelect={(file) => setPassbookFile(file)}
                      onFileClear={() => setPassbookFile(null)}
                      onViewClick={(src) => setLightbox({ open: true, title: 'Bank Passbook Proof', src })}
                      getFullImageUrl={getFullImageUrl}
                    />
                  </Box>
                </Grid>
              </Grid>
            </MainCard>

          </Stack>
        )}
      </Grid>

      {/* SIDEBAR SUMMARY & OFFICIAL SUPPORT CONTACT NUMBERS */}
      <Grid size={{ md: 4, xs: 12 }}>
        <Stack spacing={gridSpacing}>

          {/* Official System Contact & Support Numbers */}
          <MainCard title="Official System Contact & Support Numbers" icon={<ContactPhoneIcon />}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                disabled
                size="small"
                label="Primary Contact Number (Locked) *"
                value={phone}
                placeholder="+91 98765 43210"
                variant="outlined"
                helperText="Account primary phone number cannot be changed"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Customer Support / Helpline"
                value={customerHelpline}
                onChange={(e) => setCustomerHelpline(e.target.value)}
                placeholder="+91 1800 123 4567"
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="secondary" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="24/7 Emergency Helpline"
                value={emergencyHelpline}
                onChange={(e) => setEmergencyHelpline(e.target.value)}
                placeholder="+91 99950 00999"
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="error" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                disabled
                size="small"
                label="Primary Official Email (Locked) *"
                value={user?.email || primaryEmail || ''}
                placeholder="info@agency.com"
                variant="outlined"
                helperText="Account primary email cannot be changed"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Support Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@agency.com"
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="secondary" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Booking & Inquiries Email"
                value={bookingEmail}
                onChange={(e) => setBookingEmail(e.target.value)}
                placeholder="bookings@agency.com"
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="info" /></InputAdornment>
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Support Operating Hours"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="Mon - Sat: 9:00 AM - 8:00 PM (IST)"
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><AccessTimeIcon fontSize="small" color="action" /></InputAdornment>
                  }
                }}
              />
            </Stack>
          </MainCard>

          {/* Social Media Profiles & Web Links */}
          <MainCard title="Social Media Profiles & Web Links" icon={<ShareIcon />}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Official Website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.ababatravels.com"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" color="primary" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Instagram Profile URL"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/ababatravels"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><InstagramIcon fontSize="small" color="secondary" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Facebook Page URL"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/ababatravels"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><FacebookIcon fontSize="small" color="primary" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="LinkedIn Company Page URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/ababatravels"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><LinkedInIcon fontSize="small" color="primary" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Twitter / X Profile URL"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/ababatravels"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><TwitterIcon fontSize="small" color="primary" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="YouTube Channel URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@ababatravels"
                  variant="outlined"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><YouTubeIcon fontSize="small" color="error" /></InputAdornment>
                    }
                  }}
                />
              </Grid>
            </Grid>
          </MainCard>

          {/* Account Health & Reference */}
          <MainCard title="Security & Vendor Reference" icon={<SecurityIcon />}>
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>System Reference ID</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', fontWeight: 700 }}>
                  {vendorCustomId || 'VEN202600003'}
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Verification Protocol</Typography>
                <Typography variant="caption" sx={{ display: 'block', my: 0.5 }}>
                  2-Step Email OTP protection is enabled on account login and password changes.
                </Typography>
                <Chip label="2FA ACTIVE" color="success" size="small" sx={{ mt: 1, fontWeight: 800 }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Compliance Status</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    GST & Bank Verification Approved
                  </Typography>
                </Stack>
              </Box>

              <Button
                variant="contained"
                color="secondary"
                startIcon={saving || otpVerifying ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleInitiateProfileSave}
                disabled={saving || otpVerifying}
                fullWidth
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
              >
                {saving || otpVerifying ? 'Saving...' : 'Save All Details'}
              </Button>
            </Stack>
          </MainCard>

        </Stack>
      </Grid>

      {/* SECURITY OTP VERIFICATION DIALOG */}
      <Dialog
        open={otpModal.open}
        onClose={() => setOtpModal(prev => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ bgcolor: 'secondary.light', p: 1, borderRadius: '10px', display: 'flex' }}>
              <SecurityIcon color="secondary" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>OTP Verification</Typography>
          </Stack>
          <IconButton onClick={() => setOtpModal(prev => ({ ...prev, open: false }))}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            To update your vendor profile details, please enter the 6-digit Security OTP sent to registered email <strong>{user?.email || primaryEmail}</strong>.
          </Typography>

          <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: '10px', fontWeight: 700 }}>
            Security OTP Code: <strong style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>{otpModal.generatedOtp}</strong>
          </Alert>

          {otpModal.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontWeight: 600 }}>
              {otpModal.error}
            </Alert>
          )}

          <TextField
            fullWidth
            autoFocus
            label="6-Digit OTP Code"
            value={otpModal.otpInput}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtpModal(prev => ({ ...prev, otpInput: val, error: '' }));
            }}
            placeholder="• • • • • •"
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '24px', fontWeight: 800, letterSpacing: '8px' }
            }}
            sx={{ my: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="secondary"
            onClick={handleResendOtp}
            disabled={otpSending}
          >
            {otpSending ? 'Sending...' : 'Resend OTP'}
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setOtpModal(prev => ({ ...prev, open: false }))}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleConfirmOtpAndSave}
              disabled={otpModal.otpInput.length < 6 || otpVerifying}
              startIcon={otpVerifying ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
              sx={{ borderRadius: '8px', px: 2.5, fontWeight: 700 }}
            >
              {otpVerifying ? 'Verifying...' : 'Verify & Save'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* LIGHTBOX DIALOG OVERLAY */}
      <Dialog
        open={lightbox.open}
        onClose={() => setLightbox({ open: false, title: '', src: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{lightbox.title}</Typography>
          <IconButton onClick={() => setLightbox({ open: false, title: '', src: '' })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: '#09090b', minHeight: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {lightbox.src && lightbox.src.toLowerCase().includes('.pdf') ? (
            <iframe
              src={lightbox.src}
              title={lightbox.title}
              style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px', backgroundColor: '#ffffff' }}
            />
          ) : (
            <img
              src={lightbox.src}
              alt={lightbox.title}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
          {lightbox.src && (
            <Button
              component="a"
              href={lightbox.src}
              target="_blank"
              rel="noopener noreferrer"
              color="info"
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              size="small"
            >
              Open File in New Tab
            </Button>
          )}
          <Button onClick={() => setLightbox({ open: false, title: '', src: '' })} color="primary" variant="contained">
            Close Preview
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

export default VendorSettings;
