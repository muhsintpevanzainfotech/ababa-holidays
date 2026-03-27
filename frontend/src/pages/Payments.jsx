import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  XSquare, 
  ExternalLink,
  ChevronDown,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import { fetchPaymentsRequest } from '../store/slices/paymentsSlice';

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchPaymentsRequest());
  }, [dispatch]);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.stripePaymentIntentId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.booking?._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).reverse();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Succeeded': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', icon: <CheckCircle size={14} /> };
      case 'Pending': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', icon: <AlertCircle size={14} /> };
      case 'Failed': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', icon: <XSquare size={14} /> };
      case 'Refunded': return { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', icon: <CreditCard size={14} /> };
      default: return { bg: 'var(--bg-main)', color: 'var(--text-muted)', icon: null };
    }
  };

  const totalSucceeded = payments.filter(p => p.status === 'Succeeded').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Financial Audit</h1>
          <p>Consolidated log of all platform transactions and payouts</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'var(--text-main)', color: 'white' }}>
           <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}><DollarSign size={24} /></div>
           <div className="stat-info"><h3 style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Success Revenue</h3><p style={{ color: 'white' }}>₹{totalSucceeded.toLocaleString()}</p></div>
        </div>
        <div className="stat-card">
           <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
           <div className="stat-info"><h3>Successful Clearances</h3><p>{payments.filter(p => p.status === 'Succeeded').length}</p></div>
        </div>
        <div className="stat-card">
           <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}><XSquare size={24} /></div>
           <div className="stat-info"><h3>Failed Transactions</h3><p>{payments.filter(p => p.status === 'Failed').length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '250px' }}>
            <input 
              type="text" className="form-control" placeholder="Search by Transaction ID or Booking ID..." 
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
            <option value="all">All States</option>
            <option value="Succeeded">Succeeded</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction ID</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audit Detail</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Reference</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Synchronizing financial logs...</td></tr>
              ) : filteredPayments.length === 0 ? (
                 <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No transaction history available.</td></tr>
              ) : filteredPayments.map((p) => {
                const badge = getStatusBadge(p.status);
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                       {p.stripePaymentIntentId || p._id}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ fontSize: '14px', fontWeight: '700' }}>{p.user?.name || 'Anonymous Payor'}</div>
                       <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.user?.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                          #{p.booking?._id?.slice(-8).toUpperCase() || 'EXTERNAL'} <ExternalLink size={12} />
                       </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '900', fontSize: '15px' }}>₹{p.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700' }}>{p.paymentMethod?.toUpperCase() || 'CARD'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: '800', width: 'fit-content' }}>
                          {badge.icon} {p.status.toUpperCase()}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
