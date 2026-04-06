import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { 
  Button, 
  FormControl, 
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  OutlinedInput, 
  Stack, 
  Typography, 
  Box, 
  CircularProgress, 
  FormHelperText, 
  Chip,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TextField,
  Avatar
} from '@mui/material';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { registerRequest, verifyOTPRequest } from 'store/slices/authSlice';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const steps = ['Account', 'Business', 'Location', 'Modules', 'Verify'];

export default function AuthRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, needsOTP, email: userEmail } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [services, setServices] = useState([]);
  const [otp, setOtp] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    vendorType: 'Individual',
    businessLicense: '',
    description: '',
    address: {
        fullAddress: '',
        city: '',
        state: '',
        country: 'India'
    },
    bankDetails: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        branch: ''
    },
    tin: {
        number: ''
    },
    gst: {
        number: ''
    },
    selectedServices: []
  });

  const [files, setFiles] = useState({
    avatar: null,
    idCard: null,
    tinUpload: null,
    gstUpload: null,
    bankUpload: null
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_API_URL}/services`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setServices(data.data);
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const parts = name.split('.');
        const parent = parts[0];
        const child = parts[1];
        setFormData({ 
            ...formData, 
            [parent]: { ...formData[parent], [child]: value } 
        });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles && uploadedFiles[0]) {
      const file = uploadedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));
      
      if (name === 'avatar') {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const toggleService = (id) => {
    const next = formData.selectedServices.includes(id)
      ? formData.selectedServices.filter(sid => sid !== id)
      : [...formData.selectedServices, id];
    setFormData({ ...formData, selectedServices: next });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (needsOTP) {
        dispatch(verifyOTPRequest({ email: userEmail, otp }));
    } else {
        const data = new FormData();
        
        // Append basic fields
        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
                data.append(key, JSON.stringify(formData[key]));
            } else if (Array.isArray(formData[key])) {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append files
        Object.keys(files).forEach(key => {
            if (files[key]) {
                data.append(key, files[key]);
            }
        });

        dispatch(registerRequest(data));
    }
  };

  useEffect(() => {
     if (token) navigate('/dashboard');
  }, [token, navigate]);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
               <input 
                 accept="image/*" 
                 id="avatar-up" 
                 name="avatar" 
                 type="file" 
                 onChange={handleFileChange}
                 style={{ display: 'none' }} 
               />
               <label htmlFor="avatar-up">
                 <IconButton component="span">
                   <Avatar 
                     src={imagePreview} 
                     sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main', mb: 1 }} 
                   >
                     <PersonIcon sx={{ fontSize: 40 }} />
                   </Avatar>
                 </IconButton>
               </label>
               <Typography variant="caption" display="block">Profile / Business Head Photo</Typography>
            </Grid>
            <Grid item xs={12}>
               <Button
                 variant="outlined"
                 component="label"
                 fullWidth
                 startIcon={<CloudUploadIcon />}
                 color={files.idCard ? 'success' : 'primary'}
                 sx={{ py: 1.5, borderStyle: 'dashed' }}
               >
                 {files.idCard ? `ID Card: ${files.idCard.name}` : 'Upload National ID Card (Aadhar/PAN)'}
                 <input type="file" name="idCard" hidden onChange={handleFileChange} accept="application/pdf,image/*" />
               </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
               <FormControl fullWidth>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    label="Password"
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
               </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField fullWidth label="Company/Business Name" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth label="Business License/Reg No." name="businessLicense" value={formData.businessLicense} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth label="Business Category" placeholder="e.g. Catering, Decorations, Photography" name="vendorType" value={formData.vendorType} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="About Your Business" name="description" value={formData.description} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                startIcon={<CloudUploadIcon />}
                color={files.tinUpload ? 'success' : 'primary'}
                sx={{ borderStyle: 'dashed' }}
              >
                {files.tinUpload ? 'TIN Card Uploaded' : 'Upload TIN'}
                <input type="file" name="tinUpload" hidden onChange={handleFileChange} />
              </Button>
              <TextField 
                fullWidth 
                label="TIN Number" 
                size="small" 
                name="tin.number" 
                value={formData.tin.number} 
                onChange={handleInputChange} 
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                startIcon={<CloudUploadIcon />}
                color={files.gstUpload ? 'success' : 'primary'}
                sx={{ borderStyle: 'dashed' }}
              >
                {files.gstUpload ? 'GST Cert Uploaded' : 'Upload GST'}
                <input type="file" name="gstUpload" hidden onChange={handleFileChange} />
              </Button>
              <TextField 
                fullWidth 
                label="GST Number" 
                size="small" 
                name="gst.number" 
                value={formData.gst.number} 
                onChange={handleInputChange} 
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField fullWidth label="Full Business Address" name="address.fullAddress" value={formData.address.fullAddress} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={6}>
                <TextField fullWidth label="City" name="address.city" value={formData.address.city} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={6}>
                <TextField fullWidth label="State" name="address.state" value={formData.address.state} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Financial Credentials:</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                <TextField fullWidth label="Bank Name" size="small" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleInputChange} />
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  color={files.bankUpload ? 'success' : 'primary'}
                  sx={{ borderStyle: 'dashed', minWidth: 150 }}
                >
                  {files.bankUpload ? 'Bank Doc' : 'Upload Passbook'}
                  <input type="file" name="bankUpload" hidden onChange={handleFileChange} />
                </Button>
              </Stack>
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Account Holder Name" size="small" name="bankDetails.accountName" value={formData.bankDetails.accountName} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Branch Name" size="small" name="bankDetails.branch" value={formData.bankDetails.branch} onChange={handleInputChange} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField fullWidth label="Account Number" size="small" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="IFSC Code" size="small" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleInputChange} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Select Your Service Categories:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {services.map((service) => (
                <Chip
                  key={service._id}
                  label={service.title}
                  onClick={() => toggleService(service._id)}
                  color={formData.selectedServices.includes(service._id) ? 'primary' : 'default'}
                  variant={formData.selectedServices.includes(service._id) ? 'filled' : 'outlined'}
                  sx={{ borderRadius: '8px', cursor: 'pointer' }}
                />
              ))}
            </Box>
            {formData.selectedServices.length === 0 && <FormHelperText sx={{ color: 'orange', mt: 1 }}>Select at least one module to provision your dashboard</FormHelperText>}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'secondary.light', 
            borderRadius: '12px', 
            bgcolor: 'rgba(103, 58, 183, 0.02)',
            textAlign: 'center'
          }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 'secondary.light', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px',
                color: 'secondary.main'
              }}>
                <VerifiedUserIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Final Verification</Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', px: 2 }}>
                  We'll send a code to <b>{formData.email || 'your email'}</b> once you click register.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                  By clicking register, you agree to our terms of service for partner vendors.
              </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  if (needsOTP) {
    return (
        <form noValidate onSubmit={handleRegister}>
             <Box sx={{ 
                p: 3, 
                border: '1px dashed', 
                borderColor: 'secondary.light', 
                borderRadius: '12px', 
                bgcolor: 'rgba(103, 58, 183, 0.02)',
                textAlign: 'center',
                mb: 2
            }}>
                <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: 'secondary.light', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px',
                    color: 'secondary.main'
                }}>
                    <VerifiedUserIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Identity Verification</Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', px: 2 }}>
                    Your business partner account awaits. <br/>Enter the 6-digit code sent to <b>{userEmail}</b>
                </Typography>
                <CustomFormControl fullWidth error={Boolean(error)}>
                    <InputLabel htmlFor="outlined-adornment-otp-register">Verification Code</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-otp-register"
                        type="text"
                        value={otp}
                        name="otp"
                        onChange={(e) => setOtp(e.target.value)}
                        autoFocus
                        placeholder="000000"
                        label="Verification Code"
                        endAdornment={
                            <InputAdornment position="end">
                                <Button
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            if (text && text.length >= 6) {
                                                setOtp(text.trim().substring(0, 6));
                                            }
                                        } catch (err) {
                                            console.error('Failed to read clipboard:', err);
                                        }
                                    }}
                                    size="small"
                                    sx={{ minWidth: 'auto', fontWeight: 'bold' }}
                                >
                                    Paste
                                </Button>
                            </InputAdornment>
                        }
                        inputProps={{ 
                          maxLength: 6,
                          style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold' } 
                        }}
                    />
                </CustomFormControl>
            </Box>
            {error && <FormHelperText error sx={{ mb: 2 }}>{error}</FormHelperText>}
            <AnimateButton>
                <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Setup Dashboard'}
                </Button>
            </AnimateButton>
        </form>
    );
  }

  return (
    <>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem' } }}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form noValidate onSubmit={handleRegister}>
        <Box sx={{ minHeight: 300 }}>
            {renderStepContent(activeStep)}
        </Box>

        {error && (
          <Box sx={{ mt: 2 }}>
            <FormHelperText error>{error}</FormHelperText>
          </Box>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          {activeStep > 0 && (
            <Button color="secondary" onClick={handleBack} sx={{ flex: 1 }}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleNext} 
                sx={{ flex: 2 }}
                disabled={activeStep === 0 && (!formData.name || !formData.email || !formData.password)}
            >
              Continue
            </Button>
          ) : (
            <AnimateButton sx={{ flex: 2 }}>
                <Button 
                    fullWidth 
                    size="large" 
                    type="submit" 
                    variant="contained" 
                    color="secondary"
                    disabled={loading || formData.selectedServices.length === 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Processing...' : 'Register Business'}
                </Button>
            </AnimateButton>
          )}
        </Stack>
      </form>
    </>
  );
}
