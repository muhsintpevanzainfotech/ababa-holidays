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
  Info, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  MessageCircle,
  AlertCircle,
  User,
  Filter,
  Send,
  ExternalLink
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

  useEffect(() => {
    if (selectedMessage) {
      const updated = messages.find((m) => m._id === selectedMessage._id);
      if (updated) setSelectedMessage(updated);
    }
  }, [messages]);

  const handleDelete = async (id) => {
    if (await confirm('Delete Message?', 'Permanently remove this contact message?')) {
      dispatch(deleteContactMessageRequest(id));
      showToast('Message deleted', 'success');
    }
  };

  const handleStatusChange = async (id, status) => {
    dispatch(updateContactMessageStatusRequest({ id, status }));
    setSelectedMessage((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
    showToast(`Status updated to ${status}`, 'success');
  };

  const filteredMessages = messages
    .filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const totalItems = filteredMessages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Unread': 
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'Read': 
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'Replied': 
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default: 
        return { bg: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Contact Messages</h1>
          <p>General inquiries and customer feedback from the website contact form.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}><AlertCircle size={24} /></div>
          <div className="stat-info"><h3>Unread</h3><p>{messages.filter(m => m.status === 'Unread').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}><Clock size={24} /></div>
          <div className="stat-info"><h3>Read</h3><p>{messages.filter(m => m.status === 'Read').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Replied</h3><p>{messages.filter(m => m.status === 'Replied').length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by sender, email, subject..."
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
                { value: 'Unread', label: 'Unread', color: '#ef4444' },
                { value: 'Read', label: 'Read', color: '#f59e0b' },
                { value: 'Replied', label: 'Replied', color: '#10b981' }
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
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Sender</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Subject</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMessages.map((msg) => {
                const badgeStyle = getStatusBadgeStyle(msg.status);
                return (
                  <tr key={msg._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{msg.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {msg.email}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{msg.subject}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', 
                        background: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border 
                      }}>
                        {msg.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <a 
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="action-btn"
                          title="Quick Reply Email"
                          onClick={() => handleStatusChange(msg._id, 'Replied')}
                        >
                          <Send size={15} color="var(--primary)" />
                        </a>
                        <button 
                          className="action-btn view" 
                          title="View Message"
                          onClick={() => {
                            setSelectedMessage(msg);
                            setShowDrawer(true);
                            if (msg.status === 'Unread') {
                              handleStatusChange(msg._id, 'Read');
                            }
                          }}
                        >
                          <Info size={16} />
                        </button>
                        <button className="action-btn danger" title="Delete" onClick={() => handleDelete(msg._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        title="Contact Message Details"
        width="540px"
      >
        {selectedMessage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Status Tracking Pill Bar */}
            <div className="detail-section">
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                Status Tracking
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
                  { key: 'Unread', label: 'Unread', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <AlertCircle size={15} /> },
                  { key: 'Read', label: 'Read', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Clock size={15} /> },
                  { key: 'Replied', label: 'Replied', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={15} /> }
                ].map((s) => {
                  const isActive = selectedMessage.status === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(selectedMessage._id, s.key)}
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

            {/* Sender Header Card */}
            <div style={{ 
              background: 'var(--bg-main)', 
              border: '1px solid var(--border)', 
              padding: '20px', 
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Sender</span>
                      <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{selectedMessage.name}</h3>
                   </div>
                   <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      background: selectedMessage.status === 'Unread' ? 'rgba(239, 68, 68, 0.15)' : selectedMessage.status === 'Read' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: selectedMessage.status === 'Unread' ? '#ef4444' : selectedMessage.status === 'Read' ? '#f59e0b' : '#10b981'
                   }}>
                      {selectedMessage.status.toUpperCase()}
                   </span>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <a href={`mailto:${selectedMessage.email}`} style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    fontSize: '13px', padding: '6px 12px', borderRadius: '8px', 
                    background: 'var(--bg-card)', border: '1px solid var(--border)', 
                    color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' 
                  }}>
                    <Mail size={14} /> {selectedMessage.email}
                  </a>
                  {selectedMessage.phone && (
                    <a href={`tel:${selectedMessage.phone}`} style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      fontSize: '13px', padding: '6px 12px', borderRadius: '8px', 
                      background: 'var(--bg-card)', border: '1px solid var(--border)', 
                      color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none' 
                    }}>
                      <Phone size={14} /> {selectedMessage.phone}
                    </a>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
            </div>

            {/* Subject & Message Content */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Subject</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>{selectedMessage.subject || 'General Contact Enquiry'}</div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Message Body</span>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                    {selectedMessage.message}
                </div>
            </div>

            {/* Quick Reply Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>
                  Quick Reply & Communication Options
                </label>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                   <a 
                     href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Enquiry')}`}
                     className="btn btn-primary"
                     style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', textDecoration: 'none' }}
                     onClick={() => handleStatusChange(selectedMessage._id, 'Replied')}
                   >
                     <Mail size={16} /> Reply via Email
                   </a>

                   {selectedMessage.phone && (
                     <a 
                       href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                       target="_blank"
                       rel="noreferrer"
                       className="btn"
                       style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '44px', background: '#16a34a', color: 'white', textDecoration: 'none', fontWeight: '700' }}
                       onClick={() => handleStatusChange(selectedMessage._id, 'Replied')}
                     >
                       <MessageCircle size={16} /> Reply WhatsApp
                     </a>
                   )}
                </div>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ContactUs;
