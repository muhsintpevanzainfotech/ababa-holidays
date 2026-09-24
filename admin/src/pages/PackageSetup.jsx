import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Plus,
  Settings,
  ArrowRight,
  Briefcase,
  Layers,
  ListTodo,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import '../premium-builder.css';

const PackageSetup = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      const servicesData = res.data.data;

      const servicesWithCounts = await Promise.all(
        servicesData.map(async (service) => {
          try {
            const fieldsRes = await api.get(`/package-fields/setup/${service._id}`);
            return {
              ...service,
              fieldCount: fieldsRes.data.count || 0
            };
          } catch (err) {
            return { ...service, fieldCount: 0 };
          }
        })
      );

      setServices(servicesWithCounts);
    } catch (error) {
      showToast('Error', 'Failed to fetch services', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center font-bold text-slate-400 animate-pulse">Loading Services...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Package Setup Builder</h1>
          <p>Configure custom data fields for each service category</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', color: 'white', border: 'none' }}>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Global Setup Overview</h3>
        <p style={{ color: '#ffffff', fontSize: '14px', maxWidth: '700px', lineHeight: '1.6', fontWeight: '500' }}>
          Assign and manage custom data fields for various service categories. These fields will be automatically displayed to vendors during their package creation process for each specific category.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading services...</div>
      ) : (
        <div className="cards-grid">
          {services.map((service) => (
            <div key={service._id} className="card" style={{ padding: '24px', transition: 'var(--transition)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  {service.icon ? (
                    <img src={service.icon.startsWith('http') ? service.icon : `${import.meta.env.VITE_IMAGE_BASE_URL}${service.icon}`} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  ) : (
                    <Briefcase size={24} />
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{service.fieldCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Fields Defined</div>
                </div>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{service.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '18px', minHeight: '38px' }}>
                {service.description ? (service.description.substring(0, 80) + '...') : 'No description available.'}
              </p>

              <div
                role="button"
                className="group mt-6 cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  minHeight: '48px',
                  padding: '0 20px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                  boxShadow: '0 8px 20px -8px rgba(124, 58, 237, 0.5)',
                  border: 'none',
                  outline: 'none'
                }}
                onClick={() => navigate(`/packages/ai-builder/${service.customId || service._id}`, { state: { serviceTitle: service.title, serviceId: service.customId || service._id } })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 5 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Sparkles size={16} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.01em', color: '#ffffff' }}>AI Next-Gen Builder</span>
                </div>
                
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 5 }}>
                  <ChevronRight size={18} color="white" />
                </div>

                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

            </div>
          ))}
        </div>
      )}

      {services.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <AlertCircle size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No services found. Please create services first.</p>
        </div>
      )}
    </div>
  );
};

export default PackageSetup;
