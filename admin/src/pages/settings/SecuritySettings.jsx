import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import OTPModal from '../../components/OTPModal';

const SecuritySettings = () => {
  const { showToast } = useToast();
  const { user: authUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [updating, setUpdating] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return showToast('Error', 'New passwords do not match', 'error');
    }
    if (formData.newPassword.length < 6) {
      return showToast('Error', 'Password must be at least 6 characters long', 'error');
    }
    setUpdating(true);
    try {
      await api.post('/users/request-otp');
      setIsOTPModalOpen(true);
      showToast('OTP Required', 'Security verification code sent to your registered email.', 'info');
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to send OTP code', 'error');
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
      showToast('Verification Failed', error.response?.data?.message || 'Invalid or expired OTP code', 'error');
    } finally {
      setOTPLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              SETTINGS & PREFERENCES
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Security & <span style={{ color: 'var(--primary)' }}>Password</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Update your account password and security credentials with multi-factor OTP verification.
          </p>
        </div>
      </div>

      <div className="card fade-in" style={{ padding: '36px', borderRadius: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Lock size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Update Account Password</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Require current password and email OTP code confirmation.</p>
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
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
              <button 
                type="button" onClick={() => toggleVisibility('current')}
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
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <button 
                type="button" onClick={() => toggleVisibility('new')}
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button 
                type="button" onClick={() => toggleVisibility('confirm')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={updating} style={{ height: '48px', padding: '0 32px', borderRadius: '12px', fontWeight: '800', gap: '10px' }}>
            {updating ? 'Requesting OTP...' : <><Save size={18} /> Update Password</>}
          </button>
        </form>
      </div>

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

export default SecuritySettings;
