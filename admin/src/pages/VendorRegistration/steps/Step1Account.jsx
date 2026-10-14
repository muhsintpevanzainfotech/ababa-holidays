import React from 'react';
import { 
  ShieldCheck, Eye, EyeOff, User, Briefcase, 
  Building, Compass, Car, UserCheck, FileText, Image
} from 'lucide-react';
import { renderUploadPreview, getInputFieldStyle, getFieldError } from '../components/SharedUI';

const Step1Account = ({ 
  formik, imagePreview, showPassword, setShowPassword, 
  isViewMode, isDragging, setIsDragging, handleNestedFileChange, handleDrop, id 
}) => {
  const vendorTypes = [
    { val: 'Travel Agent', desc: 'Agency / Outbound', icon: <Briefcase size={16} /> },
    { val: 'Tour Operator', desc: 'Custom Packages', icon: <Compass size={16} /> },
    { val: 'Activity Provider', desc: 'Events & Sightseeing', icon: <Building size={16} /> },
    { val: 'Transport', desc: 'Fleet & Transfers', icon: <Car size={16} /> },
    { val: 'Company', desc: 'Corporate Agency', icon: <Building size={16} /> },
    { val: 'Individual', desc: 'Independent Partner', icon: <UserCheck size={16} /> }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* ============================================================ */}
      {/* SECTION 1: PARTNER IDENTITY & CREDENTIALS                    */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <ShieldCheck color="var(--primary)" size={20} /> Partner Identity & Credentials
        </h2>

        {/* Profile Avatar Upload */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
            {renderUploadPreview({
              preview: imagePreview || formik.values.avatar,
              fileInputId: 'vendorAvatarAdd',
              fileKey: 'avatar',
              previewKey: 'avatar',
              customStyle: { borderRadius: '50%', height: '80px', width: '80px' },
              isViewMode,
              isDragging,
              setIsDragging,
              handleDrop,
              handleNestedFileChange
            })}
            <input 
              id="vendorAvatarAdd" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={(e) => handleNestedFileChange(e, 'avatar', 'avatar')} 
            />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Profile Photo / Headshot</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Upload an authorized headshot or administrator avatar for account identification.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. John Doe"
              {...formik.getFieldProps('name')}
              style={getInputFieldStyle(formik, 'name')}
            />
            {getFieldError(formik, 'name')}
          </div>

          <div className="form-group">
            <label>Official Email Address *</label>
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
                placeholder={id ? 'Leave blank to retain password' : 'Create secure password'}
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

      {/* ============================================================ */}
      {/* SECTION 2: BUSINESS INTELLIGENCE & BRANDING                 */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Briefcase color="var(--primary)" size={20} /> Business Intelligence & Branding
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Legal Company / Business Name *</label>
              <input
                type="text"
                className="form-control"
                disabled={isViewMode}
                placeholder="e.g. Ababa Express Travels Pvt Ltd"
                {...formik.getFieldProps('companyName')}
                style={getInputFieldStyle(formik, 'companyName')}
              />
              {getFieldError(formik, 'companyName')}
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label>Trade / Business License Number</label>
              <input
                type="text"
                className="form-control"
                disabled={isViewMode}
                placeholder="e.g. LIC-2026-987654"
                {...formik.getFieldProps('businessLicense')}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Entity Classification *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {vendorTypes.map(type => {
                const isSelected = formik.values.vendorType === type.val;
                return (
                  <div
                    key={type.val}
                    onClick={() => !isViewMode && formik.setFieldValue('vendorType', type.val)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '14px',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-card)',
                      cursor: isViewMode ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {type.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {type.val}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{type.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {getFieldError(formik, 'vendorType')}
          </div>
        </div>

        {/* Single Company Logo Upload */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-card)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={16} color="var(--primary)" /> Company Brand Logo
              </label>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Official transparent PNG or SVG logo for your vendor store and package badges.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: '400px' }}>
            {renderUploadPreview({
              preview: formik.values.logoPreview || formik.values.logoSPreview || formik.values.logoLPreview,
              fileInputId: 'companyLogoUpload',
              fileKey: 'logo',
              previewKey: 'logoPreview',
              customStyle: { height: '80px' },
              isViewMode,
              isDragging,
              setIsDragging,
              handleDrop,
              handleNestedFileChange
            })}
            <input 
              id="companyLogoUpload" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={(e) => handleNestedFileChange(e, 'logo', 'logoPreview')} 
            />
          </div>
        </div>

        {/* Storefront Cover Banner Image Upload */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-card)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={16} color="var(--primary)" /> Storefront Cover Banner Image
              </label>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                High-resolution landscape hero banner (recommended 1920x600 px) for the vendor profile & storefront header.
              </p>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '600px' }}>
            {renderUploadPreview({
              preview: formik.values.coverBannerPreview,
              fileInputId: 'vendorCoverBannerUpload',
              fileKey: 'coverBanner',
              previewKey: 'coverBannerPreview',
              customStyle: { height: '140px', borderRadius: '14px' },
              isViewMode,
              isDragging,
              setIsDragging,
              handleDrop,
              handleNestedFileChange
            })}
            <input 
              id="vendorCoverBannerUpload" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={(e) => handleNestedFileChange(e, 'coverBanner', 'coverBannerPreview')} 
            />
          </div>
        </div>

        {/* About Vendor / Business Overview */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
            About Vendor / Business Overview *
          </label>
          <textarea
            className="form-control"
            rows={3}
            disabled={isViewMode}
            {...formik.getFieldProps('description')}
            style={{ 
              ...getInputFieldStyle(formik, 'description'), 
              width: '100%', 
              minHeight: '100px',
              resize: 'vertical',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}
            placeholder="Describe your travel agency, destinations covered, tour specializations, years of experience..."
          />
          {getFieldError(formik, 'description')}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: SINGLE POINT OF CONTACT (SPOC)                    */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <User color="var(--primary)" size={20} /> Single Point of Contact (SPOC)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label>SPOC Contact Name *</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. Jane Smith"
              {...formik.getFieldProps('spoc.name')}
              style={getInputFieldStyle(formik, 'spoc.name')}
            />
            {getFieldError(formik, 'spoc.name')}
          </div>

          <div className="form-group">
            <label>SPOC Direct Phone *</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="+91 9876543210"
              {...formik.getFieldProps('spoc.phone')}
              style={getInputFieldStyle(formik, 'spoc.phone')}
            />
            {getFieldError(formik, 'spoc.phone')}
          </div>

          <div className="form-group">
            <label>SPOC Official Email</label>
            <input
              type="email"
              className="form-control"
              disabled={isViewMode}
              placeholder="spoc@company.com"
              {...formik.getFieldProps('spoc.email')}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Step1Account;
