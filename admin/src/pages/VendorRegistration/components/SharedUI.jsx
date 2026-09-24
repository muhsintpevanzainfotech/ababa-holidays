import React from 'react';
import { FileText, X } from 'lucide-react';

export const renderReviewItem = (label, value) => (
  <div style={{ marginBottom: '20px' }}>
    <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '6px' }}>
      {label}
    </p>
    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', margin: 0, borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
      {value || '—'}
    </p>
  </div>
);

export const getInputFieldStyle = (formik, field) => {
  const parts = field.split('.');
  const isTouched = parts.length > 1 ? formik.touched[parts[0]]?.[parts[1]] : formik.touched[field];
  const hasError = parts.length > 1 ? formik.errors[parts[0]]?.[parts[1]] : formik.errors[field];
  return {
    borderColor: isTouched && hasError ? 'var(--danger)' : 'var(--border)',
    background: isTouched && hasError ? 'rgba(239, 68, 68, 0.02)' : 'var(--bg-card)'
  };
};

export const getFieldError = (formik, field) => {
  const parts = field.split('.');
  const isTouched = parts.length > 1 ? formik.touched[parts[0]]?.[parts[1]] : formik.touched[field];
  const hasError = parts.length > 1 ? formik.errors[parts[0]]?.[parts[1]] : formik.errors[field];
  if (isTouched && hasError) {
    return <p style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>{hasError}</p>;
  }
  return null;
};

export const renderUploadPreview = ({ 
  preview, fileInputId, fileKey, previewKey, customStyle = {}, 
  isViewMode, isDragging, setIsDragging, handleDrop, handleNestedFileChange, callback 
}) => {
  const isThisDragging = isDragging === fileInputId;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(fileInputId); }}
      onDragLeave={() => setIsDragging(null)}
      onDrop={(e) => handleDrop(e, fileKey, previewKey, callback)}
      onClick={() => !isViewMode && document.getElementById(fileInputId).click()}
      style={{
        width: '100%', height: '110px', position: 'relative', overflow: 'hidden', borderRadius: '12px',
        borderWidth: '2px', borderStyle: 'dashed', borderColor: isThisDragging ? 'var(--primary)' : 'var(--border)',
        background: isThisDragging ? 'rgba(var(--primary-rgb), 0.05)' : (preview ? 'none' : '#f8fafc'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: isViewMode ? 'default' : 'pointer', transition: 'all 0.3s ease', ...customStyle
      }}
    >
      {preview ? (
        <>
          {(typeof preview === 'string' && (preview.startsWith('data:image/') || preview.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i))) ? (
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} alt="Doc Preview" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '12px' }}>
              <FileText size={40} color="var(--primary)" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center' }}>Document Loaded</span>
            </div>
          )}
          {!isViewMode && (
            <div
              onClick={(e) => { e.stopPropagation(); handleNestedFileChange({ target: { files: [] } }, fileKey, previewKey); }}
              style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={12} />
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '4px' }}><FileText size={24} style={{ margin: '0 auto' }} /></div>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Drop file or click</p>
        </div>
      )}
    </div>
  );
};
