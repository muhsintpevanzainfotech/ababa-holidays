import React from 'react';
import { Star, CheckCircle, Package, Briefcase } from 'lucide-react';
import { getFieldError } from '../components/SharedUI';

const Step6Services = ({ 
  formik, isViewMode, subscriptions = [], subsLoading, services = [], servicesLoading, handleArrayToggle 
}) => {
  // Fallback plans if subscriptions list is empty/loading
  const defaultSubscriptions = [
    { _id: 'free_plan', title: 'Free Starter Plan', price: 0, billingCycle: 'mo', description: 'Basic vendor listing & booking inquiry access.' },
    { _id: 'pro_plan', title: 'Pro Growth Plan', price: 999, billingCycle: 'mo', description: 'Unlimited packages, CRM integration & priority support.' },
    { _id: 'enterprise_plan', title: 'Enterprise Plan', price: 2499, billingCycle: 'mo', description: 'Full website customization, dedicated manager & zero commissions.' }
  ];

  const planList = (subscriptions && subscriptions.length > 0) ? subscriptions : defaultSubscriptions;

  // Fallback services if services list is empty/loading
  const defaultServices = [
    { _id: 'holiday_packages', title: 'Holiday Packages' },
    { _id: 'hotel_booking', title: 'Hotels & Resorts' },
    { _id: 'flight_booking', title: 'Flights & Transfers' },
    { _id: 'sightseeing_tours', title: 'Tours & Activities' },
    { _id: 'car_rentals', title: 'Car Rentals' }
  ];

  const serviceList = (services && services.length > 0) ? services : defaultServices;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Star color="var(--primary)" /> Subscription Plan & Service Modules
      </h2>

      {/* SUBSCRIPTION PLAN SELECTION */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>
          Select Partner Subscription Plan *
        </h4>
        {subsLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subscription plans...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {planList.map(sub => {
              const subId = sub._id;
              const isSelected = formik.values.subscription === subId;
              return (
                <div
                  key={subId}
                  onClick={() => !isViewMode && formik.setFieldValue('subscription', subId)}
                  style={{
                    padding: '24px',
                    borderRadius: '24px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-card)',
                    cursor: isViewMode ? 'default' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: isSelected ? '0 10px 25px rgba(var(--primary-rgb), 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary)' }}>
                      <CheckCircle size={20} />
                    </div>
                  )}
                  <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)' }}>{sub.title}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>
                    ₹{sub.price}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{sub.billingCycle || 'mo'}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{sub.description}</p>
                </div>
              );
            })}
          </div>
        )}
        {getFieldError(formik, 'subscription')}
      </div>

      {/* SERVICE MODULES SELECTION */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--text-muted)' }}>
          Authorized Service Modules
        </h4>
        {servicesLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading service catalog...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {serviceList.map(srv => {
              const srvId = srv._id;
              const isSelected = (formik.values.selectedServices || []).includes(srvId);
              return (
                <div
                  key={srvId}
                  onClick={() => !isViewMode && handleArrayToggle('selectedServices', srvId)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-card)',
                    cursor: isViewMode ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <Briefcase size={22} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '600', color: 'var(--text-main)' }}>
                    {srv.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step6Services;
