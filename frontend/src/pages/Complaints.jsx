import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchComplaints, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint 
} from '../store/slices/complaintsSlice';
import { 
  AlertCircle, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle, 
  Loader2, 
  MessageSquare, 
  Image as ImageIcon,
  User as UserIcon,
  Clock,
  ExternalLink,
  ShieldAlert,
  Menu,
  MoreVertical,
  XCircle,
  Camera
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import { getImageUrl } from '../utils/constants';
import api from '../utils/api';
import FormSelect from '../components/FormSelect';

const Complaints = () => {
  const dispatch = useDispatch();
  const { complaints, loading } = useSelector((state) => state.complaints);
  const { user } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [activeComplaint, setActiveComplaint] = useState(null);
  
  // Selection for new complaint
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    defendant: '',
    subject: '',
    description: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    dispatch(fetchComplaints());
    // Fetch users for target selection
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.success) setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [dispatch]);

  const handleOpenModal = (type, complaint = null) => {
    setModalType(type);
    if (complaint) {
      setActiveComplaint({ ...complaint });
    } else {
      setFormData({ defendant: '', subject: '', description: '', images: [] });
      setImagePreviews([]);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      showToast('Limit Exceeded', 'You can upload up to 5 images for a dispute.', 'error');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('defendant', formData.defendant);
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    formData.images.forEach(img => data.append('images', img));

    try {
      await dispatch(createComplaint(data)).unwrap();
      showToast('Success', 'Dispute filed successfully. Administrators will review it.', 'success');
      setShowModal(false);
    } catch (err) {
      showToast('Error', err || 'Failed to file dispute', 'error');
    }
  };

  const handleUpdateStatus = async (id, status, resolution) => {
    try {
      await dispatch(updateComplaint({ id, status, resolution })).unwrap();
      showToast('Updated', `Dispute status updated to ${status}`, 'success');
      setShowModal(false);
    } catch (err) {
      showToast('Error', err || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (await confirm('Remove Record?', 'Are you sure you want to permanently remove this incident record?')) {
      try {
        await dispatch(deleteComplaint(id)).unwrap();
        showToast('Success', 'Record removed', 'success');
      } catch (err) {
        showToast('Error', err || 'Failed to delete record', 'error');
      }
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.complainant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRole = roleFilter === 'all' || c.defendant?.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusCount = (status) => {
    if (status === 'all') return complaints.length;
    return complaints.filter(c => c.status.toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Dispute Resolution</h1>
          <p>Managed platform for incident reporting and accountability</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <ShieldAlert size={20} /> File Dispute
        </button>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Search Row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="search-wrapper" style={{ flex: 1, minWidth: '300px' }}>
              <Search size={18} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by subject, filer, or incident details..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '44px', borderRadius: '12px' }}
              />
            </div>
          </div>

          {/* Filtering Intelligence Row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'Pending', 'Investigating', 'Resolved', 'Spam'].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)}
                  className={`badge ${statusFilter === status ? 'badge-primary' : 'badge-light'}`}
                  style={{ 
                    cursor: 'pointer', border: 'none', padding: '10px 18px', fontSize: '12px', 
                    display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', 
                    fontWeight: '700', transition: 'var(--transition)' 
                  }}
                >
                  {status === 'all' ? 'All Incidents' : status}
                  <span style={{ 
                    padding: '2px 8px', borderRadius: '10px', 
                    background: statusFilter === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-main)', 
                    fontSize: '11px', fontWeight: '800' 
                  }}>
                    {getStatusCount(status)}
                  </span>
                </button>
              ))}
            </div>
            
            <div style={{ width: '200px' }}>
              <FormSelect 
                options={[
                  { value: 'all', label: 'All Defendant Roles' },
                  { value: 'Vendor', label: 'Agency (Vendor)' },
                  { value: 'User', label: 'Traveler (User)' },
                  { value: 'Sub-Admin', label: 'Internal (Sub-Admin)' }
                ]}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Defendant Role"
              />
            </div>
          </div>
          
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} opacity={0.3} /></div>
      ) : filteredComplaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <MessageSquare size={48} opacity={0.1} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>No dispute records found matching your filters.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>FILER / SUBJECT</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>DEFENDANT</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>EVIDENCE</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>FILED ON</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.subject}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={12} /> {c.complainant?.name || 'Unknown'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.defendant?.name || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-main)', width: 'fit-content', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                         {c.defendant?.role || 'Guest'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        background: c.status === 'Resolved' ? '#f0fdf4' : c.status === 'Pending' ? '#fffbeb' : '#f1f5f9',
                        color: c.status === 'Resolved' ? '#166534' : c.status === 'Pending' ? '#92400e' : '#475569'
                      }}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                       {c.images?.length > 0 ? (
                         <div style={{ display: 'flex', gap: '4px' }}>
                            <div title="Evidence Attached" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' }}>
                              <Camera size={14} /> {c.images.length}
                            </div>
                         </div>
                       ) : <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>No Evidence</span>}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" onClick={() => handleOpenModal('view', c)} title="View Details"><ExternalLink size={16} /></button>
                        {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
                          <button className="action-btn" onClick={() => handleOpenModal('update', c)} title="Process Incident"><CheckCircle size={16} /></button>
                        )}
                        {user?.role === 'Admin' && (
                          <button className="action-btn danger" onClick={() => handleDelete(c._id)} title="Delete Record"><Trash2 size={16} /></button>
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

      {/* Drawer for Add/View/Update */}
      <Drawer 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalType === 'add' ? 'File New Dispute' : modalType === 'update' ? 'Process Incident' : 'Complaint Intelligence'}
      >
        {modalType === 'add' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <FormSelect 
                label="Target Partner/User"
                required
                options={users.map(u => ({ value: u._id, label: `${u.name} (${u.role})` }))}
                value={formData.defendant}
                onChange={(val) => setFormData({ ...formData, defendant: val })}
                placeholder="Select individual or company..."
              />
            </div>
            <div className="form-group">
              <label>Subject of Incident <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                className="form-control" 
                required
                placeholder="E.g., Payment dispute, Quality issue..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Detailed Description <span style={{ color: 'red' }}>*</span></label>
              <textarea 
                className="form-control" 
                required 
                rows="5"
                placeholder="Provide a step-by-step account of the incident..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Evidence / Screenshots (Max 5)</label>
              <div 
                style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => document.getElementById('complaint-images').click()}
              >
                <Camera size={32} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Click to upload evidence</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Supports JPG, PNG (Max 5MB each)</p>
                <input 
                  id="complaint-images" 
                  type="file" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              {imagePreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                   {imagePreviews.map((pre, idx) => (
                     <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={pre} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={12} />
                        </button>
                     </div>
                   ))}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ height: '48px', marginTop: '16px' }}>Submit Dispute Report</button>
          </form>
        ) : modalType === 'update' ? (
          <div>
             <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                <AlertCircle size={18} /> Process this incident by setting a resolution status.
             </div>
             <form onSubmit={(e) => {
               e.preventDefault();
               handleUpdateStatus(activeComplaint._id, activeComplaint.status, e.target.resolution.value);
             }}>
                <div className="form-group">
                   <FormSelect 
                      label="System Action"
                      options={[
                        { value: 'Investigating', label: 'Mark as Investigating' },
                        { value: 'Resolved', label: 'Mark as Resolved' },
                        { value: 'Spam', label: 'Discard as Spam' }
                      ]}
                      value={activeComplaint?.status}
                      onChange={(val) => setActiveComplaint({ ...activeComplaint, status: val })}
                   />
                </div>
                <div className="form-group">
                   <label>Official Resolution Notes</label>
                   <textarea name="resolution" className="form-control" required rows="4" placeholder="Enter findings and action taken..." defaultValue={activeComplaint?.resolution}></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block" style={{ height: '48px', marginTop: '16px' }}>Broadcast Resolution Intelligence</button>
             </form>
          </div>
        ) : (
          <div>
             <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: 'var(--bg-main)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ShieldAlert size={24} />
                </div>
                <div>
                   <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{activeComplaint?.subject}</h3>
                   <span className={`badge ${activeComplaint?.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '4px' }}>{activeComplaint?.status}</span>
                </div>
             </div>

             <div className="form-group">
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Incident Narration</label>
                <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                   {activeComplaint?.description}
                </div>
             </div>

             {activeComplaint?.images?.length > 0 && (
                <div className="form-group">
                   <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Evidence Evidence</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                      {activeComplaint.images.map((img, i) => (
                        <a key={i} href={getImageUrl(img)} target="_blank" rel="noopener noreferrer" style={{ height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                           <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </a>
                      ))}
                   </div>
                </div>
             )}

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
                <div className="card" style={{ padding: '16px' }}>
                   <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Filer</p>
                   <p style={{ margin: '4px 0 0', fontWeight: '800', fontSize: '14px' }}>{activeComplaint?.complainant?.name}</p>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                   <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Accused</p>
                   <p style={{ margin: '4px 0 0', fontWeight: '800', fontSize: '14px' }}>{activeComplaint?.defendant?.name}</p>
                </div>
             </div>

             {activeComplaint?.resolution && (
               <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #16a34a30', background: '#f0fdf4', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> Official Resolution</p>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#14532d' }}>{activeComplaint.resolution}</p>
               </div>
             )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Complaints;
