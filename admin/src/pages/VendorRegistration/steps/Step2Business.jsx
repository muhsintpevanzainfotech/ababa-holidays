import React from 'react';
import { Briefcase, Building, UserCheck, Compass, Car, FileCheck } from 'lucide-react';
import { renderUploadPreview, getInputFieldStyle, getFieldError } from '../components/SharedUI';

const Step2Business = ({ 
  formik, isViewMode, isDragging, setIsDragging, handleNestedFileChange 
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
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase color="var(--primary)" /> Business Intelligence & Branding
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div className="form-group">
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

          <div className="form-group">
            <label>Trade / Business License Number</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. LIC-2026-987654"
              {...formik.getFieldProps('businessLicense')}
            />
          </div>

          <div className="form-group">
            <label>About Vendor / Business Overview *</label>
            <textarea
              className="form-control"
              rows="4"
              disabled={isViewMode}
              {...formik.getFieldProps('description')}
              style={{ ...getInputFieldStyle(formik, 'description'), resize: 'none' }}
              placeholder="Describe your travel services, specializations, coverage, experience..."
            />
            {getFieldError(formik, 'description')}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Entity Classification *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {vendorTypes.map(type => {
              const isSelected = formik.values.vendorType === type.val;
              return (
                <div
                  key={type.val}
                  onClick={() => !isViewMode && formik.setFieldValue('vendorType', type.val)}
                  style={{
                    padding: '12px',
                    borderRadius: '16px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-card)',
                    cursor: isViewMode ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
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

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Company Logos (Small / Mid / Large)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['logoS', 'logoM', 'logoL'].map(key => (
                <div key={key} style={{ flex: 1 }}>
                  {renderUploadPreview({
                    preview: formik.values[`${key}Preview`],
                    fileInputId: key,
                    fileKey: key,
                    previewKey: `${key}Preview`,
                    customStyle: { height: '65px' },
                    isViewMode,
                    isDragging,
                    setIsDragging,
                    handleNestedFileChange
                  })}
                  <input id={key} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleNestedFileChange(e, key, `${key}Preview`)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPOC MAPPING */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>
          Single Point of Contact (SPOC)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label>SPOC Name *</label>
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
            <label>SPOC Email</label>
            <input
              type="email"
              className="form-control"
              disabled={isViewMode}
              placeholder="spoc@company.com"
              {...formik.getFieldProps('spoc.email')}
            />
          </div>
          <div className="form-group">
            <label>SPOC Phone *</label>
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
        </div>
      </div>
    </div>
  );
};

export default Step2Business;
