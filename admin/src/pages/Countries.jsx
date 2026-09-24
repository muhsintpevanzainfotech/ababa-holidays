import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import {
  Plus,
  Globe,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  X,
  Filter,
  Info,
  DollarSign,
  PhoneCall,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import PasskeyModal from '../components/PasskeyModal';
import LockToggleButton from '../components/LockToggleButton';
import { setUnlocked, lockSession } from '../store/slices/globalSlice';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCountriesRequest,
  addCountryRequest,
  updateCountryRequest,
  deleteCountryRequest
} from '../store/slices/locationsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Countries = () => {
  const dispatch = useDispatch();
  const { countries, pagination, loading, error } = useSelector((state) => state.countries);
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCountry, setCurrentCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    currency: 'INR',
    currencySymbol: '₹',
    phoneCode: '+91',
    flag: '🇮🇳',
    description: '',
    coverImage: null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchCountriesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter
    }));
  }, [dispatch, currentPage, limit, searchTerm, statusFilter]);

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

  const handleOpenModal = (type, country = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && country) {
      setCurrentCountry(country);
      setFormData({
        name: country.name || '',
        code: country.code || '',
        slug: country.slug || (country.name ? generateSlug(country.name) : ''),
        currency: country.currency || 'INR',
        currencySymbol: country.currencySymbol || '₹',
        phoneCode: country.phoneCode || country.dialCode || '+91',
        flag: country.flag || '🇮🇳',
        description: country.description || '',
        isActive: country.isActive !== undefined ? country.isActive : true,
        coverImage: null
      });
      const imgPath = country.coverImage || country.image;
      setImagePreview(imgPath?.startsWith('http') ? imgPath : getImageUrl(imgPath));
    } else {
      setFormData({
        name: '',
        code: '',
        slug: '',
        currency: 'INR',
        currencySymbol: '₹',
        phoneCode: '+91',
        flag: '🇮🇳',
        description: '',
        isActive: true,
        coverImage: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleGuardedAction = (type, country = null) => {
    if (type === 'view') {
      handleOpenModal('view', country);
      return;
    }

    if (isLocked && (type === 'delete' || type === 'edit' || type === 'add')) {
      setPendingAction({ type, country });
      setShowSecurityModal(true);
    } else {
      if (type === 'delete') {
        handleDelete(country._id);
      } else {
        handleOpenModal(type, country);
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
      showToast('Unlocked', 'You can now modify countries freely.', 'success');
    } else if (pendingAction) {
      if (pendingAction.type === 'delete') {
        handleDelete(pendingAction.country._id);
      } else {
        handleOpenModal(pendingAction.type, pendingAction.country);
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
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    if (modalType === 'add') {
      dispatch(addCountryRequest(data));
      showToast('Success', 'Country added successfully', 'success');
    } else {
      dispatch(updateCountryRequest({ id: currentCountry._id, data }));
      showToast('Success', 'Country updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (await confirm('Delete Country?', 'This will permanently delete this country and potentially affect linked states.')) {
      dispatch(deleteCountryRequest(id));
      showToast('Deleted', 'Country removed successfully', 'success');
    }
  };

  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Platform <span style={{ color: 'var(--primary)' }}>Countries</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage global countries, currency specifications, phone codes, and cover imagery
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
            <>
              <LockToggleButton onUnlockClick={handleLockToggleInternal} />
              <button className="btn btn-primary" onClick={() => handleGuardedAction('add')}>
                <Plus size={20} /> Add Country
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
              placeholder="Search by country name, code, currency..."
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading countries...</p>
      ) : countries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Globe size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No countries found. Start by adding a new country.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {countries.map((country) => {
            const cover = country.coverImage || country.image;
            return (
              <div key={country._id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
                <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                  <img
                    src={cover?.startsWith('http') ? cover : getImageUrl(cover)}
                    alt={country.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: country.isActive ? '#22c55e' : '#ef4444',
                    color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800'
                  }}>
                    {country.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>

                  <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                    color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{ fontSize: '18px' }}>{country.flag || '🇮🇳'}</span>
                    <span>{country.code || 'IN'}</span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>{country.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', padding: '2px 8px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '6px' }}>
                      /{country.slug || generateSlug(country.name)}
                    </span>
                  </div>

                  {/* METRIC CHIPS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 8px', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      💰 {country.currency || 'INR'} ({country.currencySymbol || '₹'})
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 8px', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      📞 {country.phoneCode || country.dialCode || '+91'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                    {country.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', country)}>
                      <Info size={16} />
                    </button>
                    <button className="action-btn" title="Edit Country" onClick={() => handleGuardedAction('edit', country)}>
                      <Edit size={16} />
                    </button>
                    {user?.role === 'Admin' && (
                      <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', country)}>
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
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Country</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Code / Slug</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Currency</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Phone Code</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country, index) => {
                  const cover = country.coverImage || country.image;
                  return (
                    <tr key={country._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        {startIndex + index + 1}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px', lineHeight: 1 }}>{country.flag || '🇮🇳'}</span>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, border: '1px solid var(--border)' }}>
                            <img src={cover?.startsWith('http') ? cover : getImageUrl(cover)} alt={country.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{country.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{country.description ? country.description.substring(0, 30) + '...' : 'No details'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '800', fontSize: '13px' }}>{country.code || 'IN'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>/{country.slug || generateSlug(country.name)}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700' }}>
                        {country.currency || 'INR'} <span style={{ color: 'var(--primary)', fontWeight: '900' }}>({country.currencySymbol || '₹'})</span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700' }}>
                        {country.phoneCode || country.dialCode || '+91'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                          background: country.isActive ? '#dcfce7' : '#fee2e2', color: country.isActive ? '#166534' : '#b91c1c'
                        }}>
                          {country.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group">
                          <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', country)}>
                            <Info size={16} />
                          </button>
                          <button className="action-btn" title="Edit Country" onClick={() => handleGuardedAction('edit', country)}>
                            <Edit size={16} />
                          </button>
                          {user?.role === 'Admin' && (
                            <button className="action-btn danger" title="Remove Country" onClick={() => handleGuardedAction('delete', country)}>
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

      {/* COUNTRY MANAGE DRAWER */}
      <Drawer 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalType === 'add' ? 'Add New Country' : modalType === 'edit' ? 'Edit Country Protocol' : 'Country Profile Details'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. NAME & FLAG */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Country Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. India"
                value={formData.name}
                onChange={handleNameChange}
                required
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', fontWeight: '700' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Flag (Emoji/Icon)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 🇮🇳"
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', textAlign: 'center', fontSize: '20px' }}
              />
            </div>
          </div>

          {/* 2. CODE & SLUG */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>ISO Country Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: '700' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>URL Slug</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. india"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', fontWeight: '600' }}
              />
            </div>
          </div>

          {/* 3. CURRENCY & SYMBOL & PHONE CODE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Currency</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. INR"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: '700' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Symbol</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. ₹"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', fontWeight: '700', textAlign: 'center' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Phone Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91"
                value={formData.phoneCode}
                onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                disabled={modalType === 'view'}
                style={{ height: '46px', borderRadius: '12px', fontWeight: '700' }}
              />
            </div>
          </div>

          {/* 4. COVER IMAGE UPLOAD */}
          <ImageUpload
            label="Cover Image"
            value={formData.coverImage || imagePreview}
            onChange={handleImageSelect}
            disabled={modalType === 'view'}
            title="Drag & drop country cover photo here, or click to browse"
            caption="Supports PNG, JPG, WEBP (max 5MB)"
            maxSizeMB={5}
          />

          {/* 5. DESCRIPTION */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Description & Overview</label>
            <textarea
              className="form-control"
              placeholder="Provide a description of the country for travel itineraries..."
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
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Country Active Status</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>When active, this country will be selectable for travel states and packages</div>
              </div>
            </label>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '800', borderRadius: '12px', marginTop: '10px' }}>
              {modalType === 'add' ? 'Add Country Protocol' : 'Save Changes'}
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

export default Countries;
