import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/slices/authSlice';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
      showToast('Login Failed', message, 'error');
    }

    if (user) {
      showToast('Welcome Back!', `Successfully logged in as ${user.name}`, 'success');
      navigate('/dashboard');
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
    dispatch(login(formData));
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h1>Welcome Back</h1>
        <p>Login to manage your business</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} 
              />
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={onChange}
                required
                autoComplete="username"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} 
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={onChange}
                required
                autoComplete="current-password"
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
