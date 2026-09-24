import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Save, 
  CheckCircle, 
  Calendar,
  Sparkles,
  Lock,
  BadgeCheck,
  Zap,
  Activity
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/constants';
import { getProfile, updateUser } from '../../store/slices/authSlice';
import OTPModal from '../../components/OTPModal';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user: authUser } = useSelector((state) => state.auth);

  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
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
      setFormData({
        name: authUser.name || '',
        phone: authUser.phone || '',
      });
      if (authUser.avatar) {
        setAvatarPreview(authUser.avatar.startsWith('http') ? authUser.avatar : getImageUrl(authUser.avatar));
      }
    }
  }, [authUser]);

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
      showToast('OTP Required', 'Verification code sent to your registered email.', 'info');
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        showToast('Success', 'Profile updated successfully', 'success');
        dispatch(updateUser(response.data.data));
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.data }));
        setIsOTPModalOpen(false);
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setOTPLoading(false);
    }
  };

  const createdDateFormatted = authUser?.createdAt 
    ? new Date(authUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="fade-in" style={{ paddingBottom: '50px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              background: 'rgba(var(--primary-rgb), 0.12)', 
              color: 'var(--primary)', 
              letterSpacing: '0.5px' 
            }}>
              ACCOUNT CONTROL
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.8px', margin: 0, color: 'var(--text-main)' }}>
            Account <span style={{ color: 'var(--primary)' }}>Profile</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Manage your personal identity, contact details, and account credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <Activity size={16} color="#16a34a" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Status: Active Session</span>
        </div>
      </div>

      {/* MODERN COVER BANNER & PROFILE HERO CARD */}
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '24px', 
        border: '1px solid var(--border)', 
        overflow: 'hidden', 
        boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
        marginBottom: '28px'
      }}>
        
        {/* COVER GRAPHIC BANNER */}
        <div style={{ 
          height: '160px', 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 45%, #6366f1 100%)', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Translucent Glowing Rings */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', left: '20%', bottom: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(59,130,246,0.3)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', right: '30%', top: '10px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(99,102,241,0.25)', filter: 'blur(15px)' }} />
        </div>

        {/* HERO PROFILE BODY OVERLAY */}
        <div style={{ padding: '0 32px 28px', marginTop: '-54px', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* AVATAR + USER DETAILS */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              
              {/* AVATAR CONTAINER */}
              <div style={{ position: 'relative', width: '116px', height: '116px', flexShrink: 0 }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '30px', backgroundColor: '#ffffff', 
                  overflow: 'hidden', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', position: 'relative', zIndex: 1
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={50} color="var(--primary)" />
                  )}
                </div>

                <label 
                  htmlFor="profile-avatar-upload" 
                  title="Upload profile picture"
                  style={{ 
                    position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary)', color: 'white', 
                    width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-card)', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 2, transition: 'transform 0.2s ease'
                  }}
                  className="hover-scale"
                >
                  <Camera size={16} />
                  <input id="profile-avatar-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* USER NAME & BADGES */}
              <div style={{ paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
                    {authUser?.name || 'Administrator'}
                  </h2>
                  <BadgeCheck size={20} color="#22c55e" />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', 
                    padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800',
                    display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(var(--primary-rgb), 0.2)'
                  }}>
                    <Shield size={12} /> {authUser?.role?.toUpperCase() || 'ADMIN'}
                  </span>

                  <span style={{ 
                    background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', 
                    padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800',
                    display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <CheckCircle size={12} /> VERIFIED ACCOUNT
                  </span>

                  <span style={{ 
                    background: 'var(--bg-main)', color: 'var(--text-muted)', 
                    padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                    border: '1px solid var(--border)'
                  }}>
                    ID: {authUser?.customId || 'ADM-001'}
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK STAT METRICS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'var(--bg-main)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '12px 18px', 
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{createdDateFormatted}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          
          {/* CARD 1: PERSONAL INFORMATION */}
          <div className="card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Personal Details</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Editable account information</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                Full Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Enter full name"
                  style={{ height: '48px', borderRadius: '12px', paddingLeft: '44px', fontWeight: '600', fontSize: '14px' }}
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                Phone Contact Number
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+91 98765 43210"
                  style={{ height: '48px', borderRadius: '12px', paddingLeft: '44px', fontWeight: '600', fontSize: '14px' }}
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* CARD 2: ACCOUNT SECURITY & SYSTEM INFO */}
          <div className="card" style={{ padding: '28px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="#6366f1" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>System Credentials</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Protected account identity</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                <span>Registered Email Address</span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  LOCKED
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-control" 
                  disabled 
                  style={{ height: '48px', borderRadius: '12px', paddingLeft: '44px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}
                  value={authUser?.email || ''}
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                <span>Administrator Custom ID</span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  SYSTEM ID
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  disabled 
                  style={{ height: '48px', borderRadius: '12px', paddingLeft: '44px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}
                  value={authUser?.customId || 'ADM-001'}
                />
                <Shield size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: '20px', 
          padding: '20px 28px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>Two-Factor Protection Active</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updating profile details will dispatch an OTP verification code to your email.</div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={updating}
            style={{ 
              padding: '12px 32px', 
              height: '48px', 
              fontSize: '15px', 
              fontWeight: '800', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              boxShadow: '0 4px 16px rgba(var(--primary-rgb), 0.3)'
            }}
          >
            {updating ? 'Sending OTP...' : <><Save size={18} /> Save Profile Changes</>}
          </button>
        </div>
      </form>

      {/* OTP VERIFICATION MODAL */}
      <OTPModal 
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        email={authUser?.email}
        loading={otpLoading}
        onVerify={handleVerifyOTP}
        onResend={() => api.post('/users/request-otp')}
      />
    </div>
  );
};

export default ProfileSettings;
