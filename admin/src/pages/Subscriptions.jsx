import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ActionDropdown from '../components/ActionDropdown';
import {
  Globe,
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
  List,
  Power,
  Smartphone,
  CheckCircle,
  XCircle,
  MoreVertical,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import PasskeyModal from '../components/PasskeyModal';
import LockToggleButton from '../components/LockToggleButton';

import { useSelector, useDispatch } from 'react-redux';
import { setUnlocked, lockSession } from '../store/slices/globalSlice';
import {
  fetchSubscriptionsRequest,
  addSubscriptionRequest,
  updateSubscriptionRequest,
  deleteSubscriptionRequest
} from '../store/slices/subscriptionsSlice';

const planStyles = {
  Free: {
    border: '1px solid var(--border)',
    badgeBg: 'var(--bg-main)',
    badgeColor: 'var(--text-muted)',
    popular: false,
    shadow: 'var(--shadow-premium)'
  },
  Basic: {
    border: '1px solid rgba(59, 130, 246, 0.25)',
    badgeBg: 'rgba(59, 130, 246, 0.08)',
    badgeColor: '#3b82f6',
    popular: false,
    shadow: 'var(--shadow-premium)'
  },
  Professional: {
    border: '2px solid var(--primary)',
    badgeBg: 'var(--primary)',
    badgeColor: '#ffffff',
    popular: true,
    shadow: '0 20px 25px -5px rgba(var(--primary-rgb), 0.12), 0 10px 10px -5px rgba(var(--primary-rgb), 0.05)'
  },
  Enterprise: {
    border: '1px solid rgba(245, 158, 11, 0.4)',
    badgeBg: 'rgba(245, 158, 11, 0.08)',
    badgeColor: '#f59e0b',
    popular: false,
    shadow: 'var(--shadow-premium)'
  }
};

const getPlanStyle = (planName) => {
  return planStyles[planName] || {
    border: '1px solid var(--border)',
    badgeBg: 'var(--bg-main)',
    badgeColor: 'var(--text-main)',
    popular: false,
    shadow: 'var(--shadow-premium)'
  };
};

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading, error } = useSelector((state) => state.subscriptions);
  const { user } = useSelector((state) => state.auth);
  const { isUnlocked, unlockedUntil } = useSelector((state) => state.global);
  const isLocked = !isUnlocked;
  const [view, setView] = useState('grid');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentSub, setCurrentSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
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
    isActive: true,
    isVisible: true
  });

  useEffect(() => {
    dispatch(fetchSubscriptionsRequest());
  }, [dispatch]);

  const isAdmin = user?.role === 'Admin';
  const isSubAdmin = user?.role === 'Sub-Admin';

  const isSessionUnlocked = () => {
    if (!isUnlocked || !unlockedUntil) return false;
    const expiry = new Date(unlockedUntil);
    const isValid = expiry > new Date();
    if (!isValid && isUnlocked) {
      dispatch(lockSession());
    }
    return isValid;
  };

  const handleOpenModal = (type, sub = null) => {
    if (type !== 'view' && !isAdmin) {
      showToast('Unauthorized', 'Only platform admins can modify subscription models.', 'error');
      return;
    }

    if (type !== 'view' && !isSessionUnlocked()) {
      setPendingAction(() => () => handleOpenModal(type, sub));
      setShowSecurityModal(true);
      return;
    }

    setModalType(type);
    if ((type === 'edit' || type === 'view') && sub) {
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
        isActive: sub.isActive !== undefined ? sub.isActive : true,
        isVisible: sub.isVisible !== undefined ? sub.isVisible : true
      });
    } else {
      setFormData({
        plan: 'Professional', title: '', description: '', price: 0,
        durationInDays: 30, features: [],
        userLimit: 5, packageLimit: 10, staffLimit: 5,
        crmEnabled: false, websiteEnabled: false, testimonialEnabled: false,
        contactUsEnabled: false, instagramReelsEnabled: false, enquiriesFollowupEnabled: false,
        isActive: true, isVisible: true
      });
    }
    setNewFeature('');
    setShowModal(true);
  };

  const handleToggleField = (sub, field) => {
    if (!isAdmin) return;
    if (!isSessionUnlocked()) {
      setPendingAction(() => () => handleToggleField(sub, field));
      setShowSecurityModal(true);
      return;
    }
    const currentVal = sub[field] !== undefined ? sub[field] : true;
    const newVal = !currentVal;
    dispatch(updateSubscriptionRequest({ id: sub._id, data: { [field]: newVal } }));
    const label = field === 'isActive' ? 'Active Status' : 'Visibility Status';
    const stateLabel = newVal ? (field === 'isActive' ? 'Active' : 'Visible') : (field === 'isActive' ? 'Non-Active' : 'Non-Visible');
    showToast('Success', `${sub.title} updated to ${stateLabel}`, 'success');
  };

  const handleLockToggleInternal = () => {
    if (isLocked) {
      setPendingAction({ type: 'unlock' });
      setShowSecurityModal(true);
    } else {
      dispatch(lockSession());
      showToast('Locked', 'Session locked successfully.', 'info');
    }
  };

  const onSecurityVerified = () => {
    setShowSecurityModal(false);
    if (pendingAction?.type === 'unlock') {
      showToast('Unlocked', 'You can now modify subscriptions freely.', 'success');
    } else if (pendingAction) {
      if (typeof pendingAction === 'function') {
         pendingAction();
      }
    }
    setPendingAction(null);
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
    if (!isAdmin) return;
    if (!isSessionUnlocked()) {
      setPendingAction(() => () => handleDelete(id));
      setShowSecurityModal(true);
      return;
    }
    if (await confirm('Delete Plan?', 'Are you sure you want to delete this subscription plan? Existing vendors on this plan may be affected.')) {
      dispatch(deleteSubscriptionRequest(id));
      showToast('Success', 'Plan deleted successfully', 'success');
    }
  };

  const filteredPlans = subscriptions.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' ? true : p.plan === planFilter;

    const isSubActive = p.isActive !== false;
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'active' ? isSubActive : !isSubActive;

    const isSubVisible = p.isVisible !== false;
    const matchesVisibility = visibilityFilter === 'all' ? true :
      visibilityFilter === 'visible' ? isSubVisible : !isSubVisible;

    return matchesSearch && matchesPlan && matchesStatus && matchesVisibility;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform Subscriptions</h1>
          <p>Manage tiers, pricing models, active status, visibility, and feature permissions for vendors</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isAdmin && (
            <>
              <LockToggleButton onUnlockClick={handleLockToggleInternal} />
              <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
                <Plus size={20} /> Add New Plan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><CreditCard size={24} /></div>
          <div className="stat-info"><h3>Total Plans</h3><p>{subscriptions.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><Power size={24} /></div>
          <div className="stat-info"><h3>Active Tiers</h3><p>{subscriptions.filter(s => s.isActive !== false).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Power size={24} /></div>
          <div className="stat-info"><h3>Non-Active</h3><p>{subscriptions.filter(s => s.isActive === false).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Eye size={24} /></div>
          <div className="stat-info"><h3>Visible Plans</h3><p>{subscriptions.filter(s => s.isVisible !== false).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}><EyeOff size={24} /></div>
          <div className="stat-info"><h3>Non-Visible</h3><p>{subscriptions.filter(s => s.isVisible === false).length}</p></div>
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

          <div className="filter-actions" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
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
                width="140px"
              />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active', color: '#22c55e' },
                  { value: 'inactive', label: 'Non-Active', color: '#ef4444' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="140px"
              />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Visibility' },
                  { value: 'visible', label: 'Visible', color: '#3b82f6' },
                  { value: 'hidden', label: 'Non-Visible', color: '#64748b' }
                ]}
                value={visibilityFilter}
                onChange={setVisibilityFilter}
                width="145px"
              />
            </div>
            <div className="results-count">
              <span className="badge badge-primary">{filteredPlans.length}</span>
              <span style={{ marginLeft: '1px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
            </div>

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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading subscriptions...</p>
      ) : filteredPlans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <AlertTriangle size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No subscription plans found matching your search or filters.</p>
        </div>
      ) : view === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {filteredPlans.map((sub) => {
            const planStyle = getPlanStyle(sub.plan);
            const isSubActive = sub.isActive !== false;
            const isSubVisible = sub.isVisible !== false;

            return (
              <div 
                key={sub._id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative',
                  border: planStyle.border,
                  boxShadow: planStyle.shadow || 'var(--shadow-premium)',
                  overflow: 'visible',
                  opacity: !isSubActive ? 0.75 : 1
                }}
              >
                {planStyle.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                    zIndex: 10
                  }}>
                    Popular
                  </div>
                )}
                
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      padding: '5px 12px', 
                      borderRadius: '20px', 
                      fontSize: '10px', 
                      fontWeight: '800',
                      background: planStyle.badgeBg,
                      color: planStyle.badgeColor,
                      textTransform: 'uppercase',
                      border: sub.plan === 'Free' ? '1px solid var(--border)' : 'none',
                      display: 'inline-block'
                    }}>
                      {sub.plan}
                    </span>
                    <h2 style={{ fontSize: '19px', fontWeight: '800', marginTop: '10px', color: 'var(--text-main)' }}>{sub.title}</h2>
                    
                    {/* Active & Visible Status Badges */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleField(sub, 'isActive')}
                        disabled={!isAdmin}
                        style={{
                          border: 'none',
                          cursor: isAdmin ? 'pointer' : 'default',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isSubActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isSubActive ? '#16a34a' : '#dc2626',
                          transition: 'all 0.2s ease'
                        }}
                        title={isAdmin ? `Click to toggle Active status` : ''}
                      >
                        <Power size={11} />
                        {isSubActive ? 'Active' : 'Non-Active'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleField(sub, 'isVisible')}
                        disabled={!isAdmin}
                        style={{
                          border: 'none',
                          cursor: isAdmin ? 'pointer' : 'default',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isSubVisible ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                          color: isSubVisible ? '#2563eb' : '#475569',
                          transition: 'all 0.2s ease'
                        }}
                        title={isAdmin ? `Click to toggle Visibility status` : ''}
                      >
                        {isSubVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                        {isSubVisible ? 'Visible' : 'Non-Visible'}
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>₹{sub.price}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {sub.durationInDays === -1 ? 'Lifetime Access' : `${sub.durationInDays} Days Access`}
                    </p>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', minHeight: '36px', lineHeight: '1.5' }}>{sub.description}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '10px 4px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <Users size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                      <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Users</p>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{sub.userLimit === -1 ? '∞' : sub.userLimit}</p>
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '10px 4px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <Package size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                      <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Pkgs</p>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{sub.packageLimit === -1 ? '∞' : sub.packageLimit}</p>
                    </div>
                    <div style={{ background: 'var(--bg-main)', padding: '10px 4px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <Users size={14} color="var(--primary)" style={{ marginBottom: '4px', margin: '0 auto' }} />
                      <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Staff</p>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{sub.staffLimit === -1 ? '∞' : sub.staffLimit}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                      <ShieldCheck size={14} color="var(--primary)" />
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
                </div>

                {isAdmin && (
                  <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', width: '42px', height: '42px', minWidth: 'auto', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleOpenModal('view', sub)} title="View Details">
                      <Info size={18} />
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', flex: 1, height: '42px', fontWeight: '600' }} onClick={() => handleOpenModal('edit', sub)}>
                      Edit Plan
                    </button>
                    <button className="btn" style={{ background: '#fff1f2', border: 'none', color: '#e11d48', width: '42px', height: '42px', minWidth: 'auto', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(sub._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visibility</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((sub, index) => {
                  const isSubActive = sub.isActive !== false;
                  const isSubVisible = sub.isVisible !== false;

                  return (
                    <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)', opacity: !isSubActive ? 0.75 : 1 }}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{index + 1}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px' }}>{sub.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{sub.plan} Plan</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>₹{sub.price}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.durationInDays === -1 ? '∞ / Lifetime' : `${sub.durationInDays} Days`}</div>
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
                        <button
                          type="button"
                          onClick={() => handleToggleField(sub, 'isActive')}
                          disabled={!isAdmin}
                          style={{
                            border: 'none',
                            cursor: isAdmin ? 'pointer' : 'default',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isSubActive ? '#dcfce7' : '#fee2e2',
                            color: isSubActive ? '#166534' : '#b91c1c',
                            whiteSpace: 'nowrap'
                          }}
                          title={isAdmin ? `Click to toggle Active status` : ''}
                        >
                          <Power size={12} />
                          {isSubActive ? 'Active' : 'Non-Active'}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleField(sub, 'isVisible')}
                          disabled={!isAdmin}
                          style={{
                            border: 'none',
                            cursor: isAdmin ? 'pointer' : 'default',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: isSubVisible ? '#dbeafe' : '#f1f5f9',
                            color: isSubVisible ? '#1e40af' : '#475569',
                            whiteSpace: 'nowrap'
                          }}
                          title={isAdmin ? `Click to toggle Visibility status` : ''}
                        >
                          {isSubVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {isSubVisible ? 'Visible' : 'Non-Visible'}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {isAdmin ? (
                          <div className="action-group">
                            <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', sub)}>
                              <Info size={16} />
                            </button>
                            <button className="action-btn" title="Edit Plan" onClick={() => handleOpenModal('edit', sub)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn danger" title="Delete Plan" onClick={() => handleDelete(sub._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Create Subscription Plan' : modalType === 'view' ? 'View Subscription Plan' : 'Edit Subscription Plan'}
      >
        <form onSubmit={handleSubmit}>
          {/* Status & Visibility Settings */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-main)',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid var(--border)'
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Status & Visibility Controls
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Active Status Switch Card */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: formData.isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: formData.isActive ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    flexShrink: 0
                  }}>
                    <Power size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                      Active Status
                    </div>
                    <div style={{ fontSize: '11px', color: formData.isActive ? '#16a34a' : '#dc2626', fontWeight: '600', marginTop: '2px' }}>
                      {formData.isActive ? 'Active (Enabled)' : 'Non-Active (Disabled)'}
                    </div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', margin: 0, cursor: modalType === 'view' ? 'default' : 'pointer' }}>
                  <input
                    type="checkbox"
                    disabled={modalType === 'view'}
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: formData.isActive ? '#22c55e' : '#cbd5e1',
                    borderRadius: '24px', transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '18px', width: '18px',
                      left: formData.isActive ? '24px' : '3px', bottom: '3px',
                      backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>

              {/* Visibility Status Switch Card */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: formData.isVisible ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                    color: formData.isVisible ? '#2563eb' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    flexShrink: 0
                  }}>
                    {formData.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
                      Visibility Status
                    </div>
                    <div style={{ fontSize: '11px', color: formData.isVisible ? '#2563eb' : '#64748b', fontWeight: '600', marginTop: '2px' }}>
                      {formData.isVisible ? 'Visible (Public)' : 'Non-Visible (Hidden)'}
                    </div>
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', margin: 0, cursor: modalType === 'view' ? 'default' : 'pointer' }}>
                  <input
                    type="checkbox"
                    disabled={modalType === 'view'}
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: formData.isVisible ? '#3b82f6' : '#cbd5e1',
                    borderRadius: '24px', transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '18px', width: '18px',
                      left: formData.isVisible ? '24px' : '3px', bottom: '3px',
                      backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Plan Name</label>
            <input
              type="text" className="form-control" required placeholder="e.g. Platinum Plus"
              disabled={modalType === 'view'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Plan Type</label>
            <select
              className="form-control"
              disabled={modalType === 'view'}
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
                disabled={modalType === 'view'}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>Duration (Days)</label>
                <label style={{
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: modalType === 'view' ? 'default' : 'pointer',
                  color: formData.durationInDays === -1 ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: '700',
                  userSelect: 'none',
                  background: formData.durationInDays === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    disabled={modalType === 'view'}
                    checked={formData.durationInDays === -1}
                    onChange={(e) => setFormData({ ...formData, durationInDays: e.target.checked ? -1 : 30 })}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
                  />
                  Unlimited
                </label>
              </div>
              <input
                type="number" className="form-control" required
                disabled={modalType === 'view' || formData.durationInDays === -1}
                value={formData.durationInDays === -1 ? '' : formData.durationInDays}
                placeholder={formData.durationInDays === -1 ? '∞ Unlimited (Permanent)' : '30'}
                onChange={(e) => setFormData({ ...formData, durationInDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea
              className="form-control" style={{ height: '70px', resize: 'none', padding: '12px' }}
              placeholder="Brief overview of what this plan offers..."
              disabled={modalType === 'view'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Resource Limits
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Max Users</label>
                  <label style={{
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: modalType === 'view' ? 'default' : 'pointer',
                    color: formData.userLimit === -1 ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    userSelect: 'none',
                    background: formData.userLimit === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      disabled={modalType === 'view'}
                      checked={formData.userLimit === -1} 
                      onChange={(e) => setFormData({ ...formData, userLimit: e.target.checked ? -1 : 5 })}
                      style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
                    />
                    Unlimited
                  </label>
                </div>
                <input
                  type="number" className="form-control"
                  disabled={modalType === 'view' || formData.userLimit === -1}
                  value={formData.userLimit === -1 ? '' : formData.userLimit}
                  placeholder={formData.userLimit === -1 ? '∞ Unlimited' : '5'}
                  onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Max Packages</label>
                  <label style={{
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: modalType === 'view' ? 'default' : 'pointer',
                    color: formData.packageLimit === -1 ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    userSelect: 'none',
                    background: formData.packageLimit === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      disabled={modalType === 'view'}
                      checked={formData.packageLimit === -1} 
                      onChange={(e) => setFormData({ ...formData, packageLimit: e.target.checked ? -1 : 10 })}
                      style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
                    />
                    Unlimited
                  </label>
                </div>
                <input
                  type="number" className="form-control"
                  disabled={modalType === 'view' || formData.packageLimit === -1}
                  value={formData.packageLimit === -1 ? '' : formData.packageLimit}
                  placeholder={formData.packageLimit === -1 ? '∞ Unlimited' : '10'}
                  onChange={(e) => setFormData({ ...formData, packageLimit: Number(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Max Staff</label>
                  <label style={{
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: modalType === 'view' ? 'default' : 'pointer',
                    color: formData.staffLimit === -1 ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    userSelect: 'none',
                    background: formData.staffLimit === -1 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      disabled={modalType === 'view'}
                      checked={formData.staffLimit === -1} 
                      onChange={(e) => setFormData({ ...formData, staffLimit: e.target.checked ? -1 : 5 })}
                      style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
                    />
                    Unlimited
                  </label>
                </div>
                <input
                  type="number" className="form-control"
                  disabled={modalType === 'view' || formData.staffLimit === -1}
                  value={formData.staffLimit === -1 ? '' : formData.staffLimit}
                  placeholder={formData.staffLimit === -1 ? '∞ Unlimited' : '5'}
                  onChange={(e) => setFormData({ ...formData, staffLimit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Included Features (List)</label>
            {modalType !== 'view' && (
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
                  style={{ padding: '0 16px', borderRadius: '8px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                >
                  Add Feature
                </button>
              </div>
            )}
            {formData.features && formData.features.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {formData.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={14} color="var(--primary)" />
                      <span style={{ fontWeight: '600' }}>{feat}</span>
                    </div>
                    {modalType !== 'view' && (
                      <button type="button" onClick={() => removeFeature(idx)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '6px' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Feature Access Permissions
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
            {[
              { key: 'crmEnabled', label: 'CRM Access' },
              { key: 'websiteEnabled', label: 'Website Module' },
              { key: 'testimonialEnabled', label: 'Testimonials' },
              { key: 'contactUsEnabled', label: 'Contact Us' },
              { key: 'instagramReelsEnabled', label: 'Instagram Reels' },
              { key: 'enquiriesFollowupEnabled', label: 'Enquiries Follow-up' },
            ].map((f) => (
              <label key={f.key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: modalType === 'view' ? 'default' : 'pointer',
                padding: '10px 14px',
                background: 'var(--bg-main)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                userSelect: 'none',
                color: formData[f.key] ? 'var(--text-main)' : 'var(--text-muted)'
              }}>
                <input
                  type="checkbox"
                  disabled={modalType === 'view'}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: modalType === 'view' ? 'default' : 'pointer' }}
                  checked={formData[f.key]}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            ))}
          </div>

          {modalType === 'view' ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', fontSize: '16px', fontWeight: '600' }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" style={{ height: '48px', width: '100%', fontSize: '16px', fontWeight: '600' }}>
              {modalType === 'add' ? 'Create Plan' : 'Update Subscription'}
            </button>
          )}
        </form>
      </Drawer>

      <PasskeyModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onVerified={onSecurityVerified}
        title="Admin Security Access"
      />
    </div>
  );
};

export default Subscriptions;
