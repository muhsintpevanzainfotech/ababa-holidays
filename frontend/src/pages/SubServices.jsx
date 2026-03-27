import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import { 
  Plus, 
  Search,
  LayoutGrid,
  List as ListIcon,
  Edit,
  Trash2,
  Upload,
  Briefcase,
  Wrench,
  X,
  Power,
  Filter
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import FormSelect from '../components/FormSelect';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchSubServicesRequest, 
  addSubServiceRequest, 
  updateSubServiceRequest, 
  deleteSubServiceRequest 
} from '../store/slices/subServicesSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const SubServices = () => {
  const dispatch = useDispatch();
  const { subServices, loading, error } = useSelector((state) => state.subServices);
  const { services } = useSelector((state) => state.services);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentSubService, setCurrentSubService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service: '',
    isActive: true,
    image: null,
    icon: null
  });

  useEffect(() => {
    dispatch(fetchSubServicesRequest());
    dispatch(fetchServicesRequest());
  }, [dispatch]);

  const handleOpenModal = (type, subService = null) => {
    setModalType(type);
    if (type === 'edit' && subService) {
      setCurrentSubService(subService);
      setFormData({
        title: subService.title,
        description: subService.description || '',
        service: subService.service?._id || subService.service || '',
        isActive: subService.isActive,
        image: null,
        icon: null
      });
      setImagePreview(subService.image?.startsWith('http') ? subService.image : getImageUrl(subService.image));
    } else {
      setFormData({ title: '', description: '', service: '', isActive: true, image: null, icon: null });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
      if (field === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service) {
      return showToast('Error', 'Please select a parent service', 'error');
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('service', formData.service);
    data.append('isActive', formData.isActive);
    if (formData.image) data.append('image', formData.image);
    if (formData.icon) data.append('icon', formData.icon);

    if (modalType === 'add') {
      dispatch(addSubServiceRequest(data));
      showToast('Success', 'Sub-service created successfully.', 'success');
    } else {
      dispatch(updateSubServiceRequest({ id: currentSubService._id, data }));
      showToast('Success', 'Sub-service updated successfully.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Sub-Service?',
      'Are you sure you want to delete this sub-service?'
    );
    
    if (isConfirmed) {
      dispatch(deleteSubServiceRequest(id));
      showToast('Deleted', 'Sub-service has been removed.', 'success');
    }
  };

  const filteredSubServices = subServices.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.service?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'active' ? s.isActive : !s.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Expert Sub-Services</h1>
          <p>Configure and manage secondary services and specialized offerings</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add Sub-Service
        </button>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, description or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="filter-group">
              <FilterSelect 
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'inactive', label: 'Inactive', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="160px"
              />
            </div>
            <div className="results-count">
              <span className="badge badge-primary">{filteredSubServices.length}</span>
              <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
            </div>

            <div className="view-toggles">
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading sub-services...</p>
      ) : filteredSubServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Wrench size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No sub-services found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {filteredSubServices.map((sub) => (
            <div key={sub._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img 
                  src={sub.image?.startsWith('http') ? sub.image : getImageUrl(sub.image)} 
                  alt={sub.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ 
                  position: 'absolute', top: '12px', right: '12px',
                  background: sub.isActive ? '#22c55e' : '#ef4444',
                  color: 'white',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {sub.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Briefcase size={14} color="var(--primary)" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {typeof sub.service === 'object' ? sub.service.title : 'Service'}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{sub.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '20px', minHeight: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {sub.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => handleOpenModal('edit', sub)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleDelete(sub._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sub-Service</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Parent Service</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubServices.map((sub, index) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                          <img src={sub.image?.startsWith('http') ? sub.image : getImageUrl(sub.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{sub.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: '#eff6ff', color: '#1d4ed8'
                      }}>
                        {typeof sub.service === 'object' ? sub.service.title : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: sub.isActive ? '#dcfce7' : '#fee2e2', color: sub.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="Edit Sub-Service" onClick={() => handleOpenModal('edit', sub)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" title="Remove Sub-Service" onClick={() => handleDelete(sub._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add Sub-Service' : 'Edit Sub-Service'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sub-Service Title</label>
            <input 
              type="text" className="form-control" required placeholder="e.g. Guided Tours"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="form-group">
            <FormSelect 
              label="Parent Service"
              required
              options={services.map(s => ({ value: s._id, label: s.title }))}
              value={formData.service}
              onChange={(val) => setFormData({...formData, service: val})}
              placeholder="Select Service"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" style={{ height: '100px', resize: 'none', padding: '12px' }} required
              placeholder="What this sub-service covers..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <span>Sub-Service is active and visible</span>
            </label>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label>Sub-Service Image</label>
            <div 
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}
              onClick={() => document.getElementById('subServiceImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload image</p>
                </div>
              )}
              <input id="subServiceImage" type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'image')} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
            {modalType === 'add' ? 'Create Sub-Service' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default SubServices;
