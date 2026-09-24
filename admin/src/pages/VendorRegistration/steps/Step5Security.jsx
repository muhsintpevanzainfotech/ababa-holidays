import React from 'react';
import { ShieldCheck, Plus, CheckCircle, Minus, Globe, Search } from 'lucide-react';
import { getFieldError } from '../components/SharedUI';

const Step5Security = ({ formik, isViewMode }) => {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck color="var(--primary)" /> Trust, Compliance & SEO Visibility
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        {/* STATUS & CONTROL */}
        <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>
            KYC Verification & Status
          </h4>
          <div className="form-group">
            <label style={{ marginBottom: '10px', display: 'block' }}>KYC Audit Status</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { val: 'Pending', icon: <Plus size={14} />, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
                { val: 'Verified', icon: <CheckCircle size={14} />, color: '#10b981', bg: '#f0fdf4', border: '#dcfce7' },
                { val: 'Rejected', icon: <Minus size={14} />, color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' }
              ].map(status => {
                const isSelected = formik.values.kycStatus === status.val;
                return (
                  <div
                    key={status.val}
                    onClick={() => !isViewMode && formik.setFieldValue('kycStatus', status.val)}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      borderRadius: '14px',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? status.color : 'var(--border)',
                      background: isSelected ? status.bg : 'var(--bg-card)',
                      color: isSelected ? status.color : 'var(--text-muted)',
                      cursor: isViewMode ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: '800',
                      fontSize: '12px',
                      boxShadow: isSelected ? `0 4px 12px ${status.border}` : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {status.icon}
                    {status.val.toUpperCase()}
                  </div>
                );
              })}
            </div>
            {getFieldError(formik, 'kycStatus')}
          </div>
        </div>

        {/* SEO & VISIBILITY */}
        <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={16} /> Search Engine Optimization (SEO)
          </h4>
          <div className="form-group">
            <label>SEO Meta Title</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. Best Travel Agency in Mumbai - Ababa Travels"
              {...formik.getFieldProps('seo.title')}
            />
          </div>
          <div className="form-group">
            <label>SEO Meta Keywords (comma separated)</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="tours, packages, travel agent, holiday bookings"
              {...formik.getFieldProps('seo.keywords')}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Meta Description</label>
            <textarea
              className="form-control"
              rows="3"
              disabled={isViewMode}
              placeholder="Brief meta description for search engine listings..."
              {...formik.getFieldProps('seo.description')}
              style={{ resize: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Security;
