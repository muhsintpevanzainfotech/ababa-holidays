import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Tag,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Globe,
  Package,
  Filter,
  Percent,
  DollarSign,
  Info,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import FormSelect from '../components/FormSelect';
import FilterSelect from '../components/FilterSelect';

const Coupons = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [coupons, setCoupons] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDrawer, setShowDrawer] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentCoupon, setCurrentCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    scope: 'all_packages',
    package: '',
    minBookingAmount: 0,
    maxDiscount: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
    fetchPackages();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.data);
    } catch (error) {
      showToast('Error', 'Failed to fetch coupon codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/packages');
      setPackagesList(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch packages list for coupons:', error);
    }
  };

  const handleOpenDrawer = (type, coupon = null) => {
    setModalType(type);
    if (type === 'edit' && coupon) {
      setCurrentCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || 0,
        scope: coupon.scope || 'all_packages',
        package: coupon.package?._id || coupon.package || '',
        minBookingAmount: coupon.minBookingAmount || 0,
        maxDiscount: coupon.maxDiscount !== null && coupon.maxDiscount !== undefined ? coupon.maxDiscount : '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit : '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      });
    } else {
      setCurrentCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        scope: 'all_packages',
        package: packagesList[0]?._id || '',
        minBookingAmount: 0,
        maxDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: '',
        isActive: true
      });
    }
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minBookingAmount: Number(formData.minBookingAmount) || 0,
        maxDiscount: formData.maxDiscount !== '' ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit !== '' ? Number(formData.usageLimit) : null,
        package: formData.scope === 'single_package' ? formData.package : null
      };

      if (modalType === 'add') {
        await api.post('/coupons', payload);
        showToast('Success', 'New coupon code created successfully', 'success');
      } else {
        await api.put(`/coupons/${currentCoupon._id}`, payload);
        showToast('Success', 'Coupon code updated successfully', 'success');
      }

      setShowDrawer(false);
      fetchCoupons();
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to save coupon code', 'error');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Coupon?',
      'Are you sure you want to remove this coupon code? This action cannot be undone.'
    );

    if (isConfirmed) {
      try {
        await api.delete(`/coupons/${id}`);
        showToast('Deleted', 'Coupon code removed successfully', 'success');
        fetchCoupons();
      } catch (error) {
        showToast('Error', 'Failed to delete coupon code', 'error');
      }
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      showToast('Status Updated', `Coupon ${coupon.code} is now ${!coupon.isActive ? 'Active' : 'Inactive'}`, 'success');
      fetchCoupons();
    } catch (error) {
      showToast('Error', 'Failed to update coupon status', 'error');
    }
  };

  const isExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.package?.title && coupon.package.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesScope = scopeFilter === 'all' ? true : coupon.scope === scopeFilter;

    const expired = isExpired(coupon.expiryDate);
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'active' ? (coupon.isActive && !expired) :
      statusFilter === 'inactive' ? (!coupon.isActive) :
      statusFilter === 'expired' ? expired : true;

    return matchesSearch && matchesScope && matchesStatus;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Package Coupon Codes</h1>
          <p>Create & manage discount codes for <strong>All Packages</strong> or <strong>Single Packages</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenDrawer('add')}>
          <Plus size={20} /> Add Coupon Code
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
            <Tag size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Coupons</h3>
            <p>{coupons.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Active & Live</h3>
            <p>{coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Globe size={24} />
          </div>
          <div className="stat-info">
            <h3>All Packages Scope</h3>
            <p>{coupons.filter(c => c.scope === 'all_packages').length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Single Package Scope</h3>
            <p>{coupons.filter(c => c.scope === 'single_package').length}</p>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by coupon code or package title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>

          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />

            <FilterSelect
              options={[
                { value: 'all', label: 'All Coupon Scopes' },
                { value: 'all_packages', label: '🌐 All Packages Scope' },
                { value: 'single_package', label: '📦 Single Package Scope' }
              ]}
              value={scopeFilter}
              onChange={setScopeFilter}
              width="210px"
            />

            <FilterSelect
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Live / Active', color: '#16a34a' },
                { value: 'inactive', label: 'Inactive', color: '#dc2626' },
                { value: 'expired', label: 'Expired', color: '#d97706' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="160px"
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '16px' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1.5px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Coupon Code & Discount</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Scope / Applicable Package</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Min Order & Cap</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Validity & Usage</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div className="spinner" style={{ margin: '0 auto' }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Loading coupon codes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', maxWidth: '420px', margin: '0 auto' }}>
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'rgba(var(--primary-rgb), 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}>
                        <Tag size={28} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                      </div>
                      <h3 style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>No coupon codes found</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Try adjusting your search filters or click "Add Coupon Code" above to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            letterSpacing: '1px',
                            background: 'rgba(var(--primary-rgb), 0.1)',
                            color: 'var(--primary)',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            border: '1.5px dashed var(--primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <Tag size={14} />
                            {coupon.code}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#16a34a' }}>
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              {coupon.discountType} discount
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        {coupon.scope === 'all_packages' ? (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px' }}>
                            <Globe size={14} /> All Packages Code
                          </span>
                        ) : (
                          <div>
                            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#7c3aed', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '4px 10px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '11px', marginBottom: '4px' }}>
                              <Package size={12} /> Single Package
                            </span>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                              {coupon.package?.title || 'Selected Package'}
                            </div>
                            {coupon.package?.customId && (
                              <code style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px' }}>ID: {coupon.package.customId}</code>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Min Order: <strong>₹{coupon.minBookingAmount || 0}</strong></div>
                        {coupon.maxDiscount ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Max Cap: ₹{coupon.maxDiscount}</div>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>No Max Cap</div>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: expired ? '#dc2626' : 'var(--text-main)' }}>
                          <Calendar size={14} style={{ color: expired ? '#dc2626' : 'var(--primary)' }} />
                          {new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'times'}
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        {expired ? (
                          <span style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#b45309', border: '1px solid rgba(217, 119, 6, 0.25)', padding: '5px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={13} /> Expired
                          </span>
                        ) : coupon.isActive ? (
                          <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#15803d', border: '1px solid rgba(22, 163, 74, 0.25)', padding: '5px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={13} /> Active
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', border: '1px solid rgba(220, 38, 38, 0.25)', padding: '5px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <XCircle size={13} /> Disabled
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn"
                            onClick={() => handleToggleStatus(coupon)}
                            title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                            style={{ background: coupon.isActive ? 'rgba(220, 38, 38, 0.08)' : 'rgba(22, 163, 74, 0.08)' }}
                          >
                            {coupon.isActive ? <XCircle size={16} color="#dc2626" /> : <CheckCircle size={16} color="#16a34a" />}
                          </button>
                          <button className="action-btn edit" onClick={() => handleOpenDrawer('edit', coupon)} title="Edit Coupon">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn danger" onClick={() => handleDelete(coupon._id)} title="Delete Coupon">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DRAWER */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={modalType === 'add' ? 'Create New Coupon Code' : `Edit Coupon Code - ${currentCoupon?.code || ''}`}
        width="520px"
      >
        <form onSubmit={handleSubmit}>
          {/* Coupon Scope Radio Selector */}
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '12px', display: 'block' }}>
              Coupon Application Scope
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label
                onClick={() => setFormData({ ...formData, scope: 'all_packages' })}
                style={{
                  border: `2px solid ${formData.scope === 'all_packages' ? 'var(--primary)' : 'var(--border)'}`,
                  background: formData.scope === 'all_packages' ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--bg-main)',
                  color: 'var(--text-main)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <input type="radio" name="scope" checked={formData.scope === 'all_packages'} onChange={() => {}} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>🌐 All Packages</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Applies to all travel packages</div>
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, scope: 'single_package' })}
                style={{
                  border: `2px solid ${formData.scope === 'single_package' ? 'var(--primary)' : 'var(--border)'}`,
                  background: formData.scope === 'single_package' ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--bg-main)',
                  color: 'var(--text-main)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <input type="radio" name="scope" checked={formData.scope === 'single_package'} onChange={() => {}} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>📦 Single Package</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Applies to 1 selected package</div>
                </div>
              </label>
            </div>
          </div>

          {/* If Single Package, show Package Selector */}
          {formData.scope === 'single_package' && (
            <div className="form-group" style={{ background: 'rgba(168,85,247,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.2)' }}>
              <FormSelect
                label="Select Target Package"
                required
                options={packagesList.map(pkg => ({ value: pkg._id, label: `${pkg.title} (${pkg.customId || 'PKG'})` }))}
                value={formData.package}
                onChange={(val) => setFormData({ ...formData, package: val })}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ fontWeight: '700' }}>Coupon Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SUMMER2026 or ABABA100"
              required
              style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormSelect
              label="Discount Type"
              required
              options={[
                { value: 'percentage', label: '% Percentage Discount' },
                { value: 'fixed', label: '₹ Fixed Amount Discount' }
              ]}
              value={formData.discountType}
              onChange={(val) => setFormData({ ...formData, discountType: val })}
            />

            <div className="form-group">
              <label>Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
              <input
                type="number"
                className="form-control"
                required
                min="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Min Booking Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0 for no minimum"
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Max Discount Cap (₹) (Optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Unlimited"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                Expiry Date
              </label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Usage Limit (Times) (Optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Unlimited"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span style={{ fontWeight: '700' }}>Coupon is Active & Live</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '28px', height: '48px' }}>
            <Tag size={18} /> {modalType === 'add' ? 'Publish Coupon Code' : 'Update Coupon Code'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Coupons;
