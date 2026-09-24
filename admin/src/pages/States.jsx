import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import FilterSelect from '../components/FilterSelect';
import ActionDropdown from '../components/ActionDropdown';
import {
  Plus,
  MapPin,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  X,
  Map as StateIcon,
  Filter,
  Info,
  Globe,
  Link2
} from 'lucide-react';
import PasskeyModal from '../components/PasskeyModal';
import LockToggleButton from '../components/LockToggleButton';
import { setUnlocked, lockSession } from '../store/slices/globalSlice';
import FormSelect from '../components/FormSelect';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStatesRequest,
  addStateRequest,
  updateStateRequest,
  deleteStateRequest,
  fetchCountriesRequest
} from '../store/slices/locationsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const States = () => {
  const dispatch = useDispatch();
  const { states, pagination, loading, error } = useSelector((state) => state.states);
  const { countries } = useSelector((state) => state.countries);
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentState, setCurrentState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    code: '',
    slug: '',
    description: '',
    coverImage: null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchStatesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter,
      country: countryFilter
    }));
    dispatch(fetchCountriesRequest({ limit: 1000, all: 'true' })); // Fetch all for dropdown
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, countryFilter]);

  const generateSlug = (val) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      ...(modalType === 'add' || !prev.slug ? { slug: generateSlug(val) } : {})
    }));
  };

  const handleOpenModal = (type, state = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && state) {
      setCurrentState(state);
      const parentCountryId = state.country?._id || state.countryId || state.country;
      setFormData({
        name: state.name || '',
        country: parentCountryId || '',
        code: state.code || '',
        slug: state.slug || (state.name ? generateSlug(state.name) : ''),
        description: state.description || '',
        isActive: state.isActive !== undefined ? state.isActive : true,
        coverImage: null
      });
      const imgPath = state.coverImage || state.image;
      setImagePreview(imgPath?.startsWith('http') ? imgPath : getImageUrl(imgPath));
    } else {
      setFormData({
        name: '',
        country: countries.length > 0 ? countries[0]._id : '',
        code: '',
        slug: '',
        description: '',
        isActive: true,
        coverImage: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleGuardedAction = (type, state = null) => {
    if (type === 'view') {
      handleOpenModal('view', state);
      return;
    }

    if (isLocked && (type === 'delete' || type === 'edit' || type === 'add')) {
      setPendingAction({ type, state });
      setShowSecurityModal(true);
    } else {
      if (type === 'delete') {
        handleDelete(state._id);
      } else {
        handleOpenModal(type, state);
      }
    }
  };

  const handleLockToggleInternal = () => {
    if (!isUnlocked) {
      setPendingAction({ type: 'unlock' });
      setShowSecurityModal(true);
    } else {
      dispatch(lockSession());
      showToast('Locked', 'Session locked successfully.', 'info');
    }
  };

  const onSecurityVerified = () => {
    setShowSecurityModal(false);
    if (pendingAction?.type === 'unlock') {
      showToast('Unlocked', 'You can now modify states freely.', 'success');
    } else if (pendingAction) {
      if (pendingAction.type === 'delete') {
        handleDelete(pendingAction.state._id);
      } else {
        handleOpenModal(pendingAction.type, pendingAction.state);
      }
    }
    setPendingAction(null);
  };

  const handleImageSelect = (file) => {
    if (modalType === 'view') return;
    if (!file) {
      setFormData(prev => ({ ...prev, coverImage: null }));
      setImagePreview(null);
    } else if (file instanceof File) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      setImagePreview(URL.createObjectURL(file));
    } else if (typeof file === 'string') {
      setImagePreview(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'view') return;

    if (!formData.country) {
      showToast('Validation Error', 'Please select a parent country', 'error');
      return;
    }
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    if (modalType === 'add') {
      dispatch(addStateRequest(data));
      showToast('Success', 'State added successfully', 'success');
    } else {
      dispatch(updateStateRequest({ id: currentState._id, data }));
      showToast('Success', 'State updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (await confirm('Delete State?', 'This will permanently delete this state and potentially affect linked destinations.')) {
      dispatch(deleteStateRequest(id));
      showToast('Deleted', 'State removed successfully', 'success');
    }
  };

  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Platform <span style={{ color: 'var(--primary)' }}>States & Provinces</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage regional states, province codes, URL slugs, and cover imagery per country
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
            <>
              <LockToggleButton onUnlockClick={handleLockToggleInternal} />
              <button className="btn btn-primary" onClick={() => handleGuardedAction('add')}>
                <Plus size={20} /> Add State
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by state name, code, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Countries' },
                  ...countries.map(c => ({ value: c._id, label: `${c.flag || '🌐'} ${c.name}` }))
                ]}
                value={countryFilter}
                onChange={setCountryFilter}
                width="180px"
              />
            </div>

            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'inactive', label: 'Inactive', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="140px"
              />
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading states...</p>
      ) : states.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <StateIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No states found. Start by adding a new state or province.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {states.map((state) => {
            const cover = state.coverImage || state.image;
            const countryObj = typeof state.country === 'object' ? state.country : countries.find(c => c._id === state.country);
            return (
              <div key={state._id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
                <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                  <img
                    src={cover?.startsWith('http') ? cover : getImageUrl(cover)}
                    alt={state.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: state.isActive ? '#22c55e' : '#ef4444',
                    color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800'
                  }}>
                    {state.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>

                  <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                    color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span>{countryObj?.flag || '🌐'}</span>
                    <span>{countryObj?.name || 'Country'}</span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>{state.name}</h3>
                    {state.code && (
                      <span style={{ fontSize: '12px', fontWeight: '800', padding: '2px 8px', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        {state.code}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', marginBottom: '12px' }}>
                    /{state.slug || generateSlug(state.name)}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                    {state.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', state)}>
                      <Info size={16} />
                    </button>
                    <button className="action-btn" title="Edit State" onClick={() => handleGuardedAction('edit', state)}>
                      <Edit size={16} />
                    </button>
                    {user?.role === 'Admin' && (
                      <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', state)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>State / Province</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Parent Country</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Code / Slug</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {states.map((state, index) => {
                  const cover = state.coverImage || state.image;
                  const countryObj = typeof state.country === 'object' ? state.country : countries.find(c => c._id === state.country);
                  return (
                    <tr key={state._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        {startIndex + index + 1}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, border: '1px solid var(--border)' }}>
                            <img src={cover?.startsWith('http') ? cover : getImageUrl(cover)} alt={state.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{state.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{state.description ? state.description.substring(0, 30) + '...' : 'No details'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{countryObj?.flag || '🌐'}</span>
                          <span>{countryObj?.name || 'N/A'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '800', fontSize: '13px' }}>{state.code || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>/{state.slug || generateSlug(state.name)}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                          background: state.isActive ? '#dcfce7' : '#fee2e2', color: state.isActive ? '#166534' : '#b91c1c'
                        }}>
                          {state.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group">
                          <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', state)}>
                            <Info size={16} />
                          </button>
                          <button className="action-btn" title="Edit State" onClick={() => handleGuardedAction('edit', state)}>
                            <Edit size={16} />
                          </button>
                          {user?.role === 'Admin' && (
                            <button className="action-btn danger" title="Remove State" onClick={() => handleGuardedAction('delete', state)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          itemsPerPage={pagination.limit}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setLimit}
        />
      )}

      {/* STATE MANAGE DRAWER */}
      <Drawer 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalType === 'add' ? 'Add New State / Province' : modalType === 'edit' ? 'Edit State Protocol' : 'State Profile Details'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. PARENT COUNTRY SELECT */}
          <div className="form-group" style={{ margin: 0 }}>
            <FormSelect
              label="Parent Country *"
              required
              options={countries.map(c => ({ value: c._id, label: `${c.flag || '🌐'} ${c.name} (${c.code || 'IN'})` }))}
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val })}
              placeholder="Select Parent Country"
              disabled={modalType === 'view'}
            />
          </div>

          {/* 2. STATE NAME & CODE */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>State / Province Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Kerala"
                value={formData.name}
                onChange={handleNameChange}
                required
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', fontWeight: '700' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>State Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. KL"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: '700' }}
              />
            </div>
          </div>

          {/* 3. URL SLUG */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>URL Slug</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. kerala"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
              disabled={modalType === 'view'}
              style={{ height: '46px', borderRadius: '12px', fontWeight: '600' }}
            />
          </div>

          {/* 4. COVER IMAGE UPLOAD */}
          <ImageUpload
            label="Cover Image"
            value={formData.coverImage || imagePreview}
            onChange={handleImageSelect}
            disabled={modalType === 'view'}
            title="Drag & drop state cover photo here, or click to browse"
            caption="Supports PNG, JPG, WEBP (max 5MB)"
            maxSizeMB={5}
          />

          {/* 5. DESCRIPTION */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Description & Overview</label>
            <textarea
              className="form-control"
              placeholder="Provide a description of the state for travel itineraries..."
              style={{ height: '100px', padding: '12px', resize: 'none', borderRadius: '12px' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>

          {/* 6. IS ACTIVE TOGGLE */}
          <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: modalType === 'view' ? 'default' : 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={modalType === 'view'}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px' }}>State Active Status</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>When active, this state will be selectable for destinations & tour packages</div>
              </div>
            </label>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '800', borderRadius: '12px', marginTop: '10px' }}>
              {modalType === 'add' ? 'Add State Protocol' : 'Save Changes'}
            </button>
          )}
        </form>
      </Drawer>

      <PasskeyModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onVerified={onSecurityVerified}
      />
    </div>
  );
};

export default States;
