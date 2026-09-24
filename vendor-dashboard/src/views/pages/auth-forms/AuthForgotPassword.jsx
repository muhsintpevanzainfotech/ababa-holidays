import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

export default function AuthForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP. Please check the email and try again.');
      }

      setSuccess('OTP verification code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/resetpassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed. Please verify your OTP and try again.');
      }

      setSuccess('Password reset successfully! Redirecting you to login...');
      setTimeout(() => {
        navigate('/pages/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <Box sx={{ 
          p: 2, 
          mb: 2, 
          border: '1px solid', 
          borderColor: 'success.light', 
          borderRadius: '8px', 
          bgcolor: 'rgba(76, 175, 80, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'success.dark'
        }}>
          <CheckCircleOutline color="success" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {success}
          </Typography>
        </Box>
      )}

      {step === 1 ? (
        <form noValidate onSubmit={handleSendOTP}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter your email address associated with your vendor account, and we'll send you a 6-digit OTP code to verify and reset your password.
          </Typography>

          <CustomFormControl fullWidth error={Boolean(error)}>
            <InputLabel htmlFor="outlined-adornment-email-forgot">Email Address</InputLabel>
            <OutlinedInput
              id="outlined-adornment-email-forgot"
              type="email"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              autoFocus
            />
          </CustomFormControl>

          {error && (
            <Box sx={{ mt: 1 }}>
              <FormHelperText error>{error}</FormHelperText>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <AnimateButton>
              <Button
                color="secondary"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </AnimateButton>
          </Box>
        </form>
      ) : (
        <form noValidate onSubmit={handleResetPassword}>
          <Box sx={{ 
            p: 3, 
            mb: 3, 
            border: '1px dashed', 
            borderColor: 'secondary.light', 
            borderRadius: '12px', 
            bgcolor: 'rgba(103, 58, 183, 0.02)',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Reset Password</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              We've sent a 6-digit verification code to <br/><b>{email}</b>
            </Typography>

            <CustomFormControl fullWidth error={Boolean(error)}>
              <InputLabel htmlFor="outlined-adornment-otp-forgot">Secure OTP Code</InputLabel>
              <OutlinedInput
                id="outlined-adornment-otp-forgot"
                type="text"
                value={otp}
                name="otp"
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                placeholder="000000"
                label="Secure OTP Code"
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: '900', paddingLeft: '48px', color: '#673ab7' } 
                }}
              />
            </CustomFormControl>
          </Box>

          <CustomFormControl fullWidth error={Boolean(error)}>
            <InputLabel htmlFor="outlined-adornment-password-forgot">New Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-forgot"
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
            />
          </CustomFormControl>

          <CustomFormControl fullWidth error={Boolean(error)}>
            <InputLabel htmlFor="outlined-adornment-confirm-password-forgot">Confirm Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password-forgot"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              name="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="large"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
            />
          </CustomFormControl>

          {error && (
            <Box sx={{ mt: 1 }}>
              <FormHelperText error>{error}</FormHelperText>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <AnimateButton>
              <Button
                color="secondary"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </AnimateButton>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="primary"
              variant="text"
              onClick={() => setStep(1)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Change Email / Resend Code
            </Button>
          </Box>
        </form>
      )}
    </>
  );
}
