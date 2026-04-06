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
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { loginRequest, verifyOTPRequest } from 'store/slices/authSlice';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, needsOTP, email: userEmail } = useSelector((state) => state.auth);

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
        dispatch(verifyOTPRequest({ email: userEmail, otp }));
    } else {
        dispatch(loginRequest({ email, password }));
    }
  };

  // Redirect on success
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <form noValidate onSubmit={handleLogin}>
      {!needsOTP ? (
        <>
          <CustomFormControl fullWidth error={Boolean(error)}>
            <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
            <OutlinedInput
              id="outlined-adornment-email-login"
              type="email"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              label="Email Address / Username"
            />
          </CustomFormControl>

          <CustomFormControl fullWidth error={Boolean(error)}>
            <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-login"
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              endAdornment={
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
              }
              label="Password"
            />
          </CustomFormControl>
        </>
      ) : (
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
              <Visibility sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Verify Access</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', px: 2 }}>
                We've sent a secure 6-digit code to <br/><b>{userEmail}</b>
            </Typography>
            <CustomFormControl fullWidth error={Boolean(error)}>
                <InputLabel htmlFor="outlined-adornment-otp-login">Secure OTP Code</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-otp-login"
                    type="text"
                    value={otp}
                    name="otp"
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                    placeholder="000000"
                    label="Secure OTP Code"
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
                                variant="text"
                                sx={{ minWidth: 'auto', fontWeight: 'bold', color: 'secondary.main' }}
                            >
                                Paste
                            </Button>
                        </InputAdornment>
                    }
                    inputProps={{ 
                      maxLength: 6,
                      style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: '900', paddingLeft: '48px', color: '#673ab7' } 
                    }}
                />
            </CustomFormControl>
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 1 }}>
          <FormHelperText error>{error}</FormHelperText>
          {error.includes('Verify your account') && (
            <Typography variant="body2" component={Link} to="/pages/register" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, mt: 0.5, display: 'block' }}>
              Want to verify or update registration? Go to Register Page
            </Typography>
          )}
        </Box>
      )}

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        {!needsOTP && (
          <Grid>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
              label="Keep me logged in"
            />
          </Grid>
        )}
        <Grid>
          <Typography variant="subtitle1" component={Link} to="#!" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
            {needsOTP ? 'Resend code?' : 'Forgot Password?'}
          </Typography>
        </Grid>
      </Grid>
      
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
            {loading ? 'Verifying...' : (needsOTP ? 'Complete Login' : 'Sign In')}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
