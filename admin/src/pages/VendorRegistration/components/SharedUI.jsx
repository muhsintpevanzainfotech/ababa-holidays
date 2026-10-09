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

  const onDropHandler = (e) => {
    e.preventDefault();
    if (setIsDragging) setIsDragging(null);
    if (handleDrop) {
      handleDrop(e, fileKey, previewKey, callback);
    } else if (handleNestedFileChange) {
      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile) {
        handleNestedFileChange({ target: { files: [droppedFile] } }, fileKey, previewKey);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (handleNestedFileChange) {
      handleNestedFileChange({ target: { files: [] } }, fileKey, previewKey);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (setIsDragging) setIsDragging(fileInputId); }}
      onDragLeave={() => { if (setIsDragging) setIsDragging(null); }}
      onDrop={onDropHandler}
      onClick={() => !isViewMode && document.getElementById(fileInputId)?.click()}
      style={{
        width: '100%', height: '110px', position: 'relative', overflow: 'hidden', borderRadius: '14px',
        borderWidth: '2px', borderStyle: 'dashed', borderColor: isThisDragging ? 'var(--primary)' : (preview ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'),
        background: isThisDragging ? 'rgba(59, 130, 246, 0.08)' : (preview ? 'var(--bg-main)' : 'var(--bg-main)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: isViewMode ? 'default' : 'pointer', transition: 'all 0.3s ease', ...customStyle
      }}
    >
      {preview ? (
        <>
          {(typeof preview === 'string' && (preview.startsWith('data:image/') || preview.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i))) ? (
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} alt="Document Preview" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px', padding: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                <FileText size={28} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textAlign: 'center' }}>
                Document Attached
              </span>
            </div>
          )}
          {!isViewMode && (
            <div
              onClick={handleClear}
              title="Remove File"
              style={{
                position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px',
                borderRadius: '50%', background: '#ef4444', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}
            >
              <X size={12} strokeWidth={3} />
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Choose File or Drag & Drop</p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>PDF, JPG, PNG up to 10MB</p>
        </div>
      )}
    </div>
  );
};
