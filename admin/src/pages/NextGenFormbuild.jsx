import React, { useState, useEffect } from 'react';
import {
  Monitor, Tablet, Smartphone, Eye, Sparkles,
  Maximize2, ArrowLeft, Settings, Layers, Layout,
  Workflow, Zap, Type, Hash, AlignLeft, Mail,
  ChevronDown, Calendar, Plus, MousePointer2, X,
  Trash2, GripVertical, Search, Globe, Shield, Rocket,
  Activity, Command, Cpu, Hexagon, ChevronLeft, ChevronRight,
  RotateCcw, RotateCw, CheckSquare, List, Minus,
  Phone, Link, Lock, Clock, Upload, ToggleLeft,
  AlertCircle, AlertTriangle, Grid, HelpCircle, Info, Columns, Sliders
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './NextGenFormbuild.css';

const SortableLayerItem = ({ field, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 99 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`ai-form-tool-btn ${isDragging ? 'is-dragging' : ''}`}>
      <div className="ai-form-tool-info">
        <Layers size={14} className="ai-form-tool-icon" />
        <span className="ai-form-tool-label">{field.label} ({field.type})</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(field.id);
          }}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          title="Remove Layer"
        >
          <Trash2 size={14} />
        </button>
        <GripVertical size={14} style={{ color: 'var(--ai-text-muted)' }} />
      </div>
    </div>
  );
};

const normalizeField = (field) => {
  let type = field.type || 'text';
  if (type === 'dropdown') type = 'select';
  if (type === 'file') type = 'file upload';

  // Migrate direct attributes if they exist on the root object
  const attributes = field.attributes ? { ...field.attributes } : {};
  const directKeys = [
    'disabled', 'readonly', 'minlength', 'maxlength', 'pattern', 
    'autocomplete', 'min', 'max', 'step', 'accept', 'multiple', 
    'rows', 'cols', 'options', 'checked', 'value',
    'colSm', 'colMd', 'colLg', 'colXl'
  ];
  directKeys.forEach(key => {
    if (field[key] !== undefined && attributes[key] === undefined) {
      attributes[key] = field[key];
    }
  });

  const normalized = {
    id: field.id || `field_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    label: field.label || 'Field Label',
    name: field.name || field.id || `field_${Math.random().toString(36).substr(2, 9)}`,
    placeholder: field.placeholder || '',
    required: !!field.required,
    attributes: attributes
  };

  const attrs = normalized.attributes;
  
  if (attrs.disabled === undefined) attrs.disabled = false;
  if (attrs.readonly === undefined) attrs.readonly = false;
  if (attrs.colSm === undefined) attrs.colSm = 12;
  if (attrs.colMd === undefined) attrs.colMd = 12;
  if (attrs.colLg === undefined) attrs.colLg = 12;
  if (attrs.colXl === undefined) attrs.colXl = 12;

  if (['text', 'email', 'tel', 'url', 'search', 'password', 'textarea'].includes(normalized.type)) {
    if (attrs.minlength === undefined) attrs.minlength = '';
    if (attrs.maxlength === undefined) attrs.maxlength = '';
    if (attrs.pattern === undefined) attrs.pattern = '';
    if (attrs.autocomplete === undefined) attrs.autocomplete = 'off';
  }

  if (['number', 'date', 'datetime-local', 'time', 'month', 'week'].includes(normalized.type)) {
    if (attrs.min === undefined) attrs.min = '';
    if (attrs.max === undefined) attrs.max = '';
    if (attrs.step === undefined) attrs.step = '';
  }

  if (normalized.type === 'file upload') {
    if (attrs.accept === undefined) attrs.accept = '';
    if (attrs.multiple === undefined) attrs.multiple = false;
  }

  if (['select', 'checkbox', 'radio'].includes(normalized.type)) {
    const rawOptions = field.options || attrs.options || ['Option 1', 'Option 2', 'Option 3'];
    attrs.options = rawOptions.map(opt => {
      if (typeof opt === 'object' && opt !== null && opt.label !== undefined) {
        return opt;
      }
      return { label: String(opt), value: String(opt) };
    });
    if (normalized.type === 'select') {
      if (attrs.multiple === undefined) attrs.multiple = false;
    }
  }

  if (normalized.type === 'switch') {
    if (attrs.checked === undefined) attrs.checked = false;
  }

  return normalized;
};

const isValidUrl = (str) => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

const getFieldDefaultValue = (field) => {
  if (!field) return '';
  if (field.type === 'switch') {
    return field.attributes?.checked !== undefined ? !!field.attributes.checked : false;
  }
  if (field.type === 'checkbox') {
    const defaultVal = field.attributes?.value;
    if (defaultVal) {
      return Array.isArray(defaultVal) ? defaultVal : [defaultVal];
    }
    return [];
  }
  if (field.type === 'select') {
    const defaultVal = field.attributes?.value;
    if (defaultVal) {
      return field.attributes?.multiple ? (Array.isArray(defaultVal) ? defaultVal : [defaultVal]) : defaultVal;
    }
    return field.attributes?.multiple ? [] : '';
  }
  return field.attributes?.value !== undefined ? field.attributes.value : '';
};

const validateField = (field, value) => {
  const finalValue = value !== undefined ? value : getFieldDefaultValue(field);

  if (field.required) {
    if (finalValue === undefined || finalValue === null || finalValue === '' || (Array.isArray(finalValue) && finalValue.length === 0)) {
      return `${field.label || 'This field'} is required.`;
    }
  }

  if (finalValue === undefined || finalValue === null || finalValue === '') {
    return null;
  }

  const attrs = field.attributes || {};

  if (attrs.minlength && typeof finalValue === 'string') {
    const minL = parseInt(attrs.minlength, 10);
    if (!isNaN(minL) && finalValue.length < minL) {
      return `Must be at least ${minL} characters.`;
    }
  }

  if (attrs.maxlength && typeof finalValue === 'string') {
    const maxL = parseInt(attrs.maxlength, 10);
    if (!isNaN(maxL) && finalValue.length > maxL) {
      return `Must be no more than ${maxL} characters.`;
    }
  }

  if (attrs.pattern && typeof finalValue === 'string') {
    try {
      const regex = new RegExp(`^(?:${attrs.pattern})$`);
      if (!regex.test(finalValue)) {
        return `Value does not match the required pattern.`;
      }
    } catch (_) {}
  }

  if (attrs.min !== undefined && attrs.min !== '') {
    if (field.type === 'number') {
      const numVal = parseFloat(finalValue);
      const minVal = parseFloat(attrs.min);
      if (!isNaN(numVal) && !isNaN(minVal) && numVal < minVal) {
        return `Value must be at least ${minVal}.`;
      }
    } else if (['date', 'datetime-local', 'time', 'month', 'week'].includes(field.type)) {
      if (finalValue < attrs.min) {
        return `Value must be on or after ${attrs.min}.`;
      }
    }
  }

  if (attrs.max !== undefined && attrs.max !== '') {
    if (field.type === 'number') {
      const numVal = parseFloat(finalValue);
      const maxVal = parseFloat(attrs.max);
      if (!isNaN(numVal) && !isNaN(maxVal) && numVal > maxVal) {
        return `Value must be no more than ${maxVal}.`;
      }
    } else if (['date', 'datetime-local', 'time', 'month', 'week'].includes(field.type)) {
      if (finalValue > attrs.max) {
        return `Value must be on or before ${attrs.max}.`;
      }
    }
  }

  return null;
};

const renderInputField = (field, value, onChange) => {
  const inputStyle = {
    width: '100%',
    padding: '12px 18px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.25s ease',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'search':
    case 'password': {
      const activeValue = value !== undefined ? value : (field.attributes?.value || '');
      return (
        <div style={{ width: '100%' }}>
          <input
            type={field.type}
            style={inputStyle}
            placeholder={field.placeholder}
            value={activeValue}
            onChange={(e) => onChange(field.id, e.target.value)}
            disabled={field.attributes?.disabled}
            readOnly={field.attributes?.readonly}
            minLength={field.attributes?.minlength || undefined}
            maxLength={field.attributes?.maxlength || undefined}
            pattern={field.attributes?.pattern || undefined}
            autoComplete={field.attributes?.autocomplete}
            onClick={(e) => e.stopPropagation()}
          />
          {field.type === 'url' && isValidUrl(activeValue) && (
            <div style={{ marginTop: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', fontSize: '11px', color: 'var(--ai-text-muted)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                Live URL Preview: {activeValue}
              </div>
              <iframe
                src={activeValue}
                style={{ width: '100%', height: '200px', border: 'none', backgroundColor: '#fff' }}
                title="URL Preview"
              />
            </div>
          )}
        </div>
      );
    }
    case 'number':
    case 'date':
    case 'datetime-local':
    case 'time':
    case 'month':
    case 'week': {
      const activeValue = value !== undefined ? value : (field.attributes?.value || '');
      return (
        <input
          type={field.type}
          style={inputStyle}
          placeholder={field.placeholder}
          value={activeValue}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={field.attributes?.disabled}
          readOnly={field.attributes?.readonly}
          min={field.attributes?.min || undefined}
          max={field.attributes?.max || undefined}
          step={field.attributes?.step || undefined}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    case 'textarea': {
      const activeValue = value !== undefined ? value : (field.attributes?.value || '');
      return (
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          placeholder={field.placeholder}
          value={activeValue}
          disabled={field.attributes?.disabled}
          readOnly={field.attributes?.readonly}
          minLength={field.attributes?.minlength || undefined}
          maxLength={field.attributes?.maxlength || undefined}
          rows={field.attributes?.rows || 4}
          cols={field.attributes?.cols || 50}
          onChange={(e) => onChange(field.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    case 'file upload':
      return (
        <div style={{ width: '100%' }}>
          <input
            type="file"
            style={inputStyle}
            onChange={(e) => {
              const files = Array.from(e.target.files).map(f => f.name);
              onChange(field.id, field.attributes?.multiple ? files : files[0]);
            }}
            disabled={field.attributes?.disabled}
            accept={field.attributes?.accept || undefined}
            multiple={field.attributes?.multiple}
            onClick={(e) => e.stopPropagation()}
          />
          {value && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
              Selected: {Array.isArray(value) ? value.join(', ') : value}
            </div>
          )}
        </div>
      );
    case 'checkbox': {
      const defaultVal = field.attributes?.value;
      const resolvedDefault = defaultVal ? (Array.isArray(defaultVal) ? defaultVal : [defaultVal]) : [];
      const currentValues = Array.isArray(value) ? value : (value !== undefined ? [value] : resolvedDefault);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          {(field.attributes?.options || [{ label: 'Option 1', value: 'Option 1' }]).map((opt, idx) => {
            const isChecked = currentValues.includes(opt.value);
            return (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: field.attributes?.disabled ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: field.attributes?.disabled ? 0.5 : 1 }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={field.attributes?.disabled}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...currentValues, opt.value]
                      : currentValues.filter(v => v !== opt.value);
                    onChange(field.id, newValues);
                  }}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--ai-neon-purple)' }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }
    case 'radio': {
      const activeValue = value !== undefined ? value : (field.attributes?.value || '');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          {(field.attributes?.options || [{ label: 'Option 1', value: 'Option 1' }]).map((opt, idx) => (
            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: field.attributes?.disabled ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: field.attributes?.disabled ? 0.5 : 1 }}>
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={activeValue === opt.value}
                disabled={field.attributes?.disabled}
                onChange={(e) => onChange(field.id, e.target.value)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--ai-neon-purple)' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    case 'select': {
      const defaultVal = field.attributes?.value;
      const selectVal = value !== undefined ? value : (defaultVal || (field.attributes?.multiple ? [] : ''));
      const activeValue = field.attributes?.multiple ? (Array.isArray(selectVal) ? selectVal : [selectVal].filter(Boolean)) : selectVal;
      return (
        <select
          style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}
          value={activeValue}
          multiple={field.attributes?.multiple}
          disabled={field.attributes?.disabled}
          onChange={(e) => {
            if (field.attributes?.multiple) {
              const opts = Array.from(e.target.selectedOptions).map(o => o.value);
              onChange(field.id, opts);
            } else {
              onChange(field.id, e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!field.attributes?.multiple && (
            <option value="" style={{ backgroundColor: '#1e1b29', color: 'rgba(255,255,255,0.4)' }}>
              {field.placeholder || 'Select an option'}
            </option>
          )}
          {(field.attributes?.options || [{ label: 'Option 1', value: 'Option 1' }]).map((opt, idx) => (
            <option key={idx} value={opt.value} style={{ backgroundColor: '#1e1b29', color: '#fff' }}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    case 'switch': {
      const activeValue = value !== undefined ? value : !!field.attributes?.checked;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={field.attributes?.disabled}
            onClick={() => {
              if (field.attributes?.disabled) return;
              onChange(field.id, !activeValue);
            }}
            style={{
              background: activeValue ? 'var(--ai-neon-purple)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '9999px',
              width: '44px',
              height: '24px',
              position: 'relative',
              cursor: field.attributes?.disabled ? 'not-allowed' : 'pointer',
              opacity: field.attributes?.disabled ? 0.5 : 1,
              transition: 'background-color 0.2s',
              padding: 0
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: activeValue ? '23px' : '3px',
              transition: 'left 0.2s'
            }} />
          </button>
          <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
            {activeValue ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    }
    default:
      return null;
  }
};

const getFieldIcon = (type) => {
  switch (type) {
    case 'text': return <Type size={16} />;
    case 'number': return <Hash size={16} />;
    case 'textarea': return <AlignLeft size={16} />;
    case 'email': return <Mail size={16} />;
    case 'password': return <Lock size={16} />;
    case 'tel': return <Phone size={16} />;
    case 'url': return <Link size={16} />;
    case 'search': return <Search size={16} />;
    case 'date': return <Calendar size={16} />;
    case 'datetime-local': return <Calendar size={16} />;
    case 'time': return <Clock size={16} />;
    case 'month': return <Calendar size={16} />;
    case 'week': return <Calendar size={16} />;
    case 'select':
    case 'dropdown': return <ChevronDown size={16} />;
    case 'checkbox': return <CheckSquare size={16} />;
    case 'radio': return <List size={16} />;
    case 'switch': return <ToggleLeft size={16} />;
    case 'file upload': return <Upload size={16} />;
    default: return <Type size={16} />;
  }
};

const SortableCanvasItem = ({
  field,
  selectedFieldId,
  isPreviewMode,
  setSelectedFieldId,
  onRemove,
  formData = {},
  handleFieldChange,
  selectedFieldIds = [],
  handleSelectForGroup,
  isInsideGroup = false,
  errors = {},
  deviceMode = 'desktop'
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id, disabled: isPreviewMode });
  const isFullWidth = ['textarea', 'file upload', 'url', 'editor'].includes(field.type);
  
  const getColSpan = () => {
    const attrs = field.attributes || {};
    if (deviceMode === 'mobile') return attrs.colSm || 12;
    if (deviceMode === 'tablet') return attrs.colMd || (attrs.colLg ? Math.min(12, attrs.colLg * 2) : 12);
    return attrs.colLg || attrs.colXl || 12;
  };

  const colSpan = getColSpan();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 99 : 1,
    gridColumn: `span ${colSpan} / span ${colSpan}`
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isPreviewMode && setSelectedFieldId(field.id)}
      className={`ai-form-field-card ${selectedFieldId === field.id && !isPreviewMode ? 'selected' : ''} ${isPreviewMode ? 'preview' : ''} ${isFullWidth ? 'full-width' : ''}`}
    >
      <div className="ai-form-field-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isPreviewMode && (
            <input
              type="checkbox"
              checked={selectedFieldIds.includes(field.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectForGroup(field.id);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '15px',
                height: '15px',
                accentColor: 'var(--ai-neon-purple)',
                cursor: 'pointer'
              }}
              title="Select field for grouping"
            />
          )}
          <div 
            className="ai-form-field-type" 
            {...attributes} 
            {...listeners} 
            style={{ cursor: isPreviewMode ? 'default' : (isDragging ? 'grabbing' : 'grab'), display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div className="ai-form-field-icon">
              {getFieldIcon(field.type)}
            </div>
            <span className="ai-form-field-type-name">{field.type.toUpperCase()}</span>
          </div>
        </div>
        {!isPreviewMode && (
          <div className="ai-form-field-actions">
            <button className="ai-form-field-action-btn" {...attributes} {...listeners} style={{ cursor: 'grab' }}><GripVertical size={16} /></button>
            <button
              className="ai-form-field-action-btn delete"
              onPointerDown={(e) => {
                e.stopPropagation();
                onRemove(field.id);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <h4 className="ai-form-field-label">
        {field.label.toUpperCase()}
        {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </h4>
      <div className="ai-form-field-input-container">
        {renderInputField(field, formData[field.id], handleFieldChange)}
      </div>
      {errors[field.id] && (
        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }} className="field-error-label">
          <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          {errors[field.id]}
        </div>
      )}
    </div>
  );
};

const SortableGroupItem = ({
  group,
  fields,
  selectedFieldId,
  isPreviewMode,
  setSelectedFieldId,
  onRemoveField,
  onUngroup,
  onSaveTemplate,
  formData = {},
  handleFieldChange,
  selectedFieldIds = [],
  handleSelectForGroup,
  errors = {},
  deviceMode = 'desktop'
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, disabled: isPreviewMode });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 99 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ai-form-group-container ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="ai-form-group-header">
        <div 
          className="ai-form-group-header-info" 
          {...attributes} 
          {...listeners} 
          style={{ cursor: isPreviewMode ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ai-neon-purple)',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <Layers size={18} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
            <div className="ai-form-group-title-row">
              <span className="ai-form-group-title">
                {group.title}
              </span>
              <div className="ai-form-group-badge">
                <Workflow size={11} />
                <span>Section Setup</span>
              </div>
            </div>
            {group.description && (
              <p className="ai-form-group-desc">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {!isPreviewMode && (
          <div className="ai-form-group-actions">
            <button
              onClick={() => onSaveTemplate(group)}
              className="ai-form-group-btn-save"
              title="Save Group as Reusable Template"
            >
              Save Template
            </button>
            <button
              onClick={() => onUngroup(group.id)}
              className="ai-form-group-btn-ungroup"
              title="Ungroup (Keep fields)"
            >
              Ungroup
            </button>
          </div>
        )}
      </div>

      <div className="ai-form-group-body">
        <SortableContext items={group.fields} strategy={verticalListSortingStrategy}>
          {group.fields.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--ai-text-muted)' }}>
              No fields in this group. Drop elements here.
            </div>
          ) : (
            group.fields.map((fieldId) => {
              const field = fields.find(f => f.id === fieldId);
              if (!field) return null;
              return (
                <SortableCanvasItem
                  key={field.id}
                  field={field}
                  selectedFieldId={selectedFieldId}
                  isPreviewMode={isPreviewMode}
                  setSelectedFieldId={setSelectedFieldId}
                  onRemove={() => onRemoveField(field.id)}
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                  selectedFieldIds={selectedFieldIds}
                  handleSelectForGroup={handleSelectForGroup}
                  isInsideGroup={true}
                  errors={errors}
                  deviceMode={deviceMode}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
};

const NextGenFormbuild = () => {
  const [activeView, setActiveView] = useState('desktop');
  const [activeSection, setActiveSection] = useState('assets');
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem('nextgen_form_schema');
    if (saved) {
      const parsed = JSON.parse(saved);
      return (parsed.fields || []).map(normalizeField);
    }
    return [];
  });
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('nextgen_form_schema');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.groups || [];
    }
    return [];
  });
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('nextgen_form_schema');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.layout) return parsed.layout;
      const groupedFieldIds = new Set((parsed.groups || []).flatMap(g => g.fields || []));
      const groupIds = (parsed.groups || []).map(g => g.id);
      const ungroupedFieldIds = (parsed.fields || []).filter(f => !groupedFieldIds.has(f.id)).map(f => f.id);
      return [...groupIds, ...ungroupedFieldIds];
    }
    return [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('nextgen_form_schema');
    if (saved) {
      const parsed = JSON.parse(saved);
      const initialFields = (parsed.fields || []).map(normalizeField);
      const initialGroups = parsed.groups || [];
      const initialLayout = parsed.layout || (() => {
        const groupedFieldIds = new Set(initialGroups.flatMap(g => g.fields || []));
        const groupIds = initialGroups.map(g => g.id);
        const ungroupedFieldIds = initialFields.filter(f => !groupedFieldIds.has(f.id)).map(f => f.id);
        return [...groupIds, ...ungroupedFieldIds];
      })();
      return [{ fields: initialFields, groups: initialGroups, layout: initialLayout }];
    }
    return [{ fields: [], groups: [], layout: [] }];
  });
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'system', text: 'How can I help you architect this form today?' }]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [inspectorTab, setInspectorTab] = useState('general');
  const containerRef = React.useRef(null);

  const handleInjectPresetForm = (presetType) => {
    let presetName = '';
    let presetFieldsData = [];

    if (presetType === 'passenger') {
      presetName = 'Passenger Information';
      presetFieldsData = [
        { type: 'text', label: 'Full Passenger Name', required: true, placeholder: 'e.g. John Doe' },
        { type: 'text', label: 'Passport Number', required: true, placeholder: 'e.g. A12345678' },
        { type: 'date', label: 'Date of Birth', required: true },
        { type: 'select', label: 'Gender', required: true, attributes: { options: [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }] } },
        { type: 'text', label: 'Nationality', required: false, placeholder: 'e.g. Indian' }
      ];
    } else if (presetType === 'contact') {
      presetName = 'Contact & Communication';
      presetFieldsData = [
        { type: 'email', label: 'Primary Email Address', required: true, placeholder: 'name@domain.com' },
        { type: 'tel', label: 'Mobile Contact Number', required: true, placeholder: '+91 98765 43210' },
        { type: 'tel', label: 'Emergency Contact Number', required: false, placeholder: 'Alternative contact' },
        { type: 'textarea', label: 'Residential Address', required: false, placeholder: 'Street address...' }
      ];
    } else if (presetType === 'payment') {
      presetName = 'Billing & Payment Details';
      presetFieldsData = [
        { type: 'text', label: 'Billing Recipient Name', required: true, placeholder: 'Full Name' },
        { type: 'text', label: 'GST / Tax ID Number', required: false, placeholder: 'Optional tax registration' },
        { type: 'select', label: 'Preferred Payment Method', required: true, attributes: { options: [{ label: 'UPI / QR', value: 'UPI' }, { label: 'Credit/Debit Card', value: 'Card' }, { label: 'Net Banking', value: 'NetBanking' }] } }
      ];
    } else if (presetType === 'vendor_bank') {
      presetName = 'Vendor Bank Details';
      presetFieldsData = [
        { type: 'text', label: 'Account Holder Name', required: true, placeholder: 'e.g. Acme Travels Pvt Ltd' },
        { type: 'text', label: 'Bank Name', required: true, placeholder: 'e.g. State Bank of India' },
        { type: 'text', label: 'Account Number', required: true, placeholder: 'e.g. 123456789012' },
        { type: 'text', label: 'IFSC / SWIFT Code', required: true, placeholder: 'e.g. SBIN0001234' },
        { type: 'text', label: 'Branch Name', required: false, placeholder: 'e.g. Main Branch' },
        { type: 'text', label: 'VPA / UPI ID', required: false, placeholder: 'e.g. vendor@upi' },
        { type: 'file upload', label: 'Bank Proof (Cancelled Cheque / Passbook)', required: false, attributes: { accept: '.pdf,.png,.jpg,.jpeg' } }
      ];
    }

    if (presetFieldsData.length > 0) {
      const newFieldIds = [];
      const newFieldsToAdd = presetFieldsData.map(pd => {
        const newId = `field_${Math.random().toString(36).substr(2, 9)}`;
        newFieldIds.push(newId);
        return normalizeField({
          id: newId,
          type: pd.type,
          label: pd.label,
          placeholder: pd.placeholder || '',
          required: pd.required || false,
          attributes: pd.attributes || {}
        });
      });

      const newGroupId = `group_${Math.random().toString(36).substr(2, 9)}`;
      const newGroup = {
        id: newGroupId,
        title: presetName,
        description: 'Preset form section',
        fields: newFieldIds
      };

      const newFields = [...fields, ...newFieldsToAdd];
      const newGroups = [...groups, newGroup];
      const newLayout = [...layout, newGroupId];
      updateState(newFields, newGroups, newLayout);
      showAlert("Preset Injected", `"${presetName}" section added to form canvas!`, "success");
    }
  };

  // Custom Alert & Prompt Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', // 'info', 'success', 'warning', 'error', 'confirm', 'prompt'
    title: '',
    message: '',
    defaultValue: '',
    onConfirm: null
  });
  const [promptInput, setPromptInput] = useState('');

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setModalConfig({ isOpen: true, type, title, message, defaultValue: '', onConfirm });
  };

  const showConfirm = (title, message, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, defaultValue: '', onConfirm });
  };

  const showPrompt = (title, message, defaultValue, onConfirm) => {
    setPromptInput(defaultValue || '');
    setModalConfig({ isOpen: true, type: 'prompt', title, message, defaultValue, onConfirm });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Reusable templates state
  const [groupTemplates, setGroupTemplates] = useState(() => {
    const saved = localStorage.getItem('nextgen_group_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { customId } = useParams();

  const [serviceTitle, setServiceTitle] = useState(location.state?.serviceTitle || 'Loading Service...');
  const [serviceId, setServiceId] = useState(customId || location.state?.serviceId || 'SERVICE');
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchServiceSchema = async () => {
      const activeId = customId || location.state?.serviceId;
      if (!activeId) {
        setLoadingService(false);
        return;
      }

      try {
        setLoadingService(true);
        const res = await api.get(`/package-fields/setup/${activeId}`);
        if (res.data.success) {
          if (res.data.service) {
            setServiceTitle(res.data.service.title || 'Service Form Builder');
            setServiceId(res.data.service.customId || res.data.service._id);

            const schema = res.data.service.formSchema;
            if (schema && schema.fields && schema.fields.length > 0) {
              const loadedFields = schema.fields.map(normalizeField);
              const loadedGroups = schema.groups || [];
              const loadedLayout = schema.layout || loadedFields.map(f => f.id);

              setFields(loadedFields);
              setGroups(loadedGroups);
              setLayout(loadedLayout);
              setHistory([{ fields: loadedFields, groups: loadedGroups, layout: loadedLayout }]);
              setHistoryIndex(0);
              localStorage.setItem('nextgen_form_schema', JSON.stringify({
                fields: loadedFields,
                groups: loadedGroups,
                layout: loadedLayout
              }));
              return;
            }
          }

          if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const mappedFields = res.data.data.map((pf, idx) => normalizeField({
              id: pf.fieldName || `field_${idx}`,
              type: pf.fieldType === 'upload' ? 'file upload' : pf.fieldType,
              label: pf.label,
              placeholder: pf.config?.placeholder || '',
              required: pf.isRequired,
              attributes: {
                options: pf.config?.options || [],
                min: pf.config?.min,
                max: pf.config?.max,
                minlength: pf.config?.minlength,
                maxlength: pf.config?.maxlength,
                accept: pf.config?.accept,
                multiple: pf.config?.multiple
              }
            }));
            const mappedLayout = mappedFields.map(f => f.id);

            setFields(mappedFields);
            setGroups([]);
            setLayout(mappedLayout);
            setHistory([{ fields: mappedFields, groups: [], layout: mappedLayout }]);
            setHistoryIndex(0);
            localStorage.setItem('nextgen_form_schema', JSON.stringify({
              fields: mappedFields,
              groups: [],
              layout: mappedLayout
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load service custom fields:", err);
      } finally {
        setLoadingService(false);
      }
    };

    fetchServiceSchema();
  }, [customId]);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const updateState = (newFields, newGroups, newLayout, saveHistory = true) => {
    if (saveHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ fields: newFields, groups: newGroups, layout: newLayout });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      const newHistory = [...history];
      newHistory[historyIndex] = { fields: newFields, groups: newGroups, layout: newLayout };
      setHistory(newHistory);
    }
    setFields(newFields);
    setGroups(newGroups);
    setLayout(newLayout);

    // Save schema to localStorage so external /preview route gets it immediately
    localStorage.setItem('nextgen_form_schema', JSON.stringify({
      fields: newFields,
      groups: newGroups,
      layout: newLayout,
      serviceTitle
    }));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setFields(prev.fields);
      setGroups(prev.groups);
      setLayout(prev.layout);
      localStorage.setItem('nextgen_form_schema', JSON.stringify(prev));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setFields(next.fields);
      setGroups(next.groups);
      setLayout(next.layout);
      localStorage.setItem('nextgen_form_schema', JSON.stringify(next));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const handleSaveToBackend = async () => {
    const targetId = customId || serviceId;
    if (!targetId) {
      showAlert("Save Error", "No service target specified for saving.", "error");
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.post(`/package-fields/setup/${targetId}`, {
        fields,
        groups,
        layout
      });

      if (res.data.success) {
        showAlert(
          "Cloud Save Complete",
          `Service: ${serviceTitle} (${targetId})\nStatus: ${fields.length} field(s) & ${groups.length} group(s) saved directly to database.`,
          "success"
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      showAlert("Save Failed", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSaveToBackend();
    showAlert(
      "Form Published & Activated Live",
      `All package forms for "${serviceTitle}" are now synchronized with this Next-Gen schema.`,
      "success"
    );
  };

  const addField = (type, label) => {
    const newFieldId = `field_${Math.random().toString(36).substr(2, 9)}`;
    const newField = normalizeField({
      id: newFieldId,
      type,
      label,
      placeholder: `Enter ${label}...`,
      required: false
    });
    const newFields = [...fields, newField];
    const newLayout = [...layout, newFieldId];
    updateState(newFields, groups, newLayout);
    setSelectedFieldId(newFieldId);
  };

  const updateField = (id, updates, saveHistory = true) => {
    const newFields = fields.map(f => f.id === id ? { ...f, ...updates } : f);
    updateState(newFields, groups, layout, saveHistory);
  };

  const handleRemoveField = (id) => {
    const newFields = fields.filter(f => f.id !== id);
    const newGroups = groups.map(g => ({
      ...g,
      fields: g.fields.filter(fieldId => fieldId !== id)
    })).filter(g => g.fields.length > 0);
    const newLayout = layout.filter(layoutId => layoutId !== id);
    
    updateState(newFields, newGroups, newLayout);
    if (selectedFieldId === id) setSelectedFieldId(null);
    setSelectedFieldIds(prev => prev.filter(fId => fId !== id));
  };

  const handleDuplicate = () => {
    if (!selectedField) return;
    const newId = `field_${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedField = {
      ...selectedField,
      id: newId,
      label: `${selectedField.label} (Copy)`
    };

    const newFields = [...fields, duplicatedField];
    let newLayout = [...layout];
    let newGroups = [...groups];

    const rootIndex = layout.indexOf(selectedFieldId);
    if (rootIndex !== -1) {
      newLayout.splice(rootIndex + 1, 0, newId);
    } else {
      newGroups = groups.map(g => {
        if (g.fields.includes(selectedFieldId)) {
          const gIndex = g.fields.indexOf(selectedFieldId);
          const newGroupFields = [...g.fields];
          newGroupFields.splice(gIndex + 1, 0, newId);
          return { ...g, fields: newGroupFields };
        }
        return g;
      });
    }

    updateState(newFields, newGroups, newLayout);
    setSelectedFieldId(newId);
  };

  const handleSelectForGroup = (fieldId) => {
    setSelectedFieldIds(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleCreateGroup = (title = "New Group") => {
    if (selectedFieldIds.length === 0) return;
    const groupId = `group_${Math.random().toString(36).substr(2, 9)}`;
    const newGroup = {
      id: groupId,
      title,
      description: 'Group collection of fields',
      fields: [...selectedFieldIds]
    };

    let firstIndex = -1;
    let newLayout = [];
    
    layout.forEach((id) => {
      if (selectedFieldIds.includes(id)) {
        if (firstIndex === -1) {
          firstIndex = newLayout.length;
          newLayout.push(groupId);
        }
      } else {
        newLayout.push(id);
      }
    });

    const newGroups = groups.map(g => ({
      ...g,
      fields: g.fields.filter(fid => !selectedFieldIds.includes(fid))
    })).filter(g => g.fields.length > 0);

    newGroups.push(newGroup);
    
    if (firstIndex === -1) {
      newLayout.push(groupId);
    }

    setSelectedFieldIds([]);
    updateState(fields, newGroups, newLayout);
  };

  const handleUngroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupFields = group.fields;
    const newLayout = [];
    layout.forEach(id => {
      if (id === groupId) {
        newLayout.push(...groupFields);
      } else {
        newLayout.push(id);
      }
    });

    const newGroups = groups.filter(g => g.id !== groupId);
    updateState(fields, newGroups, newLayout);
  };

  const handleSaveGroupAsTemplate = (group) => {
    const templateFields = group.fields.map(fieldId => {
      const field = fields.find(f => f.id === fieldId);
      return {
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        attributes: field.attributes
      };
    });

    const newTemplate = {
      id: `tmpl_${Math.random().toString(36).substr(2, 9)}`,
      title: group.title || 'Untitled Group Template',
      description: group.description || 'Saved from builder',
      fields: templateFields
    };

    const newTemplates = [...groupTemplates, newTemplate];
    setGroupTemplates(newTemplates);
    localStorage.setItem('nextgen_group_templates', JSON.stringify(newTemplates));
    showAlert("Template Saved", `Group "${newTemplate.title}" saved as a reusable template!`, "success");
  };

  const handleInjectTemplate = (template) => {
    const newFieldIds = [];
    const newFieldsToAdd = template.fields.map(tf => {
      const newId = `field_${Math.random().toString(36).substr(2, 9)}`;
      newFieldIds.push(newId);
      return normalizeField({
        id: newId,
        type: tf.type,
        label: tf.label,
        placeholder: tf.placeholder,
        required: tf.required || false,
        attributes: tf.attributes
      });
    });

    const newGroupId = `group_${Math.random().toString(36).substr(2, 9)}`;
    const newGroup = {
      id: newGroupId,
      title: template.title,
      description: template.description,
      fields: newFieldIds
    };

    const newFields = [...fields, ...newFieldsToAdd];
    const newGroups = [...groups, newGroup];
    const newLayout = [...layout, newGroupId];

    updateState(newFields, newGroups, newLayout);
  };

  const handleRemoveTemplate = (templateId) => {
    const updated = groupTemplates.filter(t => t.id !== templateId);
    setGroupTemplates(updated);
    localStorage.setItem('nextgen_group_templates', JSON.stringify(updated));
  };

  const handleMoveGroup = (index, direction) => {
    const group = groups[index];
    if (!group) return;
    const layoutIndex = layout.indexOf(group.id);
    if (layoutIndex === -1) return;

    let targetIndex = -1;
    if (direction === 'up') {
      for (let i = layoutIndex - 1; i >= 0; i--) {
        if (groups.some(g => g.id === layout[i])) {
          targetIndex = i;
          break;
        }
      }
    } else {
      for (let i = layoutIndex + 1; i < layout.length; i++) {
        if (groups.some(g => g.id === layout[i])) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1) {
      const newLayout = [...layout];
      const temp = newLayout[layoutIndex];
      newLayout[layoutIndex] = newLayout[targetIndex];
      newLayout[targetIndex] = temp;
      updateState(fields, groups, newLayout);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Live validation
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldId]: error
      }));
    }
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    const userMessage = aiInput;
    const newMessages = [...aiMessages, { role: 'user', text: userMessage }];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiTyping(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a form builder AI. Return JSON only.
Based on the user's request, return a JSON object containing a "fields" array of elements to add.
Structure: { "fields": [ { "type": "text|number|textarea|email|dropdown|checkbox|radio", "label": "Field Label", "placeholder": "Placeholder text" } ] }.
If the user wants to clear the form, return exactly: { "action": "clear" }.
If you cannot fulfill the request, return: { "error": "Reason" }.`
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);

      let aiResponse = "I have updated your protocol as requested.";

      if (parsed.action === 'clear') {
        updateState([], [], []);
        aiResponse = "I have cleared all assets from the canvas.";
      } else if (parsed.fields && parsed.fields.length > 0) {
        const newFieldsToAdd = parsed.fields.map(f => normalizeField({
          id: `field_${Math.random().toString(36).substr(2, 9)}`,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder || `Enter ${f.label}...`,
          required: false
        }));

        const newFields = [...fields, ...newFieldsToAdd];
        const newLayout = [...layout, ...newFieldsToAdd.map(f => f.id)];
        updateState(newFields, groups, newLayout);
        const fieldNames = parsed.fields.map(f => f.label).join(', ');
        aiResponse = `I have added the following protocols: ${fieldNames}.`;
      } else if (parsed.error) {
        aiResponse = parsed.error;
      }

      setAiMessages(prev => [...prev, { role: 'system', text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setAiMessages(prev => [...prev, { role: 'system', text: "Error communicating with Neural Core. Please verify your VITE_OPENAI_API_KEY." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Case 1: Reordering root-level layout
    if (layout.includes(activeId)) {
      const oldIndex = layout.indexOf(activeId);
      const newIndex = layout.indexOf(overId);
      if (newIndex !== -1) {
        const newLayout = arrayMove(layout, oldIndex, newIndex);
        updateState(fields, groups, newLayout);
      }
      return;
    }

    // Case 2: Reordering inside a group
    let groupIndex = -1;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].fields.includes(activeId)) {
        groupIndex = i;
        break;
      }
    }

    if (groupIndex !== -1) {
      const group = groups[groupIndex];
      const oldIndex = group.fields.indexOf(activeId);
      const newIndex = group.fields.indexOf(overId);
      if (newIndex !== -1) {
        const newFields = arrayMove(group.fields, oldIndex, newIndex);
        const newGroups = [...groups];
        newGroups[groupIndex] = { ...group, fields: newFields };
        updateState(fields, newGroups, layout);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div ref={containerRef} className="ai-form-wrapper">
        <div className="ai-form-cursor-glow" style={{ left: 'var(--mouse-x)', top: 'var(--mouse-y)' }} />
        <div className="ai-form-noise-bg" />

        {/* HEADER */}
        <header className="ai-form-header">
          <div className="ai-form-header-left">
            <button className="ai-form-btn-exit" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="ai-form-exit-icon" />
              <span>EXIT</span>
            </button>

            <div className="ai-form-divider" />

            <div className="ai-form-service-info">
              <h2>{serviceTitle}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                <span>ID: <strong>{serviceId}</strong></span>
                <div className="ai-form-telemetry-badge">
                  <Activity size={12} />
                  <span>{fields.length} Fields | {groups.length} Groups | {fields.filter(f => f.required).length} Required</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-form-header-right">
            <div className="ai-form-actions-group">
              {/* Responsive Viewport Switcher */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginRight: '8px' }}>
                {[
                  { id: 'desktop', label: 'Desktop', icon: Monitor },
                  { id: 'tablet', label: 'Tablet', icon: Tablet },
                  { id: 'mobile', label: 'Mobile', icon: Smartphone }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setDeviceMode(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: deviceMode === item.id ? 'var(--ai-neon-purple)' : 'transparent',
                      color: deviceMode === item.id ? '#ffffff' : 'var(--ai-text-muted)',
                      boxShadow: deviceMode === item.id ? '0 2px 10px rgba(168, 85, 247, 0.4)' : 'none'
                    }}
                    title={`Switch to ${item.label} Viewport`}
                  >
                    <item.icon size={14} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                  </button>
                ))}
              </div>

              <button
                className={`ai-form-icon-btn ${historyIndex <= 0 ? 'disabled' : ''}`}
                onClick={handleUndo}
                title="Undo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className={`ai-form-icon-btn ${historyIndex >= history.length - 1 ? 'disabled' : ''}`}
                onClick={handleRedo}
                title="Redo"
              >
                <ChevronRight size={18} />
              </button>
              <button
                className={`ai-form-icon-btn ml-2 ${isPreviewMode ? 'active' : ''}`}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                title="Toggle Canvas Preview"
              >
                <Eye size={18} />
              </button>
              <button
                className="ai-form-icon-btn ml-2"
                onClick={() => {
                  // Save schema to localStorage
                  localStorage.setItem('nextgen_form_schema', JSON.stringify({ fields, groups, layout }));
                  window.open('/preview', '_blank');
                }}
                title="Open Review in New Tab"
              >
                <Rocket size={16} />
              </button>
              <button
                className="ai-form-icon-btn ml-2"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            <button 
              className="ai-form-btn-publish" 
              onClick={handleSaveToBackend} 
              style={{ background: 'none', border: '1px solid rgba(59, 130, 246, 0.4)', color: 'var(--ai-neon-blue)', boxShadow: 'none' }}
              disabled={isSaving}
            >
              <Shield size={15} />
              <span>{isSaving ? 'SAVING...' : 'SAVE CLOUD'}</span>
            </button>

            <button className="ai-form-btn-publish" onClick={handlePublish}>
              <Rocket size={15} />
              <span>PUBLISH</span>
            </button>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="ai-form-main-layout">

          {/* SLIM ICON SIDEBAR */}
          {!isPreviewMode && (
            <aside className="ai-form-sidebar">
              <div className="ai-form-sidebar-top">
                <button
                  className={`ai-form-sidebar-item ${activeSection === 'ai' ? 'active' : ''}`}
                  onClick={() => setActiveSection(activeSection === 'ai' ? null : 'ai')}
                  title="AI Assistant"
                >
                  <Sparkles size={22} />
                </button>
                <button
                  className={`ai-form-sidebar-item ${activeSection === 'assets' ? 'active' : ''}`}
                  onClick={() => setActiveSection(activeSection === 'assets' ? null : 'assets')}
                  title="Design Tools"
                >
                  <Layout size={22} />
                </button>
                <button
                  className={`ai-form-sidebar-item ${activeSection === 'layers' ? 'active' : ''}`}
                  onClick={() => setActiveSection(activeSection === 'layers' ? null : 'layers')}
                  title="Layers"
                >
                  <Layers size={22} />
                </button>
                <button
                  className={`ai-form-sidebar-item ${activeSection === 'groups' ? 'active' : ''}`}
                  onClick={() => setActiveSection(activeSection === 'groups' ? null : 'groups')}
                  title="Group Section"
                >
                  <Workflow size={22} />
                </button>
                <button
                  className={`ai-form-sidebar-item ${activeSection === 'livedata' ? 'active' : ''}`}
                  onClick={() => setActiveSection(activeSection === 'livedata' ? null : 'livedata')}
                  title="Live Data JSON"
                >
                  <Activity size={22} />
                </button>
              </div>
              <button
                className={`ai-form-sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveSection(activeSection === 'settings' ? null : 'settings')}
                title="Settings"
              >
                <Settings size={22} />
              </button>
            </aside>
          )}

          {/* LEFT PANEL */}
          <aside className={`ai-form-assets-panel ${activeSection && !isPreviewMode ? 'open' : 'closed'}`}>

            {activeSection === 'ai' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>AI Assistant</h3>
                    <span>Protocol Generator</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-ai-chat-area ai-form-scrollbar-hide" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`ai-form-chat-message ${msg.role}`} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div className="ai-form-chat-avatar" style={{ width: '32px', height: '32px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: msg.role === 'system' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: msg.role === 'system' ? 'var(--ai-neon-purple)' : '#fff', border: msg.role === 'system' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255,255,255,0.2)' }}>
                        {msg.role === 'system' ? <Sparkles size={14} /> : <Type size={14} />}
                      </div>
                      <div className="ai-form-chat-bubble" style={{ backgroundColor: msg.role === 'user' ? 'var(--ai-neon-purple)' : 'rgba(255, 255, 255, 0.03)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', borderTopLeftRadius: msg.role === 'system' ? '4px' : '16px', borderTopRightRadius: msg.role === 'user' ? '4px' : '16px', fontSize: '13px', lineHeight: '1.6', color: '#fff' }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="ai-form-chat-message system" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div className="ai-form-chat-avatar" style={{ width: '32px', height: '32px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(168, 85, 247, 0.1)', color: 'var(--ai-neon-purple)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <Sparkles size={14} />
                      </div>
                      <div className="ai-form-chat-bubble" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '16px', borderTopLeftRadius: '4px', fontSize: '13px', color: 'var(--ai-text-muted)' }}>
                        Architecting...
                      </div>
                    </div>
                  )}
                </div>
                <div className="ai-form-ai-input-area" style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'var(--ai-bg-deep)' }}>
                  <div className="ai-form-ai-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Describe the form..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                      className="ai-form-ai-input"
                      style={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '16px 48px 16px 20px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button onClick={handleAiSubmit} className="ai-form-ai-send" style={{ position: 'absolute', right: '12px', width: '32px', height: '32px', borderRadius: '10px', backgroundColor: aiInput.trim() ? 'var(--ai-neon-purple)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: aiInput.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                      <Rocket size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'assets' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>Design Tools</h3>
                    <span>Builder Elements</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-search-box">
                  <div className="ai-form-search-input-wrapper">
                    <Search className="ai-form-search-icon" size={14} />
                    <input
                      type="text"
                      placeholder="Search form elements..."
                      value={toolSearchQuery}
                      onChange={(e) => setToolSearchQuery(e.target.value)}
                      className="ai-form-search-input"
                    />
                  </div>
                </div>
                <div className="ai-form-panel-content ai-form-scrollbar-hide">


                  {/* TEXT & INPUTS */}
                  <div className="ai-form-tools-section">
                    <h4>TEXT & INPUT PROTOCOL</h4>
                    <div className="ai-form-tools-grid">
                      {[
                        { id: 'text', label: 'Text Input', icon: Type },
                        { id: 'email', label: 'Email Address', icon: Mail },
                        { id: 'password', label: 'Password Secure', icon: Lock },
                        { id: 'tel', label: 'Telephone', icon: Phone },
                        { id: 'url', label: 'URL Address', icon: Link },
                        { id: 'search', label: 'Search Bar', icon: Search },
                        { id: 'textarea', label: 'Textarea Multi', icon: AlignLeft }
                      ].filter(t => !toolSearchQuery || t.label.toLowerCase().includes(toolSearchQuery.toLowerCase())).map(tool => (
                        <button key={tool.id} onClick={() => addField(tool.id, tool.label)} className="ai-form-tool-btn">
                          <div className="ai-form-tool-info">
                            <tool.icon size={14} className="ai-form-tool-icon" />
                            <span className="ai-form-tool-label">{tool.label}</span>
                          </div>
                          <Plus size={12} className="ai-form-tool-add" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NUMERIC & CHRONO */}
                  <div className="ai-form-tools-section" style={{ marginTop: '16px' }}>
                    <h4>NUMERIC & CHRONO</h4>
                    <div className="ai-form-tools-grid">
                      {[
                        { id: 'number', label: 'Number Field', icon: Hash },
                        { id: 'date', label: 'Date Picker', icon: Calendar },
                        { id: 'datetime-local', label: 'Date & Time', icon: Calendar },
                        { id: 'time', label: 'Time Picker', icon: Clock },
                        { id: 'month', label: 'Month Picker', icon: Calendar },
                        { id: 'week', label: 'Week Picker', icon: Calendar }
                      ].filter(t => !toolSearchQuery || t.label.toLowerCase().includes(toolSearchQuery.toLowerCase())).map(tool => (
                        <button key={tool.id} onClick={() => addField(tool.id, tool.label)} className="ai-form-tool-btn">
                          <div className="ai-form-tool-info">
                            <tool.icon size={14} className="ai-form-tool-icon" />
                            <span className="ai-form-tool-label">{tool.label}</span>
                          </div>
                          <Plus size={12} className="ai-form-tool-add" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SELECTION PROTOCOL */}
                  <div className="ai-form-tools-section" style={{ marginTop: '16px' }}>
                    <h4>SELECTION PROTOCOL</h4>
                    <div className="ai-form-tools-grid">
                      {[
                        { id: 'select', label: 'Select Dropdown', icon: ChevronDown },
                        { id: 'checkbox', label: 'Checkbox Group', icon: CheckSquare },
                        { id: 'radio', label: 'Radio Group', icon: List },
                        { id: 'switch', label: 'Switch Toggle', icon: ToggleLeft }
                      ].filter(t => !toolSearchQuery || t.label.toLowerCase().includes(toolSearchQuery.toLowerCase())).map(tool => (
                        <button key={tool.id} onClick={() => addField(tool.id, tool.label)} className="ai-form-tool-btn">
                          <div className="ai-form-tool-info">
                            <tool.icon size={14} className="ai-form-tool-icon" />
                            <span className="ai-form-tool-label">{tool.label}</span>
                          </div>
                          <Plus size={12} className="ai-form-tool-add" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRANSMISSION */}
                  <div className="ai-form-tools-section" style={{ marginTop: '16px', marginBottom: '24px' }}>
                    <h4>TRANSMISSION</h4>
                    <div className="ai-form-tools-grid">
                      {[
                        { id: 'file upload', label: 'File Upload', icon: Upload }
                      ].filter(t => !toolSearchQuery || t.label.toLowerCase().includes(toolSearchQuery.toLowerCase())).map(tool => (
                        <button key={tool.id} onClick={() => addField(tool.id, tool.label)} className="ai-form-tool-btn">
                          <div className="ai-form-tool-info">
                            <tool.icon size={14} className="ai-form-tool-icon" />
                            <span className="ai-form-tool-label">{tool.label}</span>
                          </div>
                          <Plus size={12} className="ai-form-tool-add" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'layers' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>Layers</h3>
                    <span>Structure Overview</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-panel-content ai-form-scrollbar-hide">
                  {layout.length === 0 ? (
                    <p style={{ color: 'var(--ai-text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No layers yet.</p>
                  ) : (
                    <div className="ai-form-tools-list">
                      {layout.map((id) => {
                        const group = groups.find(g => g.id === id);
                        if (group) {
                          return (
                            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '2px solid rgba(168,85,247,0.3)', paddingLeft: '8px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                                <Workflow size={12} style={{ color: 'var(--ai-neon-purple)' }} />
                                <span>{group.title} (Group)</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '10px' }}>
                                {group.fields.map(fieldId => {
                                  const field = fields.find(f => f.id === fieldId);
                                  if (!field) return null;
                                  return (
                                    <div key={field.id} className="ai-form-tool-btn" style={{ padding: '8px 12px', opacity: 0.85 }}>
                                      <div className="ai-form-tool-info">
                                        <Layers size={12} className="ai-form-tool-icon" />
                                        <span className="ai-form-tool-label" style={{ fontSize: '10px' }}>{field.label}</span>
                                      </div>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        const field = fields.find(f => f.id === id);
                        if (!field) return null;
                        return (
                          <div key={field.id} className="ai-form-tool-btn">
                            <div className="ai-form-tool-info">
                              <Layers size={14} className="ai-form-tool-icon" />
                              <span className="ai-form-tool-label">{field.label} ({field.type})</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'groups' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>Group Section</h3>
                    <span>Manage Form Groups</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-panel-content ai-form-scrollbar-hide" style={{ padding: '20px' }}>
                  
                  {/* Create Group from selection if any */}
                  {selectedFieldIds.length > 0 ? (
                    <div style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.05)',
                      border: '1px dashed var(--ai-neon-purple)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>Create New Group</h4>
                      <p style={{ fontSize: '11px', color: 'var(--ai-text-muted)', marginBottom: '12px' }}>
                        {selectedFieldIds.length} field(s) selected.
                      </p>
                      <button
                        onClick={() => {
                          showPrompt("Create New Group", "Enter Group Title:", "Personal Information", (title) => {
                            if (title && title.trim()) handleCreateGroup(title.trim());
                          });
                        }}
                        className="ai-form-btn-publish"
                        style={{ width: '100%', background: 'var(--ai-neon-purple)', color: '#fff', justifyContent: 'center' }}
                      >
                        Group Selected Fields
                      </button>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--ai-text-muted)', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>
                      Check field checkboxes in the canvas to select and group them.
                    </p>
                  )}

                  {/* Saved/Created Groups List */}
                  <h4 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>
                    CREATED GROUPS ({groups.length})
                  </h4>

                  {groups.length === 0 ? (
                    <p style={{ color: 'var(--ai-text-muted)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
                      No groups created yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      {groups.map((group, idx) => (
                        <div key={group.id} style={{
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* Editable Title */}
                            <input
                              type="text"
                              value={group.title}
                              onChange={(e) => {
                                const updated = groups.map(g => g.id === group.id ? { ...g, title: e.target.value } : g);
                                setGroups(updated);
                                updateState(fields, updated, layout, false);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid transparent',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                outline: 'none',
                                padding: '2px 0',
                                width: '60%'
                              }}
                              onFocus={(e) => e.target.style.borderBottom = '1px solid var(--ai-neon-purple)'}
                              onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                            />
                            
                            {/* Reorder / Action controls */}
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleMoveGroup(idx, 'up')}
                                disabled={idx === 0}
                                style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'var(--ai-text-muted)', cursor: idx === 0 ? 'default' : 'pointer', padding: '2px' }}
                                title="Move Group Up"
                              >
                                <ChevronLeft size={16} style={{ transform: 'rotate(90deg)' }} />
                              </button>
                              <button
                                onClick={() => handleMoveGroup(idx, 'down')}
                                disabled={idx === groups.length - 1}
                                style={{ background: 'none', border: 'none', color: idx === groups.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--ai-text-muted)', cursor: idx === groups.length - 1 ? 'default' : 'pointer', padding: '2px' }}
                                title="Move Group Down"
                              >
                                <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} />
                              </button>
                              <button
                                onClick={() => handleUngroup(group.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                title="Ungroup (Keep Fields)"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--ai-text-muted)' }}>
                            Fields: {group.fields.length}
                          </div>

                          <button
                            onClick={() => handleSaveGroupAsTemplate(group)}
                            className="ai-form-btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', alignSelf: 'flex-start' }}
                          >
                            Save Group Template
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reusable Templates List */}
                  <h4 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginTop: '24px', marginBottom: '12px', textTransform: 'uppercase' }}>
                    REUSABLE TEMPLATES ({groupTemplates.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupTemplates.map((template) => (
                      <div key={template.id} style={{
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{template.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--ai-text-muted)' }}>{template.fields.length} fields</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleInjectTemplate(template)}
                            className="ai-form-btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Inject
                          </button>
                          <button
                            onClick={() => handleRemoveTemplate(template.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              opacity: 0.8
                            }}
                            title="Delete Template"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </>
            )}

            {activeSection === 'livedata' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>Live Data Panel</h3>
                    <span>JSON Schema View</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-panel-content ai-form-scrollbar-hide" style={{ padding: '20px' }}>
                  <p style={{ color: 'var(--ai-text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                    This panel displays real-time values entered in the form fields.
                  </p>
                  <div style={{
                    backgroundColor: '#0c0a12',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#34d399',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
                    maxHeight: '400px'
                  }}>
                    {JSON.stringify(formData, null, 2)}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                      showAlert("JSON Telemetry Copied", "Form JSON data copied to clipboard!", "info");
                    }}
                    className="ai-form-btn-secondary"
                    style={{ width: '100%', marginTop: '16px', padding: '12px', justifyContent: 'center' }}
                  >
                    Copy JSON Data
                  </button>
                </div>
              </>
            )}

            {activeSection === 'settings' && (
              <>
                <div className="ai-form-panel-header">
                  <div className="ai-form-panel-title">
                    <h3>Settings</h3>
                    <span>Form Configuration</span>
                  </div>
                  <button onClick={() => setActiveSection(null)} className="ai-form-btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="ai-form-panel-content ai-form-scrollbar-hide" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>Target Service Context</h4>
                    <div style={{ fontSize: '12px', color: 'var(--ai-neon-blue)', fontWeight: 'bold' }}>{serviceTitle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--ai-text-muted)', marginTop: '4px' }}>Custom ID: {serviceId}</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '12px' }}>Schema Quick Controls</h4>
                    
                    <button
                      onClick={() => {
                        const targetId = customId || serviceId;
                        if (!targetId) return;
                        showConfirm(
                          "Reload Cloud Schema",
                          "Reload schema from backend? Unsaved local changes will be lost.",
                          async () => {
                            try {
                              const res = await api.get(`/package-fields/setup/${targetId}`);
                              if (res.data.success && res.data.service?.formSchema) {
                                const loadedFields = (res.data.service.formSchema.fields || []).map(normalizeField);
                                const loadedGroups = res.data.service.formSchema.groups || [];
                                const loadedLayout = res.data.service.formSchema.layout || loadedFields.map(f => f.id);
                                updateState(loadedFields, loadedGroups, loadedLayout);
                                showAlert("Schema Reloaded", "Schema reloaded successfully from database!", "success");
                              } else {
                                showAlert("No Schema Found", "No saved schema found on backend for this service.", "warning");
                              }
                            } catch (err) {
                              showAlert("Restore Error", "Failed to reload schema from server.", "error");
                            }
                          }
                        );
                      }}
                      className="ai-form-btn-secondary"
                      style={{ width: '100%', marginBottom: '10px', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
                    >
                      Restore Saved Schema from Cloud
                    </button>

                    <button
                      onClick={() => {
                        showConfirm(
                          "Clear Canvas Schema",
                          "Are you sure you want to clear all fields and groups from this canvas?",
                          () => {
                            updateState([], [], []);
                            setSelectedFieldId(null);
                            setSelectedFieldIds([]);
                            showAlert("Canvas Cleared", "All assets removed from canvas schema.", "info");
                          }
                        );
                      }}
                      className="ai-form-btn-danger"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
                    >
                      Clear Canvas Schema
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* CENTRAL CANVAS */}
          <main className={`ai-form-canvas ${!isPreviewMode ? 'ai-form-dotted-grid' : ''}`}>

            <div className="ai-form-canvas-scroll ai-form-scrollbar-hide">
              <div className={`ai-form-device-bezel view-${deviceMode}`}>
                {deviceMode === 'mobile' && (
                  <div className="mobile-notch-bar" style={{ borderRadius: '24px 24px 0 0', margin: '-16px -20px 16px -20px', background: 'rgba(15, 23, 42, 0.95)' }}>
                    <span>9:41</span>
                    <div className="notch-camera" />
                    <div className="notch-status-icons">
                      <span>5G</span>
                      <div className="notch-battery" />
                    </div>
                  </div>
                )}

                <div className="ai-form-device-bar">
                  <div className="ai-form-device-dots">
                    <div className="ai-form-device-dot red" />
                    <div className="ai-form-device-dot yellow" />
                    <div className="ai-form-device-dot green" />
                  </div>
                  <div className="ai-form-device-title">
                    {deviceMode === 'desktop' && '💻 DESKTOP VIEWPORT FRAME (860px)'}
                    {deviceMode === 'tablet' && '📱 TABLET VIEWPORT FRAME (680px)'}
                    {deviceMode === 'mobile' && '📲 MOBILE VIEWPORT FRAME (400px)'}
                  </div>
                </div>

                {/* FORM HEADER BANNER AT THE VERY TOP */}
                <div className="ai-form-top-banner">
                  <div className="ai-form-top-banner-meta">
                    <span className="ai-form-top-banner-tag">LIVE FORM PREVIEW</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ai-neon-blue)', background: 'rgba(59, 130, 246, 0.12)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                      {fields.length} Fields | {groups.length} Sections
                    </span>
                  </div>
                  <h2 className="ai-form-top-banner-title">{serviceTitle || 'Package Setup Form'}</h2>
                  <p className="ai-form-top-banner-sub">Configure custom inputs, validation rules, and live package setup schema.</p>
                </div>

                {layout.length === 0 ? (
                  <div className="ai-form-empty-state">
                    <div className="ai-form-empty-glow" />
                    <div className="ai-form-empty-card">
                      <div className="ai-form-empty-icon">
                        <Plus size={40} />
                      </div>
                      <h2 className="ai-form-empty-title">Neural Sandbox</h2>
                      <p className="ai-form-empty-subtitle">Begin your protocol by injecting assets.</p>
                      <button
                        onClick={() => setActiveSection('assets')}
                        className="ai-form-empty-btn"
                      >
                        Access Library
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ai-form-fields-container">
                    <SortableContext items={layout} strategy={verticalListSortingStrategy}>
                      {layout.map((id) => {
                        const group = groups.find(g => g.id === id);
                        if (group) {
                          return (
                            <SortableGroupItem
                              key={group.id}
                              group={group}
                              fields={fields}
                              selectedFieldId={selectedFieldId}
                              isPreviewMode={isPreviewMode}
                              setSelectedFieldId={setSelectedFieldId}
                              onRemoveField={handleRemoveField}
                              onUngroup={handleUngroup}
                              onSaveTemplate={handleSaveGroupAsTemplate}
                              formData={formData}
                              handleFieldChange={handleFieldChange}
                              selectedFieldIds={selectedFieldIds}
                              handleSelectForGroup={handleSelectForGroup}
                              errors={errors}
                              deviceMode={deviceMode}
                            />
                          );
                        }

                        const field = fields.find(f => f.id === id);
                        if (!field) return null;
                        return (
                          <SortableCanvasItem
                            key={field.id}
                            field={field}
                            selectedFieldId={selectedFieldId}
                            isPreviewMode={isPreviewMode}
                            setSelectedFieldId={setSelectedFieldId}
                            onRemove={handleRemoveField}
                            formData={formData}
                            handleFieldChange={handleFieldChange}
                            selectedFieldIds={selectedFieldIds}
                            handleSelectForGroup={handleSelectForGroup}
                            isInsideGroup={false}
                            errors={errors}
                            deviceMode={deviceMode}
                          />
                        );
                      })}
                    </SortableContext>
                  </div>
                )}
              </div>
            </div>

            {/* Floating selection grouping toolbar */}
            {selectedFieldIds.length > 0 && !isPreviewMode && (
              <div className="ai-form-grouping-toolbar">
                <div className="ai-form-grouping-info">
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ai-neon-purple)',
                    flexShrink: 0
                  }}>
                    <Workflow size={16} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>
                    Selected <strong style={{ color: 'var(--ai-neon-purple)' }}>{selectedFieldIds.length}</strong> field(s) for grouping
                  </span>
                </div>
                <div className="ai-form-grouping-actions">
                  <button
                    onClick={() => {
                      showPrompt("Create Section Group", "Enter group title:", "New Section Group", (title) => {
                        if (title && title.trim()) handleCreateGroup(title.trim());
                      });
                    }}
                    style={{
                      padding: '8px 18px',
                      background: 'linear-gradient(135deg, var(--ai-neon-purple) 0%, #7c3aed 100%)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                      height: '36px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => setSelectedFieldIds([])}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--ai-text-muted)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      height: '36px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {!isPreviewMode && (
              <div className="ai-form-bottom-controls">
                <div className="ai-form-control-group">
                  <button className="ai-form-icon-btn"><MousePointer2 size={18} /></button>
                  <button className="ai-form-icon-btn" onClick={toggleFullscreen}><Maximize2 size={18} /></button>
                </div>
                <span className="ai-form-scale-text">Scale: 100%</span>
              </div>
            )}
          </main>

          {/* PROPERTY INSPECTOR */}
          <aside className={`ai-form-inspector ${selectedFieldId && !isPreviewMode ? 'open' : 'closed'}`}>
            {selectedField ? (
              (() => {
                const updateAttr = (key, val, saveHistory = false) => {
                  updateField(selectedFieldId, {
                    attributes: {
                      ...(selectedField.attributes || {}),
                      [key]: val
                    }
                  }, saveHistory);
                };
                const isSelectableType = ['select', 'checkbox', 'radio'].includes(selectedField.type);

                return (
                  <>
                    <div className="ai-form-inspector-header">
                      <div className="ai-form-inspector-title">
                        <h3>Inspector</h3>
                        <span>{selectedField.label} ({selectedField.type})</span>
                      </div>
                      <button onClick={() => setSelectedFieldId(null)} className="ai-form-btn-close">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="ai-form-inspector-tabs">
                      <button
                        className={`ai-form-inspector-tab-btn ${inspectorTab === 'general' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('general')}
                      >
                        General
                      </button>
                      <button
                        className={`ai-form-inspector-tab-btn ${inspectorTab === 'grid' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('grid')}
                      >
                        <Grid size={11} style={{ marginRight: '3px', display: 'inline' }} />
                        Grid
                      </button>
                      <button
                        className={`ai-form-inspector-tab-btn ${inspectorTab === 'validation' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('validation')}
                      >
                        Validation
                      </button>
                      {isSelectableType && (
                        <button
                          className={`ai-form-inspector-tab-btn ${inspectorTab === 'options' ? 'active' : ''}`}
                          onClick={() => setInspectorTab('options')}
                        >
                          Options ({selectedField.attributes?.options?.length || 0})
                        </button>
                      )}
                    </div>

                    <div className="ai-form-inspector-content ai-form-scrollbar-hide">
                      {inspectorTab === 'general' && (
                        <div className="ai-form-inspector-section">
                          <div className="ai-form-input-group">
                            <label className="ai-form-label">Label</label>
                            <input
                              value={selectedField.label || ''}
                              onChange={(e) => updateField(selectedFieldId, { label: e.target.value }, false)}
                              onBlur={() => updateState(fields, groups, layout, true)}
                              className="ai-form-input"
                            />
                          </div>

                          <div className="ai-form-input-group">
                            <label className="ai-form-label">Name Attribute</label>
                            <input
                              value={selectedField.name || ''}
                              onChange={(e) => updateField(selectedFieldId, { name: e.target.value }, false)}
                              onBlur={() => updateState(fields, groups, layout, true)}
                              className="ai-form-input"
                            />
                          </div>

                          <div className="ai-form-input-group">
                            <label className="ai-form-label">Placeholder</label>
                            <input
                              value={selectedField.placeholder || ''}
                              onChange={(e) => updateField(selectedFieldId, { placeholder: e.target.value }, false)}
                              onBlur={() => updateState(fields, groups, layout, true)}
                              className="ai-form-input"
                            />
                          </div>

                          <div className="ai-form-input-group">
                            <label className="ai-form-label">Default Value</label>
                            <input
                              value={selectedField.attributes?.value || ''}
                              onChange={(e) => updateAttr('value', e.target.value, false)}
                              onBlur={() => updateState(fields, groups, layout, true)}
                              className="ai-form-input"
                            />
                          </div>

                          <div className="ai-form-toggle-group" onClick={() => updateField(selectedFieldId, { required: !selectedField.required })}>
                            <div className="ai-form-toggle-labels">
                              <span className="ai-form-toggle-main-label">Required Field</span>
                              <span className="ai-form-toggle-sub-label">Validation mandatory</span>
                            </div>
                            <div className={`ai-form-switch ${selectedField.required ? 'active' : ''}`}>
                              <div className="ai-form-switch-thumb" />
                            </div>
                          </div>

                          <div className="ai-form-toggle-group" onClick={() => updateAttr('disabled', !selectedField.attributes?.disabled, true)}>
                            <div className="ai-form-toggle-labels">
                              <span className="ai-form-toggle-main-label">Disabled</span>
                              <span className="ai-form-toggle-sub-label">Deactivate field</span>
                            </div>
                            <div className={`ai-form-switch ${selectedField.attributes?.disabled ? 'active' : ''}`}>
                              <div className="ai-form-switch-thumb" />
                            </div>
                          </div>

                          <div className="ai-form-toggle-group" onClick={() => updateAttr('readonly', !selectedField.attributes?.readonly, true)}>
                            <div className="ai-form-toggle-labels">
                              <span className="ai-form-toggle-main-label">Read Only</span>
                              <span className="ai-form-toggle-sub-label">View only state</span>
                            </div>
                            <div className={`ai-form-switch ${selectedField.attributes?.readonly ? 'active' : ''}`}>
                              <div className="ai-form-switch-thumb" />
                            </div>
                          </div>
                        </div>
                      )}

                      {inspectorTab === 'grid' && (
                        <div className="ai-form-inspector-section">
                          {/* Grid Setup Alert & Info Banner */}
                          <div style={{
                            backgroundColor: 'rgba(168, 85, 247, 0.08)',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Grid size={16} style={{ color: 'var(--ai-neon-purple)' }} />
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>12-Col Grid Setup</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                showAlert(
                                  "12-Column Responsive Grid Protocol",
                                  `⚡ RESPONSIVE GRID LAYOUT SETUP GUIDE

Configure independent column spans (1 to 12) for each breakpoint:

• Mobile (SM / <640px): Phone viewport span.
• Tablet (MD / 768px): Tablet viewport span.
• Desktop (L / LG / 1024px): Laptop viewport span.
• Extra Large (XL / >1280px): Widescreen desktop span.

COLUMN SPAN CALCULATIONS (12-COL RATIO):
- 12 Cols = 100% Full Width (1 item per row)
- 6 Cols  = 50% Half Width (2 items per row)
- 4 Cols  = 33.3% One-Third (3 items per row)
- 3 Cols  = 25% One-Quarter (4 items per row)
- 2 Cols  = 16.6% One-Sixth (6 items per row)

Quick Tip: Click any layout preset below or adjust per viewport!`,
                                  "info"
                                );
                              }}
                              style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '6px',
                                color: '#c084fc',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 10px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Click to view Grid Setup Guide Alert Box"
                            >
                              <HelpCircle size={13} />
                              <span>Guide</span>
                            </button>
                          </div>

                          {/* Quick Layout Presets */}
                          <div style={{ marginBottom: '18px' }}>
                            <label className="ai-form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ai-text-muted)' }}>Quick Layout Presets</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  updateAttr('colSm', 12, false);
                                  updateAttr('colMd', 12, false);
                                  updateAttr('colLg', 12, false);
                                  updateAttr('colXl', 12, true);
                                }}
                                className="ai-form-btn-secondary"
                                style={{ fontSize: '11px', fontWeight: '700', padding: '8px', justifyContent: 'center' }}
                              >
                                Full Width (100%)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateAttr('colSm', 12, false);
                                  updateAttr('colMd', 6, false);
                                  updateAttr('colLg', 6, false);
                                  updateAttr('colXl', 6, true);
                                }}
                                className="ai-form-btn-secondary"
                                style={{ fontSize: '11px', fontWeight: '700', padding: '8px', justifyContent: 'center' }}
                              >
                                Half Width (50%)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateAttr('colSm', 12, false);
                                  updateAttr('colMd', 6, false);
                                  updateAttr('colLg', 4, false);
                                  updateAttr('colXl', 4, true);
                                }}
                                className="ai-form-btn-secondary"
                                style={{ fontSize: '11px', fontWeight: '700', padding: '8px', justifyContent: 'center' }}
                              >
                                3-Column (33%)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateAttr('colSm', 12, false);
                                  updateAttr('colMd', 6, false);
                                  updateAttr('colLg', 3, false);
                                  updateAttr('colXl', 3, true);
                                }}
                                className="ai-form-btn-secondary"
                                style={{ fontSize: '11px', fontWeight: '700', padding: '8px', justifyContent: 'center' }}
                              >
                                4-Column (25%)
                              </button>
                            </div>
                          </div>

                          {/* Breakpoint Controls: Mobile, Tablet, Desktop, L, XL */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Mobile / SM */}
                            <div
                              className={`ai-form-grid-card ${deviceMode === 'mobile' ? 'active' : ''}`}
                              onClick={() => setDeviceMode('mobile')}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="ai-form-grid-label-row">
                                <div className="ai-form-grid-title">
                                  <Smartphone size={15} style={{ color: 'var(--ai-neon-cyan)' }} />
                                  <span>Mobile / SM (&lt;640px)</span>
                                </div>
                                <span className="ai-form-grid-badge">
                                  {selectedField.attributes?.colSm || 12}/12 COLS
                                </span>
                              </div>
                              <select
                                value={selectedField.attributes?.colSm || 12}
                                onChange={(e) => {
                                  updateAttr('colSm', parseInt(e.target.value, 10), true);
                                  setDeviceMode('mobile');
                                }}
                                onFocus={() => setDeviceMode('mobile')}
                                className="ai-form-dropdown-modern"
                              >
                                <option value={12}>12 Columns - 100% (Full Width)</option>
                                <option value={6}>6 Columns - 50% (Half Width)</option>
                                <option value={4}>4 Columns - 33.3% (One-Third)</option>
                              </select>
                            </div>

                            {/* Tablet / MD */}
                            <div
                              className={`ai-form-grid-card ${deviceMode === 'tablet' ? 'active' : ''}`}
                              onClick={() => setDeviceMode('tablet')}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="ai-form-grid-label-row">
                                <div className="ai-form-grid-title">
                                  <Tablet size={15} style={{ color: '#60a5fa' }} />
                                  <span>Tablet / MD (768px)</span>
                                </div>
                                <span className="ai-form-grid-badge">
                                  {selectedField.attributes?.colMd || 12}/12 COLS
                                </span>
                              </div>
                              <select
                                value={selectedField.attributes?.colMd || 12}
                                onChange={(e) => {
                                  updateAttr('colMd', parseInt(e.target.value, 10), true);
                                  setDeviceMode('tablet');
                                }}
                                onFocus={() => setDeviceMode('tablet')}
                                className="ai-form-dropdown-modern"
                              >
                                <option value={12}>12 Columns - 100% (Full Width)</option>
                                <option value={6}>6 Columns - 50% (Half Width)</option>
                                <option value={4}>4 Columns - 33.3% (One-Third)</option>
                                <option value={3}>3 Columns - 25% (One-Quarter)</option>
                              </select>
                            </div>

                            {/* Desktop / L / LG */}
                            <div
                              className={`ai-form-grid-card ${deviceMode === 'desktop' ? 'active' : ''}`}
                              onClick={() => setDeviceMode('desktop')}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="ai-form-grid-label-row">
                                <div className="ai-form-grid-title">
                                  <Monitor size={15} style={{ color: '#a855f7' }} />
                                  <span>Desktop / L / LG (1024px)</span>
                                </div>
                                <span className="ai-form-grid-badge">
                                  {selectedField.attributes?.colLg || 12}/12 COLS
                                </span>
                              </div>
                              <select
                                value={selectedField.attributes?.colLg || 12}
                                onChange={(e) => {
                                  updateAttr('colLg', parseInt(e.target.value, 10), true);
                                  setDeviceMode('desktop');
                                }}
                                onFocus={() => setDeviceMode('desktop')}
                                className="ai-form-dropdown-modern"
                              >
                                <option value={12}>12 Columns - 100% (Full Width)</option>
                                <option value={6}>6 Columns - 50% (Half Width)</option>
                                <option value={4}>4 Columns - 33.3% (One-Third)</option>
                                <option value={3}>3 Columns - 25% (One-Quarter)</option>
                                <option value={2}>2 Columns - 16.6% (One-Sixth)</option>
                              </select>
                            </div>

                            {/* Extra Large / XL */}
                            <div
                              className={`ai-form-grid-card ${deviceMode === 'desktop' ? 'active' : ''}`}
                              onClick={() => setDeviceMode('desktop')}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="ai-form-grid-label-row">
                                <div className="ai-form-grid-title">
                                  <Maximize2 size={15} style={{ color: '#34d399' }} />
                                  <span>Extra Large / XL (&gt;1280px)</span>
                                </div>
                                <span className="ai-form-grid-badge">
                                  {selectedField.attributes?.colXl || 12}/12 COLS
                                </span>
                              </div>
                              <select
                                value={selectedField.attributes?.colXl || 12}
                                onChange={(e) => {
                                  updateAttr('colXl', parseInt(e.target.value, 10), true);
                                  setDeviceMode('desktop');
                                }}
                                onFocus={() => setDeviceMode('desktop')}
                                className="ai-form-dropdown-modern"
                              >
                                <option value={12}>12 Columns - 100% (Full Width)</option>
                                <option value={6}>6 Columns - 50% (Half Width)</option>
                                <option value={4}>4 Columns - 33.3% (One-Third)</option>
                                <option value={3}>3 Columns - 25% (One-Quarter)</option>
                                <option value={2}>2 Columns - 16.6% (One-Sixth)</option>
                              </select>
                            </div>

                            {/* Interactive 12-Column Visual Ratio Bar */}
                            <div style={{ marginTop: '6px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ai-text-muted)', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '600' }}>Active Viewport Grid Ratio</span>
                                <span style={{ color: 'var(--ai-neon-cyan)', fontWeight: '800', textTransform: 'uppercase' }}>{deviceMode} MODE</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                                {Array.from({ length: 12 }).map((_, i) => {
                                  const activeCols = deviceMode === 'mobile'
                                    ? (selectedField.attributes?.colSm || 12)
                                    : deviceMode === 'tablet'
                                    ? (selectedField.attributes?.colMd || 12)
                                    : (selectedField.attributes?.colLg || 12);
                                  const isActive = i < activeCols;
                                  return (
                                    <div
                                      key={i}
                                      style={{
                                        height: '16px',
                                        borderRadius: '4px',
                                        backgroundColor: isActive ? 'var(--ai-neon-purple)' : 'rgba(255,255,255,0.08)',
                                        boxShadow: isActive ? '0 0 8px rgba(168, 85, 247, 0.5)' : 'none',
                                        transition: 'all 0.25s ease'
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                      {inspectorTab === 'validation' && (
                        <div className="ai-form-inspector-section">
                          {['text', 'email', 'tel', 'url', 'search', 'password', 'textarea'].includes(selectedField.type) && (
                            <>
                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Min Length</label>
                                <input
                                  type="number"
                                  value={selectedField.attributes?.minlength || ''}
                                  onChange={(e) => updateAttr('minlength', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  placeholder="Min character count"
                                />
                              </div>

                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Max Length</label>
                                <input
                                  type="number"
                                  value={selectedField.attributes?.maxlength || ''}
                                  onChange={(e) => updateAttr('maxlength', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  placeholder="Max character count"
                                />
                              </div>

                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Regex Pattern</label>
                                <input
                                  value={selectedField.attributes?.pattern || ''}
                                  onChange={(e) => updateAttr('pattern', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  placeholder="e.g. [A-Za-z]{3}"
                                />
                              </div>

                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Autocomplete</label>
                                <select
                                  value={selectedField.attributes?.autocomplete || 'off'}
                                  onChange={(e) => updateAttr('autocomplete', e.target.value, true)}
                                  className="ai-form-input"
                                  style={{ backgroundColor: '#1e1b29', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                  <option value="off">Off</option>
                                  <option value="on">On</option>
                                  <option value="name">Name</option>
                                  <option value="email">Email</option>
                                  <option value="username">Username</option>
                                </select>
                              </div>
                            </>
                          )}

                          {['number', 'date', 'datetime-local', 'time', 'month', 'week'].includes(selectedField.type) && (
                            <>
                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Minimum</label>
                                <input
                                  type={selectedField.type === 'number' ? 'number' : selectedField.type}
                                  value={selectedField.attributes?.min || ''}
                                  onChange={(e) => updateAttr('min', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                />
                              </div>

                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Maximum</label>
                                <input
                                  type={selectedField.type === 'number' ? 'number' : selectedField.type}
                                  value={selectedField.attributes?.max || ''}
                                  onChange={(e) => updateAttr('max', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                />
                              </div>

                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Step Value</label>
                                <input
                                  type="number"
                                  value={selectedField.attributes?.step || ''}
                                  onChange={(e) => updateAttr('step', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  placeholder="Interval value"
                                />
                              </div>
                            </>
                          )}

                          {selectedField.type === 'file upload' && (
                            <>
                              <div className="ai-form-input-group">
                                <label className="ai-form-label">Accepted Extensions</label>
                                <input
                                  value={selectedField.attributes?.accept || ''}
                                  onChange={(e) => updateAttr('accept', e.target.value, false)}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  placeholder="e.g. .pdf,.png,image/*"
                                />
                              </div>

                              <div className="ai-form-toggle-group" onClick={() => updateAttr('multiple', !selectedField.attributes?.multiple, true)}>
                                <div className="ai-form-toggle-labels">
                                  <span className="ai-form-toggle-main-label">Multiple Files</span>
                                  <span className="ai-form-toggle-sub-label">Allow selecting multiple files</span>
                                </div>
                                <div className={`ai-form-switch ${selectedField.attributes?.multiple ? 'active' : ''}`}>
                                  <div className="ai-form-switch-thumb" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {inspectorTab === 'options' && isSelectableType && (
                        <div className="ai-form-inspector-section">
                          {selectedField.type === 'select' && (
                            <div className="ai-form-toggle-group" style={{ marginBottom: '16px' }} onClick={() => updateAttr('multiple', !selectedField.attributes?.multiple, true)}>
                              <div className="ai-form-toggle-labels">
                                <span className="ai-form-toggle-main-label">Multiple Choice</span>
                                <span className="ai-form-toggle-sub-label">Allow multiple items</span>
                              </div>
                              <div className={`ai-form-switch ${selectedField.attributes?.multiple ? 'active' : ''}`}>
                                <div className="ai-form-switch-thumb" />
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0 }}>Options List</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const currentOpts = selectedField.attributes?.options || [];
                                const newOpt = { label: `Option ${currentOpts.length + 1}`, value: `option_${currentOpts.length + 1}` };
                                updateAttr('options', [...currentOpts, newOpt], true);
                              }}
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '4px',
                                color: 'var(--ai-neon-purple)',
                                fontSize: '11px',
                                padding: '4px 8px',
                                cursor: 'pointer'
                              }}
                            >
                              + Add Option
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(selectedField.attributes?.options || []).map((opt, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={(e) => {
                                    const currentOpts = [...(selectedField.attributes?.options || [])];
                                    currentOpts[idx] = { ...currentOpts[idx], label: e.target.value };
                                    updateAttr('options', currentOpts, false);
                                  }}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  style={{ flex: 1, padding: '8px' }}
                                  placeholder="Label"
                                />
                                <input
                                  type="text"
                                  value={opt.value}
                                  onChange={(e) => {
                                    const currentOpts = [...(selectedField.attributes?.options || [])];
                                    currentOpts[idx] = { ...currentOpts[idx], value: e.target.value };
                                    updateAttr('options', currentOpts, false);
                                  }}
                                  onBlur={() => updateState(fields, groups, layout, true)}
                                  className="ai-form-input"
                                  style={{ flex: 1, padding: '8px' }}
                                  placeholder="Value"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentOpts = (selectedField.attributes?.options || []).filter((_, i) => i !== idx);
                                    updateAttr('options', currentOpts, true);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ai-form-inspector-footer">
                      <button onClick={handleDuplicate} className="ai-form-btn-secondary">Duplicate</button>
                      <button
                        onClick={() => {
                          handleRemoveField(selectedFieldId);
                        }}
                        className="ai-form-btn-danger"
                      >
                        Deconstruct
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="ai-form-inspector-empty">
                <div className="ai-form-empty-inspector-icon">
                  <div className="ai-form-empty-inspector-bg" />
                  <Search size={32} />
                </div>
                <h4>Protocol Void</h4>
                <p>Select node to modify.</p>
              </div>
            )}
          </aside>
        </div>

        {/* NEXT-GEN DESIGN ALERT & PROMPT MODAL */}
        {modalConfig.isOpen && (
          <div className="nextgen-alert-overlay">
            <div className={`nextgen-alert-modal type-${modalConfig.type}`}>
              <div className="nextgen-alert-header">
                <div className={`nextgen-alert-icon-badge type-${modalConfig.type}`}>
                  {modalConfig.type === 'success' && <CheckSquare size={22} />}
                  {modalConfig.type === 'error' && <AlertCircle size={22} />}
                  {modalConfig.type === 'warning' && <AlertTriangle size={22} />}
                  {modalConfig.type === 'confirm' && <AlertTriangle size={22} />}
                  {(modalConfig.type === 'info' || modalConfig.type === 'prompt') && <Sparkles size={22} />}
                </div>
                <div className="nextgen-alert-title-wrap">
                  <h3>{modalConfig.title || 'Notification'}</h3>
                  <span>Builder Protocol Telemetry</span>
                </div>
                <button onClick={closeModal} className="ai-form-btn-close" style={{ marginLeft: 'auto' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="nextgen-alert-body">
                <p>{modalConfig.message}</p>
                {modalConfig.type === 'prompt' && (
                  <input
                    type="text"
                    className="nextgen-alert-input"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Type value here..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (modalConfig.onConfirm) modalConfig.onConfirm(promptInput);
                        closeModal();
                      }
                    }}
                  />
                )}
              </div>

              <div className="nextgen-alert-footer">
                {(modalConfig.type === 'confirm' || modalConfig.type === 'prompt') && (
                  <button onClick={closeModal} className="nextgen-alert-btn-cancel">
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modalConfig.type === 'prompt') {
                      if (modalConfig.onConfirm) modalConfig.onConfirm(promptInput);
                    } else if (modalConfig.onConfirm) {
                      modalConfig.onConfirm();
                    }
                    closeModal();
                  }}
                  className={`nextgen-alert-btn-confirm type-${modalConfig.type}`}
                >
                  {modalConfig.type === 'confirm' ? 'Confirm Action' : modalConfig.type === 'prompt' ? 'Submit' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

/* ==========================================================================
   CLEAN EXTERNAL PREVIEW COMPONENT (/preview route)
   ========================================================================== */
export const NextGenPreview = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [layout, setLayout] = useState([]);
  const [serviceTitle, setServiceTitle] = useState('');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [activeView, setActiveView] = useState('desktop');
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nextgen_form_schema');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceTitle) setServiceTitle(parsed.serviceTitle);
      const normalizedFields = (parsed.fields || []).map(normalizeField);
      setFields(normalizedFields);
      setGroups(parsed.groups || []);

      const initialLayout = parsed.layout || (() => {
        const groupedFieldIds = new Set((parsed.groups || []).flatMap(g => g.fields || []));
        const groupIds = (parsed.groups || []).map(g => g.id);
        const ungroupedFieldIds = normalizedFields.filter(f => !groupedFieldIds.has(f.id)).map(f => f.id);
        return [...groupIds, ...ungroupedFieldIds];
      })();
      setLayout(initialLayout);

      const initialData = {};
      normalizedFields.forEach(f => {
        initialData[f.id] = getFieldDefaultValue(f);
      });
      setFormData(initialData);
    }
  }, []);

  const requiredFields = fields.filter(f => f.required);
  const completedRequiredCount = requiredFields.filter(f => {
    const val = formData[f.id];
    return val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;

  const completionPercentage = requiredFields.length > 0 
    ? Math.round((completedRequiredCount / requiredFields.length) * 100)
    : 100;

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldId]: error }));
    }
  };

  const handleResetData = () => {
    const initialData = {};
    fields.forEach(f => {
      initialData[f.id] = getFieldDefaultValue(f);
    });
    setFormData(initialData);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalData = {};
    fields.forEach(field => {
      finalData[field.id] = formData[field.id] !== undefined ? formData[field.id] : getFieldDefaultValue(field);
    });

    setSubmittedData(finalData);
  };

  const getPreviewColSpan = (field) => {
    if (!field) return 12;
    const attrs = field.attributes || {};
    if (activeView === 'mobile') return attrs.colSm || 12;
    if (activeView === 'tablet') return attrs.colMd || (attrs.colLg ? Math.min(12, attrs.colLg * 2) : 12);
    return attrs.colLg || attrs.colXl || 12;
  };

  return (
    <div className="nextgen-preview-wrapper">
      <div className="ai-form-noise-bg" />
      <div className="ai-form-cursor-glow" style={{ left: '50%', top: '30%' }} />

      {/* TOP PREVIEW NAV BAR */}
      <header className="nextgen-preview-top-nav">
        <div className="nextgen-preview-top-left">
          <button className="ai-form-btn-exit" onClick={() => window.history.length > 1 ? navigate(-1) : window.close()}>
            <ArrowLeft size={16} />
            <span>EXIT PREVIEW</span>
          </button>
          <div className="ai-form-divider" />
          <div className="nextgen-preview-badge">
            <Sparkles size={14} className="text-purple-400" />
            <span>Interactive Telemetry Preview</span>
          </div>
        </div>

        <div className="nextgen-preview-top-right" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginRight: '12px' }}>
            {[
              { id: 'desktop', label: 'Desktop', icon: Monitor },
              { id: 'tablet', label: 'Tablet', icon: Tablet },
              { id: 'mobile', label: 'Mobile', icon: Smartphone }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeView === item.id ? 'var(--ai-neon-purple)' : 'transparent',
                  color: activeView === item.id ? '#ffffff' : 'var(--ai-text-muted)',
                  boxShadow: activeView === item.id ? '0 2px 10px rgba(168, 85, 247, 0.4)' : 'none'
                }}
                title={`Switch to ${item.label} Viewport`}
              >
                <item.icon size={14} />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
              </button>
            ))}
          </div>

          <button onClick={handleResetData} className="ai-form-btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <RotateCcw size={14} />
            <span>Reset Test Data</span>
          </button>
        </div>
      </header>

      {/* PREVIEW CONTAINER BODY */}
      <div className="nextgen-preview-viewport">
        <div className={`nextgen-preview-container view-${activeView}`}>
          <div className="nextgen-preview-glow-top" />

          {/* Form Header */}
          <div className="nextgen-preview-header">
            <div className="nextgen-preview-header-meta">
              <span className="nextgen-preview-tag">LIVE TELEMETRY FORM</span>
              {requiredFields.length > 0 && (
                <span className="nextgen-preview-progress-pill">
                  {completionPercentage}% Completed
                </span>
              )}
            </div>
            <h1>{serviceTitle || 'Form Protocol Preview'}</h1>
            <p>Verify field validation rules, option dependencies, and live input responses for {serviceTitle || 'this service'}.</p>

            {/* Progress Bar */}
            {requiredFields.length > 0 && (
              <div className="nextgen-preview-progress-track">
                <div 
                  className="nextgen-preview-progress-bar" 
                  style={{ width: `${completionPercentage}%` }} 
                />
              </div>
            )}
          </div>

          {layout.length === 0 ? (
            <div className="nextgen-preview-empty">
              <div className="nextgen-preview-empty-icon">
                <Plus size={36} />
              </div>
              <h3>No Form Protocol Schema Found</h3>
              <p>Build your form schema using the AI Next-Gen Builder first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="nextgen-preview-form">
              {layout.map((id) => {
                const group = groups.find(g => g.id === id);
                if (group) {
                  return (
                    <div key={group.id} className="nextgen-preview-group">
                      <div className="nextgen-preview-group-header">
                        <div className="nextgen-preview-group-badge">
                          <Workflow size={16} />
                        </div>
                        <div>
                          <h3 className="nextgen-preview-group-title">{group.title}</h3>
                          {group.description && <p className="nextgen-preview-group-desc">{group.description}</p>}
                        </div>
                      </div>

                      <div className="nextgen-preview-group-fields">
                        {group.fields.map(fieldId => {
                          const field = fields.find(f => f.id === fieldId);
                          if (!field) return null;
                          const cSpan = getPreviewColSpan(field);
                          return (
                            <div key={field.id} className="nextgen-preview-field-item" style={{ gridColumn: `span ${cSpan} / span ${cSpan}` }}>
                              <label className="nextgen-preview-label">
                                <span>{field.label}</span>
                                {field.required && <span className="nextgen-preview-required">*</span>}
                              </label>
                              <div className="nextgen-preview-input-box">
                                {renderInputField(field, formData[field.id], handleFieldChange)}
                              </div>
                              {errors[field.id] && (
                                <div className="nextgen-preview-error-label">
                                  <AlertCircle size={12} />
                                  <span>{errors[field.id]}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const field = fields.find(f => f.id === id);
                if (!field) return null;
                const cSpan = getPreviewColSpan(field);
                return (
                  <div key={field.id} className="nextgen-preview-field-item standalone" style={{ gridColumn: `span ${cSpan} / span ${cSpan}` }}>
                    <label className="nextgen-preview-label">
                      <span>{field.label}</span>
                      {field.required && <span className="nextgen-preview-required">*</span>}
                    </label>
                    <div className="nextgen-preview-input-box">
                      {renderInputField(field, formData[field.id], handleFieldChange)}
                    </div>
                    {errors[field.id] && (
                      <div className="nextgen-preview-error-label">
                        <AlertCircle size={12} />
                        <span>{errors[field.id]}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <button type="submit" className="nextgen-preview-submit-btn">
                <Rocket size={18} />
                <span>SUBMIT PROTOCOL TELEMETRY</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* SUBMISSION MODAL */}
      {submittedData && (
        <div className="nextgen-preview-modal-overlay">
          <div className="nextgen-preview-modal">
            <div className="nextgen-preview-modal-glow" />
            <div className="nextgen-preview-modal-header">
              <div className="nextgen-preview-modal-icon">
                <CheckSquare size={24} />
              </div>
              <div>
                <h2>Protocol Telemetry Verified</h2>
                <span>Form Submission Output</span>
              </div>
            </div>

            <p style={{ color: 'var(--ai-text-muted)', fontSize: '13px', margin: '16px 0 20px 0', lineHeight: '1.6' }}>
              All field constraints have passed validation. Below is the parsed JSON telemetry output ready for submission API:
            </p>

            <pre className="nextgen-preview-json">{JSON.stringify(submittedData, null, 2)}</pre>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(submittedData, null, 2));
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2500);
                }}
                className="ai-form-btn-secondary"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                {copiedJson ? 'Copied to Clipboard!' : 'Copy Telemetry JSON'}
              </button>

              <button
                onClick={() => setSubmittedData(null)}
                className="nextgen-preview-submit-btn"
                style={{ flex: 1, margin: 0, padding: '12px', background: 'var(--ai-neon-purple)' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextGenFormbuild;
