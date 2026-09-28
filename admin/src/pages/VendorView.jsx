import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Package, 
  FileText, 
  Quote, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Info,
  AlertCircle,
  Eye,
  Landmark,
  User,
  Briefcase,
  CreditCard,
  X
} from 'lucide-react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useSelector } from 'react-redux';

const VendorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightbox, setLightbox] = useState(null);

  const handleApprove = async () => {
    try {
      const res = await api.put(`/vendors/${vendor._id}/approve`);
      if (res.data.success) {
        showToast('Approved', 'Vendor account approved & activation email sent.', 'success');
        setVendor(prev => ({
          ...prev,
          profile: { ...(prev.profile || {}), isApproved: true }
        }));
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to approve vendor', 'error');
    }
  };

  const handleToggleVerification = async () => {
    const nextVerified = !vendor.isVerified;
    const isConfirmed = await confirm(
      `${nextVerified ? 'Verify' : 'Unverify'} Account?`,
      `Are you sure you want to mark ${vendor.name} as ${nextVerified ? 'Verified' : 'Unverified'}?`
    );

    if (isConfirmed) {
      try {
        const res = await api.put(`/vendors/${vendor._id}`, { isVerified: nextVerified });
        if (res.data.success) {
          showToast('Status Updated', `Vendor marked as ${nextVerified ? 'Verified' : 'Unverified'}.`, 'success');
          setVendor(prev => ({ ...prev, isVerified: nextVerified }));
        }
      } catch (err) {
        showToast('Error', err.response?.data?.message || 'Failed to update verification', 'error');
      }
    }
  };

  const handleToggleSuspension = async () => {
    const action = vendor.isSuspended ? 'unsuspend' : 'suspend';
    const isConfirmed = await confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Partner?`,
      `Are you sure you want to ${action} ${vendor.name}?`
    );

    if (isConfirmed) {
      try {
        const res = await api.put(`/vendors/${vendor._id}`, { isSuspended: !vendor.isSuspended });
        if (res.data.success) {
          showToast('Status Updated', `Vendor has been ${action}ed.`, 'success');
          setVendor(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
        }
      } catch (err) {
        showToast('Error', err.response?.data?.message || 'Failed to update suspension status', 'error');
      }
    }
  };
  
  // Data for tabs
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        // Fetch basic vendor profile
        const res = await api.get(`/vendors/${id}`);
        if (res.data.success) {
          setVendor(res.data.data);
        }
        
        // Fetch related data
        const [pkgRes, blogRes, bannerRes, testRes, enqRes, compRes, reelRes] = await Promise.all([
          api.get(`/packages?vendor=${id}`),
          api.get(`/blogs/vendor/${id}`),
          api.get(`/banners/vendor/${id}`),
          api.get(`/testimonials?vendor=${id}`),
          api.get(`/enquiries?vendor=${id}`),
          api.get(`/complaints/user/${id}`),
          api.get(`/instagram-reels?vendor=${id}`)
        ]);

        if (pkgRes.data.success) setPackages(pkgRes.data.data);
        if (blogRes.data.success) setBlogs(blogRes.data.data);
        if (bannerRes.data.success) setBanners(bannerRes.data.data);
        if (testRes.data.success) setTestimonials(testRes.data.data);
        if (enqRes.data.success) setEnquiries(enqRes.data.data);
        if (compRes.data.success) setComplaints(compRes.data.data);
        if (reelRes.data.success) setReels(reelRes.data.data);

      } catch (err) {
        showToast('Error', 'Failed to fetch vendor details', 'error');
        navigate('/vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id, navigate]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loader">Loading Vendor Intelligence...</div>
    </div>
  );

  if (!vendor) return null;

  return (
    <div className="fade-in">
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/vendors')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Vendor Intelligence</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Deep-dive analysis of partner performance and content.</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '40px', background: 'var(--bg-main)', overflow: 'hidden', border: '4px solid var(--bg-main)', boxShadow: 'var(--shadow-lg)' }}>
              {vendor.avatar ? (
                <img src={getImageUrl(vendor.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '900' }}>
                  {vendor.name.charAt(0)}
                </div>
              )}
            </div>
            {vendor.profile?.isApproved && (
              <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--bg-card)', padding: '4px', borderRadius: '50%' }}>
                <CheckCircle size={24} color="#16a34a" fill="rgba(34, 197, 94, 0.2)" />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>{vendor.name}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ height: '24px' }}>{vendor.profile?.companyName || 'Travel Partner'}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> Mumbai, India
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!vendor.profile?.isApproved ? (
                  <button 
                    className="btn" 
                    style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: '700', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleApprove}
                  >
                    <CheckCircle size={14} /> Approve Now
                  </button>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: '700', fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                    <CheckCircle size={14} color="#22c55e" /> Approved
                  </span>
                )}

                <span 
                  onClick={handleToggleVerification}
                  title="Click to toggle verification status"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: vendor.isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: vendor.isVerified ? '#22c55e' : '#ef4444',
                    border: `1px solid ${vendor.isVerified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    cursor: 'pointer'
                  }}
                >
                  {vendor.isVerified ? 'Verified' : 'Unverified'}
                </span>

                <button 
                  className="btn"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: vendor.isSuspended ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: vendor.isSuspended ? '#22c55e' : '#ef4444',
                    border: `1px solid ${vendor.isSuspended ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                  onClick={handleToggleSuspension}
                >
                  {vendor.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>

                <button className="btn btn-primary" onClick={() => navigate(`/vendors/edit/${vendor._id}`)}>Edit Profile</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Official</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{vendor.email}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Support Contact</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{vendor.phone || '+91 98765 43210'}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Status</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{vendor.isSuspended ? 'Suspended' : 'Healthy Activity'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="profile-stat-box" onClick={() => setActiveTab('packages')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Total Packages</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="#3b82f6" />
            </div>
          </div>
          <span className="stat-count">{packages.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('blogs')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Knowledge Base</span>
            <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#0ea5e9" />
            </div>
          </div>
          <span className="stat-count">{blogs.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('banners')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Offer Banners</span>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="#ec4899" />
            </div>
          </div>
          <span className="stat-count">{banners.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('testimonials')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Client Praise</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={20} color="#8b5cf6" />
            </div>
          </div>
          <span className="stat-count">{testimonials.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('enquiries')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Active Leads</span>
            <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} color="#f97316" />
            </div>
          </div>
          <span className="stat-count">{enquiries.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('highlights')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Web Shows</span>
            <div style={{ background: 'rgba(217, 70, 239, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color="#d946ef" />
            </div>
          </div>
          <span className="stat-count">{reels.length}</span>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="vendor-tab-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Info size={18} /> Overview</button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}><Package size={18} /> Packages ({packages.length})</button>
        <button className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}><FileText size={18} /> Blogs ({blogs.length})</button>
        <button className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}><Globe size={18} /> Banners ({banners.length})</button>
        <button className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}><Quote size={18} /> Testimonials ({testimonials.length})</button>
        <button className={`tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`} onClick={() => setActiveTab('enquiries')}><MessageSquare size={18} /> Enquiries ({enquiries.length})</button>
        <button className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`} onClick={() => setActiveTab('highlights')}><Smartphone size={18} /> Highlights ({reels.length})</button>
        <button className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`} onClick={() => setActiveTab('disputes')}><AlertCircle size={18} /> Disputes ({complaints.length})</button>
      </div>

      {/* Tab Content Areas */}
      <div className="tab-content" style={{ paddingBottom: '60px' }}>
        
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Grid: Business Profile & Subscription Tier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Business Credentials Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <Briefcase size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Business Credentials</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '18px' }}>
                  {[
                    { label: 'Company Name', value: vendor.profile?.companyName || vendor.companyName || 'Not Specified' },
                    { label: 'Account ID', value: vendor.customId || vendor._id },
                    { label: 'Business Type', value: vendor.profile?.businessType || vendor.businessType || 'Travel Agency' },
                    { label: 'Year Established', value: vendor.profile?.establishedYear || vendor.establishedYear || 'N/A' },
                    { label: 'Reg. / License No.', value: vendor.profile?.registrationNumber || vendor.registrationNumber || 'N/A' },
                    { label: 'Account Role', value: vendor.role || 'vendor' },
                    { label: 'Registered Date', value: new Date(vendor.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { label: 'Email Verified', value: vendor.isVerified ? 'Verified' : 'Pending' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-word' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>About Vendor / Business Overview</p>
                  <div style={{ 
                    padding: '14px 16px', 
                    borderRadius: '12px', 
                    background: 'var(--bg-main)', 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-line' 
                  }}>
                    {vendor.profile?.description || vendor.description || 'No detailed business overview provided yet.'}
                  </div>
                </div>
              </div>

              {/* SPOC / Primary Contact Person */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <User size={20} color="#3b82f6" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Primary Contact (SPOC)</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '18px' }}>
                  {[
                    { label: 'Contact Name', value: vendor.profile?.spocName || vendor.name || 'N/A' },
                    { label: 'Designation', value: vendor.profile?.spocDesignation || 'Managing Director' },
                    { label: 'Primary Phone', value: vendor.phone || vendor.profile?.spocPhone || 'N/A' },
                    { label: 'Alternate Mobile', value: vendor.profile?.spocAltPhone || vendor.alternatePhone || 'N/A' },
                    { label: 'Official Email', value: vendor.email || 'N/A' },
                    { label: 'Support Email', value: vendor.profile?.supportEmail || vendor.email || 'N/A' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-word' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Headquarters / Operational Address</p>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-main)', fontSize: '13px', lineHeight: '1.5' }}>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>
                      {typeof vendor.profile?.address === 'object'
                        ? (vendor.profile.address.fullAddress || vendor.profile.address.street || 'Address not specified')
                        : (typeof vendor.address === 'object'
                          ? (vendor.address.fullAddress || vendor.address.street || 'Address not specified')
                          : (vendor.profile?.address || vendor.address || 'Address not specified'))}
                    </p>
                    {(vendor.profile?.city || vendor.city || vendor.profile?.state || vendor.state || vendor.profile?.address?.city || vendor.profile?.address?.state) && (
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
                        {[
                          vendor.profile?.city || vendor.profile?.address?.city || vendor.city,
                          typeof vendor.profile?.state === 'object' ? vendor.profile?.state?.name : (vendor.profile?.state || vendor.profile?.address?.state || vendor.state),
                          vendor.profile?.pincode || vendor.profile?.address?.zipCode || vendor.pincode,
                          typeof vendor.profile?.country === 'object' ? vendor.profile?.country?.name : (vendor.profile?.country || vendor.profile?.address?.country || vendor.country || 'India')
                        ].filter(val => val && typeof val === 'string').join(', ')}
                      </p>
                    )}
                    {vendor.profile?.googleMapsUrl && (
                      <a href={vendor.profile.googleMapsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#3b82f6', fontWeight: '700' }}>
                        <ExternalLink size={12} /> Open on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Grid: Tax Documents & Bank Account Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Tax & Verification Documents */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <ShieldCheck size={20} color="#16a34a" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Tax & Compliance Documents</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* GST Document */}
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>GSTIN Number</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {vendor.profile?.gstNumber || vendor.gstNumber || 'Not Provided'}
                      </p>
                    </div>
                    {(vendor.profile?.gstDoc || vendor.gstDoc) && (
                      <button 
                        onClick={() => setLightbox({ src: getImageUrl(vendor.profile?.gstDoc || vendor.gstDoc), title: 'GST Certificate Proof' })}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={14} /> View Proof
                      </button>
                    )}
                  </div>

                  {/* PAN Document */}
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>PAN Number</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {vendor.profile?.panNumber || vendor.panNumber || 'Not Provided'}
                      </p>
                    </div>
                    {(vendor.profile?.panDoc || vendor.panDoc) && (
                      <button 
                        onClick={() => setLightbox({ src: getImageUrl(vendor.profile?.panDoc || vendor.panDoc), title: 'PAN Card Proof' })}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={14} /> View Proof
                      </button>
                    )}
                  </div>

                  {/* Trade License / Reg Certificate */}
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Trade License / Registration</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {vendor.profile?.tradeLicenseNo || vendor.tradeLicenseNo || 'Not Provided'}
                      </p>
                    </div>
                    {(vendor.profile?.tradeLicenseDoc || vendor.tradeLicenseDoc) && (
                      <button 
                        onClick={() => setLightbox({ src: getImageUrl(vendor.profile?.tradeLicenseDoc || vendor.tradeLicenseDoc), title: 'Trade License Proof' })}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={14} /> View Proof
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Settlement Bank Account Details */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <Landmark size={20} color="#8b5cf6" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Settlement Bank Account</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                  {[
                    { label: 'Bank Name', value: vendor.profile?.bankDetails?.bankName || vendor.bankDetails?.bankName || 'N/A' },
                    { label: 'Account Holder', value: vendor.profile?.bankDetails?.accountHolderName || vendor.bankDetails?.accountHolderName || 'N/A' },
                    { label: 'Account Number', value: vendor.profile?.bankDetails?.accountNumber || vendor.bankDetails?.accountNumber || 'N/A' },
                    { label: 'IFSC Code', value: vendor.profile?.bankDetails?.ifscCode || vendor.bankDetails?.ifscCode || 'N/A' },
                    { label: 'Branch Name', value: vendor.profile?.bankDetails?.branchName || vendor.bankDetails?.branchName || 'N/A' },
                    { label: 'Account Type', value: vendor.profile?.bankDetails?.accountType || vendor.bankDetails?.accountType || 'Current' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-word' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {(vendor.profile?.bankDetails?.passbookDoc || vendor.bankDetails?.passbookDoc) && (
                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Bank Account Proof (Cancelled Cheque / Passbook)</span>
                    <button 
                      onClick={() => setLightbox({ src: getImageUrl(vendor.profile?.bankDetails?.passbookDoc || vendor.bankDetails?.passbookDoc), title: 'Bank Account Proof' })}
                      style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: 'none', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Eye size={14} /> View Passbook Proof
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Grid: Branding, Services & SEO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Branding & Logos Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <Globe size={20} color="#ec4899" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Company Branding & Assets</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Brand Logo</p>
                    <div 
                      style={{ width: '100%', height: '110px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => vendor.avatar && setLightbox({ src: getImageUrl(vendor.avatar), title: `${vendor.name} Logo` })}
                    >
                      {vendor.avatar ? (
                        <img src={getImageUrl(vendor.avatar)} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Logo Uploaded</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Trade Cover Banner</p>
                    <div 
                      style={{ width: '100%', height: '110px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => (vendor.profile?.coverBanner || vendor.coverBanner) && setLightbox({ src: getImageUrl(vendor.profile?.coverBanner || vendor.coverBanner), title: 'Cover Banner' })}
                    >
                      {(vendor.profile?.coverBanner || vendor.coverBanner) ? (
                        <img src={getImageUrl(vendor.profile?.coverBanner || vendor.coverBanner)} alt="Cover Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Cover Banner</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Social Media Profiles</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {vendor.profile?.websiteUrl && (
                      <a href={vendor.profile.websiteUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} /> Website
                      </a>
                    )}
                    {vendor.profile?.socialLinks?.instagram && (
                      <a href={vendor.profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                        Instagram
                      </a>
                    )}
                    {vendor.profile?.socialLinks?.facebook && (
                      <a href={vendor.profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                        Facebook
                      </a>
                    )}
                    {vendor.profile?.socialLinks?.linkedin && (
                      <a href={vendor.profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                        LinkedIn
                      </a>
                    )}
                    {!vendor.profile?.websiteUrl && !vendor.profile?.socialLinks?.instagram && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No social profiles linked yet.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Authorized Services & Categories */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <Package size={20} color="#0ea5e9" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Authorized Travel Services</h3>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {(vendor.profile?.services || ['Tour Packages', 'Hotel Bookings', 'Cab Rentals', 'Flight Booking']).map((srv, idx) => (
                    <span 
                      key={idx}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        background: 'rgba(14, 165, 233, 0.12)', 
                        color: '#0ea5e9',
                        border: '1px solid rgba(14, 165, 233, 0.25)' 
                      }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>SEO Meta Keywords</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {vendor.profile?.seoKeywords || 'travel agency, tour packages, holidays, destination guide, booking partner'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'packages' && (
          <div className="card" style={{ padding: 0 }}>
             <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--bg-main)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Package Name</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Category</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Price</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Added Date</th>
                      </tr>
                   </thead>
                   <tbody>
                      {packages.length > 0 ? packages.map((pkg, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px', fontWeight: '700' }}>{pkg.title}</td>
                           <td style={{ padding: '16px 24px' }}><span className="badge badge-primary">{pkg.serviceCategory?.title || 'Travel'}</span></td>
                           <td style={{ padding: '16px 24px', fontWeight: '800' }}>₹{pkg.price}</td>
                           <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(pkg.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                              <Package size={48} opacity={0.2} />
                              <p style={{ margin: 0, fontWeight: '600' }}>No Packages Cataloged</p>
                              <p style={{ margin: 0, fontSize: '13px' }}>This vendor hasn't published any travel packages yet.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="cards-grid">
             {blogs.length > 0 ? blogs.map((blog, idx) => (
                <div key={idx} className="card" style={{ padding: '16px' }}>
                   <img src={blog.image ? getImageUrl(blog.image) : '/default-blog.jpg'} alt="" style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover', marginBottom: '16px' }} />
                   <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800' }}>{blog.title}</h4>
                   <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(blog.createdAt).toLocaleDateString()}</p>
                </div>
             )) : (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                     <FileText size={48} opacity={0.2} />
                     <p style={{ margin: 0, fontWeight: '600' }}>Knowledge Base Empty</p>
                     <p style={{ margin: 0, fontSize: '13px' }}>No articles or travel tips have been authored by this partner.</p>
                   </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="cards-grid">
             {banners.length > 0 ? banners.map((banner, idx) => (
                <div key={idx} className="card" style={{ padding: '16px' }}>
                   <img src={banner.image ? getImageUrl(banner.image) : '/default-banner.jpg'} alt="" style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover', marginBottom: '16px' }} />
                   <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>{banner.title}</h4>
                   <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)' }}>{banner.description}</p>
                   <span className={`badge ${banner.isActive ? 'badge-success' : 'badge-secondary'}`}>{banner.isActive ? 'Active' : 'Inactive'}</span>
                </div>
             )) : (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                      <Globe size={48} opacity={0.2} />
                      <p style={{ margin: 0, fontWeight: '600' }}>No Promotional Banners</p>
                      <p style={{ margin: 0, fontSize: '13px' }}>This vendor has not published any promotional offer banners yet.</p>
                   </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="cards-grid">
             {testimonials.length > 0 ? testimonials.map((t, idx) => (
                <div key={idx} className="card" style={{ padding: '24px' }}>
                   <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden' }}>
                         <img src={`https://ui-avatars.com/api/?name=${t.name || t.customerName || 'Customer'}`} alt="" />
                      </div>
                      <div>
                         <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{t.name || t.customerName || 'Customer'}</h4>
                         <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Rated: {t.rating}/5</p>
                      </div>
                   </div>
                   <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-main)', margin: 0 }}>"{t.comment || t.content}"</p>
                </div>
             )) : (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                     <Quote size={48} opacity={0.2} />
                     <p style={{ margin: 0, fontWeight: '600' }}>No Client Feedback</p>
                     <p style={{ margin: 0, fontSize: '13px' }}>There are no testimonials recorded for this vendor yet.</p>
                   </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'enquiries' && (
           <div className="card" style={{ padding: 0 }}>
             <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--bg-main)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Inquirer</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Email</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Package Interested</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Date</th>
                      </tr>
                   </thead>
                   <tbody>
                      {enquiries.length > 0 ? enquiries.map((enq, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px', fontWeight: '700' }}>{enq.name}</td>
                           <td style={{ padding: '16px 24px' }}>{enq.email}</td>
                           <td style={{ padding: '16px 24px', fontWeight: '600' }}>{enq.package?.title || 'General Enquiry'}</td>
                           <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(enq.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '64px 24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                              <MessageSquare size={48} opacity={0.2} />
                              <p style={{ margin: 0, fontWeight: '600' }}>No Active Enquiries</p>
                              <p style={{ margin: 0, fontSize: '13px' }}>This vendor has not received any leads or inquiries through the portal.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="card" style={{ padding: 0 }}>
             <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'var(--bg-main)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Incident Role</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Subject Partner</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Incident Subject</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px' }}>Filed Date</th>
                      </tr>
                   </thead>
                   <tbody>
                      {complaints.length > 0 ? complaints.map((c, idx) => {
                        const isComplainant = c.complainant?._id === id;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px 24px' }}>
                               <span style={{ 
                                 padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', 
                                 background: isComplainant ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                                 color: isComplainant ? '#60a5fa' : '#f87171',
                                 border: `1px solid ${isComplainant ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                               }}>
                                 {isComplainant ? 'COMPLAINANT' : 'DEFENDANT'}
                               </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                               <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{isComplainant ? c.defendant?.name : c.complainant?.name}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isComplainant ? c.defendant?.role : c.complainant?.role}</span>
                               </div>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{c.subject}</td>
                            <td style={{ padding: '16px 24px' }}>
                               <span style={{ 
                                 padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                 background: c.status === 'Resolved' ? 'rgba(34, 197, 94, 0.15)' : c.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                 color: c.status === 'Resolved' ? '#4ade80' : c.status === 'Pending' ? '#fbbf24' : '#cbd5e1'
                               }}>
                                 {c.status.toUpperCase()}
                               </span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No dispute records on file for this partner.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}


        {activeTab === 'highlights' && (
          <div className="cards-grid">
             {reels.length > 0 ? reels.map((reel, idx) => (
                <div key={idx} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '200px', background: '#000', position: 'relative', overflow: 'hidden' }}>
                    {reel.video ? (
                      <video src={getImageUrl(reel.video)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted onMouseOver={(e) => e.target.play()} onMouseOut={(e) => e.target.pause()} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '8px' }}>
                         <Smartphone size={32} opacity={0.5} />
                         <span style={{ fontSize: '10px', opacity: 0.8 }}>External Reel</span>
                         {reel.reelUrl && (
                            <a href={reel.reelUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ fontSize: '9px', padding: '2px 8px' }}>
                               View on Insta
                            </a>
                         )}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800' }}>{reel.title}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', height: '30px', overflow: 'hidden' }}>{reel.caption}</p>
                  </div>
                </div>
             )) : (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                     <Smartphone size={48} opacity={0.2} />
                     <p style={{ margin: 0, fontWeight: '600' }}>No Agency Highlights</p>
                     <p style={{ margin: 0, fontSize: '13px' }}>The vendor hasn’t uploaded any reels or highlights yet.</p>
                   </div>
                </div>
             )}
          </div>
        )}

      </div>

      {/* Lightbox Document & Image Viewer Overlay */}
      {lightbox && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setLightbox(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{lightbox.title}</h3>
              <button 
                onClick={() => setLightbox(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#09090b' }}>
              <img src={lightbox.src} alt={lightbox.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorView;
