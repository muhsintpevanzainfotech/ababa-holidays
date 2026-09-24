import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  BellOff, 
  Lock, 
  UserCog, 
  CheckCircle, 
  ArrowRight, 
  ShieldAlert, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Bell,
  Sparkles,
  Shield,
  UserCheck,
  User,
  Mail,
  Phone,
  Camera,
  Calendar,
  Zap,
  Sliders,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import { getProfile, updateUser } from '../store/slices/authSlice';
import OTPModal from '../components/OTPModal';

const Settings = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const { isNotificationsEnabled, toggleNotifications } = useUI();
  const { showToast } = useToast();

  // Passkey State
  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(true);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileOtpModal, setProfileOtpModal] = useState(false);
  const [profileOtpLoading, setProfileOtpLoading] = useState(false);

  // Password Security Form State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordOtpModal, setPasswordOtpModal] = useState(false);
  const [passwordOtpLoading, setPasswordOtpLoading] = useState(false);

  // Auto-scroll on hash changes (e.g., /settings#security)
  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  // Load Auth User
  useEffect(() => {
    if (authUser) {
      setProfileData({
        name: authUser.name || '',
        phone: authUser.phone || '',
      });
      if (authUser.avatar) {
        setAvatarPreview(authUser.avatar.startsWith('http') ? authUser.avatar : getImageUrl(authUser.avatar));
      }
    }
  }, [authUser]);

  useEffect(() => {
    fetchPasskeyStatus();
  }, []);

  const fetchPasskeyStatus = async () => {
    try {
      const response = await api.get('/settings/passkey-status');
      if (response.data?.success) {
        setIsPasskeyEnabled(response.data.enabled);
      }
    } catch (err) {
      console.error('Error fetching passkey status:', err);
    }
  };

  // --- PASSKEY HANDLER ---
  const handleTogglePasskey = async () => {
    setPasskeyLoading(true);
    try {
      const nextState = !isPasskeyEnabled;
      const response = await api.post('/settings/toggle-passkey', { enabled: nextState });
      setIsPasskeyEnabled(response.data.enabled);
      showToast(
        'Passkey Preference Updated',
        `Passkey authorization requirement is now turned ${response.data.enabled ? 'ON' : 'OFF'}.`,
        'success'
      );
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to update passkey setting', 'error');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // --- PROFILE HANDLERS ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      await api.post('/users/request-otp');
      setProfileOtpModal(true);
      showToast('OTP Required', 'Security verification code sent to your registered email.', 'info');
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to request verification code', 'error');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleVerifyProfileOTP = async (otp) => {
    setProfileOtpLoading(true);
    try {
      const data = new FormData();
      data.append('name', profileData.name);
      data.append('phone', profileData.phone);
      data.append('otp', otp);
      if (avatar) {
        data.append('avatar', avatar);
      }

      const response = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        showToast('Success', 'Profile details updated successfully', 'success');
        dispatch(updateUser(response.data.data));
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.data }));
        setProfileOtpModal(false);
      }
    } catch (error) {
      showToast('Verification Failed', error.response?.data?.message || 'Update failed', 'error');
    } finally {
      setProfileOtpLoading(false);
    }
  };

  // --- PASSWORD HANDLERS ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showToast('Error', 'New passwords do not match', 'error');
    }
    if (passwordData.newPassword.length < 6) {
      return showToast('Error', 'Password must be at least 6 characters long', 'error');
    }
    setPasswordUpdating(true);
    try {
      await api.post('/users/request-otp');
      setPasswordOtpModal(true);
      showToast('OTP Required', 'Security verification code sent to your registered email.', 'info');
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to send OTP code', 'error');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleVerifyPasswordOTP = async (otp) => {
    setPasswordOtpLoading(true);
    try {
      const response = await api.put('/users/profile', {
        password: passwordData.newPassword,
        otp: otp,
        currentPassword: passwordData.currentPassword
      });
      if (response.data.success) {
        showToast('Success', 'Password updated successfully.', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordOtpModal(false);
      }
    } catch (error) {
      showToast('Verification Failed', error.response?.data?.message || 'Invalid or expired OTP code', 'error');
    } finally {
      setPasswordOtpLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const scrollToSection = (sectionId) => {
    navigate(`/settings#${sectionId}`);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* HERO PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(30, 27, 75, 0.03) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.15)',
        borderRadius: '24px',
        padding: '28px 32px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-premium)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', relative: 'z-index: 2' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ 
                fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: '8px', background: 'var(--primary)', color: '#ffffff' 
              }}>
                ADMINISTRATION
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                System Controls & Preferences
              </span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main)' }}>
              Settings & <span style={{ color: 'var(--primary)' }}>Configuration</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', margin: 0, maxWidth: '640px', lineHeight: '1.5' }}>
              Manage your personal profile, global push notifications, administrative email passkey requirements, and security credentials.
            </p>
          </div>

          {/* QUICK ANCHOR JUMP BAR */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => scrollToSection('profile')}
              style={{
                padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
              }}
            >
              <UserCog size={15} color="var(--primary)" /> Profile
            </button>
            <button 
              onClick={() => scrollToSection('general')}
              style={{
                padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
              }}
            >
              <Sliders size={15} color="var(--primary)" /> General & Passkey
            </button>
            <button 
              onClick={() => scrollToSection('security')}
              style={{
                padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
              }}
            >
              <Lock size={15} color="var(--primary)" /> Security
            </button>
            {authUser?.role === 'Admin' && (
              <button 
                onClick={() => scrollToSection('permissions')}
                style={{
                  padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border)',
                  background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
                }}
              >
                <ShieldCheck size={15} color="var(--primary)" /> Sub-Admin Control
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STACKED MODERN SECTIONS CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* SECTION 1: ACCOUNT PROFILE */}
        <section id="profile" style={{ scrollMarginTop: '100px' }}>
          <div className="card fade-in" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <UserCog size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Account Profile Details</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Manage your public display name, contact phone, and avatar image.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <div style={{ 
                    width: '100%', height: '100%', borderRadius: '32px', backgroundColor: 'var(--bg-main)', 
                    overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.25)', position: 'relative', zIndex: 1
                  }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={48} color="var(--primary)" />
                    )}
                  </div>
                  <label 
                    htmlFor="settings-avatar-upload" 
                    style={{ 
                      position: 'absolute', bottom: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', 
                      width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', cursor: 'pointer', border: '3px solid var(--bg-card)', 
                      boxShadow: 'var(--shadow-md)', zIndex: 2
                    }}
                  >
                    <Camera size={18} />
                    <input id="settings-avatar-upload" type="file" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </label>
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>{authUser?.name || 'Administrator'}</h3>
                    <span style={{ 
                      background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', 
                      padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800'
                    }}>
                      {authUser?.role?.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-muted)' }}>{authUser?.email}</p>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                    <CheckCircle size={14} /> Account Verified & Active
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>
                    <User size={16} color="var(--primary)" /> Full Name
                  </label>
                  <input 
                    type="text" className="form-control" required style={{ height: '48px', borderRadius: '12px', fontWeight: '600' }}
                    value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>
                    <Phone size={16} color="var(--primary)" /> Phone Number
                  </label>
                  <input 
                    type="text" className="form-control" style={{ height: '48px', borderRadius: '12px', fontWeight: '600' }}
                    value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>
                    <Mail size={16} color="#94a3b8" /> Registered Email Address
                  </label>
                  <input 
                    type="email" className="form-control" disabled style={{ height: '48px', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600' }}
                    value={authUser?.email || ''}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>
                    <Shield size={16} color="#94a3b8" /> Account Custom ID
                  </label>
                  <input 
                    type="text" className="form-control" disabled style={{ height: '48px', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600' }}
                    value={authUser?.customId || 'ADM-001'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={profileUpdating} style={{ height: '46px', padding: '0 28px', borderRadius: '12px', fontWeight: '800', gap: '8px' }}>
                  {profileUpdating ? 'Saving...' : <><Save size={18} /> Update Profile</>}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* SECTION 2: GENERAL & PASSKEY PREFERENCES */}
        <section id="general" style={{ scrollMarginTop: '100px' }}>
          <div className="card fade-in" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Sliders size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>General & Passkey Preferences</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Configure system alerts and administrative operation passkeys.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* PUSH NOTIFICATIONS TOGGLE CARD */}
              <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: isNotificationsEnabled ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isNotificationsEnabled ? 'var(--primary)' : '#ef4444', flexShrink: 0 }}>
                    {isNotificationsEnabled ? <Bell size={22} /> : <BellOff size={22} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Push & System Alerts</h4>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: isNotificationsEnabled ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isNotificationsEnabled ? 'var(--primary)' : '#ef4444' }}>
                        {isNotificationsEnabled ? 'ACTIVE' : 'MUTED'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Real-time audio and visual pop-up notifications for new bookings, vendor registrations, and support enquiries in topbar.
                    </p>
                  </div>
                </div>
                
                <div 
                  onClick={toggleNotifications}
                  style={{ width: '56px', height: '30px', backgroundColor: isNotificationsEnabled ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}
                >
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isNotificationsEnabled ? '29px' : '3px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              {/* PASSKEY TOGGLE CARD */}
              <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: isPasskeyEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPasskeyEnabled ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                    {isPasskeyEnabled ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Passkey Authorization Requirement</h4>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: isPasskeyEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isPasskeyEnabled ? '#10b981' : '#ef4444' }}>
                        {isPasskeyEnabled ? 'PASSKEY ENABLED (ON)' : 'PASSKEY TURNED OFF'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Turn OFF to perform administrative operations (adding/editing categories, services, destinations, sub-services, staff, policies) directly without requesting a 6-digit email passkey.
                    </p>
                  </div>
                </div>
                
                <div 
                  onClick={!passkeyLoading ? handleTogglePasskey : undefined}
                  style={{ width: '56px', height: '30px', backgroundColor: isPasskeyEnabled ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: passkeyLoading ? 'wait' : 'pointer', transition: '0.3s', flexShrink: 0 }}
                >
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isPasskeyEnabled ? '29px' : '3px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: SECURITY & PASSWORD */}
        <section id="security" style={{ scrollMarginTop: '100px' }}>
          <div className="card fade-in" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Lock size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Security & Password Management</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Update your admin login password with multi-factor OTP verification.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '520px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <Key size={16} color="var(--primary)" /> Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword.current ? 'text' : 'password'} className="form-control" required
                    style={{ height: '48px', paddingRight: '48px', borderRadius: '12px', fontWeight: '600' }}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                  <button 
                    type="button" onClick={() => togglePasswordVisibility('current')}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <Lock size={16} color="var(--primary)" /> New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword.new ? 'text' : 'password'} className="form-control" required placeholder="Minimum 6 characters"
                    style={{ height: '48px', paddingRight: '48px', borderRadius: '12px', fontWeight: '600' }}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <button 
                    type="button" onClick={() => togglePasswordVisibility('new')}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <ShieldCheck size={16} color="#10b981" /> Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword.confirm ? 'text' : 'password'} className="form-control" required placeholder="Re-enter new password"
                    style={{ height: '48px', paddingRight: '48px', borderRadius: '12px', fontWeight: '600' }}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                  <button 
                    type="button" onClick={() => togglePasswordVisibility('confirm')}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={passwordUpdating} style={{ height: '46px', padding: '0 28px', borderRadius: '12px', fontWeight: '800', gap: '8px' }}>
                {passwordUpdating ? 'Requesting OTP...' : <><Save size={18} /> Change Password</>}
              </button>
            </form>
          </div>
        </section>

        {/* SECTION 4: SUB-ADMIN CONTROL (ADMIN ONLY) */}
        {authUser?.role === 'Admin' && (
          <section id="permissions" style={{ scrollMarginTop: '100px' }}>
            <div className="card fade-in" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Sub-Admin Permissions Control</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Configure systemic permissions and module delegation for sub-admins.</p>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => navigate('/staff')} style={{ padding: '8px 18px', fontSize: '13px', height: '40px', fontWeight: '700', borderRadius: '10px' }}>
                  Manage Staff Members <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {[
                  { title: 'Global View Permissions', desc: 'Allows sub-admins to view dashboard analytics and operational records.', active: true },
                  { title: 'Vendor Management Authority', desc: 'Grants ability to verify, edit, or terminate vendor agency profiles.', active: true },
                  { title: 'Subscriptions & Billing', desc: 'Permits modification of vendor pricing tier packages and commissions.', active: false },
                  { title: 'Content & Review Moderation', desc: 'Permits approving or hiding customer testimonials and reels.', active: true }
                ].map((perm, idx) => (
                  <div key={idx} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: perm.active ? 'rgba(34, 197, 94, 0.03)' : 'var(--bg-card)', borderColor: perm.active ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '2px', color: perm.active ? '#10b981' : '#cbd5e1' }}>
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: perm.active ? 'var(--text-main)' : 'var(--text-muted)' }}>{perm.title}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{perm.desc}</p>
                      </div>
                    </div>
                    <div style={{ width: '44px', height: '24px', backgroundColor: perm.active ? '#10b981' : '#cbd5e1', borderRadius: '24px', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: perm.active ? '23px' : '3px', transition: 'left 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* OTP MODALS */}
      <OTPModal 
        isOpen={profileOtpModal}
        onClose={() => setProfileOtpModal(false)}
        email={authUser?.email}
        loading={profileOtpLoading}
        onVerify={handleVerifyProfileOTP}
        onResend={() => api.post('/users/request-otp')}
      />

      <OTPModal 
        isOpen={passwordOtpModal}
        onClose={() => setPasswordOtpModal(false)}
        email={authUser?.email}
        loading={passwordOtpLoading}
        onVerify={handleVerifyPasswordOTP}
        onResend={() => api.post('/users/request-otp')}
      />
    </div>
  );
};

export default Settings;
