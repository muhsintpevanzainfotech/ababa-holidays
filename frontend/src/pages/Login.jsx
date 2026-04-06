import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, verifyOTP, reset } from '../store/slices/authSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { Lock, Mail, Loader2, Eye, EyeOff, User, Phone, CheckCircle, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/constants';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  const { showToast } = useToast();

  useEffect(() => {
    if (isError) {
      showToast('Error', typeof message === 'string' ? message : 'Authentication failed', 'error');
    }

    if (user && (user.isVerified || user.accessToken)) {
      if (user.role === 'Admin' || user.role === 'Sub-Admin') {
        showToast('Welcome!', `Logged in as ${user.name}`, 'success');
        navigate('/dashboard');
      } else {
        showToast('Unauthorized', 'This portal is for Admins only.', 'error');
        // The backend should catch this, but extra check here.
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
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card fade-in" style={{ maxWidth: '450px', width: '100%', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#64748b' }}>
            Login to manage the platform
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
              <input type="email" className="form-control" name="email" value={email} placeholder="Enter your email" onChange={onChange} required style={{ paddingLeft: '44px' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control" name="password" value={password} placeholder="••••••••" onChange={onChange} required
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading} style={{ height: '48px', marginTop: '12px', fontWeight: '800' }}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Admin Panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
             Looking to partner with us?
          </p>
          <button 
            type="button" 
            className="btn btn-outline btn-block" 
            onClick={() => navigate('/vendor-register')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', fontSize: '14px', fontWeight: '700' }}
          >
            <Briefcase size={18} /> Join as Vendor Partner
          </button>
          
          <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '20px' }}>
            Restricted access for authorized staff only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
