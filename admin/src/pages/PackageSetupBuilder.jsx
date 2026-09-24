import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Settings,
  Type,
  AlignLeft,
  List,
  Upload,
  Hash,
  Calendar,
  Eye,
  ArrowLeft,
  MoreVertical,
  CheckCircle2,
  GripVertical
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';

const PackageSetupBuilder = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [service, setService] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [modalType, setModalType] = useState('add');

  const [formData, setFormData] = useState({
    setId: '',
    setTitle: '',
    setOrder: 0,
    label: '',
    fieldName: '',
    fieldType: 'text',
    isRequired: false,
    order: 0,
    secondaryLabel: '',
    showInCard: false,
    config: {
      minLength: '',
      maxLength: '',
      rows: 3,
      options: [],
      searchable: false,
      multiple: false,
      withImage: false,
      minFiles: 1,
      maxFiles: 1,
      accept: ['image'],
      allowCustom: true,
      dependsOn: '',
      api: ''
    }
  });

  const [selectOption, setSelectOption] = useState({ label: '', value: '', image: '' });

  const handleSetTitleChange = (newTitle) => {
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
    const autoId = slug ? `set_${slug}` : '';
    setFormData(prev => ({
      ...prev,
      setTitle: newTitle,
      setId: prev.setId && !prev.setId.startsWith('set_') ? prev.setId : autoId
    }));
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, fieldsRes] = await Promise.all([
        api.get(`/services`), // We'll find our service in the list
        api.get(`/package-fields/setup/${serviceId}`)
      ]);
      
      const foundService = serviceRes.data.data.find(s => s._id === serviceId || s.customId === serviceId);
      setService(foundService);
      setFields(fieldsRes.data.data);
    } catch (error) {
      showToast('Error', 'Failed to fetch package setup data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (type, field = null) => {
    setModalType(type);
    if (type === 'edit' && field) {
      setCurrentField(field);
      setFormData({
        setId: field.setId || '',
        setTitle: field.setTitle || '',
        setOrder: field.setOrder || 0,
        ...field,
        config: {
          ...formData.config,
          ...field.config
        }
      });
    } else {
      setCurrentField(null);
      setFormData({
        setId: '',
        setTitle: '',
        setOrder: 0,
        label: '',
        fieldName: '',
        fieldType: 'text',
        isRequired: false,
        order: fields.length,
        secondaryLabel: '',
        showInCard: false,
        config: {
          minLength: '',
          maxLength: '',
          rows: 3,
          options: [],
          searchable: false,
          multiple: false,
          withImage: false,
          minFiles: 1,
          maxFiles: 1,
          accept: ['image'],
          allowCustom: true,
          dependsOn: '',
          api: ''
        }
      });
    }
    setShowDrawer(true);
  };

  const handleAddOption = () => {
    if (!selectOption.label || !selectOption.value) return;
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        options: [...formData.config.options, { ...selectOption }]
      }
    });
    setSelectOption({ label: '', value: '', image: '' });
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...formData.config.options];
    newOptions.splice(index, 1);
    setFormData({
      ...formData,
      config: { ...formData.config, options: newOptions }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, service: serviceId };
      
      if (modalType === 'add') {
        await api.post('/package-fields', payload);
        showToast('Success', 'Field added successfully', 'success');
      } else {
        await api.put(`/package-fields/${currentField._id}`, payload);
        showToast('Success', 'Field updated successfully', 'success');
      }
      
      setShowDrawer(false);
      fetchData();
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to save field', 'error');
    }
  };

  const handleDelete = async (fieldId) => {
    const isConfirmed = await confirm(
      'Delete Field?',
      'Are you sure you want to delete this field? Data stored in this field for existing packages might be affected.'
    );
    
    if (isConfirmed) {
      try {
        await api.delete(`/package-fields/${fieldId}`);
        showToast('Deleted', 'Field removed successfully', 'success');
        fetchData();
      } catch (error) {
        showToast('Error', 'Failed to delete field', 'error');
      }
    }
  };

  const handleReorder = async (direction, index) => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    // Swap
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order values
    const updatedFields = newFields.map((f, i) => ({ id: f._id, order: i }));
    
    try {
      await api.put('/package-fields/reorder', { fields: updatedFields });
      setFields(newFields);
    } catch (error) {
      showToast('Error', 'Failed to reorder fields', 'error');
    }
  };

  if (loading && !service) return <div className="p-8 text-center">Loading builder...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="action-btn" onClick={() => navigate('/packages/setup')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Package Setup Builder</h1>
            <p>Define custom fields for <strong>{service?.title}</strong> packages</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenDrawer('add')}>
          <Plus size={20} /> Add Custom Field
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', width: '60px' }}>Order</th>
                <th style={{ padding: '16px 24px' }}>Label / Key</th>
                <th style={{ padding: '16px 24px' }}>Type</th>
                <th style={{ padding: '16px 24px' }}>Required</th>
                <th style={{ padding: '16px 24px' }}>In Card</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No custom fields defined yet for this service.
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr key={field._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button 
                          className="action-btn" 
                          disabled={index === 0}
                          onClick={() => handleReorder('up', index)}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          className="action-btn" 
                          disabled={index === fields.length - 1}
                          onClick={() => handleReorder('down', index)}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{field.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{field.fieldName}</div>
                      {field.setTitle && (
                        <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>
                          📁 {field.setTitle} {field.setId && <code style={{ fontSize: '10px', opacity: 0.8, marginLeft: '4px' }}>({field.setId})</code>}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {field.fieldType}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {field.isRequired ? <CheckCircle2 size={18} color="#16a34a" /> : <X size={18} color="#dc2626" />}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {field.showInCard ? <CheckCircle2 size={18} color="#3498db" /> : <X size={18} color="#94a3b8" />}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="action-btn" onClick={() => handleOpenDrawer('edit', field)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" onClick={() => handleDelete(field._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={modalType === 'add' ? 'Add Custom Field' : 'Edit Field'}
        width="500px"
      >
        <form onSubmit={handleSubmit}>
          {/* Field Set / Section Grouping */}
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📁 Field Set / Section Group (Optional)
            </h4>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px' }}>Set Title (e.g. SEO & Search Optimization)</label>
              <input
                type="text" className="form-control" placeholder="e.g. SEO & Search Optimization"
                value={formData.setTitle || ''}
                onChange={(e) => handleSetTitleChange(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label style={{ fontSize: '12px' }}>Set ID (Auto-generated or Custom)</label>
              <input
                type="text" className="form-control" placeholder="e.g. set_seo_search_optimization"
                value={formData.setId || ''}
                onChange={(e) => setFormData({ ...formData, setId: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Field Label</label>
            <input
              type="text" className="form-control" placeholder="e.g. Hotel Star Rating"
              required
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Field Name (Unique Key)</label>
            <input
              type="text" className="form-control" placeholder="e.g. starRating"
              required
              pattern="^[a-zA-Z0-9_]+$"
              title="Only alphanumeric and underscore allowed"
              value={formData.fieldName}
              onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Field Type</label>
            <select 
              className="form-control"
              value={formData.fieldType}
              onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
            >
              <optgroup label="TEXT & INPUT PROTOCOL">
                <option value="text">Text Input</option>
                <option value="email">Email Address</option>
                <option value="password">Password Secure</option>
                <option value="phone">Telephone</option>
                <option value="url">URL Address</option>
                <option value="search">Search Bar</option>
                <option value="textarea">Textarea Multi</option>
              </optgroup>
              <optgroup label="NUMERIC & CHRONO">
                <option value="number">Number Field</option>
                <option value="date">Date Picker</option>
                <option value="datetime">Date & Time</option>
                <option value="time">Time Picker</option>
                <option value="month">Month Picker</option>
                <option value="week">Week Picker</option>
              </optgroup>
              <optgroup label="SELECTION PROTOCOL">
                <option value="select">Select Dropdown</option>
                <option value="checkbox">Checkbox Group</option>
                <option value="radio">Radio Group</option>
                <option value="switch">Switch Toggle</option>
              </optgroup>
              <optgroup label="TRANSMISSION">
                <option value="upload">File Upload</option>
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label>Field Dependency (Optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select 
                className="form-control"
                value={formData.config.dependsOn}
                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, dependsOn: e.target.value } })}
              >
                <option value="">No Dependency</option>
                {fields.filter(f => f._id !== currentField?._id).map(f => (
                  <option key={f.fieldName} value={f.fieldName}>{f.label}</option>
                ))}
              </select>
              <input 
                type="text" className="form-control" placeholder="API Path (e.g. /api/options/:value)"
                value={formData.config.api}
                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, api: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                />
                <span>Is Required?</span>
              </label>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.showInCard}
                  onChange={(e) => setFormData({ ...formData, showInCard: e.target.checked })}
                />
                <span>Show in card?</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Secondary Label / Instruction (Optional)</label>
            <input
              type="text" className="form-control" placeholder="Small text below label"
              value={formData.secondaryLabel}
              onChange={(e) => setFormData({ ...formData, secondaryLabel: e.target.value })}
            />
          </div>

          {/* DYNAMIC CONFIG SECTION */}
          <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', marginTop: '24px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} /> Configuration Settings
            </h4>

            {['text', 'email', 'password', 'phone', 'url', 'search', 'textarea'].includes(formData.fieldType) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Min Length</label>
                  <input
                    type="number" className="form-control"
                    value={formData.config.minLength || ''}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, minLength: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Length</label>
                  <input
                    type="number" className="form-control"
                    value={formData.config.maxLength || ''}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxLength: e.target.value } })}
                  />
                </div>
                {formData.fieldType === 'textarea' && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Visible Rows</label>
                    <input
                      type="number" className="form-control"
                      value={formData.config.rows}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, rows: e.target.value } })}
                    />
                  </div>
                )}
              </div>
            )}

            {formData.fieldType === 'upload' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Min Files</label>
                    <input
                      type="number" className="form-control"
                      value={formData.config.minFiles}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, minFiles: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Files</label>
                    <input
                      type="number" className="form-control"
                      value={formData.config.maxFiles}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxFiles: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Accepted Formats</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    {['image', 'video', 'pdf'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.config.accept.includes(type)}
                          onChange={(e) => {
                            const newAccept = e.target.checked 
                              ? [...formData.config.accept, type]
                              : formData.config.accept.filter(a => a !== type);
                            setFormData({ ...formData, config: { ...formData.config, accept: newAccept } });
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {['select', 'radio', 'checkbox'].includes(formData.fieldType) && (
              <>
                <div style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Add Option</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" className="form-control input-sm" placeholder="Label"
                      value={selectOption.label}
                      onChange={(e) => setSelectOption({ ...selectOption, label: e.target.value })}
                    />
                    <input 
                      type="text" className="form-control input-sm" placeholder="Value"
                      value={selectOption.value}
                      onChange={(e) => setSelectOption({ ...selectOption, value: e.target.value })}
                    />
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={handleAddOption}>
                    <Plus size={14} /> Add Option
                  </button>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {formData.config.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px' }}>
                        <strong>{opt.label}</strong> ({opt.value})
                      </div>
                      <button type="button" className="action-btn danger" onClick={() => handleRemoveOption(i)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '32px', height: '48px' }}>
            <Save size={20} /> {modalType === 'add' ? 'Create Field' : 'Update Field'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default PackageSetupBuilder;
