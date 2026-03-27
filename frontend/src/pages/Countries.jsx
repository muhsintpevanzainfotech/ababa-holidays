import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import {
  Plus,
  Globe,
  Search,
  LayoutGrid,
  List as ListIcon,
  Edit,
  Trash2,
  Upload,
  X,
  Power,
  CheckCircle,
  XCircle,
  Filter,
  Eye
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import MapPicker from '../components/MapPicker';
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
    dialCode: '',
    description: '',
    isActive: true,
    image: null
  });

  useEffect(() => {
    dispatch(fetchCountriesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter
    }));
  }, [dispatch, currentPage, limit, searchTerm, statusFilter]);

  const handleOpenModal = (type, country = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && country) {
      setCurrentCountry(country);
      setFormData({
        name: country.name,
        code: country.code || '',
        dialCode: country.dialCode || '',
        description: country.description || '',
        isActive: country.isActive,
        image: null
      });
      setImagePreview(country.image?.startsWith('http') ? country.image : getImageUrl(country.image));
    } else {
      setFormData({
        name: '',
        code: '',
        dialCode: '',
        description: '',
        isActive: true,
        image: null
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

  const handleFileChange = (e) => {
    if (modalType === 'view') return;
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'view') return;
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
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
          <h1>Platform Countries</h1>
          <p>Manage countries available for travel states and destinations</p>
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
              placeholder="Search by country name or code..."
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading countries...</p>
      ) : countries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Globe size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No countries found. Start by adding a new country.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {countries.map((country) => (
            <div key={country._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={country.image?.startsWith('http') ? country.image : getImageUrl(country.image)}
                  alt={country.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: country.isActive ? '#22c55e' : '#ef4444',
                  color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                }}>
                  {country.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{country.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', padding: '2px 8px', background: 'var(--bg-main)', borderRadius: '4px' }}>
                    {country.code || 'N/A'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                  {country.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', country)}>
                    <Eye size={16} />
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
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Country</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Code</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country, index) => (
                  <tr key={country._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                          <img src={country.image?.startsWith('http') ? country.image : getImageUrl(country.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{country.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{country.code || 'N/A'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: country.isActive ? '#dcfce7' : '#fee2e2', color: country.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {country.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', country)}>
                          <Eye size={16} />
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
          itemsPerPage={pagination.limit}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setLimit}
        />
      )}

      <Drawer isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'add' ? 'Add New Country' : modalType === 'edit' ? 'Edit Country' : 'Country Details'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Country Name <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. India"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={modalType === 'view'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label>Country Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={modalType === 'view'}
              />
            </div>
            <div className="form-group">
              <label>Dial Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91"
                value={formData.dialCode}
                onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                disabled={modalType === 'view'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>Country Image</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
              onClick={() => modalType !== 'view' && document.getElementById('countryImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  {modalType !== 'view' && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload country image</p>
                </div>
              )}
              <input id="countryImage" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              placeholder="About the country..."
              style={{ height: '100px', padding: '12px', resize: 'none' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={modalType === 'view'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: modalType === 'view' ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={modalType === 'view'}
              />
              <span style={{ fontWeight: '600' }}>Country is active</span>
            </label>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '600' }}>
              {modalType === 'add' ? 'Add Country' : 'Save Changes'}
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
