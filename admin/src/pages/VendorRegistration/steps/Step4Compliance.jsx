import React from 'react';
import { CreditCard, Landmark, FileText, ShieldAlert } from 'lucide-react';
import { renderUploadPreview, getInputFieldStyle, getFieldError } from '../components/SharedUI';

const Step4Compliance = ({ 
  formik, isViewMode, isDragging, setIsDragging, handleNestedFileChange, handleDrop 
}) => {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard color="var(--primary)" /> Compliance, Tax & Settlement Financials
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        {/* TAX & IDENTITY COMPLIANCE */}
        <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> Tax IDs & Legal Proof
          </h4>

          <div className="form-group">
            <label>GST Identification Number (GSTIN)</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="22AAAAA0000A1Z5"
              {...formik.getFieldProps('gst.number')}
              style={getInputFieldStyle(formik, 'gst.number')}
            />
            {getFieldError(formik, 'gst.number')}
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GST Certificate Upload (PDF / Image)</label>
              {renderUploadPreview({
                preview: formik.values.gstPreview,
                fileInputId: 'gstFile',
                fileKey: 'gst.file',
                previewKey: 'gstPreview',
                customStyle: { height: '80px' },
                isViewMode,
                isDragging,
                setIsDragging,
                handleDrop,
                handleNestedFileChange
              })}
              <input 
                id="gstFile" 
                type="file" 
                style={{ display: 'none' }} 
                accept="image/*,application/pdf,.doc,.docx"
                onChange={(e) => handleNestedFileChange(e, 'gst.file', 'gstPreview')} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tax Identification Number (TIN / PAN)</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="ABCDE1234F"
              {...formik.getFieldProps('tin.number')}
              style={getInputFieldStyle(formik, 'tin.number')}
            />
            {getFieldError(formik, 'tin.number')}
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TIN / PAN Proof Upload (PDF / Image)</label>
              {renderUploadPreview({
                preview: formik.values.tinPreview,
                fileInputId: 'tinFile',
                fileKey: 'tin.file',
                previewKey: 'tinPreview',
                customStyle: { height: '80px' },
                isViewMode,
                isDragging,
                setIsDragging,
                handleDrop,
                handleNestedFileChange
              })}
              <input 
                id="tinFile" 
                type="file" 
                style={{ display: 'none' }} 
                accept="image/*,application/pdf,.doc,.docx"
                onChange={(e) => handleNestedFileChange(e, 'tin.file', 'tinPreview')} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Identity Card Proof (Aadhaar / Passport / ID)</label>
            {renderUploadPreview({
              preview: formik.values.idCardPreview,
              fileInputId: 'idCardFileAdd',
              fileKey: 'idCardFile',
              previewKey: 'idCardPreview',
              customStyle: { height: '80px' },
              isViewMode,
              isDragging,
              setIsDragging,
              handleDrop,
              handleNestedFileChange
            })}
            <input 
              id="idCardFileAdd" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*,application/pdf,.doc,.docx"
              onChange={(e) => handleNestedFileChange(e, 'idCardFile', 'idCardPreview')} 
            />
          </div>
        </div>

        {/* SETTLEMENT BANK DETAILS */}
        <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Landmark size={16} /> Settlement Bank Details
          </h4>

          <div className="form-group">
            <label>Full Bank Name</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. State Bank of India / HDFC Bank"
              {...formik.getFieldProps('bankDetails.bankName')}
              style={getInputFieldStyle(formik, 'bankDetails.bankName')}
            />
            {getFieldError(formik, 'bankDetails.bankName')}
          </div>

          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="Name as printed in bank passbook"
              {...formik.getFieldProps('bankDetails.accountName')}
              style={getInputFieldStyle(formik, 'bankDetails.accountName')}
            />
            {getFieldError(formik, 'bankDetails.accountName')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                className="form-control"
                disabled={isViewMode}
                placeholder="987654321012"
                {...formik.getFieldProps('bankDetails.accountNumber')}
                style={getInputFieldStyle(formik, 'bankDetails.accountNumber')}
              />
              {getFieldError(formik, 'bankDetails.accountNumber')}
            </div>

            <div className="form-group">
              <label>IFSC / SWIFT Code</label>
              <input
                type="text"
                className="form-control"
                disabled={isViewMode}
                placeholder="SBIN0001234"
                {...formik.getFieldProps('bankDetails.ifscCode')}
                style={getInputFieldStyle(formik, 'bankDetails.ifscCode')}
              />
              {getFieldError(formik, 'bankDetails.ifscCode')}
            </div>
          </div>

          <div className="form-group">
            <label>Branch Name</label>
            <input
              type="text"
              className="form-control"
              disabled={isViewMode}
              placeholder="e.g. Main Branch, Fort Mumbai"
              {...formik.getFieldProps('bankDetails.branch')}
              style={getInputFieldStyle(formik, 'bankDetails.branch')}
            />
            {getFieldError(formik, 'bankDetails.branch')}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Bank Proof (Cancelled Cheque / Passbook)</label>
            {renderUploadPreview({
              preview: formik.values.bankPreview,
              fileInputId: 'bankFileAdd',
              fileKey: 'bankFile',
              previewKey: 'bankPreview',
              customStyle: { height: '80px' },
              isViewMode,
              isDragging,
              setIsDragging,
              handleDrop,
              handleNestedFileChange
            })}
            <input 
              id="bankFileAdd" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*,application/pdf,.doc,.docx"
              onChange={(e) => handleNestedFileChange(e, 'bankFile', 'bankPreview')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Compliance;
