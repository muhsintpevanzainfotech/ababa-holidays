import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyIcon from '@mui/icons-material/Key';

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
        navigate('/login');
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
          borderColor: '#043e38', 
          borderRadius: '8px', 
          bgcolor: 'rgba(4, 62, 56, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: '#043e38'
        }}>
          <CheckCircleOutline sx={{ color: '#043e38' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {success}
          </Typography>
        </Box>
      )}

      {step === 1 ? (
        <form noValidate onSubmit={handleSendOTP}>
          <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
            Enter your email address associated with your vendor account, and we'll send you a 6-digit OTP code to verify and reset your password.
          </Typography>

          <TextField
            fullWidth
            id="outlined-adornment-email-forgot"
            type="email"
            value={email}
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(error)}
            margin="normal"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: '#043e38', fontSize: 22 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '10px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#043e38' },
                '&.Mui-focused fieldset': { borderColor: '#043e38' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#043e38', fontWeight: 600 }
            }}
          />

          {error && (
            <Box sx={{ mt: 1 }}>
              <FormHelperText error>{error}</FormHelperText>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <AnimateButton>
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  bgcolor: '#043e38', 
                  '&:hover': { bgcolor: '#022925' }, 
                  py: 1.5, 
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(4, 62, 56, 0.25)'
                }}
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
            borderColor: '#043e38', 
            borderRadius: '12px', 
            bgcolor: 'rgba(4, 62, 56, 0.03)',
            textAlign: 'center'
          }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'rgba(4, 62, 56, 0.1)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              color: '#043e38'
            }}>
              <KeyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#043e38' }}>Reset Password</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              We've sent a 6-digit verification code to <br/><b>{email}</b>
            </Typography>

            <TextField
                fullWidth
                id="outlined-adornment-otp-forgot"
                type="text"
                value={otp}
                name="otp"
                label="Secure OTP Code"
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                placeholder="000000"
                error={Boolean(error)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: '#043e38', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: '10px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      letterSpacing: '6px',
                      fontWeight: '800',
                      color: '#043e38'
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#043e38' },
                    '&.Mui-focused fieldset': { borderColor: '#043e38' }
                  },
                  '& .MuiInputLabel-root': { color: '#043e38', fontWeight: 600 }
                }}
                inputProps={{ maxLength: 6 }}
            />
          </Box>

          <TextField
            fullWidth
            id="outlined-adornment-password-forgot"
            type={showPassword ? 'text' : 'password'}
            value={password}
            name="password"
            label="New Password"
            placeholder="Enter new password"
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(error)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#043e38', fontSize: 22 }} />
                </InputAdornment>
              ),
              endAdornment: (
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
              ),
              sx: { borderRadius: '10px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#043e38' },
                '&.Mui-focused fieldset': { borderColor: '#043e38' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#043e38', fontWeight: 600 }
            }}
          />

          <TextField
            fullWidth
            id="outlined-adornment-confirm-password-forgot"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm new password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(error)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#043e38', fontSize: 22 }} />
                </InputAdornment>
              ),
              endAdornment: (
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
              ),
              sx: { borderRadius: '10px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#043e38' },
                '&.Mui-focused fieldset': { borderColor: '#043e38' }
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#043e38', fontWeight: 600 }
            }}
          />

          {error && (
            <Box sx={{ mt: 1 }}>
              <FormHelperText error>{error}</FormHelperText>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <AnimateButton>
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  bgcolor: '#043e38', 
                  '&:hover': { bgcolor: '#022925' }, 
                  py: 1.5, 
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(4, 62, 56, 0.25)'
                }}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </AnimateButton>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => setStep(1)}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#043e38' }}
            >
              Change Email / Resend Code
            </Button>
          </Box>
        </form>
      )}
    </>
  );
}
