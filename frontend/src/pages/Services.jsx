import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import {
  Plus,
  MapPin,
  Globe,
  Briefcase,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  LayoutGrid,
  List as ListIcon,
  Settings,
  Edit,
  Trash2,
  Upload,
  X,
  Power,
  PlusCircle,
  Clock,
  Filter,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import PasskeyModal from '../components/PasskeyModal';
import FilterSelect from '../components/FilterSelect';
import FormSelect from '../components/FormSelect';
import LockToggleButton from '../components/LockToggleButton';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchServicesRequest,
  addServiceRequest,
  updateServiceRequest,
  deleteServiceRequest
} from '../store/slices/servicesSlice';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { setUnlocked, lockSession } from '../store/slices/globalSlice';

const Services = () => {
  const dispatch = useDispatch();
  const { services, loading, error, pagination } = useSelector((state) => state.services);
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
    image: null,
    icon: null,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  useEffect(() => {
    dispatch(fetchServicesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter
    }));
    dispatch(fetchCategoriesRequest());
  }, [dispatch, currentPage, limit, searchTerm, statusFilter]);

  const handleOpenModal = (type, service = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && service) {
      setCurrentService(service);
      setFormData({
        title: service.title,
        description: service.description || '',
        isActive: service.isActive,
        image: null,
        icon: null,
        seoTitle: service.seo?.title || '',
        seoDescription: service.seo?.description || '',
        seoKeywords: service.seo?.keywords?.join(', ') || ''
      });
      setImagePreview(service.image?.startsWith('http') ? service.image : getImageUrl(service.image));
      setIconPreview(service.icon?.startsWith('http') ? service.icon : getImageUrl(service.icon));
    } else {
      setFormData({
        title: '',
        description: '',
        isActive: true,
        image: null,
        icon: null,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
      setImagePreview(null);
      setIconPreview(null);
    }
    setShowModal(true);
  };

  const handleGuardedAction = (type, service = null) => {
    if (isLocked && (type === 'delete' || type === 'edit' || type === 'add')) {
      setPendingAction({ type, service });
      setShowSecurityModal(true);
    } else {
      if (type === 'delete') {
        handleDelete(service._id);
      } else {
        handleOpenModal(type, service);
      }
    }
  };

  const handleLockToggleInternal = () => {
    setPendingAction({ type: 'unlock' });
    setShowSecurityModal(true);
  };

  const onSecurityVerified = () => {
    setShowSecurityModal(false);
    if (pendingAction?.type === 'unlock') {
      showToast('Unlocked', 'You can now modify services freely.', 'success');
    } else if (pendingAction) {
      if (pendingAction.type === 'delete') {
        handleDelete(pendingAction.service._id);
      } else {
        handleOpenModal(pendingAction.type, pendingAction.service);
      }
    }
    setPendingAction(null);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'image') setImagePreview(reader.result);
        if (field === 'icon') setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('isActive', formData.isActive);
    if (formData.image) data.append('image', formData.image);
    if (formData.icon) data.append('icon', formData.icon);

    // Format SEO data
    const seoData = {
      title: formData.seoTitle,
      description: formData.seoDescription,
      keywords: formData.seoKeywords ? formData.seoKeywords.split(',').map(k => k.trim()) : []
    };
    data.append('seo', JSON.stringify(seoData));

    if (modalType === 'add') {
      dispatch(addServiceRequest(data));
      showToast('Success', 'Service created successfully.', 'success');
    } else {
      dispatch(updateServiceRequest({ id: currentService._id, data }));
      showToast('Success', 'Service updated successfully.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Service?',
      'Are you sure you want to delete this service? All related sub-services will be affected.'
    );

    if (isConfirmed) {
      dispatch(deleteServiceRequest(id));
      showToast('Deleted', 'Service has been removed.', 'success');
    }
  };

  // Server-side filtering is now implemented.
  // We use the full services array from Redux state.
  const displayServices = services;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform Services</h1>
          <p>Manage primary service categories and global settings</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'Admin' && <LockToggleButton onUnlockClick={handleLockToggleInternal} />}
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => handleGuardedAction('add')}>
              <Plus size={20} /> Add New Service
            </button>
          )}
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by service title..."
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
              <span className="badge badge-primary">{pagination?.total || 0}</span>
              <span style={{ marginLeft: '1px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading services...</p>
      ) : displayServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No services found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {displayServices.map((service) => (
            <div key={service._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={service.image?.startsWith('http') ? service.image : getImageUrl(service.image)}
                  alt={service.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: service.isActive ? '#22c55e' : '#ef4444',
                  color: 'white',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{service.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '20px', minHeight: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {service.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {service.customId}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', service)}>
                      <Eye size={16} />
                    </button>
                    {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
                      <button className="action-btn" title="Edit Service" onClick={() => handleGuardedAction('edit', service)}>
                        <Edit size={16} />
                      </button>
                    )}
                    {user?.role === 'Admin' && (
                      <button className="action-btn danger" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', service)}>
                        <Trash2 size={16} />
                      </button>
                    )}
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Custom ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayServices.map((service, index) => (
                  <tr key={service._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {((currentPage - 1) * limit) + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                          <img src={service.image?.startsWith('http') ? service.image : getImageUrl(service.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{service.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{service.customId}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: service.isActive ? '#dcfce7' : '#fee2e2', color: service.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', service)}>
                          <Eye size={16} />
                        </button>
                        {user?.role === 'Admin' && (
                          <button className="action-btn" title="Edit Service" onClick={() => handleGuardedAction('edit', service)}>
                            <Edit size={16} />
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button className="action-btn danger" title="Remove Service" onClick={() => handleGuardedAction('delete', service)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={limit}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setLimit}
        />
      )}

      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add Service Type' : modalType === 'edit' ? 'Edit Service' : 'Service Details'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text" className="form-control" required placeholder="e.g. Luxury Hotel"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>Service Icon (Small Logo)</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center', background: 'var(--bg-main)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
              onClick={() => modalType !== 'view' && document.getElementById('serviceIcon').click()}
            >
              {iconPreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={iconPreview} alt="Icon Preview" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'contain', background: '#fff', padding: '4px', boxShadow: 'var(--shadow)' }} />
                  {modalType !== 'view' && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Change Icon</div>}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <PlusCircle size={24} style={{ marginBottom: '4px' }} />
                  <p style={{ fontSize: '13px' }}>Click to upload icon</p>
                </div>
              )}
              {modalType !== 'view' && <input id="serviceIcon" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'icon')} />}
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control" style={{ height: '100px', resize: 'none', padding: '12px' }} required
              placeholder="What this service category covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Service is active and visible</span>
            </label>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>SEO Configuration</h4>
            <div className="form-group">
              <label>SEO Title</label>
              <input
                type="text" className="form-control" placeholder="Meta title for SEO"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                disabled={modalType === 'view'}
              />
            </div>
            <div className="form-group">
              <label>SEO Description</label>
              <textarea
                className="form-control" style={{ height: '80px', resize: 'none', padding: '12px' }}
                placeholder="Meta description for search results"
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                disabled={modalType === 'view'}
              />
            </div>
            <div className="form-group">
              <label>SEO Keywords (comma separated)</label>
              <input
                type="text" className="form-control" placeholder="keyword1, keyword2, keyword3"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                disabled={modalType === 'view'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label>Service Image</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
              onClick={() => modalType !== 'view' && document.getElementById('serviceImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  {modalType !== 'view' && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload service image</p>
                </div>
              )}
              {modalType !== 'view' && <input id="serviceImage" type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'image')} />}
            </div>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
              {modalType === 'add' ? 'Create Service' : 'Save Changes'}
            </button>
          )}
        </form>
      </Drawer>
      <PasskeyModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onVerified={onSecurityVerified}
        title={pendingAction?.type === 'unlock' ? 'Unlock Modifications' : 'Security Check Required'}
      />
    </div>
  );
};

export default Services;
