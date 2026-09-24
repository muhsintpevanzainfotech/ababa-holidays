import React from 'react';
import { ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import { renderUploadPreview, getInputFieldStyle, getFieldError } from '../components/SharedUI';

const Step1Account = ({ 
  formik, imagePreview, showPassword, setShowPassword, 
  isViewMode, isDragging, setIsDragging, handleNestedFileChange, id 
}) => {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck color="var(--primary)" /> Partner Identity & Credentials
      </h2>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--bg-main)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
          {renderUploadPreview({
            preview: imagePreview || formik.values.avatar,
            fileInputId: 'vendorAvatarAdd',
            fileKey: 'avatar',
            previewKey: 'avatar',
            customStyle: { borderRadius: '50%', height: '90px', width: '90px' },
            isViewMode,
            isDragging,
            setIsDragging,
            handleNestedFileChange
          })}
          <input id="vendorAvatarAdd" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleNestedFileChange(e, 'avatar', 'avatar')} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>Profile Photo / Headshot</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Upload a professional headshot or company avatar for vendor identification.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            className="form-control"
            disabled={isViewMode}
            placeholder="John Doe"
            {...formik.getFieldProps('name')}
            style={getInputFieldStyle(formik, 'name')}
          />
          {getFieldError(formik, 'name')}
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            className="form-control"
            disabled={isViewMode}
            placeholder="vendor@company.com"
            {...formik.getFieldProps('email')}
            style={getInputFieldStyle(formik, 'email')}
          />
          {getFieldError(formik, 'email')}
        </div>

        <div className="form-group">
          <label>Mobile / Phone Number *</label>
          <input
            type="text"
            className="form-control"
            disabled={isViewMode}
            placeholder="+91 9876543210"
            {...formik.getFieldProps('phone')}
            style={getInputFieldStyle(formik, 'phone')}
          />
          {getFieldError(formik, 'phone')}
        </div>

        <div className="form-group">
          <label>{id ? 'Access Password (Optional)' : 'Access Password *'}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              disabled={isViewMode}
              placeholder={id ? 'Leave blank to keep current password' : 'Create strong password'}
              {...formik.getFieldProps('password')}
              style={getInputFieldStyle(formik, 'password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {getFieldError(formik, 'password')}
        </div>
      </div>
    </div>
  );
};

export default Step1Account;
