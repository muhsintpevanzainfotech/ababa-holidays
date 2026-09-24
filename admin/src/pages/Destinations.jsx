import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import { getImageUrl } from '../utils/constants';
import FilterSelect from '../components/FilterSelect';
import MapPicker from '../components/MapPicker';
import {
  Plus,
  MapPin,
  Search,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  X,
  Map as DestIcon,
  Filter,
  Info,
  Globe,
  Tag,
  Compass,
  Navigation,
  Layers,
  Image as ImageIcon
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

const DESTINATION_CATEGORIES = [
  'Hill Station',
  'Beach',
  'Waterfall',
  'Wildlife',
  'Historical',
  'Adventure',
  'Religious',
  'City',
  'Island',
  'Nature'
];

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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [coverPreview, setCoverPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    state: '',
    shortDescription: '',
    description: '',
    categories: ['Hill Station'],
    latitude: 10.0889,
    longitude: 77.0595,
    address: 'Munnar, Idukki, Kerala, India',
    city: 'Munnar',
    pincode: '685612',
    googlePlaceId: '',
    mapZoom: 12,
    locationName: 'Munnar Hill Station',
    coverImage: null,
    thumbnail: null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchDestinationsRequest({
      page: currentPage,
      limit,
      search: searchTerm,
      status: statusFilter,
      state: stateFilter,
      country: countryFilter,
      category: categoryFilter
    }));
    dispatch(fetchStatesRequest({ limit: 1000, all: 'true' }));
    dispatch(fetchCountriesRequest({ limit: 1000, all: 'true' }));
  }, [dispatch, currentPage, limit, searchTerm, statusFilter, stateFilter, countryFilter, categoryFilter]);

  const generateSlug = (val) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (val) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      ...(modalType === 'add' || !prev.slug ? { slug: generateSlug(val) } : {})
    }));
    handleSearchPlaces(val);
  };

  const handleCountryChange = (countryId) => {
    setFormData(prev => {
      const filteredStates = states.filter(s => (s.country?._id || s.countryId || s.country) === countryId);
      return {
        ...prev,
        country: countryId,
        state: filteredStates.length > 0 ? filteredStates[0]._id : ''
      };
    });
  };

  const toggleCategory = (cat) => {
    if (modalType === 'view') return;
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      let updated;
      if (exists) {
        updated = prev.categories.filter(c => c !== cat);
        if (updated.length === 0) updated = [cat]; // keep at least one
      } else {
        updated = [...prev.categories, cat];
      }
      return { ...prev, categories: updated };
    });
  };

  const handleOpenModal = (type, destination = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && destination) {
      setCurrentDestination(destination);
      const parentState = typeof destination.state === 'object' ? destination.state : states.find(s => s._id === destination.state);
      const parentCountryId = destination.country?._id || destination.countryId || parentState?.country?._id || parentState?.country;

      const loadedCategories = Array.isArray(destination.categories) && destination.categories.length > 0 
        ? destination.categories 
        : [destination.category || 'Hill Station'];

      setFormData({
        name: destination.name || '',
        slug: destination.slug || (destination.name ? generateSlug(destination.name) : ''),
        country: parentCountryId || '',
        state: destination.state?._id || destination.stateId || destination.state || '',
        shortDescription: destination.shortDescription || '',
        description: destination.description || '',
        categories: loadedCategories,
        latitude: destination.latitude || 10.0889,
        longitude: destination.longitude || 77.0595,
        address: destination.address || '',
        city: destination.city || '',
        pincode: destination.pincode || '',
        googlePlaceId: destination.googlePlaceId || '',
        mapZoom: destination.mapZoom || 12,
        locationName: destination.locationName || destination.name || '',
        isActive: destination.isActive !== undefined ? destination.isActive : true,
        coverImage: null,
        thumbnail: null
      });

      const coverPath = destination.coverImage || destination.image;
      setCoverPreview(coverPath?.startsWith('http') ? coverPath : getImageUrl(coverPath));
      
      const thumbPath = destination.thumbnail;
      setThumbnailPreview(thumbPath?.startsWith('http') ? thumbPath : getImageUrl(thumbPath));
    } else {
      const defaultState = states.length > 0 ? states[0] : null;
      const defaultCountry = defaultState ? (defaultState.country?._id || defaultState.country) : (countries.length > 0 ? countries[0]._id : '');
      
      setFormData({
        name: '',
        slug: '',
        country: defaultCountry,
        state: defaultState ? defaultState._id : '',
        shortDescription: '',
        description: '',
        categories: ['Hill Station'],
        latitude: 10.0889,
        longitude: 77.0595,
        address: '',
        city: '',
        pincode: '',
        googlePlaceId: '',
        mapZoom: 12,
        locationName: '',
        isActive: true,
        coverImage: null,
        thumbnail: null
      });
      setCoverPreview(null);
      setThumbnailPreview(null);
    }
    setSuggestions([]);
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

  const handleSearchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const placeName = item.display_name.split(',')[0];
    
    setFormData(prev => ({
      ...prev,
      name: prev.name || placeName,
      locationName: placeName,
      address: item.display_name,
      latitude: lat,
      longitude: lon,
      slug: prev.slug || generateSlug(placeName)
    }));
    setSuggestions([]);
  };

  const handleCoverSelect = (file) => {
    if (modalType === 'view') return;
    if (!file) {
      setFormData(prev => ({ ...prev, coverImage: null }));
      setCoverPreview(null);
    } else if (file instanceof File) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      setCoverPreview(URL.createObjectURL(file));
    } else if (typeof file === 'string') {
      setCoverPreview(file);
    }
  };

  const handleThumbnailSelect = (file) => {
    if (modalType === 'view') return;
    if (!file) {
      setFormData(prev => ({ ...prev, thumbnail: null }));
      setThumbnailPreview(null);
    } else if (file instanceof File) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (typeof file === 'string') {
      setThumbnailPreview(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'view') return;

    if (!formData.state) {
      showToast('Validation Error', 'Please select a parent state', 'error');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        if (key === 'categories') {
          data.append('categories', JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
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

  const handleDelete = async (id) => {
    if (await confirm('Delete Destination?', 'This will permanently delete this destination record.')) {
      dispatch(deleteDestinationRequest(id));
      showToast('Deleted', 'Destination removed successfully', 'success');
    }
  };

  const startIndex = (currentPage - 1) * limit;

  // Available states based on selected country filter
  const availableStates = countryFilter === 'all' 
    ? states 
    : states.filter(s => (s.country?._id || s.countryId || s.country) === countryFilter);

  return (
    <div className="fade-in">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Platform <span style={{ color: 'var(--primary)' }}>Destinations</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage travel spots, GPS coordinates, location maps, and multi-category tags
          </p>
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

      {/* SEARCH AND FILTERS */}
      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search destination, city, address, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            {/* Country Filter */}
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Countries' },
                  ...countries.map(c => ({ value: c._id, label: `${c.flag || '🌐'} ${c.name}` }))
                ]}
                value={countryFilter}
                onChange={(val) => {
                  setCountryFilter(val);
                  setStateFilter('all');
                }}
                width="160px"
              />
            </div>

            {/* State Filter */}
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterSelect
                options={[
                  { value: 'all', label: 'All States' },
                  ...availableStates.map(s => ({ value: s._id, label: s.name }))
                ]}
                value={stateFilter}
                onChange={setStateFilter}
                width="160px"
              />
            </div>

            {/* Category Filter */}
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...DESTINATION_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                width="160px"
              />
            </div>

            {/* Status Filter */}
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'inactive', label: 'Inactive', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="130px"
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

      {/* CONTENT LIST / GRID */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading destinations...</p>
      ) : destinations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <DestIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No destinations found. Start by creating a new travel destination.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {destinations.map((dest) => {
            const cover = dest.coverImage || dest.image;
            const stateObj = typeof dest.state === 'object' ? dest.state : states.find(s => s._id === dest.state);
            const countryObj = typeof dest.country === 'object' ? dest.country : (stateObj?.country || countries.find(c => c._id === dest.country));
            const cats = Array.isArray(dest.categories) && dest.categories.length > 0 ? dest.categories : [dest.category || 'Hill Station'];

            return (
              <div key={dest._id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
                <div style={{ height: '170px', background: '#f8fafc', position: 'relative' }}>
                  <img
                    src={cover?.startsWith('http') ? cover : getImageUrl(cover)}
                    alt={dest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: dest.isActive ? '#22c55e' : '#ef4444',
                    color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800'
                  }}>
                    {dest.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>

                  {/* Location Badge */}
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                    color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span>{countryObj?.flag || '🌐'}</span>
                    <span>{stateObj?.name || 'State'}, {countryObj?.name || 'Country'}</span>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>{dest.name}</h3>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', marginBottom: '10px' }}>
                    /{dest.slug || generateSlug(dest.name)}
                  </div>

                  {/* CATEGORY TAGS */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {cats.map((c, i) => (
                      <span key={i} style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '6px' }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                    {dest.shortDescription || dest.description || 'No description provided.'}
                  </p>

                  {/* GPS COORDINATES */}
                  {dest.latitude && dest.longitude && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', fontWeight: '700' }}>
                      <MapPin size={12} color="var(--primary)" />
                      <span>GPS: {dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', dest)}>
                      <Info size={16} />
                    </button>
                    <button className="action-btn" title="Edit Destination" onClick={() => handleGuardedAction('edit', dest)}>
                      <Edit size={16} />
                    </button>
                    {user?.role === 'Admin' && (
                      <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleDelete(dest._id)}>
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
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Destination</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Location Hierarchy</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Categories</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Map Coordinates</th>
                  <th style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest, index) => {
                  const cover = dest.coverImage || dest.image;
                  const stateObj = typeof dest.state === 'object' ? dest.state : states.find(s => s._id === dest.state);
                  const countryObj = typeof dest.country === 'object' ? dest.country : (stateObj?.country || countries.find(c => c._id === dest.country));
                  const cats = Array.isArray(dest.categories) && dest.categories.length > 0 ? dest.categories : [dest.category || 'Hill Station'];

                  return (
                    <tr key={dest._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        {startIndex + index + 1}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '46px', height: '46px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, border: '1px solid var(--border)' }}>
                            <img src={cover?.startsWith('http') ? cover : getImageUrl(cover)} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)' }}>{dest.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>/{dest.slug || generateSlug(dest.name)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span>{countryObj?.flag || '🌐'}</span>
                          <span>{stateObj?.name || 'State'}, {countryObj?.name || 'Country'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                          {cats.slice(0, 3).map((c, i) => (
                            <span key={i} style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '4px' }}>
                              {c}
                            </span>
                          ))}
                          {cats.length > 3 && (
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', background: 'var(--bg-main)', color: 'var(--text-muted)', borderRadius: '4px' }}>
                              +{cats.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        {dest.latitude && dest.longitude ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="var(--primary)" />
                            <span>{dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}</span>
                          </div>
                        ) : 'Not Pinned'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                          background: dest.isActive ? '#dcfce7' : '#fee2e2', color: dest.isActive ? '#166534' : '#b91c1c'
                        }}>
                          {dest.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group">
                          <button className="action-btn" title="View Details" onClick={() => handleGuardedAction('view', dest)}>
                            <Info size={16} />
                          </button>
                          <button className="action-btn" title="Edit Destination" onClick={() => handleGuardedAction('edit', dest)}>
                            <Edit size={16} />
                          </button>
                          {user?.role === 'Admin' && (
                            <button className="action-btn danger" title="Remove Destination" onClick={() => handleGuardedAction('delete', dest)}>
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

      {/* DESTINATION MANAGE DRAWER */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add Destination Protocol' : modalType === 'edit' ? 'Edit Destination Protocol' : 'Destination Profile Details'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* SECTION 1: BASIC IDENTIFICATION */}
          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={16} /> Basic Identification
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Destination Name */}
              <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Destination Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Munnar"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  disabled={modalType === 'view'}
                  style={{ height: '46px', borderRadius: '12px', fontWeight: '700' }}
                />

                {/* Auto-suggest place dropdown */}
                {suggestions.length > 0 && modalType !== 'view' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '4px',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border)',
                          fontSize: '13px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--bg-main)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{s.display_name.split(',')[0]}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div style={{ position: 'absolute', right: '12px', top: '38px', fontSize: '11px', color: 'var(--text-muted)' }}>Searching places...</div>
                )}
              </div>

              {/* URL Slug */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: '700', fontSize: '13px' }}>URL Slug</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. munnar"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  disabled={modalType === 'view'}
                  style={{ height: '46px', borderRadius: '12px', fontWeight: '600' }}
                />
              </div>

              {/* Country & State Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormSelect
                  label="Country *"
                  required
                  options={countries.map(c => ({ value: c._id, label: `${c.flag || '🌐'} ${c.name}` }))}
                  value={formData.country}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                  disabled={modalType === 'view'}
                />

                <FormSelect
                  label="State / Province *"
                  required
                  options={states
                    .filter(s => !formData.country || (s.country?._id || s.countryId || s.country) === formData.country)
                    .map(s => ({ value: s._id, label: s.name }))}
                  value={formData.state}
                  onChange={(val) => setFormData({ ...formData, state: val })}
                  placeholder="Select State"
                  disabled={modalType === 'view'}
                />
              </div>

              {/* Short Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Short Summary Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brief 1-sentence highlight (e.g. Famous tea plantations & cool climate)"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  disabled={modalType === 'view'}
                  style={{ height: '46px', borderRadius: '12px' }}
                />
              </div>

              {/* Detailed Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Detailed Overview</label>
                <textarea
                  className="form-control"
                  placeholder="About the destination, travel attractions, culture, best time to visit..."
                  style={{ height: '90px', padding: '12px', resize: 'none', borderRadius: '12px' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={modalType === 'view'}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DESTINATION CATEGORIES */}
          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} /> Destination Categories (Select all that apply)
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DESTINATION_CATEGORIES.map((cat) => {
                const isSelected = formData.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    disabled={modalType === 'view'}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(var(--primary-rgb), 0.12)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: modalType === 'view' ? 'default' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: MAP / LOCATION DETAILS */}
          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} /> Map & Location Specifications
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Interactive Map Picker */}
              <div style={{ pointerEvents: modalType === 'view' ? 'none' : 'auto', opacity: modalType === 'view' ? 0.8 : 1 }}>
                <MapPicker
                  lat={formData.latitude}
                  lng={formData.longitude}
                  onChange={({ lat, lng }) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
              </div>

              {/* Lat & Long */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="10.0889"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || '' })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="77.0595"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || '' })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Map Zoom Level</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="12"
                    value={formData.mapZoom}
                    onChange={(e) => setFormData({ ...formData, mapZoom: parseInt(e.target.value, 10) || 12 })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* Location Name & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Location Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Munnar Hill Station"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>City / Town</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Munnar"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* Address & Pincode */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Full Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Munnar, Idukki, Kerala, India"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Pincode / ZIP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 685612"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    disabled={modalType === 'view'}
                    style={{ height: '42px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* Google Place ID */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Google Place ID (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ChIJK29V..."
                  value={formData.googlePlaceId}
                  onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                  disabled={modalType === 'view'}
                  style={{ height: '42px', borderRadius: '10px' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: IMAGERY UPLOAD */}
          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={16} /> Destination Media & Imagery
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <ImageUpload
                label="Cover Image"
                value={formData.coverImage || coverPreview}
                onChange={handleCoverSelect}
                disabled={modalType === 'view'}
                title="Main Cover Photo"
                caption="PNG, JPG, WEBP (max 5MB)"
                maxSizeMB={5}
              />

              <ImageUpload
                label="Thumbnail Image"
                value={formData.thumbnail || thumbnailPreview}
                onChange={handleThumbnailSelect}
                disabled={modalType === 'view'}
                title="Square Card Thumbnail"
                caption="PNG, JPG, WEBP (max 5MB)"
                maxSizeMB={5}
              />
            </div>
          </div>

          {/* SECTION 5: ACTIVE STATUS */}
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
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Destination Active Status</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>When active, this destination will be published for tour packages & bookings</div>
              </div>
            </label>
          </div>

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '800', borderRadius: '12px', marginTop: '10px' }}>
              {modalType === 'add' ? 'Add Destination Protocol' : 'Save Changes'}
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
