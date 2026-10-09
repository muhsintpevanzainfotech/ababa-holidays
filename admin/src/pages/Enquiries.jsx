import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEnquiriesRequest, 
  deleteEnquiryRequest, 
  updateEnquiryStatusRequest,
  addFollowUpRequest
} from '../store/slices/enquiriesSlice';
import { 
  Search, 
  Trash2, 
  Info, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  X, 
  MessageSquare,
  MessageCircle,
  Send,
  Clock,
  User,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  Wrench
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import FilterSelect from '../components/FilterSelect';
import { getImageUrl } from '../utils/constants';

const Enquiries = () => {
  const dispatch = useDispatch();
  const { enquiries, loading } = useSelector((state) => state.enquiries);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [view, setView] = useState('list');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  
  useEffect(() => {
    dispatch(fetchEnquiriesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEnquiry) {
      const updated = enquiries.find(e => e._id === selectedEnquiry._id);
      if (updated) {
        setSelectedEnquiry(updated);
      }
    }
  }, [enquiries]);

  const handleDelete = async (id) => {
    if (await confirm('Delete Enquiry?', 'Are you sure you want to remove this enquiry?')) {
      dispatch(deleteEnquiryRequest(id));
      showToast('Enquiry deleted successfully', 'success');
    }
  };

  const handleStatusChange = async (id, status) => {
    dispatch(updateEnquiryStatusRequest({ id, status }));
    setSelectedEnquiry(prev => (prev && prev._id === id ? { ...prev, status } : prev));
    showToast(`Status updated to ${status}`, 'success');
  };

  const handleCorrection = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowDrawer(true);
    showToast('Correction mode enabled', 'info');
  };

  const handleAddFollowUp = (e) => {
    e.preventDefault();
    if (!followUpNote.trim()) return;
    
    dispatch(addFollowUpRequest({ 
      id: selectedEnquiry._id, 
      note: followUpNote,
      status: selectedEnquiry.status 
    }));
    
    setFollowUpNote('');
    showToast('Follow-up added', 'success');
  };

  const filteredEnquiries = enquiries
    .filter((item) => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone && item.phone.includes(searchTerm));
        
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const totalItems = filteredEnquiries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEnquiries = filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'badge-primary';
      case 'In Progress': return 'badge-warning';
      case 'Closed': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Web Enquiries</h1>
          <p>Track and manage service enquiries received from the website.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1e40af' }}><MessageSquare size={24} /></div>
          <div className="stat-info"><h3>Total Enquiries</h3><p>{enquiries.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#9a3412' }}><Clock size={24} /></div>
          <div className="stat-info"><h3>New</h3><p>{enquiries.filter(e => e.status === 'New').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#166534' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Closed</h3><p>{enquiries.filter(e => e.status === 'Closed').length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search enquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} />
          </div>
          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <FilterSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'New', label: 'New' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Closed', label: 'Closed' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading enquiries...</p>
      ) : currentEnquiries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', marginBottom: '24px' }}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No enquiries found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {currentEnquiries.map((enquiry) => (
            <div key={enquiry._id} className="card" style={{ padding: '20px', position: 'relative', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className={`badge ${getStatusColor(enquiry.status)}`}>{enquiry.status}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(enquiry.createdAt).toLocaleDateString()}</div>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{enquiry.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{enquiry.email}</p>
              
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', minHeight: '60px' }}>
                {enquiry.message.length > 100 ? `${enquiry.message.substring(0, 100)}...` : enquiry.message}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="action-btn" onClick={() => handleCorrection(enquiry)} title="Correction">
                  <Wrench size={16} />
                </button>
                <button className="action-btn view" onClick={() => { setSelectedEnquiry(enquiry); setShowDrawer(true); }}>
                  <Info size={16} />
                </button>
                <button className="action-btn danger" onClick={() => handleDelete(enquiry._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Service</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{new Date(enquiry.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{enquiry.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {enquiry.email}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px' }}>{enquiry.serviceOfInterest || 'General Enquiry'}</div>
                      {enquiry.vendor && (
                          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '500' }}>Vendor: {enquiry.vendor.name}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${getStatusColor(enquiry.status)}`}>{enquiry.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="action-btn" 
                          onClick={() => handleCorrection(enquiry)}
                          title="Correction"
                          style={{ color: 'var(--primary)' }}
                        >
                          <Wrench size={16} />
                        </button>
                        <button 
                          className="action-btn view" 
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setShowDrawer(true);
                          }}
                        >
                          <Info size={16} />
                        </button>
                        <button className="action-btn danger" onClick={() => handleDelete(enquiry._id)}>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <Drawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
        title="Enquiry Details"
        width="540px"
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Status Management Pill Bar */}
            <div className="detail-section">
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                Status Management
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '8px', 
                background: 'var(--bg-main)', 
                padding: '6px', 
                borderRadius: '14px', 
                border: '1px solid var(--border)' 
              }}>
                {[
                  { key: 'New', label: 'New', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: <Clock size={15} /> },
                  { key: 'In Progress', label: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <MessageSquare size={15} /> },
                  { key: 'Closed', label: 'Closed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={15} /> }
                ].map((s) => {
                  const isActive = selectedEnquiry.status === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(selectedEnquiry._id, s.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isActive ? `1.5px solid ${s.color}` : '1.5px solid transparent',
                        background: isActive ? s.color : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-main)',
                        boxShadow: isActive ? `0 4px 12px ${s.bg}` : 'none'
                      }}
                    >
                      {s.icon} {s.key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Information & Header Card */}
            <div className="detail-section">
              <div style={{ 
                background: 'var(--bg-main)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                      Customer Contact
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {selectedEnquiry.name}
                    </h3>
                  </div>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    background: selectedEnquiry.status === 'New' ? 'rgba(59, 130, 246, 0.15)' : selectedEnquiry.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                    color: selectedEnquiry.status === 'New' ? '#3b82f6' : selectedEnquiry.status === 'In Progress' ? '#f59e0b' : '#10b981' 
                  }}>
                    {selectedEnquiry.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <a href={`mailto:${selectedEnquiry.email}`} style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    fontSize: '13px', padding: '6px 12px', borderRadius: '8px', 
                    background: 'var(--bg-card)', border: '1px solid var(--border)', 
                    color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' 
                  }}>
                    <Mail size={14} /> {selectedEnquiry.email}
                  </a>
                  {selectedEnquiry.phone && (
                    <a href={`tel:${selectedEnquiry.phone}`} style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      fontSize: '13px', padding: '6px 12px', borderRadius: '8px', 
                      background: 'var(--bg-card)', border: '1px solid var(--border)', 
                      color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none' 
                    }}>
                      <Phone size={14} /> {selectedEnquiry.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Enquiry From / Source & Target Details */}
            <div className="detail-section">
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                Enquiry Details & Source
              </label>
              <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '18px', 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px' 
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Enquiry From / Form</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {selectedEnquiry.serviceOfInterest || 'Website Contact Form'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Vendor / Agency</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600', color: selectedEnquiry.vendor ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {selectedEnquiry.vendor?.companyName || selectedEnquiry.vendor?.name || 'Main Website / Admin'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Received Date</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-main)' }}>
                    {new Date(selectedEnquiry.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedEnquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {selectedEnquiry.file && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Attachment</span>
                    <div style={{ marginTop: '4px' }}>
                      <a href={getImageUrl(selectedEnquiry.file)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ fontSize: '11px', gap: '4px' }}>
                        View Attachment File
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Content Box */}
            <div className="detail-section">
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                Enquiry Message
              </label>
              <div style={{ 
                background: 'var(--bg-main)', 
                border: '1px solid var(--border)', 
                padding: '18px', 
                borderRadius: '14px', 
                fontSize: '14px', 
                lineHeight: '1.7', 
                color: 'var(--text-main)', 
                whiteSpace: 'pre-line' 
              }}>
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Quick Reply & Communication Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>
                  Quick Reply & Communication Options
                </label>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                   <a 
                     href={`mailto:${selectedEnquiry.email}?subject=Re: Enquiry - ${encodeURIComponent(selectedEnquiry.serviceOfInterest || 'Ababa Travels')}`}
                     className="btn btn-primary"
                     style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', textDecoration: 'none' }}
                     onClick={() => handleStatusChange(selectedEnquiry._id, 'In Progress')}
                   >
                     <Mail size={16} /> Reply via Email
                   </a>

                   {selectedEnquiry.phone && (
                     <a 
                       href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                       target="_blank"
                       rel="noreferrer"
                       className="btn"
                       style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', background: '#16a34a', color: 'white', textDecoration: 'none', fontWeight: '700' }}
                       onClick={() => handleStatusChange(selectedEnquiry._id, 'In Progress')}
                     >
                       <MessageCircle size={16} /> Reply WhatsApp
                     </a>
                   )}
                </div>
            </div>

            {/* Follow-up History */}
            <div className="detail-section">
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                Follow-up History & Activity Log
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {selectedEnquiry.followUps?.length > 0 ? (
                  selectedEnquiry.followUps.map((f, i) => (
                    <div key={i} style={{ 
                      background: 'var(--bg-main)', 
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${selectedEnquiry.status === 'New' ? '#3b82f6' : selectedEnquiry.status === 'In Progress' ? '#f59e0b' : '#10b981'}`,
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      fontSize: '13px' 
                    }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{f.note}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {new Date(f.date).toLocaleString()} — logged by <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{f.followedUpBy?.name || 'Staff User'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    No follow-up notes logged for this enquiry yet.
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAddFollowUp} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a follow-up note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Add Note</button>
              </form>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Enquiries;
