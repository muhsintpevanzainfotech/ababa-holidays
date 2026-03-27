import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ActionDropdown from '../components/ActionDropdown';
import {
  Plus,
  CreditCard,
  Check,
  X,
  Package,
  Users,
  ShieldCheck,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Power,
  Smartphone,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';

import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSubscriptionsRequest,
  addSubscriptionRequest,
  updateSubscriptionRequest,
  deleteSubscriptionRequest
} from '../store/slices/subscriptionsSlice';

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading, error } = useSelector((state) => state.subscriptions);
  const [view, setView] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentSub, setCurrentSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [newFeature, setNewFeature] = useState('');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [formData, setFormData] = useState({
    plan: 'Professional',
    title: '',
    description: '',
    price: 0,
    durationInDays: 30,
    features: [],
    userLimit: 5,
    packageLimit: 10,
    staffLimit: 5,
    crmEnabled: false,
    websiteEnabled: false,
    testimonialEnabled: false,
    contactUsEnabled: false,
    instagramReelsEnabled: false,
    enquiriesFollowupEnabled: false,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchSubscriptionsRequest());
  }, [dispatch]);

  const handleOpenModal = (type, sub = null) => {
    setModalType(type);
    if (type === 'edit' && sub) {
      setCurrentSub(sub);
      setFormData({
        plan: sub.plan,
        title: sub.title,
        description: sub.description || '',
        price: sub.price || 0,
        durationInDays: sub.durationInDays || 30,
        features: sub.features || [],
        userLimit: sub.userLimit || 0,
        packageLimit: sub.packageLimit || 0,
        staffLimit: sub.staffLimit || 0,
        crmEnabled: sub.crmEnabled || false,
        websiteEnabled: sub.websiteEnabled || false,
        testimonialEnabled: sub.testimonialEnabled || false,
        contactUsEnabled: sub.contactUsEnabled || false,
        instagramReelsEnabled: sub.instagramReelsEnabled || false,
        enquiriesFollowupEnabled: sub.enquiriesFollowupEnabled || false,
        isActive: sub.isActive !== undefined ? sub.isActive : true
      });
    } else {
      setFormData({
        plan: 'Professional', title: '', description: '', price: 0,
        durationInDays: 30, features: [],
        userLimit: 5, packageLimit: 10, staffLimit: 5,
        crmEnabled: false, websiteEnabled: false, testimonialEnabled: false,
        contactUsEnabled: false, instagramReelsEnabled: false, enquiriesFollowupEnabled: false,
        isActive: true
      });
    }
    setNewFeature('');
    setShowModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...(formData.features || []), newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      dispatch(addSubscriptionRequest(formData));
      showToast('Success', 'Subscription plan created', 'success');
    } else {
      dispatch(updateSubscriptionRequest({ id: currentSub._id, data: formData }));
      showToast('Success', 'Subscription plan updated', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (await confirm('Delete Plan?', 'Are you sure you want to delete this subscription plan? Existing vendors on this plan may be affected.')) {
      dispatch(deleteSubscriptionRequest(id));
      showToast('Success', 'Plan deleted successfully', 'success');
    }
  };

  const filteredPlans = subscriptions.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' ? true : p.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform Subscriptions</h1>
          <p>Manage tiers, pricing models, and feature access permissions for vendors</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add New Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><CreditCard size={24} /></div>
          <div className="stat-info"><h3>Total Plans</h3><p>{subscriptions.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><Power size={24} /></div>
          <div className="stat-info"><h3>Active Tiers</h3><p>{subscriptions.filter(s => s.isActive !== false).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}><ShieldCheck size={24} /></div>
          <div className="stat-info"><h3>Premium Plans</h3><p>{subscriptions.filter(s => s.price > 0).length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by plan name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Plans' },
                  { value: 'Free', label: 'Free Plan', color: '#64748b' },
                  { value: 'Basic', label: 'Basic Plan', color: '#3b82f6' },
                  { value: 'Professional', label: 'Professional Plan', color: '#8b5cf6' },
                  { value: 'Enterprise', label: 'Enterprise Plan', color: '#f59e0b' }
                ]}
                value={planFilter}
                onChange={setPlanFilter}
                width="160px"
              />
            </div>
            <div className="results-count">
              <span className="badge badge-primary">{filteredPlans.length}</span>
              <span style={{ marginLeft: '1px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
            </div>

            <div className="view-toggles">
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading subscriptions...</p>
      ) : filteredPlans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <AlertTriangle size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No subscription plans found matching your search.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid mobile-slider">
          {filteredPlans.map((sub) => (
            <div key={sub._id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                    background: sub.plan === 'Free' ? '#f1f5f9' : '#dbeafe',
                    color: sub.plan === 'Free' ? '#64748b' : '#1e40af',
                    textTransform: 'uppercase'
                  }}>
                    {sub.plan}
                  </span>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', marginTop: '12px' }}>{sub.title}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>₹{sub.price}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub.durationInDays} Days Access</p>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', minHeight: '40px', lineHeight: '1.5' }}>{sub.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Users size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Users</p>
                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{sub.userLimit === -1 ? '∞' : sub.userLimit}</p>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Package size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Pkgs</p>
                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{sub.packageLimit === -1 ? '∞' : sub.packageLimit}</p>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Users size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Staff</p>
                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{sub.staffLimit === -1 ? '∞' : sub.staffLimit}</p>
                  </div>
                </div>

                <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={14} />
                  Included Features
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'CRM Access', enabled: sub.crmEnabled },
                    { label: 'Website Module', enabled: sub.websiteEnabled },
                    { label: 'Testimonials', enabled: sub.testimonialEnabled },
                    { label: 'Contact Us', enabled: sub.contactUsEnabled },
                    { label: 'Insta Reels', enabled: sub.instagramReelsEnabled },
                    { label: 'Enquiries', enabled: sub.enquiriesFollowupEnabled },
                  ].map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      {feature.enabled ? <Check size={14} color="#22c55e" strokeWidth={3} /> : <X size={14} color="#ef4444" strokeWidth={3} />}
                      <span style={{ color: feature.enabled ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: feature.enabled ? '600' : '400' }}>{feature.label}</span>
                    </div>
                  ))}
                </div>
                {sub.features && sub.features.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>Additional Features</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {sub.features.map((feat, idx) => (
                        <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                          <Check size={12} strokeWidth={3} color="var(--primary)" /> {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', flex: 1, height: '42px', fontWeight: '600' }} onClick={() => handleOpenModal('edit', sub)}>
                  Edit Plan
                </button>
                <button className="btn" style={{ background: '#fff1f2', border: 'none', color: '#e11d48', width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(sub._id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price/Dur</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Limits (U/P/S)</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Features</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((sub, index) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{sub.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{sub.plan} Plan</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>₹{sub.price}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.durationInDays} Days</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: '#f5f3ff', color: '#5b21b6', fontSize: '11px' }}>{sub.userLimit === -1 ? '∞' : sub.userLimit} Users</span>
                        <span className="badge" style={{ background: '#eff6ff', color: '#1e40af', fontSize: '11px' }}>{sub.packageLimit === -1 ? '∞' : sub.packageLimit} Pkgs</span>
                        <span className="badge" style={{ background: '#f0fdf4', color: '#166534', fontSize: '11px' }}>{sub.staffLimit === -1 ? '∞' : sub.staffLimit} Staff</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {sub.crmEnabled && <div title="CRM Access" style={{ color: '#22c55e' }}><ShieldCheck size={16} /></div>}
                        {sub.websiteEnabled && <div title="Website Module" style={{ color: '#3b82f6' }}><Globe size={16} /></div>}
                        {sub.instagramReelsEnabled && <div title="Instagram Reels" style={{ color: '#d946ef' }}><Smartphone size={16} /></div>}
                        {sub.enquiriesFollowupEnabled && <div title="Enquiries Follow-up" style={{ color: '#f59e0b' }}><Check size={16} /></div>}
                        {sub.features && sub.features.length > 0 && (
                          <span style={{ marginLeft: '4px', fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '12px', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            +{sub.features.length} custom
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: (sub.isActive !== false) ? '#dcfce7' : '#fee2e2',
                        color: (sub.isActive !== false) ? '#166534' : '#b91c1c'
                      }}>
                        {(sub.isActive !== false) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" title={sub.isActive !== false ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(sub._id)}>
                          {sub.isActive !== false ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button className="action-btn" title="Edit Plan" onClick={() => handleOpenModal('edit', sub)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" title="Delete Plan" onClick={() => handleDelete(sub._id)}>
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

      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Create Subscription Plan' : 'Edit Subscription Plan'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plan Name</label>
            <input
              type="text" className="form-control" required placeholder="e.g. Platinum Plus"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Plan Type</label>
            <select
              className="form-control"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number" className="form-control" required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Duration (Days)</label>
              <input
                type="number" className="form-control" required
                value={formData.durationInDays}
                onChange={(e) => setFormData({ ...formData, durationInDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea
              className="form-control" style={{ height: '70px', resize: 'none', padding: '12px' }}
              placeholder="Brief overview of what this plan offers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Resource Limits</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px' }}>Max Users</label>
                <input
                  type="number" className="form-control"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px' }}>Max Pkgs</label>
                <input
                  type="number" className="form-control"
                  value={formData.packageLimit}
                  onChange={(e) => setFormData({ ...formData, packageLimit: Number(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px' }}>Max Staff</label>
                <input
                  type="number" className="form-control"
                  value={formData.staffLimit}
                  onChange={(e) => setFormData({ ...formData, staffLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Included Features (List)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="E.g., 24/7 Priority Support"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={addFeature}
                style={{ padding: '0 16px', borderRadius: '8px', whiteSpace: 'nowrap' }}
              >
                Add Feature
              </button>
            </div>
            {formData.features && formData.features.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {formData.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={14} color="var(--primary)" />
                      <span style={{ fontWeight: '600' }}>{feat}</span>
                    </div>
                    <button type="button" onClick={() => removeFeature(idx)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '6px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Feature Access</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            {[
              { key: 'crmEnabled', label: 'CRM Access' },
              { key: 'websiteEnabled', label: 'Website Module' },
              { key: 'testimonialEnabled', label: 'Testimonials' },
              { key: 'contactUsEnabled', label: 'Contact Us' },
              { key: 'instagramReelsEnabled', label: 'Instagram' },
              { key: 'enquiriesFollowupEnabled', label: 'Enquiries' },
            ].map((f) => (
              <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '17px', height: '17px' }}
                  checked={formData[f.key]}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
            {modalType === 'add' ? 'Create Plan' : 'Update Subscription'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Subscriptions;
