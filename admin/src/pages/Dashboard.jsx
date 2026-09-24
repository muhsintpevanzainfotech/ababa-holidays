import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Compass,
  Zap,
  RefreshCw,
  Sliders,
  ChevronRight,
  CreditCard,
  FileText
} from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [data, setData] = useState({
    revenue: 0,
    vendors: 0,
    packages: 0,
    users: 0,
    services: 0,
    categories: 0,
    subServices: 0,
    destinations: 0,
    bookings: 0,
    recentItems: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('6M');

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData({
          revenue: res.data.data.revenue || 0,
          vendors: res.data.data.vendors || 0,
          packages: res.data.data.packages || 0,
          users: res.data.data.users || 0,
          services: res.data.data.services || 0,
          categories: res.data.data.categories || 0,
          subServices: res.data.data.subServices || 0,
          destinations: res.data.data.destinations || 0,
          bookings: res.data.data.bookings || 0,
          recentItems: res.data.data.recentItems || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Role helper
  const isVendor = user?.role === 'Vendor';

  // Mock revenue trajectory chart coordinates
  const revenuePoints = [
    { label: 'Apr', value: 45000 },
    { label: 'May', value: 72000 },
    { label: 'Jun', value: 68000 },
    { label: 'Jul', value: 94000 },
    { label: 'Aug', value: 115000 },
    { label: 'Sep', value: data.revenue > 0 ? data.revenue : 145000 }
  ];

  const formattedRevenueNode = data.revenue > 0 
    ? (data.revenue >= 100000 
        ? `₹${(data.revenue / 100000).toFixed(1)}L` 
        : `₹${Math.round(data.revenue / 1000)}K`)
    : '₹0';

  const statCards = [
    {
      title: 'Total Gross Revenue',
      value: `₹${Number(data.revenue).toLocaleString('en-IN')}`,
      change: '+14.5%',
      isPositive: true,
      detail: isVendor ? 'Earnings from completed package sales' : 'Completed booking transactions',
      icon: <DollarSign size={24} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      textColor: '#10b981',
      link: '/payments'
    },
    {
      title: isVendor ? 'My Active Packages' : 'Active Partner Vendors',
      value: (isVendor ? data.packages : data.vendors).toString(),
      change: '+4.2%',
      isPositive: true,
      detail: isVendor ? 'Published tours & itineraries' : 'Verified travel agencies & partners',
      icon: isVendor ? <Package size={24} /> : <Users size={24} />,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      bgLight: 'rgba(14, 165, 233, 0.12)',
      textColor: '#0ea5e9',
      link: isVendor ? '/packages' : '/vendors'
    },
    {
      title: isVendor ? 'Total Bookings' : 'Active Packages',
      value: (isVendor ? data.bookings : data.packages).toString(),
      change: '+8.1%',
      isPositive: true,
      detail: isVendor ? 'Customer reservations' : 'Live listings & itineraries',
      icon: isVendor ? <Calendar size={24} /> : <Package size={24} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      bgLight: 'rgba(139, 92, 246, 0.12)',
      textColor: '#8b5cf6',
      link: isVendor ? '/bookings' : '/packages'
    },
    {
      title: 'Registered Travelers',
      value: data.users.toString(),
      change: '+3.6%',
      isPositive: true,
      detail: isVendor ? 'Unique customers who booked' : 'Active customer profiles',
      icon: <UserPlus size={24} />,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      bgLight: 'rgba(249, 115, 22, 0.12)',
      textColor: '#f97316',
      link: isVendor ? '/bookings' : '/users'
    }
  ];

  const quickLaunchItems = isVendor ? [
    { title: 'Create Package', desc: 'Add new tour or itinerary', icon: <Package size={20} />, color: '#8b5cf6', path: '/packages/setup' },
    { title: 'My Bookings', desc: 'Manage incoming customer bookings', icon: <Calendar size={20} />, color: '#10b981', path: '/bookings' },
    { title: 'Brand Showcase', desc: 'Update agency profile & logo', icon: <Briefcase size={20} />, color: '#0ea5e9', path: '/vendor/brands' },
    { title: 'Reels & Shows', desc: 'Publish video reels & promotional shows', icon: <Globe size={20} />, color: '#ec4899', path: '/vendor/shows' },
    { title: 'Customer Reviews', desc: 'Manage testimonials & reviews', icon: <ShieldCheck size={20} />, color: '#f59e0b', path: '/vendor/testimonials' },
    { title: 'Agency Banners', desc: 'Manage hero promotional banners', icon: <Sliders size={20} />, color: '#64748b', path: '/vendor/banners' }
  ] : [
    { title: 'Create Package', desc: 'Add new tour or itinerary', icon: <Package size={20} />, color: '#8b5cf6', path: '/packages/setup' },
    { title: 'Onboard Vendor', desc: 'Register partner agency', icon: <UserPlus size={20} />, color: '#0ea5e9', path: '/vendors/create' },
    { title: 'Manage Bookings', desc: 'View customer reservations', icon: <Calendar size={20} />, color: '#10b981', path: '/bookings' },
    { title: 'Platform Policies', desc: 'Edit legal & terms guidelines', icon: <ShieldCheck size={20} />, color: '#f59e0b', path: '/policies' },
    { title: 'Web Banners', desc: 'Promotions & hero banners', icon: <Globe size={20} />, color: '#ec4899', path: '/website/banners' },
    { title: 'System Settings', desc: 'Configure platform parameters', icon: <Sliders size={20} />, color: '#64748b', path: '/settings/profile' }
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. HERO BANNER HEADER */}
      <div className="dashboard-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="pulse-badge">
                <span className="pulse-dot"></span>
                <span>Platform Operational • 99.9% Uptime</span>
              </div>
              <span style={{ fontSize: '13px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.5px', color: '#ffffff' }}>
              {getGreeting()}, <span style={{ color: '#a5b4fc' }}>{user?.name || (isVendor ? 'Vendor' : 'Admin')}</span>! 👋
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '600px', lineHeight: 1.6 }}>
              {isVendor 
                ? `Here is your agency real-time summary. You have ${data.bookings} customer bookings and ${data.packages} active tour packages listed.`
                : `Here is your real-time travel platform overview. You have ${data.bookings} active bookings and ${data.vendors} verified vendors operating smoothly today.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchStats}
              className="btn"
              disabled={refreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                minWidth: 'auto',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Sync Stats'}
            </button>

            <button
              onClick={() => navigate('/packages/setup')}
              className="btn"
              style={{
                background: '#ffffff',
                color: '#312e81',
                border: 'none',
                minWidth: 'auto',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)'
              }}
            >
              <Sparkles size={16} color="#6366f1" /> Quick Setup
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="modern-stat-card"
            onClick={() => navigate(card.link)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                className="stat-icon-wrapper"
                style={{ background: card.bgLight, color: card.textColor }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  background: card.isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: card.isPositive ? '#10b981' : '#ef4444',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <TrendingUp size={12} /> {card.change}
              </div>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {card.title}
              </p>
              <h2 style={{ margin: '6px 0 4px', fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                {loading ? '...' : card.value}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.85 }}>
                {card.detail}
              </p>
            </div>

            {/* Bottom mini progress indicator */}
            <div style={{ marginTop: '16px' }}>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${65 + idx * 10}%`, background: card.gradient }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: Analytics & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Revenue Analytics Curve Chart */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="var(--primary)" /> Revenue Trajectory
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Monthly booking turnover & revenue velocity
                </p>
              </div>

              <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                {['1M', '6M', '1Y'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeChartTab === tab ? 'var(--bg-card)' : 'transparent',
                      color: activeChartTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(53, 133, 142, 0.4)" />
                    <stop offset="100%" stopColor="rgba(53, 133, 142, 0.0)" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="var(--border)" strokeDasharray="4 4" opacity="0.5" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="var(--border)" strokeDasharray="4 4" opacity="0.5" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="var(--border)" strokeDasharray="4 4" opacity="0.5" />

                {/* Area path */}
                <path
                  d="M 20,130 C 120,110 220,100 320,65 C 420,40 520,30 580,20 L 580,150 L 20,150 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line path */}
                <path
                  d="M 20,130 C 120,110 220,100 320,65 C 420,40 520,30 580,20"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Nodes */}
                {[
                  { x: 20, y: 130, val: '₹45K' },
                  { x: 130, y: 110, val: '₹72K' },
                  { x: 240, y: 95, val: '₹68K' },
                  { x: 350, y: 65, val: '₹94K' },
                  { x: 460, y: 40, val: '₹115K' },
                  { x: 570, y: 20, val: formattedRevenueNode }
                ].map((pt, i) => (
                  <g key={i} className="chart-node" style={{ cursor: 'pointer' }}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                  </g>
                ))}
              </svg>

              {/* Month labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                {revenuePoints.map((pt, idx) => (
                  <span key={idx}>{pt.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Recent Activity Feed</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isVendor ? 'Real-time updates from your packages & bookings' : 'Real-time updates from listings, vendors & packages'}
                </p>
              </div>
              <button 
                onClick={() => navigate('/packages')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All Listings <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-main)' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Listing Title</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Location / Info</th>
                    <th style={{ padding: '12px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'left' }}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div className="loader" style={{ margin: '0 auto 12px' }}></div>
                        <p style={{ margin: 0, fontSize: '13px' }}>Loading recent activity...</p>
                      </td>
                    </tr>
                  ) : data.recentItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No recent activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentItems.map((item, i) => (
                      <tr key={item._id || i} style={{ borderBottom: i === data.recentItems.length - 1 ? 'none' : '1px solid var(--border)' }}>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              {item.type === 'Package' ? <Briefcase size={20} /> : item.type === 'Booking' ? <Calendar size={20} /> : <Users size={20} />}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{item.title}</p>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{item.type}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px' }}>
                          <span style={{ 
                            padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                            backgroundColor: item.status === 'Active' || item.status === 'Verified' || item.status === 'Confirmed' || item.status === 'Completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: item.status === 'Active' || item.status === 'Verified' || item.status === 'Confirmed' || item.status === 'Completed' ? '#10b981' : '#f59e0b',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}>
                            {item.status === 'Active' || item.status === 'Verified' || item.status === 'Confirmed' || item.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            <MapPin size={14} color="var(--primary)" /> {item.location || 'India'}
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {timeAgo(item.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Quick Command Launcher & Module Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Quick Launcher Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" /> Command Launcher
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Fast shortcuts to primary administrative functions
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quickLaunchItems.map((item, idx) => (
                <div
                  key={idx}
                  className="quick-launch-tile"
                  onClick={() => navigate(item.path)}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{item.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Module Distribution */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>
              Ecosystem Inventory
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: 'Travel Services', count: data.services, icon: <Briefcase size={16} />, color: '#6366f1', total: Math.max(data.services, 20) },
                { label: 'Service Categories', count: data.categories, icon: <Layers size={16} />, color: '#0ea5e9', total: Math.max(data.categories, 30) },
                { label: 'Sub-Services', count: data.subServices, icon: <Sliders size={16} />, color: '#10b981', total: Math.max(data.subServices, 40) },
                { label: 'Destinations', count: data.destinations, icon: <Compass size={16} />, color: '#f59e0b', total: Math.max(data.destinations, 50) }
              ].map((m, idx) => {
                const percent = Math.min(100, Math.round((m.count / m.total) * 100)) || 10;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                        <span style={{ color: m.color }}>{m.icon}</span> {m.label}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '6px' }}>
                        {m.count}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percent}%`, background: m.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Security & Compliance Widget */}
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '20px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Passkey & Security Shield</h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Verified admin session protection</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Passkey authentication is active. Sensitive policy edits and administrative actions are protected by timed session authorization.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
