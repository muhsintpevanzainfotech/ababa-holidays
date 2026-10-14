import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  UserCheck,
  Briefcase,
  CreditCard,
  X,
  Copy,
  Check,
  Search,
  Download,
  Share2,
  Send,
  Star,
  Award,
  Activity,
  TrendingUp,
  Clock,
  FileDown,
  Lock,
  ShieldAlert,
  Percent,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldQuestion,
  HelpCircle
} from 'lucide-react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const VendorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightbox, setLightbox] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Search queries for tabs
  const [packageSearch, setPackageSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Data for tabs
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reels, setReels] = useState([]);
  const [staff, setStaff] = useState([]);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied!', `${key} copied to clipboard`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApprove = async () => {
    try {
      const res = await api.put(`/vendors/${vendor._id}/approve`);
      if (res.data.success) {
        showToast('Vendor Approved', 'Vendor account successfully approved & activation email dispatched.', 'success');
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
      `${nextVerified ? 'Verify' : 'Revoke Verification'} Account?`,
      `Are you sure you want to mark ${vendor.name} as ${nextVerified ? 'Verified' : 'Unverified'}?`,
      {
        confirmText: nextVerified ? 'Verify Account' : 'Revoke Verification',
        variant: nextVerified ? 'success' : 'warning'
      }
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
      `${action.charAt(0).toUpperCase() + action.slice(1)} Vendor?`,
      `Are you sure you want to ${action} ${vendor.name}? ${vendor.isSuspended ? 'They will regain access to their dashboard.' : 'This will affect their ability to manage services.'}`,
      {
        confirmText: vendor.isSuspended ? 'Unsuspend Vendor' : 'Suspend Vendor',
        variant: vendor.isSuspended ? 'success' : 'warning'
      }
    );

    if (isConfirmed) {
      try {
        const res = await api.put(`/vendors/${vendor._id}`, { isSuspended: !vendor.isSuspended });
        if (res.data.success) {
          showToast('Status Updated', `Vendor has been ${action}ed successfully.`, 'success');
          setVendor(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
        }
      } catch (err) {
        showToast('Error', err.response?.data?.message || 'Failed to update suspension status', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vendors/${id}`);
        if (res.data.success) {
          setVendor(res.data.data);
        }
        
        // Fetch related vendor intelligence collections
        const [pkgRes, blogRes, bannerRes, testRes, enqRes, compRes, reelRes, staffRes] = await Promise.all([
          api.get(`/packages?vendor=${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/blogs/vendor/${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/banners/vendor/${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/testimonials?vendor=${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/enquiries?vendor=${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/complaints/user/${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/instagram-reels?vendor=${id}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/vendors/staff?vendorId=${id}`).catch(() => ({ data: { success: false, data: [] } }))
        ]);

        if (pkgRes.data?.success) setPackages(pkgRes.data.data);
        if (blogRes.data?.success) setBlogs(blogRes.data.data);
        if (bannerRes.data?.success) setBanners(bannerRes.data.data);
        if (testRes.data?.success) setTestimonials(testRes.data.data);
        if (enqRes.data?.success) setEnquiries(enqRes.data.data);
        if (compRes.data?.success) setComplaints(compRes.data.data);
        if (reelRes.data?.success) setReels(reelRes.data.data);
        if (staffRes?.data?.success) setStaff(staffRes.data.data);

      } catch (err) {
        showToast('Error', 'Failed to fetch vendor intelligence dossier', 'error');
        navigate('/vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id, navigate]);

  // Derived helpers
  const profile = vendor?.profile || {};
  const isApproved = profile.isApproved;
  const isVerified = vendor?.isVerified;
  const isSuspended = vendor?.isSuspended;

  const fullAddressText = useMemo(() => {
    if (!profile && !vendor) return 'Address not specified';
    if (typeof profile.address === 'object' && profile.address?.fullAddress) {
      return profile.address.fullAddress;
    }
    if (typeof profile.address === 'string' && profile.address) {
      return profile.address;
    }
    if (typeof vendor?.address === 'object' && vendor.address?.fullAddress) {
      return vendor.address.fullAddress;
    }
    const parts = [
      profile.address?.street || vendor?.address?.street,
      profile.address?.city || profile.city || vendor?.city,
      typeof profile.address?.state === 'object' ? profile.address.state?.name : (profile.address?.state || profile.state || vendor?.state),
      profile.address?.zipCode || profile.pincode || vendor?.pincode,
      typeof profile.address?.country === 'object' ? profile.address.country?.name : (profile.address?.country || profile.country || vendor?.country || 'India')
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  }, [profile, vendor]);

  const commissionRate = profile.packageCommission?.rate ?? (profile.commissionRate || 10);
  const commissionType = profile.packageCommission?.type || 'Percentage';

  // Filtered lists for tabs
  const filteredPackages = useMemo(() => {
    if (!packageSearch) return packages;
    return packages.filter(p => p.title?.toLowerCase().includes(packageSearch.toLowerCase()) || p.serviceCategory?.title?.toLowerCase().includes(packageSearch.toLowerCase()));
  }, [packages, packageSearch]);

  const filteredStaff = useMemo(() => {
    if (!staffSearch) return staff;
    return staff.filter(s => s.name?.toLowerCase().includes(staffSearch.toLowerCase()) || s.email?.toLowerCase().includes(staffSearch.toLowerCase()) || s.phone?.includes(staffSearch));
  }, [staff, staffSearch]);

  const filteredEnquiries = useMemo(() => {
    if (!enquirySearch) return enquiries;
    return enquiries.filter(e => e.name?.toLowerCase().includes(enquirySearch.toLowerCase()) || e.email?.toLowerCase().includes(enquirySearch.toLowerCase()) || e.package?.title?.toLowerCase().includes(enquirySearch.toLowerCase()));
  }, [enquiries, enquirySearch]);

  // Document extraction
  const gstDoc = profile.gst?.upload || profile.gstDoc || vendor?.gstDoc;
  const gstNumber = profile.gst?.number || profile.gstNumber || vendor?.gstNumber;
  const tinDoc = profile.tin?.upload || profile.panDoc || profile.tinDoc || vendor?.panDoc;
  const tinNumber = profile.tin?.number || profile.panNumber || profile.tinNumber || vendor?.panNumber;
  const bankDoc = profile.bankDetails?.upload || profile.bankDetails?.passbookDoc || profile.passbookDoc || vendor?.bankDetails?.passbookDoc;
  const idCardDoc = profile.idCard || vendor?.idCard;
  const tradeLicenseDoc = profile.tradeLicenseDoc || vendor?.tradeLicenseDoc;

  // Compliance score
  const complianceScore = useMemo(() => {
    let score = 0;
    if (gstNumber) score += 20;
    if (gstDoc) score += 15;
    if (tinNumber) score += 20;
    if (tinDoc) score += 15;
    if (profile.bankDetails?.accountNumber) score += 15;
    if (bankDoc) score += 15;
    return Math.min(score, 100);
  }, [gstNumber, gstDoc, tinNumber, tinDoc, profile.bankDetails, bankDoc]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '65vh', gap: '16px' }}>
      <div className="loader" style={{ width: '48px', height: '48px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      <p style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '15px', letterSpacing: '0.3px' }}>Synthesizing Vendor Intelligence...</p>
    </div>
  );

  if (!vendor) return null;

  return (
    <div className="fade-in" style={{ paddingBottom: '80px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => navigate('/vendors')}
            className="btn-icon"
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '14px', 
              border: '1px solid var(--border)', 
              background: 'var(--bg-card)', 
              color: 'var(--text-main)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            title="Return to Vendor Directory"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.8px' }}>
                Executive Intelligence Dossier
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                REF: {vendor.customId || vendor._id.substring(0, 10).toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '2px 0 0', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              {vendor.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Direct WhatsApp shortcut if phone exists */}
          {vendor.phone && (
            <a 
              href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="btn"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#16a34a',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={14} /> WhatsApp
            </a>
          )}

          {/* Quick Approval Action */}
          {!isApproved ? (
            <button 
              className="btn"
              onClick={handleApprove}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#fff', 
                fontWeight: '800', 
                borderRadius: '10px', 
                padding: '8px 16px', 
                fontSize: '12px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <CheckCircle size={15} /> Approve Partner
            </button>
          ) : (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#16a34a', 
              fontWeight: '800', 
              fontSize: '12px', 
              background: 'rgba(34, 197, 94, 0.12)', 
              border: '1px solid rgba(34, 197, 94, 0.25)', 
              padding: '8px 14px', 
              borderRadius: '10px' 
            }}>
              <CheckCircle size={15} color="#16a34a" /> Approved Partner
            </span>
          )}

          {/* Verification toggle */}
          <button 
            onClick={handleToggleVerification}
            className="btn"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              background: isVerified ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isVerified ? '#16a34a' : '#d97706',
              border: `1px solid ${isVerified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.35)'}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />} {isVerified ? 'Verified Account' : 'Verify Account'}
          </button>

          {/* Suspension toggle */}
          <button 
            onClick={handleToggleSuspension}
            className="btn"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              background: isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.12)',
              color: isSuspended ? '#ef4444' : 'var(--text-muted)',
              border: `1px solid ${isSuspended ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lock size={14} /> {isSuspended ? 'Suspended Account' : 'Active Account'}
          </button>

          {/* Print button */}
          <button 
            onClick={() => window.print()}
            className="btn"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Print / Save Vendor Intelligence Dossier"
          >
            <Printer size={14} /> Print Dossier
          </button>

          {/* Edit Vendor Button */}
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/vendors/edit/${vendor._id}`)}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Briefcase size={14} /> Edit Partner
          </button>
        </div>
      </div>

      {/* Hero Command Deck Header */}
      <div 
        style={{ 
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-premium)',
          marginBottom: '28px'
        }}
      >
        {/* Cover Banner Background with Gradient */}
        <div 
          style={{ 
            height: '180px', 
            width: '100%', 
            background: profile.coverBanner 
              ? `url(${getImageUrl(profile.coverBanner)}) center/cover no-repeat` 
              : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            position: 'relative'
          }}
        >
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)' 
            }} 
          />
          
          {/* Cover Overlay Info Tags */}
          <div style={{ position: 'absolute', top: '18px', right: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: '800', 
              background: 'rgba(0, 0, 0, 0.5)', 
              backdropFilter: 'blur(8px)', 
              color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Calendar size={12} /> Joined {new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <span style={{ 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: '800', 
              background: 'rgba(0, 0, 0, 0.5)', 
              backdropFilter: 'blur(8px)', 
              color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.15)' 
            }}>
              Tier: {profile.subscription?.title || profile.subscriptionPlan || 'Executive Partner'}
            </span>
          </div>
        </div>

        {/* Profile Details Bottom Section */}
        <div style={{ padding: '0 32px 28px', marginTop: '-60px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            
            {/* Avatar & Main Identity */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ 
                    width: '124px', 
                    height: '124px', 
                    borderRadius: '28px', 
                    background: 'var(--bg-card)', 
                    overflow: 'hidden', 
                    border: '4px solid var(--bg-card)', 
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {vendor.avatar ? (
                    <img src={getImageUrl(vendor.avatar)} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '900' }}>
                      {vendor.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                {isApproved && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-4px', 
                      right: '-4px', 
                      background: 'var(--bg-card)', 
                      padding: '3px', 
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }} 
                    title="Approved ABABA Travel Partner"
                  >
                    <CheckCircle size={24} color="#16a34a" fill="#22c55e" />
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>
                    {profile.companyName || vendor.name}
                  </h2>
                  <span style={{ 
                    padding: '3px 10px', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    background: 'rgba(var(--primary-rgb), 0.12)', 
                    color: 'var(--primary)',
                    border: '1px solid rgba(var(--primary-rgb), 0.25)' 
                  }}>
                    {profile.vendorType || profile.businessType || 'Travel Partner Agency'}
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>Managed by <strong>{vendor.name}</strong></span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="var(--primary)" /> 
                    {profile.address?.city || vendor.city || 'South India'}, {typeof profile.address?.country === 'object' ? profile.address.country?.name : (profile.address?.country || 'India')}
                  </span>
                </p>

                {/* Micro Action Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleCopy(vendor.email, 'Email')}
                    className="btn"
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      background: 'var(--bg-main)', 
                      color: 'var(--text-main)', 
                      border: '1px solid var(--border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Mail size={12} color="var(--text-muted)" /> {vendor.email}
                    {copiedKey === 'Email' ? <Check size={12} color="#16a34a" /> : <Copy size={11} color="var(--text-muted)" />}
                  </button>

                  {vendor.phone && (
                    <button 
                      onClick={() => handleCopy(vendor.phone, 'Phone')}
                      className="btn"
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: 'var(--bg-main)', 
                        color: 'var(--text-main)', 
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      <Phone size={12} color="var(--text-muted)" /> {vendor.phone}
                      {copiedKey === 'Phone' ? <Check size={12} color="#16a34a" /> : <Copy size={11} color="var(--text-muted)" />}
                    </button>
                  )}

                  {profile.websiteUrl && (
                    <a 
                      href={profile.websiteUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn"
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: 'var(--bg-main)', 
                        color: '#3b82f6', 
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Globe size={12} /> Visit Portal <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick KPI Stats Pill on Right */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '16px', 
                background: 'var(--bg-main)', 
                padding: '12px 18px', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                alignItems: 'center'
              }}
            >
              <div style={{ textAlign: 'center', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Compliance</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: complianceScore >= 80 ? '#16a34a' : '#f59e0b' }}>{complianceScore}%</span>
              </div>
              <div style={{ textAlign: 'center', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Rating</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Star size={14} fill="#f59e0b" /> {profile.rating || 4.9}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Commission</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                  {commissionRate}{commissionType === 'Flat' ? '₹' : '%'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Intelligence Metric Cards Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
          gap: '16px', 
          marginBottom: '28px' 
        }}
      >
        <div 
          className="card" 
          onClick={() => setActiveTab('packages')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'packages' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Tour Packages</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{packages.length}</span>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Active Catalog</span>
          </div>
        </div>

        <div 
          className="card" 
          onClick={() => setActiveTab('enquiries')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'enquiries' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Travel Leads</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{enquiries.length}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Inquiries</span>
          </div>
        </div>

        <div 
          className="card" 
          onClick={() => setActiveTab('staff')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'staff' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Operations Staff</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{staff.length}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Team Members</span>
          </div>
        </div>

        <div 
          className="card" 
          onClick={() => setActiveTab('compliance')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'compliance' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>KYC Documents</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>
              {[gstDoc, tinDoc, bankDoc, idCardDoc].filter(Boolean).length}/4
            </span>
            <span style={{ fontSize: '11px', color: complianceScore >= 80 ? '#16a34a' : '#f59e0b', fontWeight: '700' }}>
              {complianceScore >= 80 ? 'Verified' : 'Incomplete'}
            </span>
          </div>
        </div>

        <div 
          className="card" 
          onClick={() => setActiveTab('testimonials')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'testimonials' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Client Praise</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217, 70, 239, 0.12)', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Quote size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{testimonials.length}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Reviews</span>
          </div>
        </div>

        <div 
          className="card" 
          onClick={() => setActiveTab('disputes')} 
          style={{ 
            padding: '18px 20px', 
            cursor: 'pointer', 
            transition: 'var(--transition)',
            borderRadius: '18px',
            border: activeTab === 'disputes' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Dispute Rate</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: complaints.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: complaints.length > 0 ? '#dc2626' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: complaints.length > 0 ? '#dc2626' : '#16a34a' }}>{complaints.length}</span>
            <span style={{ fontSize: '11px', color: complaints.length > 0 ? '#dc2626' : '#16a34a', fontWeight: '700' }}>
              {complaints.length === 0 ? 'Zero Risk' : 'Open Cases'}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {[
          { id: 'overview', label: 'Executive Overview', icon: <Info size={16} /> },
          { id: 'compliance', label: 'Compliance & Financial Vault', icon: <ShieldCheck size={16} />, badge: complianceScore >= 80 ? '✓' : '!' },
          { id: 'staff', label: 'Staff & Security', icon: <Users size={16} />, count: staff.length },
          { id: 'packages', label: 'Tour Packages', icon: <Package size={16} />, count: packages.length },
          { id: 'enquiries', label: 'Leads & Enquiries', icon: <MessageSquare size={16} />, count: enquiries.length },
          { id: 'branding', label: 'Branding & Assets', icon: <Globe size={16} /> },
          { id: 'testimonials', label: 'Customer Reviews', icon: <Quote size={16} />, count: testimonials.length },
          { id: 'blogs', label: 'Articles & Blogs', icon: <FileText size={16} />, count: blogs.length },
          { id: 'highlights', label: 'Video Shows (Reels)', icon: <Smartphone size={16} />, count: reels.length },
          { id: 'disputes', label: 'Disputes & Claims', icon: <AlertCircle size={16} />, count: complaints.length }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: isActive ? '800' : '600',
                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)',
                boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.25)' : 'none'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span 
                  style={{ 
                    padding: '2px 7px', 
                    borderRadius: '10px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-main)',
                    color: isActive ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span 
                  style={{ 
                    padding: '1px 6px', 
                    borderRadius: '6px', 
                    fontSize: '10px', 
                    fontWeight: '900',
                    background: tab.badge === '✓' ? '#16a34a' : '#f59e0b',
                    color: '#fff'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* Legal Entity & Operational Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Briefcase size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Legal Entity Credentials</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                  Registered Agency
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Legal Business Name</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{profile.companyName || vendor.name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Entity Type</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{profile.vendorType || profile.businessType || 'Travel Partner'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>License / Reg. Number</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'monospace' }}>{profile.businessLicense || profile.registrationNumber || 'Not Specified'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Established Year</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{profile.establishedYear || '2024'}</p>
                </div>
              </div>

              {/* Description box */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Business Overview & Scope</p>
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-main)', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                  {profile.description || vendor.description || 'No detailed business overview provided yet.'}
                </div>
              </div>
            </div>

            {/* Single Point of Contact (SPOC) Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} color="#3b82f6" />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Executive SPOC</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                  Primary Signatory
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-main)', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
                  {(profile.spoc?.name || vendor.name)?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {profile.spoc?.name || vendor.name}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {profile.spoc?.designation || 'Managing Director / Partner Lead'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>SPOC Direct Mobile</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {profile.spoc?.phone || vendor.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>SPOC Official Email</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {profile.spoc?.email || vendor.email}
                  </p>
                </div>
              </div>

              {/* Location Summary */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Operational Location</p>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--text-main)', fontWeight: '600' }}>
                  {fullAddressText}
                </p>
              </div>
            </div>

            {/* Platform Partnership & Membership Plan Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} color="#8b5cf6" />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Commercial Terms & Tier</h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                  {profile.subscription?.title || 'Active Plan'}
                </span>
              </div>

              <div style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>Platform Commission Rate</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                    {commissionRate}{commissionType === 'Flat' ? ' ₹ Flat' : '% Per Booking'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Commission charged on verified customer checkout bookings.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Payout Schedule</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Weekly Auto-Settlement</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Service Radius</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Kerala / South India</p>
                </div>
              </div>
            </div>

          </div>

          {/* Authorized Service Categories */}
          <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Layers size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Authorized Tourism Service Categories</h3>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Array.isArray(profile.selectedServices) && profile.selectedServices.length > 0 ? (
                profile.selectedServices.map((srv, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      background: 'rgba(var(--primary-rgb), 0.08)',
                      border: '1px solid rgba(var(--primary-rgb), 0.2)',
                      color: 'var(--primary)',
                      fontWeight: '800',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Package size={14} />
                    {typeof srv === 'object' ? srv.title : srv}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  Standard authorized modules: Tour Packages, Day Excursions, Fleet Bookings.
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Compliance, Tax & Financial Vault */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Vault Header Banner */}
          <div 
            style={{ 
              padding: '24px', 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'var(--text-main)' }}>
                  KYC Verification & Settlement Financial Vault
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                Inspect uploaded compliance files, tax certificates, and verified payout banking credentials.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Compliance Status</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: complianceScore >= 80 ? '#16a34a' : '#f59e0b' }}>
                  {complianceScore}% Authenticated
                </span>
              </div>
            </div>
          </div>

          {/* Document Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* GST Certificate Card */}
            <div className="card" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TAX COMPLIANCE</span>
                <span style={{ 
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                  background: gstNumber ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: gstNumber ? '#16a34a' : '#ef4444'
                }}>
                  {gstNumber ? 'GST Registered' : 'Missing GST'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Goods & Services Tax (GSTIN)</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {gstNumber || 'Not Provided'}
                </p>
                {gstNumber && (
                  <button 
                    onClick={() => handleCopy(gstNumber, 'GST Number')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                    title="Copy GSTIN"
                  >
                    {copiedKey === 'GST Number' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              {gstDoc ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setLightbox({ src: getImageUrl(gstDoc), title: 'GST Registration Certificate' })}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> Preview Certificate
                  </button>
                  <a 
                    href={getImageUrl(gstDoc)} 
                    target="_blank" 
                    rel="noreferrer" 
                    download 
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Download original file"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No certificate document uploaded
                </div>
              )}
            </div>

            {/* TIN / PAN Card */}
            <div className="card" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DIRECT TAX ID</span>
                <span style={{ 
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                  background: tinNumber ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: tinNumber ? '#16a34a' : '#ef4444'
                }}>
                  {tinNumber ? 'PAN / TIN Linked' : 'Missing TIN'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Permanent Account No. (PAN/TIN)</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {tinNumber || 'Not Provided'}
                </p>
                {tinNumber && (
                  <button 
                    onClick={() => handleCopy(tinNumber, 'PAN Number')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                    title="Copy PAN"
                  >
                    {copiedKey === 'PAN Number' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              {tinDoc ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setLightbox({ src: getImageUrl(tinDoc), title: 'PAN / Tax Identification Card' })}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> Preview PAN Card
                  </button>
                  <a 
                    href={getImageUrl(tinDoc)} 
                    target="_blank" 
                    rel="noreferrer" 
                    download 
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No PAN document uploaded
                </div>
              )}
            </div>

            {/* National ID Card (Aadhaar/Passport) */}
            <div className="card" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LEGAL IDENTITY</span>
                <span style={{ 
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                  background: idCardDoc ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: idCardDoc ? '#16a34a' : '#ef4444'
                }}>
                  {idCardDoc ? 'Uploaded' : 'Pending Upload'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>National ID Card Proof</h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Government issued photo identity (Aadhaar / Passport / Voter ID).
              </p>
              {idCardDoc ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setLightbox({ src: getImageUrl(idCardDoc), title: 'National Identity Proof' })}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> Inspect ID Card
                  </button>
                  <a 
                    href={getImageUrl(idCardDoc)} 
                    target="_blank" 
                    rel="noreferrer" 
                    download 
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No National ID on file
                </div>
              )}
            </div>

            {/* Trade / Business License Proof */}
            <div className="card" style={{ padding: '20px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OPERATIONAL PERMIT</span>
                <span style={{ 
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                  background: tradeLicenseDoc ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                  color: tradeLicenseDoc ? '#16a34a' : 'var(--text-muted)'
                }}>
                  {tradeLicenseDoc ? 'License On File' : 'Optional'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Trade / Commercial License</h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Municipal trade authorization or Kerala Tourism accreditation.
              </p>
              {tradeLicenseDoc ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setLightbox({ src: getImageUrl(tradeLicenseDoc), title: 'Trade License Accreditation' })}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> View Trade License
                  </button>
                  <a 
                    href={getImageUrl(tradeLicenseDoc)} 
                    target="_blank" 
                    rel="noreferrer" 
                    download 
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No trade license document uploaded
                </div>
              )}
            </div>

          </div>

          {/* Verified Settlement Payout Bank Account Details */}
          <div className="card" style={{ padding: '28px', borderRadius: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={22} color="#8b5cf6" />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                  Designated Settlement Payout Bank Account
                </h3>
              </div>
              {bankDoc && (
                <button 
                  onClick={() => setLightbox({ src: getImageUrl(bankDoc), title: 'Bank Account Passbook / Cancelled Cheque Proof' })}
                  className="btn"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: '#8b5cf6',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={14} /> View Passbook Proof
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Bank Institution</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {profile.bankDetails?.bankName || vendor.bankDetails?.bankName || 'Not Configured'}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Account Beneficiary Name</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {profile.bankDetails?.accountName || profile.bankDetails?.accountHolderName || vendor.name}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Account Number</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {profile.bankDetails?.accountNumber || vendor.bankDetails?.accountNumber || 'Not Configured'}
                  </p>
                  {profile.bankDetails?.accountNumber && (
                    <button 
                      onClick={() => handleCopy(profile.bankDetails.accountNumber, 'Account Number')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                      title="Copy Account Number"
                    >
                      {copiedKey === 'Account Number' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>IFSC / Clearing Code</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {profile.bankDetails?.ifscCode || vendor.bankDetails?.ifscCode || 'Not Configured'}
                  </p>
                  {profile.bankDetails?.ifscCode && (
                    <button 
                      onClick={() => handleCopy(profile.bankDetails.ifscCode, 'IFSC')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                      title="Copy IFSC"
                    >
                      {copiedKey === 'IFSC' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Branch Location</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {profile.bankDetails?.branch || profile.bankDetails?.branchName || 'Main Branch'}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Account Type</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {profile.bankDetails?.accountType || 'Current / Business Account'}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Staff & Security Network */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Vendor Operational Staff ({staff.length})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Team members provisioned to manage packages, leads, and bookings under this vendor account.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search staff name or email..." 
                value={staffSearch} 
                onChange={(e) => setStaffSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-main)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Staff Member</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact Details</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Access Role</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Security Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Provisioned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length > 0 ? filteredStaff.map((member, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', overflow: 'hidden', flexShrink: 0 }}>
                            {member.avatar ? (
                              <img src={getImageUrl(member.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              member.name?.charAt(0)?.toUpperCase() || 'S'
                            )}
                          </div>
                          <div>
                            <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{member.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {member.customId || member._id?.substring(0, 10)}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} color="var(--text-muted)" /> {member.email}
                          </span>
                          {member.phone && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={13} /> {member.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                            background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', width: 'fit-content'
                          }}>
                            <UserCheck size={13} /> {member.role || 'Vendor-Staff'}
                          </span>
                          {Array.isArray(member.permissions) && member.permissions.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {member.permissions.map((perm, pIdx) => (
                                <span key={pIdx} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                  {perm.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard Access</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', width: 'fit-content',
                            background: member.isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: member.isSuspended ? '#ef4444' : '#22c55e',
                            border: `1px solid ${member.isSuspended ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                          }}>
                            {member.isSuspended ? 'Suspended' : 'Active Account'}
                          </span>
                          {member.isVerified && (
                            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>✓ Verified Email</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                          <Users size={48} opacity={0.25} />
                          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Staff Members Found</p>
                          <p style={{ margin: 0, fontSize: '13px' }}>This vendor has not added any staff or team members yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Package Catalog */}
      {activeTab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Cataloged Travel Packages ({packages.length})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Curated itineraries, trip packages, and tour offers published by this vendor.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search package title or category..." 
                value={packageSearch} 
                onChange={(e) => setPackageSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredPackages.length > 0 ? filteredPackages.map((pkg, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  padding: 0, 
                  borderRadius: '18px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ height: '160px', position: 'relative', background: 'var(--bg-main)' }}>
                  <img 
                    src={pkg.images?.[0] ? getImageUrl(pkg.images[0]) : (pkg.image ? getImageUrl(pkg.image) : '/default-package.jpg')} 
                    alt={pkg.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <span 
                    style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      left: '12px', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      background: 'rgba(0,0,0,0.65)', 
                      backdropFilter: 'blur(6px)', 
                      color: '#fff' 
                    }}
                  >
                    {pkg.serviceCategory?.title || 'Tour'}
                  </span>
                  <span 
                    style={{ 
                      position: 'absolute', 
                      bottom: '12px', 
                      right: '12px', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: '900', 
                      background: 'var(--primary)', 
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {pkg.title}
                    </h4>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {pkg.duration ? `${pkg.duration} Days` : 'Multi-day itinerary'} • Added {new Date(pkg.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: pkg.isActive ? '#16a34a' : 'var(--text-muted)' }}>
                      {pkg.isActive ? '● Live on Web' : '○ Draft Mode'}
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/packages/edit/${pkg._id}`)}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px' }}>
                <Package size={48} opacity={0.25} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Travel Packages Cataloged</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>This partner hasn't authored any tour packages yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Leads & Enquiries */}
      {activeTab === 'enquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                Active Leads & Booking Inquiries ({enquiries.length})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Direct customer booking inquiries forwarded to this vendor.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search lead inquirer or package..." 
                value={enquirySearch} 
                onChange={(e) => setEnquirySearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-main)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Traveler / Inquirer</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact Info</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Requested Package</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Message Excerpt</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Received Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.length > 0 ? filteredEnquiries.map((enq, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {enq.name}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{enq.email}</span>
                          {enq.phone && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{enq.phone}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--primary)' }}>
                        {enq.package?.title || 'General Travel Lead'}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {enq.message || 'No custom note provided'}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                          <MessageSquare size={48} opacity={0.25} />
                          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Active Leads or Inquiries</p>
                          <p style={{ margin: 0, fontSize: '13px' }}>This vendor has not received customer booking inquiries yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Branding & Assets */}
      {activeTab === 'branding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Multi-Format Brand Logos */}
            <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 16px', color: 'var(--text-main)' }}>
                Multi-Size Brand Logos
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Small Logo', url: profile.companylogos?.small || vendor.avatar },
                  { label: 'Medium Logo', url: profile.companylogos?.medium || vendor.avatar },
                  { label: 'Large Logo', url: profile.companylogos?.large || vendor.avatar }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>{item.label}</p>
                    <div 
                      style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.url ? 'pointer' : 'default' }}
                      onClick={() => item.url && setLightbox({ src: getImageUrl(item.url), title: item.label })}
                    >
                      {item.url ? (
                        <img src={getImageUrl(item.url)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No Asset</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media Matrix */}
            <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 16px', color: 'var(--text-main)' }}>
                Connected Social Profiles
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Official Website', url: profile.websiteUrl, icon: <Globe size={16} /> },
                  { name: 'Instagram', url: profile.socialLinks?.instagram, icon: <Smartphone size={16} /> },
                  { name: 'Facebook', url: profile.socialLinks?.facebook, icon: <Globe size={16} /> },
                  { name: 'LinkedIn', url: profile.socialLinks?.linkedin, icon: <Briefcase size={16} /> }
                ].map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {s.icon}
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{s.name}</span>
                    </div>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Open Link <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not Linked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SEO & Search Discovery */}
          <div className="card" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 12px', color: 'var(--text-main)' }}>
              SEO & Search Meta Discovery
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Meta Title</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {profile.seo?.metaTitle || `${vendor.name} - Official Travel Partner | ABABA Holidays`}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Meta Keywords</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {profile.seo?.metaKeywords || profile.seoKeywords || 'kerala tours, travel agency, tour packages'}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 7: Customer Reviews & Praise */}
      {activeTab === 'testimonials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {testimonials.length > 0 ? testimonials.map((t, idx) => (
            <div key={idx} className="card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {(t.name || t.customerName || 'C')?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{t.name || t.customerName || 'Verified Traveler'}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(t.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, sIdx) => (
                      <Star key={sIdx} size={14} fill={sIdx < (t.rating || 5) ? '#f59e0b' : 'transparent'} color="#f59e0b" />
                    ))}
                  </div>
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', margin: 0 }}>
                  "{t.comment || t.content || 'Excellent service and memorable travel experience.'}"
                </p>
              </div>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', borderRadius: '20px' }}>
              <Quote size={48} opacity={0.25} style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Customer Praise Recorded</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>There are no testimonials on file for this partner.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Blogs & Insights */}
      {activeTab === 'blogs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {blogs.length > 0 ? blogs.map((blog, idx) => (
            <div key={idx} className="card" style={{ padding: 0, borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ height: '150px', background: 'var(--bg-main)' }}>
                <img src={blog.image ? getImageUrl(blog.image) : '/default-blog.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{blog.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', borderRadius: '20px' }}>
              <FileText size={48} opacity={0.25} style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Published Articles</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>The partner has not authored destination guides yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Highlights & Video Shows (Reels) */}
      {activeTab === 'highlights' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {reels.length > 0 ? reels.map((reel, idx) => (
            <div key={idx} className="card" style={{ padding: 0, borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ height: '220px', background: '#000', position: 'relative' }}>
                {reel.video ? (
                  <video src={getImageUrl(reel.video)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted onMouseOver={(e) => e.target.play()} onMouseOut={(e) => e.target.pause()} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '8px' }}>
                    <Smartphone size={32} opacity={0.5} />
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>External Reel</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800' }}>{reel.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reel.caption}</p>
              </div>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', borderRadius: '20px' }}>
              <Smartphone size={48} opacity={0.25} style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No Agency Video Shows</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>The vendor has not uploaded travel reels yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 10: Disputes & Incident Claims */}
      {activeTab === 'disputes' && (
        <div className="card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-main)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Claim Role</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subject Partner</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Incident Subject</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Filed Date</th>
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
                      <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {isComplainant ? c.defendant?.name : c.complainant?.name}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                        {c.subject}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                          background: c.status === 'Resolved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: c.status === 'Resolved' ? '#16a34a' : '#f59e0b'
                        }}>
                          {c.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '64px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                        <ShieldCheck size={48} opacity={0.25} color="#16a34a" />
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>Impeccable Incident Track Record</p>
                        <p style={{ margin: 0, fontSize: '13px' }}>Zero dispute or complaint records on file for this partner.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Document & Image Viewer Overlay */}
      {lightbox && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(10px)'
          }}
          onClick={() => setLightbox(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '88vh',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{lightbox.title}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a 
                  href={lightbox.src} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <Download size={13} /> Download
                </a>
                <button 
                  onClick={() => setLightbox(null)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div style={{ padding: '24px', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#09090b', minWidth: '400px', minHeight: '300px' }}>
              {lightbox.src?.endsWith('.pdf') ? (
                <iframe src={lightbox.src} title={lightbox.title} style={{ width: '80vw', height: '70vh', border: 'none', borderRadius: '10px' }} />
              ) : (
                <img src={lightbox.src} alt={lightbox.title} style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '10px' }} />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorView;
