import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Shield, 
  ChevronLeft,
  MapPin,
  TrendingUp,
  Package,
  Clock,
  ExternalLink,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be filtered by user ID on the backend
        const [userRes, bookingsRes, paymentsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/bookings?user=${id}`),
          api.get(`/payments?user=${id}`)
        ]);

        setUserData(userRes.data.data);
        setBookings(bookingsRes.data.data || []);
        setPayments(paymentsRes.data.data || []);
      } catch (err) {
        showToast('Error fetching user intelligence', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, showToast]);

  const stats = [
    { label: 'Total Spends', value: `₹${payments.filter(p => p.status === 'Succeeded').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: '#16a34a' },
    { label: 'Total Tours', value: bookings.filter(b => b.bookingStatus === 'Completed').length, icon: <Package size={20} />, color: 'var(--primary)' },
    { label: 'Active Bookings', value: bookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending').length, icon: <Clock size={20} />, color: '#ca8a04' },
    { label: 'Cancelled', value: bookings.filter(b => b.bookingStatus === 'Cancelled').length, icon: <AlertCircle size={20} />, color: '#dc2626' },
  ];

  if (loading) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>Synchronizing traveler records...</div>;
  if (!userData) return <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>User record not found.</div>;

  return (
    <div className="fade-in">
      {/* Dynamic Header */}
      <div style={{ marginBottom: '32px' }}>
        <button onClick={() => navigate('/users')} className="btn btn-link" style={{ padding: 0, marginBottom: '16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={16} /> Back to Directory
        </button>
        
        <div className="card" style={{ padding: '32px', border: 'none', background: 'var(--text-main)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=6366f1&color=fff`} 
                  alt="" 
                  style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.1)' }} 
                />
                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', border: '3px solid var(--text-main)' }}>ACTIVE</div>
              </div>
              <div>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '900', color: 'white' }}>{userData.name}</h1>
                <div style={{ display: 'flex', gap: '16px', opacity: 0.8, fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {userData.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {userData.phone || 'No phone'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> {userData.customId}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
               <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>Export History</button>
               <button className="btn btn-primary">Message User</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.label}</h3><p>{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="vendor-tab-nav" style={{ marginBottom: '24px' }}>
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Intelligence Overview</button>
        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Booking Ledger ({bookings.length})</button>
        <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Invoices & Payouts ({payments.length})</button>
      </div>

      {/* Content Area */}
      <div className="tab-content">
        {activeTab === 'overview' && (
           <div className="cards-grid">
              <div className="card" style={{ padding: '24px' }}>
                 <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800' }}>Traveler Bio</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Join Date</span>
                       <span style={{ fontWeight: '700' }}>{new Date(userData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Location</span>
                       <span style={{ fontWeight: '700' }}>{userData.address || 'Not Provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Total Reward Points</span>
                       <span style={{ fontWeight: '700', color: 'var(--primary)' }}>4,250 PTS</span>
                    </div>
                 </div>
              </div>
              
              <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)', color: 'white', border: 'none' }}>
                 <TrendingUp size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                 <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900' }}>Frequent Traveler</h3>
                 <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.8 }}>This user has booked 3 international and 2 domestic tours in the last 12 months.</p>
                 <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>PREMIUM BADGE ELIGIBLE</p>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card" style={{ padding: 0 }}>
             <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--bg-main)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Trip ID</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Package</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Travel Date</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px' }}>Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {bookings.length > 0 ? bookings.map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px', fontWeight: '800', color: 'var(--text-muted)', fontSize: '13px' }}>#{b._id.slice(-6).toUpperCase()}</td>
                           <td style={{ padding: '16px 24px', fontWeight: '700' }}>{b.package?.title}</td>
                           <td style={{ padding: '16px 24px' }}>{new Date(b.travelDate).toLocaleDateString()}</td>
                           <td style={{ padding: '16px 24px' }}>
                              <span className={`badge ${b.bookingStatus === 'Confirmed' ? 'badge-success' : 'badge-primary'}`}>{b.bookingStatus}</span>
                           </td>
                           <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button onClick={() => navigate(`/bookings`)} className="btn btn-link" style={{ color: 'var(--primary)', fontWeight: '700' }}>Details <ExternalLink size={12} /></button>
                           </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No travel history found for this user.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'payments' && (
           <div className="card" style={{ padding: 0 }}>
             <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--bg-main)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Invoice ID</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Amount</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Method</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Reference</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px' }}>Date</th>
                      </tr>
                   </thead>
                   <tbody>
                      {payments.length > 0 ? payments.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px', fontWeight: '800', color: 'var(--text-muted)', fontSize: '12px' }}>{p.stripePaymentIntentId?.slice(-10) || p._id.slice(-10)}</td>
                           <td style={{ padding: '16px 24px', fontWeight: '900', fontSize: '15px' }}>₹{p.amount.toLocaleString()}</td>
                           <td style={{ padding: '16px 24px', fontWeight: '700' }}>{p.paymentMethod?.toUpperCase() || 'CARD'}</td>
                           <td style={{ padding: '16px 24px', color: 'var(--primary)', fontWeight: '700' }}>#{p.booking?.slice(-8).toUpperCase()}</td>
                           <td style={{ padding: '16px 24px' }}>
                              <span style={{ background: p.status === 'Succeeded' ? '#f0fdf4' : '#fff1f2', color: p.status === 'Succeeded' ? '#166534' : '#9f1239', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{p.status.toUpperCase()}</span>
                           </td>
                           <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No transaction records cataloged.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;
