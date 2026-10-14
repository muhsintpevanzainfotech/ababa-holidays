import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import {
  Plus,
  Layers,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Upload,
  Briefcase,
  X,
  PlusCircle,
  Filter,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import PasskeyModal from '../components/PasskeyModal';
import FilterSelect from '../components/FilterSelect';
import FormSelect from '../components/FormSelect';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCategoriesRequest,
  addCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest
} from '../store/slices/categoriesSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchSubServicesRequest } from '../store/slices/subServicesSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import LockToggleButton from '../components/LockToggleButton';
import { lockSession } from '../store/slices/globalSlice';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, pagination } = useSelector((state) => state.categories);
  const { services } = useSelector((state) => state.services);
  const { subServices } = useSelector((state) => state.subServices);
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [subServiceFilter, setSubServiceFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    service: '',
    subService: '',
    description: '',
    isActive: true,
    image: null,
    icon: null,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  useEffect(() => {
    dispatch(fetchCategoriesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter,
      service: serviceFilter === 'all' ? '' : serviceFilter,
      subService: subServiceFilter === 'all' ? '' : subServiceFilter
    }));
    dispatch(fetchServicesRequest());
    dispatch(fetchSubServicesRequest({ limit: 100 }));
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, serviceFilter, subServiceFilter]);

  const handleOpenModal = (type, category = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && category) {
      setCurrentCategory(category);
      setFormData({
        title: category.title,
        service: category.service?._id || category.service || '',
        subService: category.subService?._id || category.subService || '',
        description: category.description || '',
        isActive: category.isActive,
        image: null,
        icon: null,
        seoTitle: category.seo?.title || '',
        seoDescription: category.seo?.description || '',
        seoKeywords: category.seo?.keywords?.join(', ') || ''
      });
      setImagePreview(category.image?.startsWith('http') ? category.image : getImageUrl(category.image));
      setIconPreview(category.icon?.startsWith('http') ? category.icon : getImageUrl(category.icon));
    } else {
      setFormData({
        title: '',
        service: serviceFilter !== 'all' ? serviceFilter : '',
        subService: subServiceFilter !== 'all' ? subServiceFilter : '',
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

  const handleGuardedAction = (type, category = null) => {
    if (isLocked && (type === 'delete' || type === 'edit' || type === 'add')) {
      setPendingAction({ type, service: category });
      setShowSecurityModal(true);
    } else {
      if (type === 'delete') {
        handleDelete(category._id);
      } else {
        handleOpenModal(type, category);
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
      showToast('Unlocked', 'You can now modify categories freely.', 'success');
    } else if (pendingAction?.type === 'delete') {
      handleDelete(pendingAction.service._id);
    } else if (pendingAction?.type === 'edit') {
      handleOpenModal('edit', pendingAction.service);
    } else if (pendingAction?.type === 'add') {
      handleOpenModal('add');
    }
    setPendingAction(null);
  };

  const handleImageSelect = (file, field) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: null }));
      if (field === 'image') setImagePreview(null);
      if (field === 'icon') setIconPreview(null);
    } else if (file instanceof File) {
      setFormData(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'image') setImagePreview(reader.result);
        if (field === 'icon') setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (typeof file === 'string') {
      if (field === 'image') setImagePreview(file);
      if (field === 'icon') setIconPreview(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('service', formData.service || '');
    data.append('subService', formData.subService || '');
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
      dispatch(addCategoryRequest(data));
      showToast('Success', 'Category created successfully.', 'success');
    } else {
      dispatch(updateCategoryRequest({ id: currentCategory._id, data }));
      showToast('Success', 'Category updated successfully.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Category?',
      'Are you sure you want to delete this category?'
    );

    if (isConfirmed) {
      dispatch(deleteCategoryRequest(id));
      showToast('Deleted', 'Category has been removed.', 'success');
    }
  };

  // Sub-services filtered by service for filter toolbar and modal forms
  const availableFilterSubServices = (subServices || []).filter((sub) => {
    if (serviceFilter === 'all') return true;
    const subSvcId = (sub.service?._id || sub.service || '').toString();
    return subSvcId === serviceFilter.toString();
  });

  const availableFormSubServices = (subServices || []).filter((sub) => {
    if (!formData.service) return true;
    const subSvcId = (sub.service?._id || sub.service || '').toString();
    return subSvcId === formData.service.toString();
  });

  // Server-side filtering enabled
  const displayCategories = categories;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Package Categories</h1>
          <p>Organize travel packages into logical categories and themes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'Admin' && <LockToggleButton onUnlockClick={handleLockToggleInternal} />}
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => handleGuardedAction('add')}>
              <Plus size={20} /> Add Category
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
              placeholder="Search by title, service or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => { setSearchTerm(''); setCurrentPage(1); }} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Services' },
                  ...(services || []).map((s) => ({ value: s._id, label: s.title }))
                ]}
                value={serviceFilter}
                onChange={(val) => {
                  setServiceFilter(val);
                  setSubServiceFilter('all');
                  setCurrentPage(1);
                }}
                width="170px"
              />
              <FilterSelect
                options={[
                  { value: 'all', label: serviceFilter === 'all' ? 'All Sub-Services' : 'All Service Sub-Services' },
                  ...availableFilterSubServices.map((sub) => ({ value: sub._id, label: sub.title }))
                ]}
                value={subServiceFilter}
                onChange={(val) => {
                  setSubServiceFilter(val);
                  setCurrentPage(1);
                }}
                width="180px"
              />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'inactive', label: 'Inactive', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                width="140px"
              />
              {(serviceFilter !== 'all' || subServiceFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setServiceFilter('all');
                    setSubServiceFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Reset all filters"
                >
                  <X size={14} /> Reset
                </button>
              )}
            </div>
            <div className="results-count">
              <span className="badge badge-primary">{pagination?.total || 0}</span>
              <span style={{ marginLeft: '1px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
            </div>

            <div className="view-toggles" style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</p>
      ) : displayCategories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Layers size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No categories found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {displayCategories.map((category) => (
            <div key={category._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={category.image?.startsWith('http') ? category.image : getImageUrl(category.image)}
                  alt={category.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: category.isActive ? '#22c55e' : '#ef4444',
                  color: 'white',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{category.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '14px', minHeight: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {category.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {category.service?.title && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(54, 102, 156, 0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(54, 102, 156, 0.2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Briefcase size={11} /> {category.service.title}
                    </span>
                  )}
                  {category.subService?.title && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(14, 165, 233, 0.1)',
                      color: '#0284c7',
                      border: '1px solid rgba(14, 165, 233, 0.2)'
                    }}>
                      {category.subService.title}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {category.customId}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', category)}>
                      <Info size={16} />
                    </button>
                    {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
                      <button className="action-btn" onClick={() => handleGuardedAction('edit', category)}>
                        <Edit size={16} />
                      </button>
                    )}
                    {user?.role === 'Admin' && (
                      <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', category)}>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Parent Service</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sub-Service</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Custom ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayCategories.map((category, index) => (
                  <tr key={category._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {((currentPage - 1) * limit) + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-main)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {category.image ? (
                            <img src={category.image?.startsWith('http') ? category.image : getImageUrl(category.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Layers size={20} color="var(--primary)" opacity={0.6} />
                          )}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{category.title}</p>
                          {category.description && (
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {category.service?.title ? (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: 'rgba(54, 102, 156, 0.12)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(54, 102, 156, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Briefcase size={12} /> {category.service.title}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {category.subService?.title ? (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: 'rgba(14, 165, 233, 0.12)',
                          color: '#0284c7',
                          border: '1px solid rgba(14, 165, 233, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {category.subService.title}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>{category.customId}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        background: category.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: category.isActive ? '#10b981' : '#ef4444',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', category)}>
                          <Info size={16} />
                        </button>
                        {user?.role === 'Admin' && (
                          <button className="action-btn" title="Edit Category" onClick={() => handleGuardedAction('edit', category)}>
                            <Edit size={16} />
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button className="action-btn danger" title="Remove Category" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', category)}>
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
        title={modalType === 'add' ? 'Add Service Category' : modalType === 'edit' ? 'Edit Category' : 'Category Showcase Details'}
      >
        {modalType === 'view' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)'
             }}>
                <div style={{ height: '180px', width: '100%', background: '#000', position: 'relative' }}>
                   <img 
                      src={imagePreview || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                   />
                   <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                      background: formData.isActive ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                      color: 'white'
                   }}>
                      {formData.isActive ? 'ACTIVE CATEGORY' : 'INACTIVE'}
                   </div>
                </div>

                <div style={{ padding: '20px', position: 'relative', marginTop: iconPreview ? '-40px' : '0' }}>
                   {iconPreview && (
                      <div style={{
                         width: '64px', height: '64px', borderRadius: '14px', background: 'var(--bg-card)',
                         border: '2px solid var(--border)', overflow: 'hidden', padding: '6px',
                         boxShadow: 'var(--shadow-md)', marginBottom: '12px'
                      }}>
                         <img src={iconPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                   )}
                   <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{formData.title}</h2>
                   <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>
                      ID: {currentCategory?.customId || 'CAT-001'}
                   </div>
                </div>
             </div>

             <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
             }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Parent Service
                   </span>
                   <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="var(--primary)" />
                      {currentCategory?.service?.title || 'Not Linked'}
                   </span>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      Sub-Service
                   </span>
                   <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {currentCategory?.subService?.title || 'Not Linked'}
                   </span>
                </div>
             </div>

             <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px'
             }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                   Category Overview & Scope
                </span>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                   {formData.description || 'No detailed description provided.'}
                </p>
             </div>

             <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
             }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
                   SEO Metadata & Indexing
                </span>
                <div>
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meta Title</span>
                   <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {formData.seoTitle || formData.title}
                   </p>
                </div>
                <div>
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Meta Description</span>
                   <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-main)' }}>
                      {formData.seoDescription || formData.description}
                   </p>
                </div>
                <div>
                   <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Keywords</span>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.seoKeywords ? formData.seoKeywords.split(',').map((kw, i) => (
                         <span key={i} className="seo-keyword-badge">{kw.trim()}</span>
                      )) : (
                         <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No SEO keywords defined</span>
                      )}
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {user?.role === 'Admin' && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ flex: 1, height: '44px' }}
                    onClick={() => handleGuardedAction('edit', currentCategory)}
                  >
                    <Edit size={16} /> Edit Category
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', height: '44px', flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Title</label>
              <input
                type="text" className="form-control" required placeholder="e.g. Budget Stays"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <FormSelect
                label="Parent Service"
                options={(services || []).map((s) => ({ value: s._id, label: s.title }))}
                value={formData.service}
                onChange={(val) => setFormData({ ...formData, service: val, subService: '' })}
                placeholder="Select Parent Service (Optional)"
              />
            </div>

            <div className="form-group">
              <FormSelect
                label="Parent Sub-Service"
                options={availableFormSubServices.map((sub) => ({ value: sub._id, label: sub.title }))}
                value={formData.subService}
                onChange={(val) => setFormData({ ...formData, subService: val })}
                placeholder="Select Sub-Service (Optional)"
              />
            </div>

            <ImageUpload
              label="Category Icon (Small Logo)"
              value={formData.icon || iconPreview}
              onChange={(val) => handleImageSelect(val, 'icon')}
              compact={true}
              title="Drag & drop category icon or click to browse"
              caption="PNG, SVG or JPG (max 2MB)"
              maxSizeMB={2}
            />

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control" style={{ height: '100px', resize: 'none', padding: '12px' }} required
                placeholder="What this category represents..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Category is active and visible</span>
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
                />
              </div>
              <div className="form-group">
                <label>SEO Description</label>
                <textarea
                  className="form-control" style={{ height: '80px', resize: 'none', padding: '12px' }}
                  placeholder="Meta description for search results"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>SEO Keywords (comma separated)</label>
                <input
                  type="text" className="form-control" placeholder="keyword1, keyword2, keyword3"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                />
              </div>
            </div>

            <ImageUpload
              label="Category Image"
              value={formData.image || imagePreview}
              onChange={(val) => handleImageSelect(val, 'image')}
              title="Drag & drop category banner image here, or click to browse"
              caption="Supports High Quality PNG, JPG, WEBP (max 5MB)"
              maxSizeMB={5}
            />

            <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600', width: '100%', marginTop: '16px' }}>
              {modalType === 'add' ? 'Create Category' : 'Save Changes'}
            </button>
          </form>
        )}
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

export default Categories;
