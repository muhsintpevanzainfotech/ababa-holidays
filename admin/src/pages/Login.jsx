import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/slices/authSlice';
import { Lock, Mail, Loader2, Eye, EyeOff, ArrowRight, Sun, Moon, Shield, Check, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import './Login.css';

import tajMahalImg from '../assets/login-slides/taj_mahal.jpg';
import keralaImg from '../assets/login-slides/kerala.jpg';
import ladakhImg from '../assets/login-slides/ladakh.jpg';

const slides = [
  {
    id: 0,
    image: tajMahalImg,
    title: "Capturing Moments, Creating Memories",
    subtitle: "Taj Mahal, Agra — World Wonder of India",
  },
  {
    id: 1,
    image: keralaImg,
    title: "Serene Waters & Tropical Paradises",
    subtitle: "Alleppey Backwaters, Kerala — God's Own Country",
  },
  {
    id: 2,
    image: ladakhImg,
    title: "Majestic Valleys & Crystal Reflections",
    subtitle: "Pangong Tso Lake, Ladakh — High Altitude Wonder",
  },
];

const Login = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const { isDarkMode, toggleTheme } = useUI();

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isError) {
      showToast('Error', typeof message === 'string' ? message : 'Authentication failed', 'error');
    }

    if (user && (user.isVerified || user.accessToken)) {
      if (user.role === 'Admin' || user.role === 'Sub-Admin') {
        showToast('Welcome Back!', `Logged in as ${user.name}`, 'success');
        navigate('/dashboard');
      } else {
        showToast('Unauthorized', 'This portal is reserved for System Administrators.', 'error');
      }
    }

    dispatch(reset());
  }, [user, isError, message, navigate, dispatch, showToast]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password, appType: 'admin' }));
  };

  return (
    <div className={`login-page-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Background ambient lighting */}
      <div className="login-ambient-glow" />

      {/* Main Container Card matching user mockup */}
      <div className="login-mockup-card">
        
        {/* LEFT SHOWCASE HERO PANEL WITH INDIAN TOURIST PLACES */}
        <div className="hero-showcase-panel">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`hero-slide-bg ${idx === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
          <div className="hero-overlay-gradient" />

          {/* Top Bar inside Hero */}
          <div className="hero-top-bar">
            <div className="hero-brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffffff', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <img src="/logo.png" alt="Ababa Travels" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>
              <span className="brand-symbol" style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.3px' }}>ABABA <span style={{ color: '#38bdf8' }}>TRAVELS</span></span>
            </div>
            <button 
              type="button" 
              className="back-website-btn"
              onClick={() => navigate('/')}
            >
              Back to website <ArrowRight size={14} />
            </button>
          </div>

          {/* Bottom Content inside Hero */}
          <div className="hero-bottom-content">
            <h2 className="hero-title">{slides[currentSlide].title}</h2>
            <p className="hero-subtitle">{slides[currentSlide].subtitle}</p>

            {/* Slide Pagination Bars */}
            <div className="hero-pagination-bars">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pagination-dash ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ADMIN LOGIN FORM PANEL */}
        <div className="form-panel-container">
          <div className="form-panel-wrapper">
            <div className="form-panel-header">
              <div className="portal-badge">
                <Shield size={14} /> ADMIN ACCESS PORTAL
              </div>
              <h1 className="form-heading">Welcome Back</h1>
              <p className="form-subheading">
                Enter your admin credentials to access ABABA TRAVELS control center.
              </p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <div className="input-group">
                <label className="field-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input 
                    id="email"
                    type="email" 
                    className="mockup-input" 
                    name="email" 
                    value={email} 
                    placeholder="admin@ababaholidays.com" 
                    onChange={onChange} 
                    required 
                  />
                </div>
              </div>

              <div className="input-group password-group">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="mockup-input" 
                    name="password" 
                    value={password} 
                    placeholder="Enter your password" 
                    onChange={onChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="terms-checkbox-row">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-checkmark">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="checkbox-text">
                    Remember me on this device
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button type="submit" className="mockup-primary-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Vendor Register Section */}
            <div className="vendor-register-container">
              <div className="vendor-register-divider">
                <span>Looking to partner with us?</span>
              </div>
              <button 
                type="button" 
                className="vendor-register-btn"
                onClick={() => navigate('/vendor-register')}
              >
                <Briefcase size={16} /> Join as Vendor Partner
              </button>
            </div>

            {/* Theme Switcher control */}
            <div className="form-panel-footer">
              <button 
                type="button" 
                className="theme-switch-btn"
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
