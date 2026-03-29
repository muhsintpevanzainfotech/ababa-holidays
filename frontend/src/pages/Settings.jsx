import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BellOff, Lock, UserCog, CheckCircle, ArrowRight, ShieldAlert, Key, Eye, EyeOff, Save, Bell } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import api from '../utils/api';
import OTPModal from '../components/OTPModal';
import Profile from './Profile';

const Settings = () => {
  const navigate = useNavigate();
  // Read "?tab=" from URL so external links route straight to the active tab
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'profile';
  });
  const { user } = useSelector((state) => state.auth);
  const { isNotificationsEnabled, toggleNotifications } = useUI();
  const { showToast } = useToast();

  useEffect(() => {
    // If a sub-admin somehow lands on permissions tab via URL, force them back to profile
    if (activeTab === 'permissions' && user?.role !== 'Admin') {
      setActiveTab('profile');
    }
  }, [activeTab, user]);

  // Password State
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return showToast('Error', 'New passwords do not match', 'error');
    }
    if (formData.newPassword.length < 6) {
      return showToast('Error', 'Password must be at least 6 characters', 'error');
    }
    setUpdating(true);
    try {
      await api.post('/users/request-otp');
      setIsOTPModalOpen(true);
      showToast('Action Required', 'A verification code has been sent to your registered email.', 'info');
    } catch (error) {
      showToast('Security Error', error.response?.data?.message || 'Failed to initiate password change', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setOTPLoading(true);
    try {
      const response = await api.put('/users/profile', {
        password: formData.newPassword,
        otp: otp,
        currentPassword: formData.currentPassword 
      });
      if (response.data.success) {
        showToast('Success', 'Your password has been updated successfully.', 'success');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsOTPModalOpen(false);
      }
    } catch (error) {
      showToast('Verification Failed', error.response?.data?.message || 'Invalid or expired code.', 'error');
    } finally {
      setOTPLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/users/request-otp');
      showToast('OTP Sent', 'New verification code sent to your email', 'success');
    } catch (error) {
      showToast('Error', 'Failed to resend verification code', 'error');
    }
  };

  const toggleVisibility = (field) => setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1>System Settings</h1>
          <p>Manage your account preferences, security, and staff access</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Settings Navigation Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', background: activeTab === 'profile' ? 'var(--bg-main)' : 'transparent', border: activeTab === 'profile' ? '1px solid var(--border)' : '1px solid transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'profile' ? '700' : '600', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}
            >
              <UserCog size={20} /> Account Profile
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', background: activeTab === 'general' ? 'var(--bg-main)' : 'transparent', border: activeTab === 'general' ? '1px solid var(--border)' : '1px solid transparent', color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'general' ? '700' : '600', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}
            >
              <BellOff size={20} /> General Preferences
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', background: activeTab === 'security' ? 'var(--bg-main)' : 'transparent', border: activeTab === 'security' ? '1px solid var(--border)' : '1px solid transparent', color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'security' ? '700' : '600', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}
            >
              <Lock size={20} /> Security & Password
            </button>
            {user?.role === 'Admin' && (
              <button 
                onClick={() => setActiveTab('permissions')}
                style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', background: activeTab === 'permissions' ? 'var(--bg-main)' : 'transparent', border: activeTab === 'permissions' ? '1px solid var(--border)' : '1px solid transparent', color: activeTab === 'permissions' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'permissions' ? '700' : '600', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}
              >
                <UserCog size={20} /> Sub-Admin Control
              </button>
            )}
          </div>
        </div>

        {/* Settings Content Area */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Profile />
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="card fade-in" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>General Preferences</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Control your global notification and dashboard behaviors.</p>
              
              <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isNotificationsEnabled ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isNotificationsEnabled ? 'var(--primary)' : '#ef4444' }}>
                     {isNotificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>Push Notifications</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Mute all system alerts and visual unread badges in the navbar.</p>
                  </div>
                </div>
                
                <div 
                  onClick={toggleNotifications}
                  style={{ width: '52px', height: '28px', backgroundColor: isNotificationsEnabled ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                >
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isNotificationsEnabled ? '26px' : '2px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="card fade-in" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Security & Password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Update your security credentials. We recommend using a unique password.</p>
              
              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '440px' }}>
                <div className="form-group" style={{ position: 'relative', marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700' }}>
                    <Key size={16} color="var(--primary)" /> Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword.current ? 'text' : 'password'} className="form-control" required style={{ height: '48px', paddingRight: '48px' }} value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} />
                    <button type="button" onClick={() => toggleVisibility('current')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ position: 'relative', marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700' }}>
                    <Lock size={16} color="var(--primary)" /> New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword.new ? 'text' : 'password'} className="form-control" placeholder="At least 6 characters" required style={{ height: '48px', paddingRight: '48px' }} value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                    <button type="button" onClick={() => toggleVisibility('new')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ position: 'relative', marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700' }}>
                    <ShieldCheck size={16} color="#10b981" /> Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword.confirm ? 'text' : 'password'} className="form-control" placeholder="Re-type new password" required style={{ height: '48px', paddingRight: '48px' }} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                    <button type="button" onClick={() => toggleVisibility('confirm')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '700' }}>
                  {updating ? 'Sending OTP...' : <><Save size={18} /> Save New Password</>}
                </button>
              </form>

              <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(254, 243, 199, 0.4)', borderRadius: '16px', border: '1px solid rgba(252, 211, 77, 0.5)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#92400e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                  <ShieldAlert size={16} /> Optional Verification
                </h4>
                <p style={{ fontSize: '12px', color: '#92400e', margin: 0, opacity: 0.8, lineHeight: 1.6 }}> Changing credentials triggers standard Two-Step Email Authorization. Ensure you have access to your registered email address. </p>
              </div>
            </div>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === 'permissions' && user?.role === 'Admin' && (
            <div className="card fade-in" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Sub-Admin Access Control</h2>
                 {user?.role === 'Admin' && (
                   <button className="btn btn-primary" onClick={() => navigate('/staff')} style={{ padding: '8px 16px', fontSize: '12px', height: '36px' }}>
                     Manage Staff <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                   </button>
                 )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Manage exactly what modules your sub-admins are permitted to access and modify.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Global View Permissions', desc: 'Allows sub-admins to view all dashboard metrics horizontally.', active: true },
                  { title: 'Manage Vendors', desc: 'Grants access to approve, ban, and modify vendor agencies.', active: true },
                  { title: 'Manage Subscriptions', desc: 'Full authority to modify billing and active tier logic.', active: false },
                  { title: 'Testimonials Moderation', desc: 'Permits flagging Top Picks and rejecting inappropriate comments.', active: true }
                ].map((perm, idx) => (
                  <div key={idx} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: perm.active ? 'rgba(34, 197, 94, 0.03)' : 'transparent', borderColor: perm.active ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                       <div style={{ marginTop: '2px', color: perm.active ? '#10b981' : '#cbd5e1' }}>
                          <CheckCircle size={20} />
                       </div>
                       <div>
                         <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: perm.active ? 'var(--text-main)' : 'var(--text-muted)' }}>{perm.title}</h4>
                         <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{perm.desc}</p>
                       </div>
                    </div>
                    {user?.role === 'Admin' ? (
                       <div style={{ width: '44px', height: '24px', backgroundColor: perm.active ? '#10b981' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                         <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: perm.active ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                       </div>
                    ) : (
                       <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', background: 'var(--bg-main)', borderRadius: '6px', color: 'var(--text-muted)' }}>Admin Only</span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      <OTPModal 
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        email={user?.email}
        loading={otpLoading}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </div>
  );
};

export default Settings;
