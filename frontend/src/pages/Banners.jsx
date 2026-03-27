import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import {
  Plus,
  Trash2,
  Eye,
  Power,
  Image as ImageIcon,
  ExternalLink,
  Edit,
  X,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  MoreVertical,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchBannersRequest,
  addBannerRequest,
  updateBannerRequest,
  deleteBannerRequest,
  toggleBannerStatusRequest
} from '../store/slices/bannersSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Banners = () => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banners);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentBanner, setCurrentBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    isActive: true,
    image: null
  });

  useEffect(() => {
    dispatch(fetchBannersRequest());
  }, [dispatch]);

  const handleOpenModal = (type, banner = null) => {
    setModalType(type);
    if (type === 'edit' && banner) {
      setCurrentBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || '',
        link: banner.link || '',
        isActive: banner.isActive,
        image: null
      });
      setImagePreview(banner.image?.startsWith('http') ? banner.image : getImageUrl(banner.image));
    } else {
      setFormData({ title: '', description: '', link: '', isActive: true, image: null });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('link', formData.link);
    data.append('isActive', formData.isActive);
    if (formData.image) data.append('image', formData.image);

    if (modalType === 'add') {
      dispatch(addBannerRequest(data));
      showToast('Success', 'Banner created successfully.', 'success');
    } else {
      dispatch(updateBannerRequest({ id: currentBanner._id, data }));
      showToast('Success', 'Banner updated successfully.', 'success');
    }
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    dispatch(toggleBannerStatusRequest(id));
    showToast('Status Updated', 'Banner visibility has been toggled.', 'success');
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Banner?',
      'Are you sure you want to delete this promotional banner?'
    );

    if (isConfirmed) {
      dispatch(deleteBannerRequest(id));
      showToast('Deleted', 'Banner has been removed.', 'success');
    }
  };

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'active' ? banner.isActive : !banner.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Offer Banners</h1>
          <p>Manage promotional banners and platform highlights</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add New Banner
        </button>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
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
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by banner title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="results-count">
              <span className="badge badge-primary">{filteredBanners.length}</span>
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading banners...</p>
      ) : filteredBanners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <ImageIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No banners found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {filteredBanners.map((banner) => (
            <div key={banner._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '180px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                <img
                  src={banner.image?.startsWith('http') ? banner.image : getImageUrl(banner.image)}
                  alt={banner.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: banner.isActive ? '#22c55e' : '#ef4444', color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{banner.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {banner.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => toggleStatus(banner._id)}
                    className="btn" style={{ background: banner.isActive ? '#fff1f2' : '#f0fdf4', color: banner.isActive ? '#ef4444' : '#22c55e', border: 'none', fontSize: '12px', flex: 1 }}
                  >
                    <Power size={14} /> {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="action-group">
                    <button className="action-btn edit" onClick={() => handleOpenModal('edit', banner)} title="Edit"><Edit size={16} /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(banner._id)} title="Delete"><Trash2 size={16} /></button>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Banner</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Link</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner, index) => (
                  <tr key={banner._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={banner.image?.startsWith('http') ? banner.image : getImageUrl(banner.image)} alt="" style={{ width: '80px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{banner.title}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{banner.link || '-'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: banner.isActive ? '#dcfce7' : '#fee2e2',
                        color: banner.isActive ? '#166534' : '#b91c1c'
                      }}>
                        {banner.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title={banner.isActive ? 'Hide Banner' : 'Show Banner'} onClick={() => toggleStatus(banner._id)}>
                          <Power size={16} />
                        </button>
                        <button className="action-btn" title="Edit Banner" onClick={() => handleOpenModal('edit', banner)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" title="Delete Banner" onClick={() => handleDelete(banner._id)}>
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
        title={modalType === 'add' ? 'Upload New Banner' : 'Edit Banner'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Banner Title</label>
            <input
              type="text" className="form-control" required placeholder="e.g. Summer Sale 2024"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              style={{ height: '100px', padding: '12px' }}
              placeholder="Banner description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Redirection Link (Optional)</label>
            <input
              type="text" className="form-control" placeholder="https://..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>Banner Image</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer', transition: '0.2s' }}
              onClick={() => document.getElementById('bannerImage').click()}
            >
              <input id="bannerImage" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Click to change image</div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Upload size={32} style={{ marginBottom: '8px' }} />
                  <p>Click to upload banner image</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Mark as Active</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
            {modalType === 'add' ? 'Upload Banner' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Banners;
