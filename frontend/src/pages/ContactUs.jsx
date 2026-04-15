import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchContactMessagesRequest, 
  deleteContactMessageRequest, 
  updateContactMessageStatusRequest 
} from '../store/slices/contactUsSlice';
import { 
  Search, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  MessageCircle,
  AlertCircle,
  User,
  Filter
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import FilterSelect from '../components/FilterSelect';

const ContactUs = () => {
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.contactUs);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchContactMessagesRequest());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (await confirm('Delete Message?', 'Permanently remove this contact message?')) {
      dispatch(deleteContactMessageRequest(id));
      showToast('Message deleted', 'success');
    }
  };

  const handleStatusChange = async (id, status) => {
    dispatch(updateContactMessageStatusRequest({ id, status }));
    showToast(`Status updated to ${status}`, 'success');
  };

  const filteredMessages = messages.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).reverse();

  const totalItems = filteredMessages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Unread': return 'badge-error';
      case 'Read': return 'badge-warning';
      case 'Replied': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Contact Messages</h1>
          <p>General inquiries and feedback from the contact form.</p>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search messages..."
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
                { value: 'Unread', label: 'Unread' },
                { value: 'Read', label: 'Read' },
                { value: 'Replied', label: 'Replied' }
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
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Sender</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMessages.map((msg) => (
                <tr key={msg._id} style={{ borderBottom: '1px solid var(--border)' }} className={msg.status === 'Unread' ? 'unread-row' : ''}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px' }}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600' }}>{msg.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{msg.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{msg.subject}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${getStatusColor(msg.status)}`}>{msg.status}</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="action-btn view" 
                        onClick={() => {
                          setSelectedMessage(msg);
                          setShowDrawer(true);
                          if (msg.status === 'Unread') {
                            handleStatusChange(msg._id, 'Read');
                          }
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="action-btn danger" onClick={() => handleDelete(msg._id)}>
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
        title="Contact Message"
        width="500px"
      >
        {selectedMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>From</div>
                <h3>{selectedMessage.name}</h3>
                <div style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '14px', marginBottom: '16px' }}>{selectedMessage.email}</div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                   {selectedMessage.phone && (
                     <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone</div>
                        <div style={{ fontSize: '13px' }}>{selectedMessage.phone}</div>
                     </div>
                   )}
                   <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Date</div>
                        <div style={{ fontSize: '13px' }}>{new Date(selectedMessage.createdAt).toLocaleString()}</div>
                   </div>
                </div>
            </div>

            <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Subject</label>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedMessage.subject}</div>
            </div>

            <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Message</label>
                <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'block' }}>Update Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['Read', 'Replied'].map(status => (
                        <button 
                            key={status}
                            className={`btn ${selectedMessage.status === status ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleStatusChange(selectedMessage._id, status)}
                            style={{ flex: 1 }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            <a 
              href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
              className="btn btn-primary"
              style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}
              onClick={() => handleStatusChange(selectedMessage._id, 'Replied')}
            >
              Reply via Email
            </a>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ContactUs;
