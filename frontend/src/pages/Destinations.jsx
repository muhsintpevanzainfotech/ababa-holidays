import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Drawer from '../components/Drawer';
import { getImageUrl } from '../utils/constants';
import FilterSelect from '../components/FilterSelect';
import MapPicker from '../components/MapPicker';
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
  Map as DestIcon,
  Power,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import FormSelect from '../components/FormSelect';
import PasskeyModal from '../components/PasskeyModal';
import LockToggleButton from '../components/LockToggleButton';
import { setUnlocked, lockSession } from '../store/slices/globalSlice';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDestinationsRequest,
  addDestinationRequest,
  updateDestinationRequest,
  deleteDestinationRequest,
  fetchStatesRequest,
  fetchCountriesRequest
} from '../store/slices/locationsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Destinations = () => {
  const dispatch = useDispatch();
  const { destinations, pagination, loading, error } = useSelector((state) => state.destinations);
  const { states } = useSelector((state) => state.states);
  const { countries } = useSelector((state) => state.countries);
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentDestination, setCurrentDestination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [imagePreview, setImagePreview] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    state: '',
    description: '',
    category: 'Other',
    isActive: true,
    latitude: '',
    longitude: '',
    image: null
  });

  useEffect(() => {
    dispatch(fetchDestinationsRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter,
      state: stateFilter
    }));
    dispatch(fetchStatesRequest({ limit: 1000 }));
    dispatch(fetchCountriesRequest({ limit: 1000 }));
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, stateFilter]);

  const handleOpenModal = (type, destination = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && destination) {
      setCurrentDestination(destination);
      setFormData({
        name: destination.name,
        state: destination.state?._id || destination.state,
        description: destination.description || '',
        category: destination.category || 'Other',
        isActive: destination.isActive,
        latitude: destination.latitude || '',
        longitude: destination.longitude || '',
        image: null
      });
      setImagePreview(destination.image?.startsWith('http') ? destination.image : getImageUrl(destination.image));
    } else {
      setFormData({
        name: '',
        state: states.length > 0 ? states[0]._id : '',
        description: '',
        category: 'Other',
        isActive: true,
        latitude: '',
        longitude: '',
        image: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleGuardedAction = (type, destination = null) => {
    if (type === 'view') {
      handleOpenModal('view', destination);
      return;
    }

    if (isLocked && (type === 'delete' || type === 'edit' || type === 'add')) {
      setPendingAction({ type, destination });
      setShowSecurityModal(true);
    } else {
      if (type === 'delete') {
        handleDelete(destination._id);
      } else {
        handleOpenModal(type, destination);
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
      showToast('Unlocked', 'You can now modify destinations freely.', 'success');
    } else if (pendingAction) {
      if (pendingAction.type === 'delete') {
        handleDelete(pendingAction.destination._id);
      } else {
        handleOpenModal(pendingAction.type, pendingAction.destination);
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
    setSuggestions([]);
  };

  const handleSearchPlaces = async (query) => {
    if (modalType === 'view') return;
    setFormData(prev => ({ ...prev, name: query }));
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (modalType === 'view') return;
    setFormData(prev => ({
      ...prev,
      name: suggestion.display_name.split(',')[0],
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    }));
    setSuggestions([]);
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
      dispatch(addDestinationRequest(data));
      showToast('Success', 'Destination added successfully', 'success');
    } else {
      dispatch(updateDestinationRequest({ id: currentDestination._id, data }));
      showToast('Success', 'Destination updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleStateChange = async (stateId) => {
    if (modalType === 'view') return;
    setFormData(prev => ({ ...prev, state: stateId }));

    if (!stateId) return;

    const stateObj = states.find(s => s._id === stateId);
    if (!stateObj) return;

    const searchQuery = `${stateObj.name}, ${stateObj.country?.name || ''}`;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
      }
    } catch (error) {
      console.error('State geocoding error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (await confirm('Delete Destination?', 'This will permanently delete this destination.')) {
      dispatch(deleteDestinationRequest(id));
      showToast('Deleted', 'Destination removed successfully', 'success');
    }
  };

  const startIndex = (currentPage - 1) * limit;

  const categories = ['City', 'Beach', 'Mountain', 'Historical', 'Desert', 'Other'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform Destinations</h1>
          <p>Manage specific travel destinations and local highlights nested under states</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
            <>
              <LockToggleButton onUnlockClick={handleLockToggleInternal} />
              <button className="btn btn-primary" onClick={() => handleGuardedAction('add')}>
                <Plus size={20} /> Add Destination
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
              placeholder="Search by name, state or category..."
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
                onChange={(val) => {
                  setCountryFilter(val);
                  setStateFilter('all');
                }}
                width="180px"
              />
            </div>
            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All States' },
                  ...(countryFilter === 'all'
                    ? states
                    : states.filter(s => (s.country?._id || s.country) === countryFilter)
                  ).map(s => ({ value: s._id, label: s.name }))
                ]}
                value={stateFilter}
                onChange={setStateFilter}
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading destinations...</p>
      ) : destinations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <DestIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No destinations found. Start by adding a new destination.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {destinations.map((dest) => (
            <div key={dest._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={dest.image?.startsWith('http') ? dest.image : getImageUrl(dest.image)}
                  alt={dest.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '10px', fontWeight: '800' }}>{dest.category?.toUpperCase()}</span>
                  <div style={{
                    background: dest.isActive ? '#22c55e' : '#ef4444',
                    color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {dest.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{dest.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <MapPin size={12} />
                    {dest.state?.name || 'N/A'}
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                  {dest.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', dest)}>
                    <Eye size={16} />
                  </button>
                  <button className="action-btn" title="Edit Destination" onClick={() => handleGuardedAction('edit', dest)}>
                    <Edit size={16} />
                  </button>
                  {user?.role === 'Admin' && (
                    <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleGuardedAction('delete', dest)}>
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
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Destination</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>State</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest, index) => (
                  <tr key={dest._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                          <img src={dest.image?.startsWith('http') ? dest.image : getImageUrl(dest.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{dest.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{dest.state?.name || 'N/A'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '11px' }}>{dest.category}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: dest.isActive ? '#dcfce7' : '#fee2e2', color: dest.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {dest.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', dest)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn" title="Edit Location" onClick={() => handleGuardedAction('edit', dest)}>
                          <Edit size={16} />
                        </button>
                        {user?.role === 'Admin' && (
                          <button className="action-btn danger" title="Delete Destination" onClick={() => handleGuardedAction('delete', dest)}>
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

      <Drawer isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'add' ? 'Add New Destination' : modalType === 'edit' ? 'Edit Destination' : 'Destination Details'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Destination Name <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Gateway of India"
                value={formData.name}
                onChange={(e) => handleSearchPlaces(e.target.value)}
                required
                disabled={modalType === 'view'}
              />
            </div>
            {suggestions.length > 0 && modalType !== 'view' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                      fontSize: '13px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.display_name.split(',')[0]}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.display_name}</div>
                  </div>
                ))}
              </div>
            )}
            {isSearching && (
              <div style={{ position: 'absolute', right: '12px', top: '40px', fontSize: '12px', color: 'var(--text-muted)' }}>Searching...</div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Location (Automatically marked from name or state selection)</label>
            <div style={{ pointerEvents: modalType === 'view' ? 'none' : 'auto', opacity: modalType === 'view' ? 0.8 : 1 }}>
              <MapPicker
                lat={formData.latitude}
                lng={formData.longitude}
                onChange={({ lat, lng }) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  disabled={modalType === 'view'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  disabled={modalType === 'view'}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <FormSelect
                label="Category"
                options={categories.map(c => ({ value: c, label: c }))}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                disabled={modalType === 'view'}
              />
            </div>
            <div className="form-group">
              <FormSelect
                label="State"
                required
                options={states.map(s => ({ value: s._id, label: `${s.name} (${s.country?.name || 'No Country'})` }))}
                value={formData.state}
                onChange={(val) => handleStateChange(val)}
                placeholder="Select State"
                disabled={modalType === 'view'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>Destination Image</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
              onClick={() => modalType !== 'view' && document.getElementById('destImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  {modalType !== 'view' && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload destination image</p>
                </div>
              )}
              <input id="destImage" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              placeholder="About the destination..."
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
              <span style={{ fontWeight: '600' }}>Destination is active</span>
            </label>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '600' }}>
              {modalType === 'add' ? 'Add Destination' : 'Save Changes'}
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

export default Destinations;
