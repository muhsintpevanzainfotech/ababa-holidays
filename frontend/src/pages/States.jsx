import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import FilterSelect from '../components/FilterSelect';
import ActionDropdown from '../components/ActionDropdown';
import {
  Plus,
  MapPin,
  Search,
  LayoutGrid,
  List as ListIcon,
  Edit,
  Trash2,
  Upload,
  X,
  Map as StateIcon,
  Power,
  CheckCircle,
  XCircle,
  Filter,
  Eye
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
    description: '',
    isActive: true,
    image: null
  });

  useEffect(() => {
    dispatch(fetchStatesRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter,
      country: countryFilter
    }));
    dispatch(fetchCountriesRequest({ limit: 1000 })); // Fetch all for dropdown
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, countryFilter]);

  const handleOpenModal = (type, state = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && state) {
      setCurrentState(state);
      setFormData({
        name: state.name,
        country: state.country?._id || state.country,
        description: state.description || '',
        isActive: state.isActive,
        image: null
      });
      setImagePreview(state.image?.startsWith('http') ? state.image : getImageUrl(state.image));
    } else {
      setFormData({
        name: '',
        country: countries.length > 0 ? countries[0]._id : '',
        description: '',
        isActive: true,
        image: null
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
      dispatch(addStateRequest(data));
      showToast('Success', 'State added successfully', 'success');
    } else {
      dispatch(updateStateRequest({ id: currentState._id, data }));
      showToast('Success', 'State updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (await confirm('Delete State?', 'This will permanently delete this state.')) {
      dispatch(deleteStateRequest(id));
      showToast('Deleted', 'State removed successfully', 'success');
    }
  };

  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform States</h1>
          <p>Manage states and provinces nested under countries</p>
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
              placeholder="Search by state name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions" style={{ flexWrap: 'wrap' }}>
            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Countries' },
                  ...countries.map(c => ({ value: c._id, label: c.name }))
                ]}
                value={countryFilter}
                onChange={setCountryFilter}
                width="180px"
              />
            </div>
            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'inactive', label: 'Inactive', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="150px"
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading states...</p>
      ) : states.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <StateIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No states found. Start by adding a new state.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {states.map((state) => (
            <div key={state._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={state.image?.startsWith('http') ? state.image : getImageUrl(state.image)}
                  alt={state.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: state.isActive ? '#22c55e' : '#ef4444',
                  color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                }}>
                  {state.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{state.name}</h3>
                  <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                    {state.country?.name || 'N/A'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                  {state.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', state)}>
                    <Eye size={16} />
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
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>State</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Country</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {states.map((state, index) => (
                  <tr key={state._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                          <img src={state.image?.startsWith('http') ? state.image : getImageUrl(state.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{state.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge badge-primary">{state.country?.name || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: state.isActive ? '#dcfce7' : '#fee2e2', color: state.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {state.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', state)}>
                          <Eye size={16} />
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

      <Drawer isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'add' ? 'Add New State' : modalType === 'edit' ? 'Edit State' : 'State Details'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>State Name <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Maharashtra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={modalType === 'view'}
            />
          </div>

          <div className="form-group">
            <FormSelect
              label="Country"
              required
              options={countries.map(c => ({ value: c._id, label: c.name }))}
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val })}
              placeholder="Select Country"
              disabled={modalType === 'view'}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              placeholder="About the state..."
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
              <span>State is active and available for selection</span>
            </label>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label>State Image</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
              onClick={() => modalType !== 'view' && document.getElementById('stateImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  {modalType !== 'view' && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload state image</p>
                </div>
              )}
              <input id="stateImage" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '600' }}>
              {modalType === 'add' ? 'Add State' : 'Save Changes'}
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
