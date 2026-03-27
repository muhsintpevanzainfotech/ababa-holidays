import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Lock, ShieldCheck, Eye, EyeOff, Save, ArrowLeft, ShieldAlert, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import OTPModal from '../components/OTPModal';

const ChangePassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);

  // User Email for OTP
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return showToast('Error', 'New passwords do not match', 'error');
    }

    if (formData.newPassword.length < 6) {
      return showToast('Error', 'Password must be at least 6 characters', 'error');
    }

    setUpdating(true);
    try {
      // Step 1: Request OTP
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
      // Step 2: Update Profile with new password and OTP
      const response = await api.put('/users/profile', {
        password: formData.newPassword,
        otp: otp,
        currentPassword: formData.currentPassword 
      });

      if (response.data.success) {
        showToast('Success', 'Your password has been updated successfully.', 'success');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsOTPModalOpen(false);
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (error) {
      showToast('Verification Failed', error.response?.data?.message || 'The code you entered is invalid or expired.', 'error');
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

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', fontSize: '14px', fontWeight: '700', padding: 0 }}
        >
          <ArrowLeft size={18} /> Back to Settings
        </button>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>Security Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Update your security credentials. We recommend using a unique password you don't use elsewhere.</p>
        </div>

        <div className="card shadow-soft" style={{ padding: '40px', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                <Key size={16} color="var(--primary)" /> Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword.current ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Enter current password"
                  required
                  style={{ height: '52px', paddingRight: '48px', borderRadius: '14px', background: 'var(--bg-main)', border: '2px solid var(--border)', fontWeight: '600' }}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('current')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0 24px' }} />

            <div className="form-group" style={{ position: 'relative', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                <Lock size={16} color="var(--primary)" /> New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword.new ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="At least 6 characters"
                  required
                  style={{ height: '52px', paddingRight: '48px', borderRadius: '14px', background: 'var(--bg-main)', border: '2px solid var(--border)', fontWeight: '600' }}
                  value={formData.newPassword}
                  autoComplete="new-password"
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('new')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative', marginBottom: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                <ShieldCheck size={16} color="#10b981" /> Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword.confirm ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Re-type new password"
                  required
                  style={{ height: '52px', paddingRight: '48px', borderRadius: '14px', background: 'var(--bg-main)', border: '2px solid var(--border)', fontWeight: '600' }}
                  value={formData.confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('confirm')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={updating}
              style={{ width: '100%', height: '54px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}
            >
              {updating ? 'Sending OTP...' : <><Save size={18} /> Update & Save Changes</>}
            </button>
          </form>
        </div>

        <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(254, 243, 199, 0.4)', borderRadius: '20px', border: '1px solid rgba(252, 211, 77, 0.5)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
            <ShieldAlert size={16} /> Important Note
          </h4>
          <p style={{ fontSize: '13px', color: '#92400e', margin: 0, opacity: 0.8, lineHeight: 1.6 }}> Changing your password will enable Two-Step Verification for this session. A verification code will be sent to your email to confirm this action. </p>
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

export default ChangePassword;
