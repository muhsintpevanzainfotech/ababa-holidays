import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
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
  Map as StateIcon,
  Power,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
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
  const { states, loading, error } = useSelector((state) => state.states);
  const { countries } = useSelector((state) => state.countries);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentState, setCurrentState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    isActive: true,
    image: null
  });

  useEffect(() => {
    dispatch(fetchStatesRequest());
    dispatch(fetchCountriesRequest());
  }, [dispatch]);

  const handleOpenModal = (type, state = null) => {
    setModalType(type);
    if (type === 'edit' && state) {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side duplicate check
    const isDuplicate = states.some(s => 
      s.name.toLowerCase() === formData.name.toLowerCase() && 
      (s.country?._id === formData.country || s.country === formData.country) &&
      s._id !== currentState?._id
    );

    if (isDuplicate) {
      showToast('Error', 'This state name already exists in the selected country', 'error');
      return;
    }

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

  const filteredStates = states.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.country?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'active' ? state.isActive : !state.isActive;
    
    const matchesCountry = countryFilter === 'all' ? true :
                          state.country?._id === countryFilter || state.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform States</h1>
          <p>Manage states and provinces nested under countries</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add State
        </button>
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
              <span className="badge badge-primary">{filteredStates.length}</span>
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading states...</p>
      ) : filteredStates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <StateIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No states found. Start by adding a new state.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {filteredStates.map((state) => (
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
                  <button className="action-btn" onClick={() => handleOpenModal('edit', state)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn" style={{ color: '#e11d48' }} onClick={() => handleDelete(state._id)}>
                    <Trash2 size={16} />
                  </button>
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
                {filteredStates.map((state, index) => (
                  <tr key={state._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {index + 1}
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
                        <button className="action-btn" title="Edit State" onClick={() => handleOpenModal('edit', state)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" title="Remove State" onClick={() => handleDelete(state._id)}>
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

      <Drawer isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'add' ? 'Add New State' : 'Edit State'}>
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
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <select 
              className="form-control" 
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              placeholder="About the state..." 
              style={{ height: '100px', padding: '12px', resize: 'none' }}
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
              <span>State is active and available for selection</span>
            </label>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label>State Image</label>
            <div 
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}
              onClick={() => document.getElementById('stateImage').click()}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>
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

          <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
            {modalType === 'add' ? 'Add State' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default States;
