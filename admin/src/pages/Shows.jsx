import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  LayoutGrid, 
  List, 
  Play, 
  Video, 
  ExternalLink,
  Power,
  Upload,
  User,
  Filter,
  CheckCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { 
  fetchReelsRequest, 
  addReelRequest, 
  updateReelRequest, 
  deleteReelRequest,
  toggleReelStatusRequest
} from '../store/slices/reelsSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import FormSelect from '../components/FormSelect';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Shows = ({ userRole = 'Admin' }) => {
  const dispatch = useDispatch();
  const { reels, loading } = useSelector((state) => state.reels);
  const { vendors } = useSelector((state) => state.vendors);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [view, setView] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentReel, setCurrentReel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caption: '',
    reelUrl: '',
    isActive: true,
    vendor: '',
    video: null
  });

  const isVideoMedia = (url) => {
    if (!url) return false;
    if (typeof url !== 'string') return true;
    if (url.startsWith('data:video/')) return true;
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com')) return false;
    return true;
  };

  const [videoPreview, setVideoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    dispatch(fetchReelsRequest(userRole));
    dispatch(fetchVendorsRequest());
  }, [dispatch, userRole]);

  const handleOpenModal = (type, reel = null) => {
    setModalType(type);
    setIsDragging(false);
    if (type === 'edit' && reel) {
      setCurrentReel(reel);
      setFormData({
        title: reel.title || '',
        description: reel.description || '',
        caption: reel.caption || '',
        reelUrl: reel.reelUrl || '',
        isActive: reel.isActive,
        vendor: reel.vendor?._id || reel.vendor || '',
        video: null
      });
      setVideoPreview(reel.video ? getImageUrl(reel.video) : null);
      setSelectedFileName(reel.video ? reel.video.split(/[/\\]/).pop() : '');
    } else {
      setFormData({
        title: '',
        description: '',
        caption: '',
        reelUrl: '',
        isActive: true,
        vendor: '',
        video: null
      });
      setVideoPreview(null);
      setSelectedFileName('');
    }
    setShowModal(true);
  };

  const processSelectedFile = (file) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, video: file }));
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, video: null }));
    setVideoPreview(null);
    setSelectedFileName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('caption', formData.caption);
    data.append('reelUrl', formData.reelUrl);
    data.append('isActive', formData.isActive);
    if (formData.vendor) data.append('vendor', formData.vendor);
    if (formData.video) data.append('video', formData.video);

    if (modalType === 'add') {
      dispatch(addReelRequest(data));
      showToast('Success', 'Web Show created successfully', 'success');
    } else {
      dispatch(updateReelRequest({ id: currentReel._id, data }));
      showToast('Success', 'Web Show updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Show?',
      'Are you sure you want to remove this web show?'
    );
    if (isConfirmed) {
      dispatch(deleteReelRequest(id));
      showToast('Deleted', 'Show has been removed', 'success');
    }
  };

  const toggleStatus = (id, currentStatus) => {
    dispatch(toggleReelStatusRequest({ id, isActive: !currentStatus }));
    showToast('Updated', 'Visibility toggled successfully', 'success');
  };

  const filteredReels = reels.filter(reel => {
    const matchesSearch = reel.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reel.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'active' ? reel.isActive : !reel.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{userRole === 'Vendor' ? 'Agency Highlights' : 'Web Shows'}</h1>
          <p>{userRole === 'Vendor' ? 'Manage your short video highlights and reels' : 'Manage platform video showcase and instagram reels'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add Web Show
        </button>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>

          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading shows...</p>
      ) : filteredReels.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Video size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No web shows found.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid">
          {filteredReels.map((reel) => (
            <div key={reel._id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '300px', background: '#000', position: 'relative', overflow: 'hidden' }}>
                {reel.video ? (
                  isVideoMedia(getImageUrl(reel.video)) ? (
                    <video 
                      src={getImageUrl(reel.video)} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                      loop
                      onMouseOver={(e) => {
                        try {
                          const p = e.target.play();
                          if (p && p.catch) p.catch(() => {});
                        } catch (err) {}
                      }}
                      onMouseOut={(e) => {
                        try { e.target.pause(); } catch (err) {}
                      }}
                    />
                  ) : (
                    <img src={getImageUrl(reel.video)} alt={reel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '12px' }}>
                     <Smartphone size={40} opacity={0.5} />
                     <span style={{ fontSize: '12px', opacity: 0.8 }}>External Instagram Reel</span>
                     {reel.reelUrl && (
                        <a href={reel.reelUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ fontSize: '10px' }}>
                           <ExternalLink size={12} /> View on Instagram
                        </a>
                     )}
                  </div>
                )}
                <div style={{ 
                  position: 'absolute', top: '12px', right: '12px',
                  background: reel.isActive ? '#16a34a' : '#dc2626', 
                  color: 'white', padding: '4px 10px', borderRadius: '12px', 
                  fontSize: '10px', fontWeight: '700'
                }}>
                  {reel.isActive ? 'ACTIVE' : 'HIDDEN'}
                </div>
              </div>
              <div style={{ padding: '16px', flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>{reel.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4', height: '34px', overflow: 'hidden' }}>{reel.caption || 'No caption'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{reel.vendor?.name || 'Admin'}</span>
                   </div>
                    <div className="action-group">
                       <button className="action-btn" onClick={() => handleOpenModal('edit', reel)} title="View Details">
                         <Info size={16} />
                       </button>
                       <button className="action-btn" onClick={() => toggleStatus(reel._id, reel.isActive)} title={reel.isActive ? 'Hide' : 'Show'}>
                         <Power size={16} />
                       </button>
                       <button className="action-btn" onClick={() => handleOpenModal('edit', reel)}><Edit size={16} /></button>
                       <button className="action-btn danger" onClick={() => handleDelete(reel._id)}><Trash2 size={16} /></button>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Show / Caption</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Source</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReels.map((reel) => (
                  <tr key={reel._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '60px', borderRadius: '4px', background: '#000', overflow: 'hidden' }}>
                           {reel.video ? (
                             isVideoMedia(getImageUrl(reel.video)) ? (
                               <video src={getImageUrl(reel.video)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             ) : (
                               <img src={getImageUrl(reel.video)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             )
                           ) : (
                             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={16} color="white" /></div>
                           )}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{reel.title || 'Untitled Show'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {reel.reelUrl ? (
                        <a href={reel.reelUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Smartphone size={14} /> Instagram
                        </a>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Upload size={14} /> Uploaded
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                       <span style={{ 
                         color: reel.isActive ? '#16a34a' : '#dc2626',
                         background: reel.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                         padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                       }}>{reel.isActive ? 'Active' : 'Hidden'}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" onClick={() => handleOpenModal('edit', reel)} title="View Details"><Info size={16} /></button>
                        <button className="action-btn" onClick={() => toggleStatus(reel._id, reel.isActive)}><Power size={16} /></button>
                        <button className="action-btn" onClick={() => handleOpenModal('edit', reel)}><Edit size={16} /></button>
                        <button className="action-btn danger" onClick={() => handleDelete(reel._id)}><Trash2 size={16} /></button>
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
        isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add New Web Show' : 'Edit Web Show'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Show Title</label>
            <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Give this show/reel a title..." />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea className="form-control" style={{ height: '70px' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the content..." />
          </div>

          <div className="form-group">
            <label>Social Caption (Hashtags etc)</label>
            <textarea className="form-control" style={{ height: '60px' }} value={formData.caption} onChange={(e) => setFormData({...formData, caption: e.target.value})} placeholder="Write a catchy social caption..." />
          </div>

          <div className="form-group">
            <label>Instagram Reel URL (Optional)</label>
            <input type="url" className="form-control" placeholder="https://www.instagram.com/reels/..." value={formData.reelUrl} onChange={(e) => setFormData({...formData, reelUrl: e.target.value})} />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>
              Upload Video or Image File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('reel-file-input').click()}
              style={{
                border: isDragging
                  ? '2px dashed #3b82f6'
                  : videoPreview
                  ? '2px solid rgba(59, 130, 246, 0.4)'
                  : '2px dashed var(--border)',
                borderRadius: '16px',
                padding: videoPreview ? '16px' : '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'var(--bg-main)',
                transition: 'all 0.25s ease-in-out',
                position: 'relative',
                boxShadow: isDragging ? '0 0 20px rgba(59, 130, 246, 0.25)' : 'none',
                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <input
                type="file"
                id="reel-file-input"
                hidden
                accept="video/*,image/*"
                onChange={handleFileChange}
              />

              {videoPreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      maxHeight: '220px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {isVideoMedia(videoPreview) ? (
                      <video
                        src={videoPreview}
                        controls
                        muted
                        style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                      />
                    ) : (
                      <img
                        src={videoPreview}
                        alt="Media Preview"
                        style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textAlign: 'left', flex: 1 }}>
                      <div
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isVideoMedia(videoPreview) ? 'VIDEO' : 'IMAGE'}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {selectedFileName || 'Media Uploaded'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(220, 38, 38, 0.1)',
                        color: '#dc2626',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: isDragging ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '2px',
                      transition: 'transform 0.2s ease',
                      transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Upload size={24} />
                  </div>

                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                    {isDragging ? 'Drop video or image file here' : 'Drag & Drop Video or Image File Here'}
                  </p>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    or <span style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'underline' }}>click to browse</span> from your device
                  </p>

                  <div
                    style={{
                      marginTop: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      padding: '3px 10px',
                      borderRadius: '16px',
                    }}
                  >
                    Supports MP4, WEBM, MOV, JPG, PNG, WEBP
                  </div>
                </div>
              )}
            </div>
          </div>

          {userRole === 'Admin' && (
            <div className="form-group">
              <FormSelect 
                label="Assign to Vendor (Optional)"
                options={vendors.map(v => ({ value: v._id, label: v.name }))}
                value={formData.vendor}
                onChange={(val) => setFormData({...formData, vendor: val})}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <span style={{ fontWeight: '600' }}>Mark as Active (Show on website)</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '16px' }}>
            {modalType === 'add' ? 'Publish Show' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Shows;
