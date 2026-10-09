import React from 'react';
import { 
  Check, ShieldCheck, Building, CreditCard, 
  MapPin, Star, CheckCircle, Landmark, Eye, FileText
} from 'lucide-react';
import { renderReviewItem } from '../components/SharedUI';

const Step7Review = ({ 
  formik, imagePreview, setLightbox, 
  subscriptions = [], services = [], countries = [], states = [] 
}) => {
  const selectedPlan = subscriptions.find(s => s._id === formik.values.subscription)?.title || formik.values.subscriptionPlan || 'Free Starter Plan';
  const selectedCountryName = countries.find(c => c._id === formik.values.address?.country)?.name || 'India';
  const selectedStateName = states.find(s => s._id === formik.values.address?.state)?.name || 'Maharashtra';

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Check size={28} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '6px', color: 'var(--text-main)' }}>
          Review Application Protocol
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Please inspect all details before final submission. Click on document previews to verify uploads.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* 1. ACCOUNT & BRANDING */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} /> Partner Credentials
          </h4>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center', padding: '14px', background: 'var(--bg-main)', borderRadius: '14px' }}>
            <img
              src={imagePreview || formik.values.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formik.values.name || 'Vendor')}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              alt="Partner"
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{formik.values.name || 'N/A'}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{formik.values.email || 'N/A'}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>{formik.values.phone || 'N/A'}</p>
            </div>
          </div>
          
          <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Company Logos</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{ label: 'Small', url: formik.values.logoSPreview }, { label: 'Mid', url: formik.values.logoMPreview }, { label: 'Large', url: formik.values.logoLPreview }].map((logo, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-main)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>{logo.label}</p>
                {logo.url ? (
                  <img src={logo.url} style={{ width: '100%', height: '36px', objectFit: 'contain', cursor: 'pointer' }} onClick={() => setLightbox(logo.url)} alt="Logo" />
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No File</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. BUSINESS PROFILE */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} /> Business Profile & SPOC
          </h4>
          {renderReviewItem('Legal Entity', formik.values.companyName)}
          {renderReviewItem('Entity Classification', formik.values.vendorType)}
          {renderReviewItem('License Ref.', formik.values.businessLicense)}
          {renderReviewItem('About / Overview', formik.values.description)}
          
          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>SPOC Details</p>
            <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{formik.values.spoc?.name || 'N/A'}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{formik.values.spoc?.phone} • {formik.values.spoc?.email || 'No email'}</p>
          </div>
        </div>

        {/* 3. SETTLEMENT BANK & DOCUMENTS */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={16} /> Settlement Bank & Compliance
          </h4>

          {renderReviewItem('Bank Name', formik.values.bankDetails?.bankName)}
          {renderReviewItem('Account Number', formik.values.bankDetails?.accountNumber)}
          {renderReviewItem('IFSC Code', formik.values.bankDetails?.ifscCode)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>GST CERTIFICATE</p>
              {formik.values.gstPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.gstPreview)}>
                  <Eye size={12} /> View GST
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>TIN / PAN PROOF</p>
              {formik.values.tinPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.tinPreview)}>
                  <Eye size={12} /> View TIN/PAN
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-muted)' }}>BANK PROOF</p>
              {formik.values.bankPreview ? (
                <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', width: '100%' }} onClick={() => setLightbox(formik.values.bankPreview)}>
                  <Eye size={12} /> View Proof
                </button>
              ) : (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Not Uploaded</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '10px' }}>
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

        {/* 4. LOCATION SUMMARY */}
        <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} /> Location & Plan
          </h4>
          {renderReviewItem('Full Address', formik.values.address?.fullAddress)}
          {renderReviewItem('City', formik.values.address?.city)}
          {renderReviewItem('Country & State', `${selectedCountryName} • ${selectedStateName}`)}
          {renderReviewItem('Selected Plan', selectedPlan)}
          {renderReviewItem('Package Commission', `${formik.values.packageCommission?.rate || 0}${formik.values.packageCommission?.type === 'Flat' ? ' ₹ Flat' : '%'}`)}
        </div>
      </div>
    </div>
  );
};

export default Step7Review;
