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
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  X, 
  MessageSquare,
  Clock,
  User,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import FilterSelect from '../components/FilterSelect';

const Enquiries = () => {
  const dispatch = useDispatch();
  const { enquiries, loading } = useSelector((state) => state.enquiries);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [followUpNote, setFollowUpNote] = useState('');

  useEffect(() => {
    dispatch(fetchEnquiriesRequest());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (await confirm('Delete Enquiry?', 'Are you sure you want to remove this enquiry?')) {
      dispatch(deleteEnquiryRequest(id));
      showToast('Enquiry deleted successfully', 'success');
    }
  };

  const handleStatusChange = async (id, status) => {
    dispatch(updateEnquiryStatusRequest({ id, status }));
    showToast(`Status updated to ${status}`, 'success');
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

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).reverse();

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
          <div className="filter-actions">
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
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
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
                        className="action-btn view" 
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setShowDrawer(true);
                        }}
                      >
                        <Eye size={16} />
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
        width="500px"
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="detail-section">
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Customer Information</label>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '12px' }}>{selectedEnquiry.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Mail size={14} color="var(--text-muted)" /> {selectedEnquiry.email}
                  </div>
                  {selectedEnquiry.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Phone size={14} color="var(--text-muted)" /> {selectedEnquiry.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Message</label>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                {selectedEnquiry.message}
              </div>
            </div>

            <div className="detail-section">
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Status Management</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['New', 'In Progress', 'Closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedEnquiry._id, status)}
                    className={`btn ${selectedEnquiry.status === status ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Follow-up History</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {selectedEnquiry.followUps?.length > 0 ? (
                  selectedEnquiry.followUps.map((f, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '12px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '500' }}>{f.note}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(f.date).toLocaleString()} by {f.followedUpBy?.name || 'Staff'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No follow-ups yet.</div>
                )}
              </div>
              
              <form onSubmit={handleAddFollowUp} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Enquiries;
