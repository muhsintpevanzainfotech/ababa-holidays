import React from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  MapPin,
  UserPlus,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = React.useState({
    revenue: '₹4,52,318',
    vendors: 0,
    packages: 0,
    users: 0,
    services: 0,
    categories: 0,
    subServices: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(prev => ({
            ...prev,
            vendors: res.data.data.vendors,
            packages: res.data.data.packages,
            users: res.data.data.users,
            services: res.data.data.services,
            categories: res.data.data.categories,
            subServices: res.data.data.subServices
          }));
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Revenue', value: data.revenue, icon: <DollarSign size={24} />, color: 'rgba(79, 70, 229, 0.1)', iconColor: '#4f46e5', trend: '+12.5%', detail: 'vs last month' },
    { title: 'Active Vendors', value: data.vendors.toString(), icon: <Users size={24} />, color: 'rgba(14, 165, 233, 0.1)', iconColor: '#0ea5e9', trend: '+3.2%', detail: 'new this week' },
    { title: 'Total Packages', value: data.packages.toString(), icon: <Package size={24} />, color: 'rgba(139, 92, 246, 0.1)', iconColor: '#8b5cf6', trend: '+8.1%', detail: 'active listings' },
    { title: 'Active Users', value: data.users.toString(), icon: <UserPlus size={24} />, color: 'rgba(249, 115, 22, 0.1)', iconColor: '#f97316', trend: '+1.5%', detail: 'registrations' },
  ];

  const recentItems = [
    { title: 'Golden Triangle Package', type: 'Package', status: 'Active', price: '₹45,000', location: 'Delhi/Agra/Jaipur', time: '2 mins ago' },
    { title: 'Kerala Backwaters Tour', type: 'Package', status: 'Pending', price: '₹32,500', location: 'Munnar/Alleppey', time: '15 mins ago' },
    { title: 'Elite Travels', type: 'Vendor', status: 'Verified', price: '-', location: 'Mumbai', time: '1 hour ago' },
    { title: 'Shimla Honeymoon', type: 'Package', status: 'Active', price: '₹28,000', location: 'Shimla/Manali', time: '3 hours ago' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      {/* Welcome Section */}
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>Dashboard <span style={{ color: 'var(--primary)' }}>Hub</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '4px' }}>Welcome back. Your travel ecosystem is performing exceptionally well today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--primary)" />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '40px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: stat.color, color: stat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ background: stat.trend.includes('+') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: stat.trend.includes('+') ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</p>
              <h2 style={{ margin: '4px 0', fontSize: '28px', fontWeight: '900', color: 'var(--text-main)' }}>{stat.value}</h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8 }}>{stat.detail}</p>
            </div>
            {/* Visual background element */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '100px', opacity: 0.03, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Activity Table */}
        <div className="card" style={{ padding: '0', border: '1px solid var(--border)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248, 250, 252, 0.5)' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Recent Activity</h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Latest updates across all modules</p>
            </div>
            <button 
              onClick={() => navigate('/packages')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Explore All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-main)' }}>
                <tr>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Item Details</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Added</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item, i) => (
                  <tr key={i} style={{ borderBottom: i === recentItems.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          {item.type === 'Package' ? <Briefcase size={18} /> : <Users size={18} />}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                        backgroundColor: item.status === 'Active' || item.status === 'Verified' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: item.status === 'Active' || item.status === 'Verified' ? '#16a34a' : '#a16207',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}>
                        {item.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                        <MapPin size={14} color="var(--primary)" /> {item.location}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {item.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>Quick Launcher</h2>
            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Access your most frequent commands instantly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary btn-block" 
                style={{ height: '48px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => navigate('/vendors')}
              >
                <UserPlus size={18} /> Register New Vendor
              </button>
              <button 
                className="btn btn-primary btn-block" 
                style={{ height: '48px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => navigate('/packages')}
              >
                <Package size={18} /> Create New Package
              </button>
              <button className="btn btn-primary btn-block" style={{ height: '48px' }}>
                <ArrowUpRight size={18} /> Analytics Detail
              </button>
            </div>
          </div>

          {/* Module Health */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Module Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Services', count: data.services, icon: <Briefcase size={16} /> },
                { label: 'Categories', count: data.categories, icon: <Layers size={16} /> },
                { label: 'Destinations', count: 124, icon: <MapPin size={16} /> }
              ].map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--primary)' }}>{m.icon}</div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '8px' }}>{m.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Tip */}
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Activity size={20} />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Live System Health</h4>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>System is running optimally with <strong>99.9%</strong> uptime. All services are currently operational.</p>
            </div>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '80px', opacity: 0.1, transform: 'rotate(15deg)' }}>
              <Activity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
