import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { loginRequest, verifyOTPRequest, resetAuthError } from 'store/slices/authSlice';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyIcon from '@mui/icons-material/Key';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, needsOTP, email: userEmail, approvalPending, infoMessage } = useSelector((state) => state.auth);

  const [checked, setChecked] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (needsOTP) {
      dispatch(verifyOTPRequest({ email: userEmail || email, otp }));
    } else {
      dispatch(loginRequest({ email, password }));
    }
  };

  const handleResendOTP = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ email: userEmail || email, password }));
  };

  // Redirect on success
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  if (approvalPending) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Box sx={{ 
          width: 64, 
          height: 64, 
          bgcolor: 'rgba(4, 62, 56, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px',
          color: '#043e38'
        }}>
          <HourglassEmptyIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: '#043e38' }}>Awaiting Approval</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, px: 2 }}>
          {infoMessage || 'Your account registration has been verified and is currently awaiting approval from ABABA Holidays Admin. You will be notified once activated.'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => dispatch(resetAuthError())}
          fullWidth
          size="large"
          sx={{ bgcolor: '#043e38', '&:hover': { bgcolor: '#022925' }, py: 1.5, borderRadius: '10px' }}
        >
          Return to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <form noValidate onSubmit={handleLogin}>
      {!needsOTP ? (
        <>
          <TextField
            fullWidth
            id="outlined-adornment-email-login"
            type="email"
            value={email}
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            error={Boolean(error)}
            margin="normal"
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

          <TextField
            fullWidth
            id="outlined-adornment-password-login"
            type={showPassword ? 'text' : 'password'}
            value={password}
            name="password"
            label="Password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
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

          <Box sx={{ textAlign: 'right', mt: 0.5, mb: 1 }}>
            <Typography
              variant="subtitle2"
              component={Link}
              to="/forgot-password"
              sx={{ 
                textDecoration: 'none', 
                color: '#043e38', 
                fontWeight: 700,
                fontSize: '0.85rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Forgot Password?
            </Typography>
          </Box>
        </>
      ) : (
        <Box sx={{ 
          p: 3, 
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
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#043e38' }}>Verify Access</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', px: 2 }}>
                We've sent a secure 6-digit code to <br/><b>{userEmail || email}</b>
            </Typography>
            <TextField
                fullWidth
                id="outlined-adornment-otp-login"
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
                  endAdornment: (
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
                        variant="text"
                        sx={{ minWidth: 'auto', fontWeight: 'bold', color: '#043e38' }}
                      >
                        Paste
                      </Button>
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
      )}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={error.includes('awaiting approval') ? 'warning' : 'error'} sx={{ borderRadius: '8px' }}>
            <AlertTitle>{error.includes('awaiting approval') ? 'Pending Admin Approval' : 'Authentication Error'}</AlertTitle>
            {error}
            {error.includes('Verify your account') && (
              <Typography variant="body2" component={Link} to="/register" sx={{ color: '#043e38', textDecoration: 'underline', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Want to verify or update registration? Go to Register Page
              </Typography>
            )}
          </Alert>
        </Box>
      )}

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        {!needsOTP && (
          <Grid size="auto">
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" sx={{ color: '#043e38', '&.Mui-checked': { color: '#043e38' } }} />}
              label={<Typography variant="body2" sx={{ color: '#475569' }}>Keep me logged in</Typography>}
            />
          </Grid>
        )}
        {needsOTP && (
          <Grid size="auto">
            <Typography
              variant="subtitle2"
              component={Link}
              to="#"
              onClick={handleResendOTP}
              sx={{ textDecoration: 'none', color: '#043e38', cursor: 'pointer', fontWeight: 700 }}
            >
              Resend code?
            </Typography>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 2 }}>
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
            {loading ? 'Verifying...' : (needsOTP ? 'Complete Login' : 'Sign In')}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
