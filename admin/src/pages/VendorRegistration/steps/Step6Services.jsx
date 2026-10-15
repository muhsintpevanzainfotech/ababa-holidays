import React from 'react';
import { 
  Star, CheckCircle, CheckCircle2, Package, Building, Globe, 
  Compass, Car, Briefcase, Percent, Check, Sparkles, 
  ShieldCheck, Smartphone, Zap, Bus, Heart, Plane, Landmark
} from 'lucide-react';
import { getFieldError } from '../components/SharedUI';

const Step6Services = ({ 
  formik, isViewMode, subscriptions = [], subsLoading, services = [], servicesLoading, handleArrayToggle 
}) => {
  const API_URL = import.meta.env.VITE_IMAGE_BASE_URL || (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');

  // Filter subscriptions loaded via API by visibility and active status (respect isVisible property)
  // If a vendor already has an assigned plan, retain it so it remains visible
  const planList = (Array.isArray(subscriptions) && subscriptions.length > 0)
    ? subscriptions.filter(sub => (sub.isVisible !== false && sub.isActive !== false) || sub._id === formik.values.subscription)
    : [];

  // Find currently active plan
  const selectedPlan = planList.find(sub => {
    const subId = sub._id;
    return formik.values.subscription === subId || 
      (Boolean(subId) && String(formik.values.subscription) === String(subId)) ||
      (!formik.values.subscription && formik.values.subscriptionPlan && (
        (sub.title && formik.values.subscriptionPlan.toLowerCase() === sub.title.toLowerCase()) ||
        (sub.name && formik.values.subscriptionPlan.toLowerCase() === sub.name.toLowerCase()) ||
        (sub.plan && formik.values.subscriptionPlan.toLowerCase() === sub.plan.toLowerCase())
      ));
  }) || (Array.isArray(subscriptions) ? subscriptions.find(sub => String(sub._id) === String(formik.values.subscription)) : null);

  // Services loaded strictly via API
  const serviceList = (services && Array.isArray(services)) ? services : [];

  const getServiceIcon = (title = '', isSelected = false) => {
    const t = (title || '').toLowerCase();
    const iconColor = isSelected ? '#ffffff' : undefined;
    if (t.includes('hotel') || t.includes('resort')) return <Building size={20} color={iconColor || '#10b981'} />;
    if (t.includes('bus') || t.includes('coach')) return <Bus size={20} color={iconColor || '#3b82f6'} />;
    if (t.includes('wedding')) return <Heart size={20} color={iconColor || '#ec4899'} />;
    if (t.includes('flight') || t.includes('ticket') || t.includes('visa')) return <Plane size={20} color={iconColor || '#f59e0b'} />;
    if (t.includes('hajj') || t.includes('umrah') || t.includes('pilgrim')) return <Landmark size={20} color={iconColor || '#059669'} />;
    if (t.includes('car') || t.includes('transport') || t.includes('cab') || t.includes('rent')) return <Car size={20} color={iconColor || '#f97316'} />;
    if (t.includes('tour') || t.includes('sight') || t.includes('activit')) return <Compass size={20} color={iconColor || '#8b5cf6'} />;
    return <Package size={20} color={iconColor || 'var(--primary)'} />;
  };

  const renderServiceIcon = (srv, isSelected) => {
    // If srv.icon is a valid React element
    if (React.isValidElement(srv.icon)) {
      return srv.icon;
    }

    const iconPath = srv.icon || srv.image;
    // If iconPath is a string (e.g. image path / URL / SVG)
    if (typeof iconPath === 'string' && iconPath.trim() !== '') {
      const cleanPath = iconPath.replace(/\\/g, '/');
      const srcUrl = cleanPath.startsWith('http')
        ? cleanPath
        : `${API_URL}/${cleanPath.replace(/^\//, '')}`;

      return (
        <img
          src={srcUrl}
          alt={srv.title || 'Service'}
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: isSelected ? 'brightness(0) invert(1)' : 'none',
            display: 'block'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    return getServiceIcon(srv.title, isSelected);
  };


  const currentCommType = formik.values.packageCommission?.type || 'Percentage';
  const currentCommRate = Number(formik.values.packageCommission?.rate) || 0;

  // Live Commission Simulation on ₹10,000 base package
  const samplePkgPrice = 10000;
  const adminShare = currentCommType === 'Percentage' 
    ? Math.round((samplePkgPrice * currentCommRate) / 100)
    : Math.min(samplePkgPrice, currentCommRate);
  const vendorShare = Math.max(0, samplePkgPrice - adminShare);

  const selectAllServices = () => {
    if (isViewMode) return;
    const allIds = serviceList.map(s => s._id);
    formik.setFieldValue('selectedServices', allIds);
  };

  const clearAllServices = () => {
    if (isViewMode) return;
    formik.setFieldValue('selectedServices', []);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Star color="var(--primary)" size={22} /> Subscription Plan & Service Modules
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure partner tier entitlements, authorized operations catalog, and commercial commission architecture.
        </p>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: SUBSCRIPTION PLAN SELECTION                       */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 2px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="var(--primary)" /> Select Partner Subscription Plan *
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choose the onboarding subscription tier for package quotas & features.</span>
          </div>

          {selectedPlan && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '14px',
              background: 'rgba(var(--primary-rgb), 0.12)',
              border: '1px solid rgba(var(--primary-rgb), 0.35)',
              color: 'var(--primary)', fontSize: '11px', fontWeight: '800'
            }}>
              <CheckCircle2 size={13} />
              <span>Active: {selectedPlan.title || selectedPlan.name}</span>
            </div>
          )}
        </div>

        {subsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                style={{ 
                  padding: '24px 20px', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-card)',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}
              >
                <div style={{ height: '20px', width: '60%', background: 'var(--border)', borderRadius: '6px' }} />
                <div style={{ height: '32px', width: '40%', background: 'var(--border)', borderRadius: '8px' }} />
                <div style={{ height: '14px', width: '90%', background: 'var(--border)', borderRadius: '4px' }} />
                <div style={{ height: '14px', width: '70%', background: 'var(--border)', borderRadius: '4px' }} />
                <div style={{ marginTop: 'auto', height: '36px', width: '100%', background: 'var(--border)', borderRadius: '10px' }} />
              </div>
            ))}
          </div>
        ) : planList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {planList.map(sub => {
              const subId = sub._id;
              const isSelected = 
                (Boolean(formik.values.subscription) && (formik.values.subscription === subId || String(formik.values.subscription) === String(subId))) ||
                (!formik.values.subscription && Boolean(formik.values.subscriptionPlan) && (
                  (sub.title && formik.values.subscriptionPlan.toLowerCase() === sub.title.toLowerCase()) ||
                  (sub.name && formik.values.subscriptionPlan.toLowerCase() === sub.name.toLowerCase()) ||
                  (sub.plan && formik.values.subscriptionPlan.toLowerCase() === sub.plan.toLowerCase())
                ));
              const isPopular = sub.popular || sub.isPopular || sub.plan === 'Professional' || sub.title?.toLowerCase().includes('pro') || sub.title?.toLowerCase().includes('growth');
              const cycleLabel = sub.billingCycle 
                ? `/${sub.billingCycle}` 
                : (sub.durationInDays === -1 ? ' (Lifetime)' : (sub.durationInDays && sub.durationInDays >= 365 ? '/yr' : (sub.durationInDays && sub.durationInDays >= 30 ? '/mo' : (sub.durationInDays ? `/${sub.durationInDays}d` : ''))));

              return (
                <div
                  key={subId}
                  onClick={() => {
                    if (!isViewMode) {
                      formik.setFieldValue('subscription', subId);
                      formik.setFieldValue('subscriptionPlan', sub.title || sub.name || sub.plan || 'Plan');
                    }
                  }}
                  style={{
                    padding: '24px 20px',
                    borderRadius: '20px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : (isPopular ? 'rgba(var(--primary-rgb), 0.45)' : 'var(--border)')}`,
                    background: isSelected 
                      ? 'linear-gradient(145deg, rgba(var(--primary-rgb), 0.1) 0%, var(--bg-card) 100%)' 
                      : 'var(--bg-card)',
                    cursor: isViewMode ? 'default' : 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected 
                      ? '0 14px 32px rgba(var(--primary-rgb), 0.25)' 
                      : (isPopular ? '0 8px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.03)'),
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transform: isSelected ? 'translateY(-3px)' : 'none'
                  }}
                >
                  {/* POPULAR BADGE */}
                  {isPopular && (
                    <div style={{ 
                      position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase',
                      padding: '3px 12px', borderRadius: '12px', letterSpacing: '0.6px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                      zIndex: 2
                    }}>
                      RECOMMENDED
                    </div>
                  )}

                  {/* ACTIVE CHECKMARK INDICATOR */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <div style={{ 
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      color: isSelected ? '#ffffff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isSelected ? '0 2px 8px rgba(var(--primary-rgb), 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  <div>
                    {/* PLAN TITLE */}
                    <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 8px', color: 'var(--text-main)', paddingRight: '32px' }}>
                      {sub.title || sub.name || (sub.plan ? `${sub.plan} Plan` : 'Subscription Plan')}
                    </h3>
                    
                    {/* PRICING */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '12px' }}>
                      {sub.price === 0 ? (
                        <span style={{ fontSize: '26px', fontWeight: '900', color: '#10b981', letterSpacing: '-0.5px' }}>
                          FREE
                        </span>
                      ) : (
                        <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                          ₹{sub.price}
                        </span>
                      )}
                      {cycleLabel && (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                          {cycleLabel}
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}
                    {sub.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                        {sub.description}
                      </p>
                    )}

                    {/* KEY ENTITLEMENT PILLS */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        📦 {sub.packageLimit === -1 ? 'Unlimited Pkgs' : `${sub.packageLimit ?? 0} Pkgs`}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        👥 {sub.userLimit === -1 ? 'Unlimited Users' : `${sub.userLimit ?? 1} User`}
                      </span>
                      {(sub.crmEnabled || isPopular) && (
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                          ⚡ CRM Enabled
                        </span>
                      )}
                      {sub.websiteEnabled && (
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          🌐 Web Module
                        </span>
                      )}
                    </div>

                    {/* FEATURES CHECKLIST */}
                    {Array.isArray(sub.features) && sub.features.length > 0 && (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Included Benefits
                        </span>
                        {sub.features.slice(0, 5).map((feature, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '11.5px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                            <Check size={13} color="#10b981" strokeWidth={3} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SELECT BUTTON STATE */}
                  <div style={{
                    marginTop: '18px',
                    padding: '9px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '800',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    border: isSelected ? 'none' : '1px solid var(--border)',
                    boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    {isSelected ? '✓ Active Selected Tier' : 'Select This Plan'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '36px 20px', 
            background: 'var(--bg-card)', 
            borderRadius: '20px', 
            border: '1px dashed var(--border)',
            color: 'var(--text-muted)'
          }}>
            <Package size={36} style={{ opacity: 0.5, marginBottom: '10px', display: 'inline-block' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>
              No Active Subscription Plans Available
            </h4>
            <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-muted)' }}>
              No subscription plans were returned from the API. Please ensure plans are configured in the Subscriptions management module.
            </p>
          </div>
        )}
        {getFieldError(formik, 'subscription')}
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: AUTHORIZED SERVICE MODULES                        */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 2px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={15} color="var(--primary)" /> Authorized Service Modules
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Activate services the partner is allowed to list and manage.</span>
          </div>

          {!isViewMode && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={selectAllServices}
                className="btn"
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: '700', color: 'var(--primary)' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllServices}
                className="btn"
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: '700', color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {servicesLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading service catalog...</div>
        ) : serviceList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {serviceList.map(srv => {
              const srvId = srv._id;
              const isSelected = (formik.values.selectedServices || []).includes(srvId);
              return (
                <div
                  key={srvId}
                  onClick={() => !isViewMode && handleArrayToggle('selectedServices', srvId)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-card)',
                    cursor: isViewMode ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 6px 18px rgba(var(--primary-rgb), 0.15)' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      overflow: 'hidden'
                    }}
                  >
                    {renderServiceIcon(srv, isSelected)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div 
                      title={srv.title}
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: isSelected ? '800' : '700', 
                        color: 'var(--text-main)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}
                    >
                      {srv.title}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '10.5px', 
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)', 
                        fontWeight: '700',
                        display: 'block',
                        marginTop: '2px'
                      }}
                    >
                      {isSelected ? '✓ Authorized' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 20px', 
            background: 'var(--bg-card)', 
            borderRadius: '16px', 
            border: '1px dashed var(--border)',
            color: 'var(--text-muted)'
          }}>
            <Briefcase size={32} style={{ opacity: 0.5, marginBottom: '8px', display: 'inline-block' }} />
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>
              No Service Modules Available
            </h4>
            <p style={{ fontSize: '11.5px', margin: 0, color: 'var(--text-muted)' }}>
              No service modules were returned from the API. Please configure services in the Services management module.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: PACKAGE COMMISSION SETUP                          */}
      {/* ============================================================ */}
      <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 2px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Percent size={15} color="var(--primary)" /> Package Commission Setup
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Admin commission deducted from successful traveler bookings on this vendor's packages.
          </span>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            {/* TYPE TOGGLE (SEGMENTED PILL) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Commission Mechanism
              </label>
              <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => formik.setFieldValue('packageCommission.type', 'Percentage')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: isViewMode ? 'default' : 'pointer',
                    background: currentCommType === 'Percentage' ? 'var(--primary)' : 'transparent',
                    color: currentCommType === 'Percentage' ? '#ffffff' : 'var(--text-main)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => formik.setFieldValue('packageCommission.type', 'Flat')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: isViewMode ? 'default' : 'pointer',
                    background: currentCommType === 'Flat' ? 'var(--primary)' : 'transparent',
                    color: currentCommType === 'Flat' ? '#ffffff' : 'var(--text-main)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Flat Amount (₹)
                </button>
              </div>
            </div>

            {/* RATE INPUT WITH QUICK PRESETS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Commission Rate {currentCommType === 'Percentage' ? '(%)' : '(₹)'}
                </label>
                {!isViewMode && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {currentCommType === 'Percentage' ? (
                      [5, 10, 15, 20].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => formik.setFieldValue('packageCommission.rate', val)}
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: `1px solid ${currentCommRate === val ? 'var(--primary)' : 'var(--border)'}`,
                            background: currentCommRate === val ? 'var(--primary)' : 'var(--bg-main)',
                            color: currentCommRate === val ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {val}%
                        </button>
                      ))
                    ) : (
                      [500, 1000, 1500, 2000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => formik.setFieldValue('packageCommission.rate', val)}
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: `1px solid ${currentCommRate === val ? 'var(--primary)' : 'var(--border)'}`,
                            background: currentCommRate === val ? 'var(--primary)' : 'var(--bg-main)',
                            color: currentCommRate === val ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          ₹{val}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max={currentCommType === 'Percentage' ? 100 : 100000}
                  disabled={isViewMode}
                  name="packageCommission.rate"
                  value={formik.values.packageCommission?.rate !== undefined ? formik.values.packageCommission.rate : 0}
                  onChange={(e) => formik.setFieldValue('packageCommission.rate', Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="form-control"
                  style={{
                    height: '42px',
                    padding: '0 40px 0 14px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '15px',
                    background: 'var(--bg-main)'
                  }}
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>
                  {currentCommType === 'Percentage' ? '%' : '₹'}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC LIVE CALCULATION PREVIEW */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px dashed rgba(var(--primary-rgb), 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Live Revenue Split Simulation (Per ₹10,000 Booking)
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  Admin Commission: <span style={{ color: '#ef4444', fontWeight: '900' }}>₹{adminShare.toLocaleString()}</span> &bull; Vendor Payout: <span style={{ color: '#22c55e', fontWeight: '900' }}>₹{vendorShare.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {currentCommType === 'Percentage' ? `${currentCommRate}% Platform Fee` : `₹${currentCommRate} Fixed Platform Fee`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Services;
