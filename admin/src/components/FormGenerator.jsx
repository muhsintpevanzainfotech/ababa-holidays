import React, { useState, useEffect } from 'react';
import TagInput from './TagInput';
import MapPicker from './MapPicker';
import FormSelect from './FormSelect';
import api from '../utils/api';
import { 
  Upload, 
  X, 
  Search, 
  Image as ImageIcon,
  FileText,
  Video,
  File,
  Eye,
  EyeOff,
  Star,
  List,
  MapPin
} from 'lucide-react';

const FormGenerator = ({ fields, values, onChange, errors }) => {
  const [showPassword, setShowPassword] = useState({});
  const [dependentOptions, setDependentOptions] = useState({});

  useEffect(() => {
    // Handle dependent fields initial load and changes
    fields.forEach(field => {
      if (field.config?.dependsOn && values[field.config.dependsOn]) {
        fetchDependentOptions(field, values[field.config.dependsOn]);
      }
    });
  }, [fields, values]);

  const fetchDependentOptions = async (field, dependentValue) => {
    if (!field.config?.api) return;
    try {
      const endpoint = field.config.api.replace(':value', dependentValue);
      const res = await api.get(endpoint);
      setDependentOptions(prev => ({
        ...prev,
        [field.fieldName]: res.data.data
      }));
    } catch (err) {
      console.error(`Failed to fetch options for ${field.fieldName}:`, err);
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', margin: 0 }}>Form fields not available.</p>
      </div>
    );
  }

  const handleFieldChange = (fieldName, value) => {
    onChange({ ...values, [fieldName]: value });
  };

  const renderField = (field) => {
    const { 
      fieldType, 
      label, 
      fieldName, 
      isRequired, 
      secondaryLabel, 
      config = {} 
    } = field;
    
    const value = values[fieldName] !== undefined ? values[fieldName] : (config.multiple ? [] : '');
    const error = errors?.[fieldName];

    const commonProps = {
      id: fieldName,
      className: `form-control ${error ? 'is-invalid' : ''}`,
      required: isRequired,
      value: value,
      onChange: (e) => handleFieldChange(fieldName, e.target.value)
    };

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'search':
      case 'number':
      case 'date':
      case 'datetime':
      case 'time':
      case 'month':
      case 'week':
        const inputType = fieldType === 'phone' ? 'tel' : fieldType === 'datetime' ? 'datetime-local' : fieldType;
        return <input type={inputType} {...commonProps} minLength={config.minLength} maxLength={config.maxLength} />;

      case 'password':
        return (
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword[fieldName] ? 'text' : 'password'} 
              {...commonProps} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(p => ({ ...p, [fieldName]: !p[fieldName] }))}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPassword[fieldName] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );

      case 'textarea':
        return <textarea {...commonProps} rows={config.rows || 3} style={{ minHeight: '100px', resize: 'vertical' }} />;

      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)} 
              required={isRequired}
            />
            <span style={{ fontSize: '14px' }}>{label}</span>
          </label>
        );

      case 'radio':
        return (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {config.options?.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name={fieldName} 
                  value={opt.value} 
                  checked={value === opt.value} 
                  onChange={() => handleFieldChange(fieldName, opt.value)} 
                />
                <span style={{ fontSize: '14px' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'switch':
        return (
          <div 
            onClick={() => handleFieldChange(fieldName, !value)}
            style={{ 
              width: '40px', height: '20px', borderRadius: '20px', background: value ? 'var(--primary)' : '#cbd5e1',
              position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{ 
              width: '16px', height: '16px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: '0.3s'
            }} />
          </div>
        );

      case 'select':
        const options = dependentOptions[fieldName] || config.options || [];
        if (config.multiple) {
          return (
            <div className="multi-select-container">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {(Array.isArray(value) ? value : []).map(val => {
                  const opt = options.find(o => o.value === val);
                  return (
                    <div key={val} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px' }}>
                      {opt?.label || val}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFieldChange(fieldName, value.filter(v => v !== val))} />
                    </div>
                  );
                })}
              </div>
              <select className="form-control" value="" onChange={(e) => e.target.value && !value.includes(e.target.value) && handleFieldChange(fieldName, [...value, e.target.value])}>
                <option value="">Select options...</option>
                {options.filter(opt => !value.includes(opt.value)).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <FormSelect
            options={options}
            value={value}
            onChange={(val) => handleFieldChange(fieldName, val)}
            placeholder={`Select ${label}...`}
            required={isRequired}
          />
        );

      case 'feature':
      case 'tag':
        return <TagInput tags={Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : [])} onChange={(tags) => handleFieldChange(fieldName, tags)} allowCustom={config.allowCustom !== false} />;

      case 'editor':
        return (
          <div className="editor-container" style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
            <div className="editor-toolbar" style={{ background: 'var(--bg-main)', padding: '6px 10px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px' }}>
              {['bold', 'italic', 'insertUnorderedList'].map(cmd => (
                <button key={cmd} type="button" onClick={() => document.execCommand(cmd)} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', background: 'white', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cmd === 'insertUnorderedList' ? <List size={14} /> : cmd.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
            <div 
              contentEditable 
              className="editor-content"
              style={{ minHeight: '120px', padding: '12px', outline: 'none', background: 'white', fontSize: '13px', lineHeight: '1.6' }}
              onBlur={(e) => handleFieldChange(fieldName, e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: value || '' }}
            />
          </div>
        );

      case 'rating':
        const ratingVal = Number(value) || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={24} 
                onClick={() => handleFieldChange(fieldName, star)} 
                style={{ 
                  cursor: 'pointer', 
                  color: star <= ratingVal ? '#f59e0b' : '#cbd5e1',
                  fill: star <= ratingVal ? '#f59e0b' : 'transparent',
                  transition: 'all 0.2s ease'
                }} 
              />
            ))}
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '8px' }}>
              {ratingVal > 0 ? `${ratingVal} / 5 Stars` : 'Rate'}
            </span>
          </div>
        );

      case 'map':
      case 'location':
        return <MapPicker lat={value?.lat} lng={value?.lng} onChange={(pos) => handleFieldChange(fieldName, pos)} />;

      case 'upload':
        const files = Array.isArray(value) ? value : [];
        return (
          <div className="file-upload-wrapper">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <FileText size={20} />
                    <span style={{ fontSize: '8px', display: 'block' }}>{file.name || 'File'}</span>
                  </div>
                  <button type="button" onClick={() => handleFieldChange(fieldName, files.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.8)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', padding: '2px' }}><X size={10} /></button>
                </div>
              ))}
              {(!config.maxFiles || files.length < config.maxFiles) && (
                <div onClick={() => document.getElementById(`upload-${fieldName}`).click()} style={{ width: '70px', height: '70px', borderRadius: '8px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Upload size={16} /><span style={{ fontSize: '9px', marginTop: '4px' }}>Upload</span>
                  <input type="file" id={`upload-${fieldName}`} hidden multiple={config.maxFiles > 1} accept={config.accept?.map(a => a === 'image' ? 'image/*' : a === 'video' ? 'video/*' : 'application/pdf').join(',')} onChange={(e) => handleFieldChange(fieldName, [...files, ...Array.from(e.target.files)])} />
                </div>
              )}
            </div>
          </div>
        );

      case 'section_header':
        return (
          <div className="bootstrap-section-header" style={{ gridColumn: 'span 2', textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '8px' }}>
              <div style={{ height: '1px', width: '40px', background: 'var(--primary)', opacity: 0.8 }}></div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                color: '#37517e', 
                margin: 0,
                letterSpacing: '2px',
                fontFamily: '"Poppins", sans-serif'
              }}>
                {label}
              </h2>
              <div style={{ height: '1px', width: '40px', background: 'var(--primary)', opacity: 0.8 }}></div>
            </div>
            {secondaryLabel && (
              <p style={{ 
                color: '#444444', 
                fontSize: '14px', 
                maxWidth: '700px', 
                margin: '0 auto',
                fontWeight: '500',
                lineHeight: '1.6'
              }}>
                {secondaryLabel}
              </p>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="dynamic-form-section">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px', width: '100%' }}>
        {(() => {
          const sortedFields = [...fields].sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 0;
            const orderB = b.order !== undefined ? b.order : 0;
            return orderA - orderB;
          });
          return sortedFields.map((field, idx) => {
            const isFirstOfSet = field.setTitle && (idx === 0 || sortedFields[idx - 1].setTitle !== field.setTitle || sortedFields[idx - 1].setId !== field.setId);
            const defaultSpan = (field.fieldType === 'textarea' || field.fieldType === 'editor' || field.fieldType === 'map' || field.fieldType === 'upload' || field.fieldType === 'section_header') ? 12 : 6;
            const colSpan = field.colLg || field.colSpan || field.col_lg || field.attributes?.colLg || field.config?.colLg || defaultSpan;

            return (
              <React.Fragment key={field._id || field.fieldName || idx}>
                {isFirstOfSet && (
                  <div style={{ gridColumn: 'span 12 / span 12', marginTop: idx === 0 ? '0' : '24px', marginBottom: '16px' }}>
                    <div style={{
                      background: 'rgba(var(--primary-rgb), 0.08)',
                      border: '1px solid rgba(var(--primary-rgb), 0.25)',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📁</span> {field.setTitle}
                      </h4>
                      <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', padding: '2px 10px', borderRadius: '20px' }}>
                        Section Setup
                      </span>
                    </div>
                  </div>
                )}
                <div className="form-group" style={{ 
                  gridColumn: field.fieldType === 'section_header' ? 'span 12 / span 12' : `span ${colSpan} / span ${colSpan}`,
                  marginBottom: field.fieldType === 'section_header' ? '0' : '20px'
                }}>
                  {field.fieldType !== 'section_header' && (
                    <label htmlFor={field.fieldName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>
                        {field.label} {field.isRequired && <span style={{ color: '#dc2626' }}>*</span>}
                      </span>
                      {field.secondaryLabel && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>{field.secondaryLabel}</span>}
                    </label>
                  )}
                  {renderField(field)}
                  {errors?.[field.fieldName] && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors[field.fieldName]}</div>}
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default FormGenerator;
