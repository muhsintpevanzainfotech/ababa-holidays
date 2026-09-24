import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Settings,
  ArrowLeft,
  Save,
  GripVertical,
  Type,
  Hash,
  AlignLeft,
  Eye,
  CheckSquare,
  Radio,
  ToggleRight,
  List,
  Tag,
  Upload,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Maximize,
  Sparkles,
  Layout,
  Wand2
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useToast } from '../context/ToastContext';
import FormGenerator from '../components/FormGenerator';
import '../builder.css';

const AdvancedFormBuilder = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [service, setService] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [saving, setSaving] = useState(false);

  // For Preview
  const [previewData, setPreviewData] = useState({});
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const fieldTypeIcons = {
    text: <Type size={16} />,
    number: <Hash size={16} />,
    textarea: <AlignLeft size={16} />,
    password: <Eye size={16} />,
    checkbox: <CheckSquare size={16} />,
    radio: <Radio size={16} />,
    switch: <ToggleRight size={16} />,
    select: <List size={16} />,
    tag: <Tag size={16} />,
    upload: <Upload size={16} />,
    map: <MapPin size={16} />,
    date: <Calendar size={16} />,
    section_header: <Layout size={16} />
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, fieldsRes] = await Promise.all([
        api.get(`/services`),
        api.get(`/package-fields/setup/${serviceId}`)
      ]);

      const foundService = serviceRes.data.data.find(s => s._id === serviceId);
      setService(foundService);
      setFields(fieldsRes.data.data);
      if (fieldsRes.data.data.length > 0) {
        setSelectedFieldId(fieldsRes.data.data[0]._id);
      }
    } catch (error) {
      showToast('Error', 'Failed to fetch builder data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedField = fields.find(f => f._id === selectedFieldId);

  const handleUpdateField = (id, updates) => {
    setFields(fields.map(f => f._id === id ? { ...f, ...updates } : f));
  };

  const handleUpdateConfig = (id, configUpdates) => {
    setFields(fields.map(f => f._id === id ? {
      ...f,
      config: { ...f.config, ...configUpdates }
    } : f));
  };

  const addNewField = () => {
    const newId = 'temp_' + Date.now();
    const newField = {
      _id: newId,
      label: 'New Field',
      fieldName: 'field_' + fields.length,
      fieldType: 'text',
      isRequired: false,
      order: fields.length,
      config: {
        minLength: '',
        maxLength: '',
        rows: 3,
        options: [],
        multiple: false,
        maxFiles: 1,
        accept: ['image'],
        allowCustom: true
      }
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newId);
  };

  const addDefaultSection = () => {
    const timestamp = Date.now();
    const group1Fields = [
      {
        _id: `temp_header_${timestamp}`,
        label: 'Section Header',
        fieldName: `header_${timestamp}`,
        fieldType: 'section_header',
        isRequired: false,
        secondaryLabel: 'BootstrapMade Style Section',
        order: fields.length,
        config: {}
      },
      {
        _id: `temp_title_${timestamp}`,
        label: 'Section Title',
        fieldName: 'title',
        fieldType: 'text',
        isRequired: true,
        order: fields.length + 1,
        config: { minLength: '', maxLength: '' }
      },
      {
        _id: `temp_subtitle_${timestamp}`,
        label: 'Section Subtitle',
        fieldName: 'sub_title',
        fieldType: 'text',
        isRequired: false,
        order: fields.length + 2,
        config: { minLength: '', maxLength: '' }
      },
      {
        _id: `temp_shortdesc_${timestamp}`,
        label: 'Short Description',
        fieldName: 'short_desc',
        fieldType: 'textarea',
        isRequired: false,
        order: fields.length + 3,
        config: { rows: 2 }
      },
      {
        _id: `temp_desc_${timestamp}`,
        label: 'Full Description',
        fieldName: 'desc',
        fieldType: 'textarea',
        isRequired: false,
        order: fields.length + 4,
        config: { rows: 4 }
      }
    ];
    setFields([...fields, ...group1Fields]);
    setSelectedFieldId(group1Fields[0]._id);
    showToast('Success', 'BootstrapMade Group 1 added', 'success');
  };

  const generateWithAI = () => {
    if (!aiPrompt.trim()) return;

    const prompt = aiPrompt.toLowerCase();
    const timestamp = Date.now();
    let aiFields = [];

    if (prompt.includes('contact')) {
      aiFields = [
        { label: 'Contact Us', fieldType: 'section_header', secondaryLabel: 'We respond within 24 hours' },
        { label: 'Full Name', fieldName: 'name', fieldType: 'text', isRequired: true },
        { label: 'Email Address', fieldName: 'email', fieldType: 'text', isRequired: true },
        { label: 'Subject', fieldName: 'subject', fieldType: 'text' },
        { label: 'Message', fieldName: 'message', fieldType: 'textarea', config: { rows: 4 } }
      ];
    } else if (prompt.includes('register') || prompt.includes('signup')) {
      aiFields = [
        { label: 'Create Account', fieldType: 'section_header', secondaryLabel: 'Join our community' },
        { label: 'Username', fieldName: 'username', fieldType: 'text', isRequired: true },
        { label: 'Email', fieldName: 'email', fieldType: 'text', isRequired: true },
        { label: 'Password', fieldName: 'password', fieldType: 'text', isRequired: true },
        { label: 'Terms', fieldName: 'terms', fieldType: 'checkbox' }
      ];
    } else if (prompt.includes('booking') || prompt.includes('reservation')) {
      aiFields = [
        { label: 'Book Your Stay', fieldType: 'section_header', secondaryLabel: 'Check availability in real-time' },
        { label: 'Check-in Date', fieldName: 'checkin', fieldType: 'date', isRequired: true },
        { label: 'Check-out Date', fieldName: 'checkout', fieldType: 'date', isRequired: true },
        { label: 'Guests', fieldName: 'guests', fieldType: 'number' },
        { label: 'Room Type', fieldName: 'room_type', fieldType: 'select', config: { options: [{ label: 'Deluxe', value: 'deluxe' }, { label: 'Suite', value: 'suite' }] } }
      ];
    } else {
      // Default fallback: treat prompt as a comma separated list of fields
      const items = aiPrompt.split(',').map(s => s.trim());
      aiFields = [
        { label: 'Custom Section', fieldType: 'section_header', secondaryLabel: 'AI Generated Layout' },
        ...items.map((item, idx) => ({
          label: item.charAt(0).toUpperCase() + item.slice(1),
          fieldName: item.toLowerCase().replace(/\s+/g, '_'),
          fieldType: 'text',
          order: fields.length + idx + 1
        }))
      ];
    }

    const processedFields = aiFields.map((f, i) => ({
      ...f,
      _id: `ai_${timestamp}_${i}`,
      order: fields.length + i
    }));

    setFields([...fields, ...processedFields]);
    setIsAiPromptOpen(false);
    setAiPrompt('');
    showToast('AI Generated', 'Form structure created successfully', 'success');
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f._id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(fields[0]?._id || null);
    }
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      // We need to handle BOTH new and updated fields
      // For simplicity in this demo, we'll assume the backend can handle a bulk sync or we do them one by one
      // Realistically, we'd have a bulk update endpoint

      for (const field of fields) {
        const payload = { ...field, service: serviceId };
        if (field._id.startsWith('temp_')) {
          delete payload._id;
          await api.post('/package-fields', payload);
        } else {
          await api.put(`/package-fields/${field._id}`, payload);
        }
      }

      showToast('Success', 'Form configuration saved', 'success');
      fetchData(); // Refresh to get real IDs
    } catch (error) {
      showToast('Error', 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Figma Builder...</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="action-btn" onClick={() => navigate('/packages/setup')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Universal Form Builder</h1>
            <p>Direct Edit: <strong>{service?.title}</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={fetchData}>Reset</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="builder-container">
        {/* LEFT PANEL: LAYER LIST + SETTINGS */}
        <div className="builder-left-panel">
          <div className="builder-header">
            <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layers & Sections</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`action-btn ${isAiPromptOpen ? 'active' : ''}`}
                onClick={() => setIsAiPromptOpen(!isAiPromptOpen)}
                title="Build with AI"
                style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
              >
                <Wand2 size={14} />
              </button>
              <button
                className="action-btn"
                onClick={addDefaultSection}
                title="Add Default Section (Group 1)"
              >
                <Sparkles size={14} />
              </button>
              <button className="action-btn" onClick={addNewField} title="Add Field">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {isAiPromptOpen && (
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>DESCRIBE YOUR FORM</label>
              <textarea
                className="form-control"
                placeholder="e.g. Create a contact form with subject and message..."
                style={{ fontSize: '12px', minHeight: '80px', marginBottom: '10px', borderRadius: '8px' }}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                className="btn btn-primary w-full"
                style={{ height: '36px', fontSize: '12px', borderRadius: '8px' }}
                onClick={generateWithAI}
              >
                Generate Elements
              </button>
            </div>
          )}

          <div className="field-list">
            {fields.map((field, index) => (
              <div
                key={field._id}
                className={`field-item ${selectedFieldId === field._id ? 'active' : ''}`}
                onClick={() => setSelectedFieldId(field._id)}
              >
                <div className="drag-handle"><GripVertical size={14} /></div>
                <div style={{ color: 'var(--primary)' }}>{fieldTypeIcons[field.fieldType]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{field.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{field.fieldName}</div>
                </div>
                <div className="action-group">
                  <button className="action-btn" style={{ width: '24px', height: '24px' }} onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }} disabled={index === 0}>
                    <ChevronUp size={12} />
                  </button>
                  <button className="action-btn" style={{ width: '24px', height: '24px' }} onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }} disabled={index === fields.length - 1}>
                    <ChevronDown size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedField && (
            <div className="settings-panel" style={{ borderTop: '1px solid var(--border)', width: '100%', height: '450px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>Field Properties</h4>
                <button className="action-btn danger" onClick={() => deleteField(selectedField._id)}><Trash2 size={14} /></button>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px' }}>Label</label>
                <input
                  type="text" className="form-control input-sm"
                  value={selectedField.label}
                  onChange={(e) => handleUpdateField(selectedField._id, { label: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px' }}>Field Name (Key)</label>
                <input
                  type="text" className="form-control input-sm"
                  value={selectedField.fieldName}
                  onChange={(e) => handleUpdateField(selectedField._id, { fieldName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px' }}>Field Type</label>
                <select
                  className="form-control input-sm"
                  value={selectedField.fieldType}
                  onChange={(e) => handleUpdateField(selectedField._id, { fieldType: e.target.value })}
                >
                  {Object.keys(fieldTypeIcons).map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedField.isRequired} onChange={(e) => handleUpdateField(selectedField._id, { isRequired: e.target.checked })} />
                  Required
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedField.showInCard} onChange={(e) => handleUpdateField(selectedField._id, { showInCard: e.target.checked })} />
                  In Card
                </label>
              </div>

              {/* DYNAMIC CONFIG */}
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Config Specifics</h5>

                {(selectedField.fieldType === 'text' || selectedField.fieldType === 'textarea') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '10px' }}>Min</label>
                      <input type="number" className="form-control input-sm" value={selectedField.config?.minLength || ''} onChange={(e) => handleUpdateConfig(selectedField._id, { minLength: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '10px' }}>Max</label>
                      <input type="number" className="form-control input-sm" value={selectedField.config?.maxLength || ''} onChange={(e) => handleUpdateConfig(selectedField._id, { maxLength: e.target.value })} />
                    </div>
                  </div>
                )}

                {selectedField.fieldType === 'select' && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '10px' }}>
                      <input type="checkbox" checked={selectedField.config?.multiple} onChange={(e) => handleUpdateConfig(selectedField._id, { multiple: e.target.checked })} />
                      Allow Multiple
                    </label>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>Options</div>
                    {(selectedField.config?.options || []).map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <input type="text" className="form-control input-sm" value={opt.label} placeholder="Label" onChange={(e) => {
                          const newOpts = [...selectedField.config.options];
                          newOpts[i] = { ...newOpts[i], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s/g, '_') };
                          handleUpdateConfig(selectedField._id, { options: newOpts });
                        }} />
                        <button className="action-btn danger" style={{ width: '32px', height: '32px' }} onClick={() => {
                          handleUpdateConfig(selectedField._id, { options: selectedField.config.options.filter((_, idx) => idx !== i) });
                        }}><X size={12} /></button>
                      </div>
                    ))}
                    <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '8px' }} onClick={() => {
                      handleUpdateConfig(selectedField._id, { options: [...(selectedField.config.options || []), { label: 'New', value: 'new' }] });
                    }}>Add Opt</button>
                  </div>
                )}

                {selectedField.fieldType === 'upload' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '10px' }}>Max Files</label>
                      <input type="number" className="form-control input-sm" value={selectedField.config?.maxFiles || 1} onChange={(e) => handleUpdateConfig(selectedField._id, { maxFiles: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW */}
        <div className="builder-right-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <TransformWrapper
            initialScale={0.85}
            minScale={0.2}
            maxScale={3}
            centerOnInit={true}
            onTransformed={(ref) => setZoomLevel(ref.state.scale)}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="floating-zoom-controls">
                  <div className="zoom-display">{Math.round(zoomLevel * 100)}%</div>
                  <button onClick={() => zoomIn()}>+</button>
                  <button onClick={() => zoomOut()}>-</button>
                  <button onClick={() => resetTransform()}><Maximize size={14} /></button>
                </div>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%', cursor: 'grab' }}
                  contentStyle={{ padding: '100px' }}
                >
                  <div className="preview-canvas">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', borderBottom: '2px solid var(--bg-main)', paddingBottom: '20px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Eye size={24} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Live Preview</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>See how your form will look to vendors</p>
                      </div>
                    </div>

                    <FormGenerator
                      fields={fields}
                      values={previewData}
                      onChange={setPreviewData}
                      errors={{}}
                    />

                    <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preview Mode: Data is not saved during preview.</p>
                    </div>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFormBuilder;
