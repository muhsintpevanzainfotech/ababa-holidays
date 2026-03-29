import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../utils/constants';
import Drawer from '../components/Drawer';
import FormSelect from '../components/FormSelect';
import FilterSelect from '../components/FilterSelect';
import { 
  fetchTestimonialsRequest, 
  addTestimonialRequest, 
  updateTestimonialRequest, 
  deleteTestimonialRequest 
} from '../store/slices/testimonialsSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  LayoutGrid, 
  List as ListIcon, 
  Star, 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Quote,
  Video,
  ExternalLink
} from 'lucide-react';

const Testimonials = ({ userRole = 'Admin' }) => {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.testimonials);
  const { vendors } = useSelector((state) => state.vendors);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    customerName: '',
    customerDesignation: '',
    content: '',
    rating: 5,
    status: 'Pending',
    vendor: '',
    video: '',
    isTopPick: false
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchTestimonialsRequest(userRole));
    dispatch(fetchVendorsRequest());
  }, [dispatch, userRole]);

  const handleOpenModal = (type, testimonial = null) => {
    setModalType(type);
    if (type === 'edit' && testimonial) {
      setCurrentTestimonial(testimonial);
      setFormData({
        customerName: testimonial.customerName || '',
        customerDesignation: testimonial.customerDesignation || '',
        content: testimonial.content || '',
        rating: testimonial.rating || 5,
        status: testimonial.status || 'Pending',
        vendor: testimonial.vendor?._id || testimonial.vendor || '',
        video: testimonial.video || '',
        isTopPick: testimonial.isTopPick || false
      });
      setImagePreview(testimonial.image ? getImageUrl(testimonial.image) : null);
      setSelectedImage(null);
    } else {
      setFormData({
        customerName: '',
        customerDesignation: '',
        content: '',
        rating: 5,
        status: 'Pending',
        vendor: '',
        video: '',
        isTopPick: false
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (selectedImage) data.append('image', selectedImage);

    if (modalType === 'add') {
      dispatch(addTestimonialRequest(data));
      showToast('Created', 'New testimonial added successfully.', 'success');
    } else {
      dispatch(updateTestimonialRequest({ id: currentTestimonial._id, data }));
      showToast('Updated', 'Testimonial modified successfully.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Testimonial?',
      'Are you sure you want to remove this testimonial? This action cannot be undone.'
    );
    if (isConfirmed) {
      dispatch(deleteTestimonialRequest(id));
      showToast('Deleted', 'Testimonial removed.', 'success');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, isTopPick) => {
    if (isTopPick) return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', icon: <Star size={14} fill="#ec4899" /> };
    switch (status) {
      case 'Approved': return { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', icon: <CheckCircle size={14} /> };
      case 'Pending': return { color: '#ca8a04', bg: 'rgba(202, 138, 4, 0.1)', icon: <Clock size={14} /> };
      case 'Rejected': return { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', icon: <XCircle size={14} /> };
      default: return { color: 'var(--text-muted)', bg: 'var(--bg-main)', icon: null };
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{userRole === 'Vendor' ? 'Agency Feedback Hub' : 'Official Success Stories'}</h1>
          <p>{userRole === 'Vendor' ? 'Manage customer reviews and feedback for your business' : 'Manage platform testimonials and global showcase stories'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button className="btn btn-primary" onClick={() => handleOpenModal('add')} style={{ width: '100%' }}>
            <Plus size={20} /> Add {userRole === 'Vendor' ? 'Customer Review' : 'Global Story'}
          </button>
          <button 
            className="btn" 
            style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}
            onClick={() => {
               navigator.clipboard.writeText(`${window.location.origin}/submit-testimonial`);
               showToast('Copied!', 'Public review link copied to clipboard.', 'success');
            }}
          >
            <ExternalLink size={14} /> Copy Public Review Link
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><Quote size={24} /></div>
          <div className="stat-info"><h3>Total</h3><p>{testimonials.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Approved</h3><p>{testimonials.filter(t => t.status === 'Approved').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(202, 138, 4, 0.1)', color: '#ca8a04' }}><Clock size={24} /></div>
          <div className="stat-info"><h3>Pending</h3><p>{testimonials.filter(t => t.status === 'Pending').length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input 
              type="text" className="form-control" placeholder="Search by name or content..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>

          <div className="filter-actions">
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'Approved', label: 'Approved', color: '#16a34a' },
                { value: 'Pending', label: 'Pending', color: '#ca8a04' },
                { value: 'Rejected', label: 'Rejected', color: '#dc2626' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="160px"
            />
            
            <div className="view-toggles">
              <button onClick={() => setView('grid')} className={`view-btn ${view === 'grid' ? 'active' : ''}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setView('list')} className={`view-btn ${view === 'list' ? 'active' : ''}`}><ListIcon size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading testimonials...</p>
      ) : filteredTestimonials.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Quote size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No testimonials found.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid">
          {filteredTestimonials.map((t) => {
            const status = getStatusBadge(t.status);
            return (
              <div key={t._id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-light)' }}>
                      <img src={t.image ? getImageUrl(t.image) : `https://ui-avatars.com/api/?name=${t.customerName}&background=random`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{t.customerName}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{t.customerDesignation || 'Customer'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {t.isTopPick && (
                      <div style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                         TOP PICK
                      </div>
                    )}
                    <div style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', background: status.bg, color: status.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {status.icon} {t.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <Quote size={20} color="var(--primary-light)" style={{ position: 'absolute', top: '-10px', left: '-10px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                    "{t.content.length > 150 ? t.content.substring(0, 150) + '...' : t.content}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < t.rating ? '#fbbf24' : 'none'} color={i < t.rating ? '#fbbf24' : '#cbd5e1'} />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {t.vendor ? `For: ${t.vendor.name || 'Vendor'}` : 'Global Testimonial'}
                   </div>
                   <div className="action-group">
                      {t.video && <a href={t.video} target="_blank" rel="noreferrer" className="action-btn" title="Watch Video"><Video size={16} /></a>}
                      <button className="action-btn" onClick={() => handleOpenModal('edit', t)}><Edit size={16} /></button>
                      <button className="action-btn danger" onClick={() => handleDelete(t._id)}><Trash2 size={16} /></button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Comment</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Rating</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((t) => {
                  const status = getStatusBadge(t.status, t.isTopPick);
                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={t.image ? getImageUrl(t.image) : `https://ui-avatars.com/api/?name=${t.customerName}&background=random`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{t.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.customerDesignation}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                        <p style={{ fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.content}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < t.rating ? '#fbbf24' : 'none'} color={i < t.rating ? '#fbbf24' : '#cbd5e1'} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: status.color, fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {status.icon} {t.isTopPick ? 'TOP PICK' : t.status}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group">
                          <button className="action-btn" onClick={() => handleOpenModal('edit', t)}><Edit size={16} /></button>
                          <button className="action-btn danger" onClick={() => handleDelete(t._id)}><Trash2 size={16} /></button>
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

      <Drawer 
        isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" className="form-control" required value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Designation / Location</label>
            <input type="text" className="form-control" placeholder="e.g. CEO, Traveler from Delhi" value={formData.customerDesignation} onChange={(e) => setFormData({...formData, customerDesignation: e.target.value})} />
          </div>
          <div className="form-group">
             <label>Customer Photo</label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} color="var(--text-muted)" />}
                </div>
                <div>
                  <button type="button" className="btn btn-primary" onClick={() => document.getElementById('testimonial-photo').click()} style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Upload Photo
                  </button>
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Optimum size: 250x250px</p>
                </div>
                <input id="testimonial-photo" type="file" accept="image/*" onChange={handleImageChange} hidden />
             </div>
          </div>
          <div className="form-group">
            <label>Rating</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button 
                  key={val} type="button" 
                  onClick={() => setFormData({...formData, rating: val})}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                >
                  <Star size={24} fill={val <= formData.rating ? '#fbbf24' : 'none'} color={val <= formData.rating ? '#fbbf24' : '#cbd5e1'} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Review Content</label>
            <textarea className="form-control" style={{ height: '120px' }} required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Video URL (Optional)</label>
            <input type="url" className="form-control" placeholder="YouTube/Vimeo link" value={formData.video} onChange={(e) => setFormData({...formData, video: e.target.value})} />
          </div>
          {userRole !== 'Vendor' && (
            <div className="form-group">
              <FormSelect 
                label="Assigned Vendor (Optional)" options={vendors.map(v => ({ value: v._id, label: v.companyName || v.name }))} 
                value={formData.vendor} onChange={(val) => setFormData({...formData, vendor: val})} 
              />
            </div>
          )}
          <div className="form-group">
            <FormSelect 
              label="Approval Status" options={[{ value: 'Pending', label: 'Pending' }, { value: 'Approved', label: 'Approved' }, { value: 'Rejected', label: 'Rejected' }]} 
              value={formData.status} onChange={(val) => setFormData({...formData, status: val})} 
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isTopPick}
                onChange={(e) => setFormData({...formData, isTopPick: e.target.checked})}
              />
              <span style={{ fontWeight: '600', color: '#ec4899' }}>Show in Top Picks on Website</span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '16px' }}>
            {modalType === 'add' ? 'Publish Testimonial' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Testimonials;
