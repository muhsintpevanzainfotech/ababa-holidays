import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const ImageUpload = ({
  value,
  onChange,
  accept = 'image/*',
  label,
  title = 'Drag & drop image here, or click to browse',
  caption = 'Supports PNG, JPG, WEBP or GIF (max 5MB)',
  multiple = false,
  maxSizeMB = 5,
  disabled = false,
  compact = false,
  height = 'auto'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Helper to get preview URL string
  const getPreviewUrl = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val instanceof File || val instanceof Blob) {
      return URL.createObjectURL(val);
    }
    return null;
  };

  const validateFile = (file) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split('.').pop()}`;
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return type === fileType || type === fileExt;
      });
      if (!isAccepted) {
        return `Invalid file type. Allowed: ${accept}`;
      }
    }
    return null;
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setError('');

    if (multiple) {
      const validFiles = [];
      let errMsgs = [];
      Array.from(files).forEach((file) => {
        const err = validateFile(file);
        if (err) errMsgs.push(`${file.name}: ${err}`);
        else validFiles.push(file);
      });
      if (errMsgs.length > 0) {
        setError(errMsgs.join('; '));
      }
      if (validFiles.length > 0) {
        const currentArr = Array.isArray(value) ? value : [];
        onChange([...currentArr, ...validFiles]);
      }
    } else {
      const singleFile = files[0];
      const err = validateFile(singleFile);
      if (err) {
        setError(err);
        return;
      }
      onChange(singleFile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemove = (e, indexToRemove = null) => {
    e.stopPropagation();
    if (disabled) return;
    setError('');
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, idx) => idx !== indexToRemove);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  const previewUrl = !multiple ? getPreviewUrl(value) : null;
  const multiValues = multiple && Array.isArray(value) ? value : [];

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-main)'
          }}
        >
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Drop Zone Box */}
      {!previewUrl ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: compact ? '110px' : '150px',
            height: height !== 'auto' ? height : 'auto',
            borderRadius: '14px',
            border: `2px dashed ${
              error
                ? '#ef4444'
                : isDragging
                ? 'var(--primary)'
                : 'var(--border)'
            }`,
            backgroundColor: isDragging
              ? 'rgba(53, 133, 142, 0.15)'
              : 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: compact ? '12px' : '24px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isDragging
              ? '0 0 0 4px rgba(53, 133, 142, 0.2)'
              : 'none',
            overflow: 'hidden'
          }}
        >
          {/* Animated Highlight Background on Drag */}
          {isDragging && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at center, rgba(53, 133, 142, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          >
            <div
              style={{
                width: compact ? '40px' : '52px',
                height: compact ? '40px' : '52px',
                borderRadius: '50%',
                backgroundColor: isDragging
                  ? 'rgba(53, 133, 142, 0.25)'
                  : 'rgba(53, 133, 142, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: compact ? '6px' : '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <Upload size={compact ? 20 : 26} />
            </div>

            <p
              style={{
                margin: 0,
                fontSize: compact ? '13px' : '14px',
                fontWeight: '600',
                color: isDragging
                  ? 'var(--primary)'
                  : 'var(--text-main)'
              }}
            >
              {isDragging ? 'Drop file here to upload' : title}
            </p>

            {caption && !compact && (
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}
              >
                {caption}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Single Image Preview Box */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '14px',
            border: `2px dashed ${
              isDragging ? 'var(--primary)' : 'var(--border)'
            }`,
            backgroundColor: isDragging
              ? 'rgba(53, 133, 142, 0.15)'
              : 'var(--bg-card)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
            <div
              style={{
                width: compact ? '54px' : '72px',
                height: compact ? '54px' : '72px',
                borderRadius: '10px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={previewUrl}
                alt="Uploaded preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px'
                }}
              >
                {value instanceof File ? value.name : 'Uploaded Image'}
              </p>
              {value instanceof File && (
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {(value.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                <CheckCircle size={13} /> Ready to submit
              </div>
            </div>
          </div>

          {!disabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Change Image"
              >
                <RefreshCw size={13} /> Change
              </button>

              <button
                type="button"
                onClick={(e) => handleRemove(e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Multiple Files List */}
      {multiple && multiValues.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {multiValues.map((fileItem, idx) => {
            const url = getPreviewUrl(fileItem);
            const name = fileItem instanceof File ? fileItem.name : `Image ${idx + 1}`;
            const size = fileItem instanceof File ? `${(fileItem.size / (1024 * 1024)).toFixed(2)} MB` : '';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  {url ? (
                    <img
                      src={url}
                      alt={name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <ImageIcon size={20} style={{ color: 'var(--primary)' }} />
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {name}
                    </p>
                    {size && (
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                        {size}
                      </p>
                    )}
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, idx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '6px',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
