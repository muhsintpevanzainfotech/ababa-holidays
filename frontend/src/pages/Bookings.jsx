import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Package, 
  Trash2,
  Info,
  ChevronDown
} from 'lucide-react';
import { fetchBookingsRequest, updateBookingStatusRequest, deleteBookingRequest } from '../store/slices/bookingsSlice';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Bookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchBookingsRequest());
  }, [dispatch]);

  const handleStatusUpdate = async (id, status) => {
    dispatch(updateBookingStatusRequest({ id, status }));
    showToast('Status Updated', `Booking progress set to ${status}.`, 'success');
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Remove Booking?',
      'Are you sure you want to delete this booking record? This action is permanent.'
    );
    if (isConfirmed) {
      dispatch(deleteBookingRequest(id));
      showToast('Deleted', 'Booking has been purged from logs.', 'success');
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.package?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }).reverse();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', icon: <CheckCircle size={14} /> };
      case 'Pending': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', icon: <Clock size={14} /> };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', icon: <XCircle size={14} /> };
      case 'Completed': return { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', icon: <CheckCircle size={14} /> };
      default: return { bg: 'var(--bg-main)', color: 'var(--text-muted)', icon: null };
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Reservations</h1>
          <p>Track and manage customer travel bookings and itineraries</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><Calendar size={24} /></div>
          <div className="stat-info"><h3>Total Volume</h3><p>{bookings.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Confirmed</h3><p>{bookings.filter(b => b.bookingStatus === 'Confirmed').length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}><Clock size={24} /></div>
          <div className="stat-info"><h3>Pending</h3><p>{bookings.filter(b => b.bookingStatus === 'Pending').length}</p></div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '250px' }}>
            <input 
              type="text" className="form-control" placeholder="Search by traveler or package..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>
          
          <select 
            className="form-control" 
            style={{ width: '180px', borderRadius: '12px' }} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking ID</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Traveler</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Package</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Travel Date</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Synchronizing booking data...</td></tr>
              ) : filteredBookings.length === 0 ? (
                 <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No reservations found.</td></tr>
              ) : filteredBookings.map((b) => {
                const style = getStatusStyle(b.bookingStatus);
                return (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700' }}>#{b._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} color="var(--text-muted)" />
                         </div>
                         <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{b.user?.name || 'Guest User'}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{b.contactDetails?.phone}</p>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                         <Package size={14} color="var(--primary)" /> {b.package?.title || 'Custom Tour'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px' }}>{new Date(b.travelDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '16px 24px', fontWeight: '800' }}>₹{b.totalPrice}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '12px', fontWeight: '700', width: 'fit-content' }}>
                         {style.icon} {b.bookingStatus}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                       <div className="action-group">
                         <button className="action-btn" onClick={() => openDetails(b)}><Info size={16} /></button>
                         <ActionDropdown 
                           icon={<MoreVertical size={16} />} 
                           options={[
                             { label: 'Confirm Trip', onClick: () => handleStatusUpdate(b._id, 'Confirmed'), color: '#16a34a' },
                             { label: 'Mark Completed', onClick: () => handleStatusUpdate(b._id, 'Completed'), color: 'var(--primary)' },
                             { label: 'Cancel Booking', onClick: () => handleStatusUpdate(b._id, 'Cancelled'), color: '#dc2626' },
                             { label: 'Delete Record', onClick: () => handleDelete(b._id), color: '#e11d48' }
                           ]}
                         />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer isOpen={showDetails} onClose={() => setShowDetails(false)} title="Reservation Intelligence">
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div className="card" style={{ background: 'var(--bg-main)', border: 'none' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Package Itinerary</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={24} color="var(--primary)" />
                   </div>
                   <div>
                      <p style={{ margin: 0, fontWeight: '800' }}>{selectedBooking.package?.title}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>ID: {selectedBooking._id}</p>
                   </div>
                </div>
             </div>

             <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passenger Manifest</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {selectedBooking.passengerDetails?.map((p, i) => (
                      <div key={i} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontWeight: '700' }}>{p.name}</span>
                         <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.age} yrs • {p.gender}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billing Info</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Amount</span>
                   <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>₹{selectedBooking.totalPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                   <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Payment Status</span>
                   <span style={{ fontWeight: '700', color: '#16a34a' }}>{selectedBooking.paymentStatus}</span>
                </div>
             </div>
             
             <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }} onClick={() => setShowDetails(false)}>Close Intelligence</button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Bookings;
