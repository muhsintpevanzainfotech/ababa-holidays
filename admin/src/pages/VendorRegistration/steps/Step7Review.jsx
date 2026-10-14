import React from 'react';
import { 
  Check, ShieldCheck, Building, CreditCard, 
  MapPin, Star, CheckCircle, Landmark, Eye, FileText,
  Percent, Briefcase, Globe, AlertCircle, ShieldAlert
} from 'lucide-react';
import { renderReviewItem } from '../components/SharedUI';

const Step7Review = ({ 
  formik, imagePreview, setLightbox, 
  subscriptions = [], services = [], countries = [], states = [], isPublic = false
}) => {
  const selectedPlan = subscriptions.find(s => s._id === formik.values.subscription)?.title || 
    subscriptions.find(s => s._id === formik.values.subscription)?.name || 
    formik.values.subscriptionPlan || 
    'Not Selected';
  const selectedCountryName = countries.find(c => c._id === formik.values.address?.country)?.name || formik.values.address?.country || 'N/A';
  const selectedStateName = states.find(s => s._id === formik.values.address?.state)?.name || formik.values.address?.state || 'N/A';

  // Get active service module names
  const activeServices = (formik.values.selectedServices || []).map(srvId => {
    const srv = services.find(s => s._id === srvId);
    return srv ? srv.title : srvId;
  });

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1.5px solid rgba(34, 197, 94, 0.3)' }}>
          <Check size={30} strokeWidth={3} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
          Review Application Protocol
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0, maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
          Please carefully inspect all credentials, documents, and banking financials before final submission. Click on previews to inspect documents.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* 1. ACCOUNT & BRANDING */}
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '22px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} /> Partner Credentials
          </h4>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', padding: '14px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <img
              src={imagePreview || formik.values.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formik.values.name || 'Vendor')}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
              alt="Partner"
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{formik.values.name || 'N/A'}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{formik.values.email || 'N/A'}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>{formik.values.phone || 'N/A'}</p>
            </div>
          </div>
          
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Company Brand Logo</p>
          <div style={{ textAlign: 'center', background: 'var(--bg-main)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
            {(formik.values.logoPreview || formik.values.logoSPreview || formik.values.logoLPreview) ? (
              <img 
                src={formik.values.logoPreview || formik.values.logoSPreview || formik.values.logoLPreview} 
                style={{ width: '100%', height: '54px', objectFit: 'contain', cursor: 'pointer' }} 
                onClick={() => setLightbox(formik.values.logoPreview || formik.values.logoSPreview || formik.values.logoLPreview)} 
                alt="Company Logo" 
              />
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No Company Logo Uploaded</span>
            )}
          </div>

          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Storefront Cover Banner</p>
          <div style={{ textAlign: 'center', background: 'var(--bg-main)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border)' }}>
            {formik.values.coverBannerPreview ? (
              <img 
                src={formik.values.coverBannerPreview} 
                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} 
                onClick={() => setLightbox(formik.values.coverBannerPreview)} 
                alt="Cover Banner" 
              />
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No Cover Banner Uploaded</span>
            )}
          </div>
        </div>

        {/* 2. BUSINESS PROFILE & SPOC */}
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '22px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} /> Business Profile & SPOC
          </h4>
          {renderReviewItem('Legal Entity', formik.values.companyName)}
          {renderReviewItem('Entity Classification', formik.values.vendorType)}
          {renderReviewItem('Trade / License Ref', formik.values.businessLicense || 'N/A')}
          {renderReviewItem('About / Overview', formik.values.description)}
          
          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(var(--primary-rgb), 0.04)', borderRadius: '14px', border: '1px dashed var(--primary)' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>SPOC Details</p>
            <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{formik.values.spoc?.name || 'N/A'}</p>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{formik.values.spoc?.phone} &bull; {formik.values.spoc?.email || 'No email'}</p>
          </div>
        </div>

        {/* 3. SETTLEMENT BANK & DOCUMENTS */}
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '22px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={16} /> Settlement Bank & Compliance
          </h4>

          {renderReviewItem('Bank Name', formik.values.bankDetails?.bankName)}
          {renderReviewItem('Account Number', formik.values.bankDetails?.accountNumber)}
          {renderReviewItem('IFSC Code', formik.values.bankDetails?.ifscCode)}
          {renderReviewItem('GSTIN Ref', formik.values.gst?.number || 'N/A')}
          {renderReviewItem('TIN / PAN Ref', formik.values.tin?.number || 'N/A')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>GST CERTIFICATE</p>
              {formik.values.gstPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.gstPreview)}>
                  <Eye size={12} /> View GST
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>TIN / PAN PROOF</p>
              {formik.values.tinPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.tinPreview)}>
                  <Eye size={12} /> View TIN/PAN
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>BANK PROOF</p>
              {formik.values.bankPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.bankPreview)}>
                  <Eye size={12} /> View Proof
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>ID CARD PROOF</p>
              {formik.values.idCardPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.idCardPreview)}>
                  <Eye size={12} /> View ID
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. LOCATION & COMMERCIAL PLAN */}
        <div style={{ background: 'var(--bg-card)', padding: '22px', borderRadius: '22px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} /> Location, Services & Commercials
          </h4>
          {renderReviewItem('Full Address', formik.values.address?.fullAddress)}
          {renderReviewItem('City & Zip', `${formik.values.address?.city || 'N/A'} ${formik.values.address?.zipCode ? `(${formik.values.address.zipCode})` : ''}`)}
          {renderReviewItem('Country & State', `${selectedCountryName} &bull; ${selectedStateName}`)}
          {renderReviewItem('Selected Tier', selectedPlan)}
          {renderReviewItem('Package Commission', `${formik.values.packageCommission?.rate || 0}${formik.values.packageCommission?.type === 'Flat' ? ' ₹ Flat' : '%'}`)}
          
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>
              Authorized Modules ({activeServices.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {activeServices.length > 0 ? (
                activeServices.map((name, i) => (
                  <span key={i} style={{ fontSize: '10.5px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                    ✓ {name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>None Selected</span>
              )}
            </div>
          </div>

          {!isPublic && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Admin KYC Audit: </span>
              <span style={{
                fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px',
                background: formik.values.kycStatus === 'Verified' ? 'rgba(34, 197, 94, 0.15)' : (formik.values.kycStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                color: formik.values.kycStatus === 'Verified' ? '#16a34a' : (formik.values.kycStatus === 'Rejected' ? '#ef4444' : '#d97706')
              }}>
                {formik.values.kycStatus || 'Pending'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FINAL CONFIRMATION NOTICE */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.06) 0%, rgba(34, 197, 94, 0.06) 100%)',
        border: '1.5px solid rgba(var(--primary-rgb), 0.25)',
        borderRadius: '18px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
            Confirmation Required Before Finalizing
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Clicking <strong>Submit Registration</strong> will prompt a security confirmation modal. The application will NOT be saved or closed without your explicit confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step7Review;
