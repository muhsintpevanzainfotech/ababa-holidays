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
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
  const isDark = !isLightExplicit;

  const { loading, error, token, needsOTP, email: userEmail, approvalPending, infoMessage } = useSelector((state) => state.auth);

  const [checked, setChecked] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes (300s)

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    let interval = null;
    if (needsOTP && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [needsOTP, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
    if (timer > 0) return;
    dispatch(loginRequest({ email: userEmail || email, password }));
    setTimer(300);
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
          bgcolor: isDark ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px',
          color: '#41a0ae'
        }}>
          <HourglassEmptyIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: isDark ? '#f9fafb' : '#3a2f6b' }}>Awaiting Approval</Typography>
        <Typography variant="body1" sx={{ mb: 3, px: 2, color: isDark ? '#9ca3af' : 'text.secondary' }}>
          {infoMessage || 'Your account registration has been verified and is currently awaiting approval from ABABA Holidays Admin. You will be notified once activated.'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => dispatch(resetAuthError())}
          fullWidth
          size="large"
          sx={{ bgcolor: '#36669c', '&:hover': { bgcolor: '#2d5582' }, py: 1.5, borderRadius: '10px', fontWeight: 700 }}
        >
          Return to Sign In
        </Button>
      </Box>
    );
  }

  const inputBgColor = isDark ? '#1f2937' : '#ffffff';
  const inputTextColor = isDark ? '#f9fafb' : '#0f172a';
  const inputLabelColor = isDark ? '#9ca3af' : '#64748b';
  const inputBorderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';

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
                  <MailOutlineIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', fontSize: 22 }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '10px',
                bgcolor: inputBgColor,
                color: inputTextColor,
                '& fieldset': { borderColor: inputBorderColor },
                '& input': {
                  color: inputTextColor,
                  '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                    WebkitBackgroundClip: 'text !important',
                    backgroundClip: 'text !important',
                    WebkitTextFillColor: `${inputTextColor} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${inputBgColor} inset !important`,
                    boxShadow: `0 0 0 1000px ${inputBgColor} inset !important`,
                    transition: 'background-color 9999999s ease-in-out 0s, color 9999999s ease-in-out 0s !important',
                    caretColor: `${inputTextColor} !important`
                  }
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#36669c' },
                '&.Mui-focused fieldset': { borderColor: '#36669c' }
              },
              '& .MuiInputLabel-root': { color: inputLabelColor },
              '& .MuiInputLabel-root.Mui-focused': { color: '#36669c', fontWeight: 700 }
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
                  <LockOutlinedIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', fontSize: 22 }} />
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
                    sx={{ color: isDark ? '#9ca3af' : 'action.active' }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '10px',
                bgcolor: inputBgColor,
                color: inputTextColor,
                '& fieldset': { borderColor: inputBorderColor },
                '& input': {
                  color: inputTextColor,
                  '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                    WebkitBackgroundClip: 'text !important',
                    backgroundClip: 'text !important',
                    WebkitTextFillColor: `${inputTextColor} !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${inputBgColor} inset !important`,
                    boxShadow: `0 0 0 1000px ${inputBgColor} inset !important`,
                    transition: 'background-color 9999999s ease-in-out 0s, color 9999999s ease-in-out 0s !important',
                    caretColor: `${inputTextColor} !important`
                  }
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#36669c' },
                '&.Mui-focused fieldset': { borderColor: '#36669c' }
              },
              '& .MuiInputLabel-root': { color: inputLabelColor },
              '& .MuiInputLabel-root.Mui-focused': { color: '#36669c', fontWeight: 700 }
            }}
          />

          <Box sx={{ textAlign: 'right', mt: 0.5, mb: 1 }}>
            <Typography
              variant="subtitle2"
              component={Link}
              to="/forgot-password"
              sx={{ 
                textDecoration: 'none', 
                color: '#41a0ae', 
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
          borderColor: '#41a0ae', 
          borderRadius: '12px', 
          bgcolor: isDark ? 'rgba(65, 160, 174, 0.1)' : 'rgba(54, 102, 156, 0.04)',
          textAlign: 'center'
        }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'rgba(65, 160, 174, 0.15)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              color: '#41a0ae'
            }}>
              <KeyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: isDark ? '#f9fafb' : '#3a2f6b' }}>Verify Access</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: isDark ? '#9ca3af' : 'text.secondary', px: 2 }}>
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
                      <KeyIcon sx={{ color: '#41a0ae', fontSize: 22 }} />
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
                        sx={{ minWidth: 'auto', fontWeight: 'bold', color: '#41a0ae' }}
                      >
                        Paste
                      </Button>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: '10px',
                    bgcolor: inputBgColor,
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      letterSpacing: '6px',
                      fontWeight: '800',
                      color: inputTextColor
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#41a0ae' },
                    '&.Mui-focused fieldset': { borderColor: '#36669c' }
                  },
                  '& .MuiInputLabel-root': { color: inputLabelColor, fontWeight: 600 }
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
              <Typography variant="body2" component={Link} to="/register" sx={{ color: '#41a0ae', textDecoration: 'underline', fontWeight: 600, mt: 0.5, display: 'block' }}>
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
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" sx={{ color: isDark ? '#9ca3af' : '#64748b', '&.Mui-checked': { color: '#36669c' } }} />}
              label={<Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#475569' }}>Keep me logged in</Typography>}
            />
          </Grid>
        )}
        {needsOTP && (
          <Grid size="auto" sx={{ ml: 'auto' }}>
            {timer > 0 ? (
              <Typography
                variant="subtitle2"
                sx={{ color: isDark ? '#9ca3af' : '#64748b', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Resend OTP in <Box component="span" sx={{ color: '#36669c', fontWeight: 700 }}>{formatTime(timer)}</Box>
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                component={Link}
                to="#"
                onClick={handleResendOTP}
                sx={{ textDecoration: 'none', color: '#41a0ae', cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
              >
                Resend OTP
              </Typography>
            )}
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
              bgcolor: '#36669c', 
              '&:hover': { bgcolor: '#2d5582' }, 
              py: 1.5, 
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(54, 102, 156, 0.35)'
            }}
          >
            {loading ? 'Verifying...' : (needsOTP ? 'Complete Login' : 'Sign In')}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
