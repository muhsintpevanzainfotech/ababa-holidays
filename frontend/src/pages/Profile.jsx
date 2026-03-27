import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, updateUser } from '../store/slices/authSlice';
import { User, Mail, Phone, Shield, Camera, Save, ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import OTPModal from '../components/OTPModal';

const Profile = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);
  
  useEffect(() => {
    if (authUser && !authUser.avatar) {
      dispatch(getProfile());
    }
  }, [authUser, dispatch]);
  
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFormData({
        name: authUser.name,
        phone: authUser.phone || '',
      });
      if (authUser.avatar) {
        setAvatarPreview(authUser.avatar.startsWith('http') ? authUser.avatar : getImageUrl(authUser.avatar));
      }
      setLoading(false);
    }
  }, [authUser]);

  const fetchProfile = async () => {
    setLoading(true);
    await dispatch(getProfile());
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.post('/users/request-otp');
      setIsOTPModalOpen(true);
      showToast('OTP Sent', 'Please check your email for the verification code', 'info');
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setOTPLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('otp', otp);
      if (avatar) {
        data.append('avatar', avatar);
      }

      const response = await api.put('/users/profile', data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        showToast('Success', 'Profile updated successfully', 'success');
        
        // Update Redux state
        dispatch(updateUser(response.data.data));
        
        // Update localStorage user
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsOTPModalOpen(false);
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setOTPLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/users/request-otp');
      showToast('Success', 'New OTP sent to your email', 'success');
    } catch (error) {
      showToast('Error', 'Failed to resend OTP', 'error');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div style={{ width: '100%' }}>
      <div className="card fade-in">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '20px' }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '40px', backgroundColor: 'var(--bg-main)', 
                overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-premium)', position: 'relative', zIndex: 1
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={56} color="var(--primary)" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                style={{ 
                  position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--primary)', color: 'white', 
                  width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', border: '4px solid var(--bg-card)', 
                  boxShadow: 'var(--shadow-md)', zIndex: 2, transition: 'var(--transition)'
                }}
                className="hover-scale"
              >
                <Camera size={20} />
                <input id="avatar-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
              <div style={{ 
                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', 
                borderRadius: '35px', background: 'var(--primary)', opacity: 0.1, zIndex: 0, filter: 'blur(15px)' 
              }}></div>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>{user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', 
                padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
                display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(79, 70, 229, 0.2)'
              }}>
                <Shield size={14} /> {user.role.toUpperCase()}
              </span>
              {user.isVerified && (
                <span style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', 
                  padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <CheckCircle size={14} /> VERIFIED
                </span>
              )}
            </div>
          </div>

          <div className="profile-grid">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" className="form-control" required
                style={{ height: '48px' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Mail size={16} /> Email Address
              </label>
              <input 
                type="email" className="form-control" disabled
                style={{ height: '48px', background: '#f8fafc', color: '#64748b' }}
                value={user.email}
              />
            </div>
          </div>

          <div className="profile-grid">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Phone size={16} /> Phone Number
              </label>
              <input 
                type="text" className="form-control"
                style={{ height: '48px' }}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={16} /> User ID
              </label>
              <input 
                type="text" className="form-control" disabled
                style={{ height: '48px', background: '#f8fafc', color: '#64748b' }}
                value={user.customId}
              />
            </div>
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Calendar size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Account Created On</p>
              <p style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={updating}
              style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              {updating ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      <OTPModal 
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        email={user.email}
        loading={otpLoading}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </div>
  );
};

export default Profile;
