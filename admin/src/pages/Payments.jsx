import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DollarSign,
  Info,
  RotateCcw,
  ShieldCheck,
  Zap,
  Smartphone,
  QrCode,
  Building2,
  Clock,
  User,
  Hash,
  AlertTriangle,
  RefreshCw,
  X,
  LayoutGrid,
  List,
  Settings,
  ArrowUpRight,
  Shield,
  Receipt
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import Drawer from '../components/Drawer';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import api from '../utils/api';

const Payments = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [view, setView] = useState('list');
  
  // Drawer & Modal state
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Refund Modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      if (res.data?.success) {
        setPayments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      showToast('Error', err.response?.data?.message || 'Failed to fetch payments list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (p) => {
    setSelectedPayment(p);
    setShowDetails(true);
  };

  const handleOpenRefundModal = (p) => {
    setSelectedPayment(p);
    const availableToRefund = p.amount - (p.refundAmount || 0);
    setRefundAmount(availableToRefund.toString());
    setRefundReason('');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const numAmount = parseFloat(refundAmount);
    const availableToRefund = selectedPayment.amount - (selectedPayment.refundAmount || 0);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Validation Error', 'Please enter a valid refund amount greater than 0.', 'error');
      return;
    }

    if (numAmount > availableToRefund) {
      showToast('Validation Error', `Refund amount cannot exceed remaining balance of ₹${availableToRefund}.`, 'error');
      return;
    }

    const isConfirmed = await confirm(
      'Confirm Payment Refund?',
      `Are you sure you want to process a ${numAmount >= availableToRefund ? 'Full' : 'Partial'} refund of ₹${numAmount} for Order #${selectedPayment.orderId || selectedPayment._id}?`
    );

    if (!isConfirmed) return;

    try {
      setRefunding(true);
      const res = await api.post(`/payments/${selectedPayment._id}/refund`, {
        amount: numAmount,
        reason: refundReason
      });

      if (res.data?.success) {
        showToast('Refund Successful', res.data.message || 'Refund processed via Razorpay successfully.', 'success');
        setShowRefundModal(false);
        if (showDetails) setShowDetails(false);
        fetchPayments();
      }
    } catch (err) {
      showToast('Refund Failed', err.response?.data?.message || 'Could not process refund.', 'error');
    } finally {
      setRefunding(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search ||
      (p.orderId && p.orderId.toLowerCase().includes(search)) ||
      (p.paymentId && p.paymentId.toLowerCase().includes(search)) ||
      (p._id && p._id.toLowerCase().includes(search)) ||
      (p.user?.name && p.user.name.toLowerCase().includes(search)) ||
      (p.user?.email && p.user.email.toLowerCase().includes(search)) ||
      (p.booking?._id && p.booking._id.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CAPTURED':
      case 'Succeeded':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', label: 'CAPTURED', icon: <CheckCircle size={14} /> };
      case 'CREATED':
      case 'PENDING':
      case 'Pending':
        return { bg: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', label: 'PENDING', icon: <Clock size={14} /> };
      case 'FAILED':
      case 'Failed':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', label: 'FAILED', icon: <XSquare size={14} /> };
      case 'REFUNDED':
      case 'Refunded':
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'REFUNDED', icon: <RotateCcw size={14} /> };
      case 'PARTIALLY_REFUNDED':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'PARTIAL REFUND', icon: <RotateCcw size={14} /> };
      default:
        return { bg: 'var(--bg-main)', color: 'var(--text-muted)', label: status?.toUpperCase() || 'UNKNOWN', icon: <Info size={14} /> };
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': return <CreditCard size={14} />;
      case 'upi': return <Smartphone size={14} />;
      case 'upiqr': return <QrCode size={14} />;
      case 'netbanking': return <Building2 size={14} />;
      default: return <CreditCard size={14} />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': return 'Card';
      case 'upi': return 'UPI Instant';
      case 'upiqr': return 'UPI QR';
      case 'netbanking': return 'Net Banking';
      default: return method?.toUpperCase() || 'Card';
    }
  };

  const totalCaptured = payments
    .filter(p => p.status === 'CAPTURED' || p.status === 'Succeeded' || p.status === 'PARTIALLY_REFUNDED')
    .reduce((acc, curr) => acc + (curr.amount - (curr.refundAmount || 0)), 0);

  const totalRefunded = payments
    .reduce((acc, curr) => acc + (curr.refundAmount || 0), 0);

  const totalSuccessCount = payments.filter(p => p.status === 'CAPTURED' || p.status === 'Succeeded').length;

  return (
    <div className="fade-in">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Financial Audit & Payments</h1>
          <p>Consolidated transaction ledger, Razorpay gateway logs, and instant customer refunds</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/settings/payments')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={16} /> Gateway Settings
          </button>
          <button 
            className="btn btn-primary" 
            onClick={fetchPayments} 
            disabled={loading} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loading ? 'spin-slow' : ''} /> {loading ? 'Syncing...' : 'Sync Logs'}
          </button>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Net Revenue Captured</h3>
            <p>₹{totalCaptured.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Successful Clearances</h3>
            <p>{totalSuccessCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <RotateCcw size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Refunded</h3>
            <p>₹{totalRefunded.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Receipt size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Transactions</h3>
            <p>{payments.length}</p>
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="card allow-overflow" style={{ marginBottom: '24px', padding: '20px' }}>
        <div className="filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div className="search-wrapper" style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input 
              type="text" className="form-control" placeholder="Search by Order ID, Payment ID, Booking ID, or Customer..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', paddingRight: searchTerm ? '36px' : '16px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && (
              <X 
                size={16} 
                onClick={() => setSearchTerm('')} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} 
              />
            )}
          </div>

          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'CAPTURED', label: 'Captured', color: '#16a34a' },
                { value: 'CREATED', label: 'Pending / Created', color: '#ca8a04' },
                { value: 'FAILED', label: 'Failed', color: '#dc2626' },
                { value: 'REFUNDED', label: 'Fully Refunded', color: '#a855f7' },
                { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', color: '#3b82f6' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="180px"
            />

            <FilterSelect 
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'card', label: 'Card Payment' },
                { value: 'upi', label: 'UPI Instant' },
                { value: 'upiQr', label: 'UPI Dynamic QR' },
                { value: 'netbanking', label: 'Net Banking' }
              ]}
              value={methodFilter}
              onChange={setMethodFilter}
              width="170px"
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

      {/* MAIN CONTENT: TABLE OR GRID */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <RefreshCw size={36} className="spin-slow" style={{ color: 'var(--primary)', marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Synchronizing Razorpay financial logs...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px' }}>
          <Receipt size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>No Transaction Logs Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Try clearing search keywords or status filters to view records.</p>
        </div>
      ) : view === 'grid' ? (
        
        /* GRID VIEW */
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredPayments.map((p) => {
            const badge = getStatusBadge(p.status);
            return (
              <div key={p._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.orderId || p._id}</div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', marginTop: '4px' }}>₹{p.amount.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: '800' }}>
                      {badge.icon} {badge.label}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '2px' }}>{p.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.user?.email || 'N/A'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Booking Ref: #{p.booking?._id?.slice(-8).toUpperCase() || 'REF'} <ArrowUpRight size={12} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                    {getMethodIcon(p.paymentMethod)} {getMethodLabel(p.paymentMethod)}
                  </span>
                  
                  <div className="action-group">
                    <button className="action-btn" onClick={() => handleOpenDetails(p)} title="Audit Details">
                      <Info size={16} />
                    </button>
                    {(p.status === 'CAPTURED' || p.status === 'Succeeded' || p.status === 'PARTIALLY_REFUNDED') && (p.amount > (p.refundAmount || 0)) && (
                      <button className="action-btn danger" onClick={() => handleOpenRefundModal(p)} title="Process Refund">
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* LIST / TABLE VIEW */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID / Payment ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Ref</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gateway</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const badge = getStatusBadge(p.status);
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '12px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--text-main)', fontFamily: 'monospace' }}>{p.orderId || p._id}</div>
                        {p.paymentId && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{p.paymentId}</div>}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800' }}>{p.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.user?.email || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/bookings')}>
                          #{p.booking?._id?.slice(-8).toUpperCase() || 'REF'} <ExternalLink size={12} />
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '900', fontSize: '14px', color: 'var(--text-main)' }}>₹{p.amount.toLocaleString()}</div>
                        {p.refundAmount > 0 && <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: '800' }}>Refunded: -₹{p.refundAmount.toLocaleString()}</div>}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                          {getMethodIcon(p.paymentMethod)} {getMethodLabel(p.paymentMethod)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.12)' }}>
                          {p.gateway?.toUpperCase() || 'RAZORPAY'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: '800', width: 'fit-content' }}>
                          {badge.icon} {badge.label}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="action-btn" 
                            title="Audit Details"
                            onClick={() => handleOpenDetails(p)}
                          >
                            <Info size={16} />
                          </button>
                          {(p.status === 'CAPTURED' || p.status === 'Succeeded' || p.status === 'PARTIALLY_REFUNDED') && (p.amount > (p.refundAmount || 0)) && (
                            <button 
                              className="action-btn danger" 
                              title="Process Refund"
                              onClick={() => handleOpenRefundModal(p)}
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
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

      {/* TRANSACTION AUDIT DETAILS DRAWER */}
      <Drawer
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Transaction Intelligence"
      >
        {selectedPayment && (
          <div>
            <div style={{ 
              background: 'var(--bg-main)', 
              borderRadius: '16px', 
              padding: '24px', 
              textAlign: 'center', 
              marginBottom: '24px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                display: 'inline-flex', 
                padding: '12px', 
                borderRadius: '50%', 
                background: getStatusBadge(selectedPayment.status).bg, 
                color: getStatusBadge(selectedPayment.status).color,
                marginBottom: '16px' 
              }}>
                {getStatusBadge(selectedPayment.status).icon}
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                ₹{selectedPayment.amount.toLocaleString()}
              </h2>
              <div style={{ 
                display: 'inline-flex', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                background: getStatusBadge(selectedPayment.status).bg, 
                color: getStatusBadge(selectedPayment.status).color,
                fontSize: '12px',
                fontWeight: '800'
              }}>
                {getStatusBadge(selectedPayment.status).label}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Transaction ID</span>
                <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>{selectedPayment._id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Razorpay Order ID</span>
                <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-main)' }}>{selectedPayment.orderId || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Razorpay Payment ID</span>
                <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-main)' }}>{selectedPayment.paymentId || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>{getMethodLabel(selectedPayment.paymentMethod)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Payment Gateway</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6' }}>{selectedPayment.gateway?.toUpperCase() || 'RAZORPAY'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Customer Name</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{selectedPayment.user?.name || 'Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Customer Email</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{selectedPayment.user?.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Created Date</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {(selectedPayment.status === 'CAPTURED' || selectedPayment.status === 'Succeeded' || selectedPayment.status === 'PARTIALLY_REFUNDED') && (selectedPayment.amount > (selectedPayment.refundAmount || 0)) && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#dc2626', borderColor: '#dc2626', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onClick={() => handleOpenRefundModal(selectedPayment)}
              >
                <RotateCcw size={16} /> Refund Payment
              </button>
            )}
          </div>
        )}
      </Drawer>

      {/* REFUND MODAL */}
      {showRefundModal && selectedPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Initiate Razorpay Refund</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Order #{selectedPayment.orderId || selectedPayment._id}</p>
              </div>
            </div>

            <form onSubmit={handleProcessRefund}>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Captured Amount:</span>
                  <span style={{ fontWeight: '800' }}>₹{selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Previously Refunded:</span>
                  <span style={{ fontWeight: '800', color: '#a855f7' }}>₹{(selectedPayment.refundAmount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                  <span style={{ fontWeight: '700' }}>Available to Refund:</span>
                  <span style={{ fontWeight: '900', color: '#16a34a' }}>₹{(selectedPayment.amount - (selectedPayment.refundAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Refund Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  required 
                  max={selectedPayment.amount - (selectedPayment.refundAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>Reason for Refund (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="e.g. Customer cancelled booking / Service unavailable"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRefundModal(false)}
                  disabled={refunding}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                  disabled={refunding}
                >
                  {refunding ? 'Processing Refund...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
