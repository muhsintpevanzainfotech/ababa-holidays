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
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { useSelector } from 'react-redux';

const VendorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data for tabs
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
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
        const [pkgRes, blogRes, testRes, enqRes, compRes, reelRes] = await Promise.all([
          api.get(`/packages?vendor=${id}`),
          api.get(`/blogs?author=${id}`), // Assuming blogs filter by author (vendor ID)
          api.get(`/testimonials?vendor=${id}`),
          api.get(`/enquiries?vendor=${id}`),
          api.get(`/complaints/user/${id}`),
          api.get(`/instagram-reels?vendor=${id}`)
        ]);

        if (pkgRes.data.success) setPackages(pkgRes.data.data);
        if (blogRes.data.success) setBlogs(blogRes.data.data);
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
          style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
            <div style={{ width: '140px', height: '140px', borderRadius: '40px', background: '#f8fafc', overflow: 'hidden', border: '4px solid var(--bg-main)', boxShadow: 'var(--shadow-lg)' }}>
              {vendor.avatar ? (
                <img src={getImageUrl(vendor.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '900' }}>
                  {vendor.name.charAt(0)}
                </div>
              )}
            </div>
            {vendor.profile?.isApproved && (
              <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'white', padding: '4px', borderRadius: '50%' }}>
                <CheckCircle size={24} color="#16a34a" fill="#dcfce7" />
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => navigate(`/vendors/edit/${vendor._id}`)}>Edit Profile</button>
                <button className="action-btn" title="Launch Website"><ExternalLink size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Official</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{vendor.email}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.05)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Support Contact</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{vendor.phone || '+91 98765 43210'}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.05)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={18} /></div>
                <div><p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Status</p><p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{vendor.isSuspended ? 'Suspended' : 'Healthy Activity'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="profile-stat-box" onClick={() => setActiveTab('packages')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Total Packages</span>
            <Package size={20} color="var(--primary)" opacity={0.5} />
          </div>
          <span>{packages.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('blogs')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Knowledge Base</span>
            <FileText size={20} color="#0ea5e9" opacity={0.5} />
          </div>
          <span>{blogs.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('testimonials')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Client Praise</span>
            <Quote size={20} color="#8b5cf6" opacity={0.5} />
          </div>
          <span>{testimonials.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('enquiries')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Active Leads</span>
            <MessageSquare size={20} color="#f97316" opacity={0.5} />
          </div>
          <span>{enquiries.length}</span>
        </div>
        <div className="profile-stat-box" onClick={() => setActiveTab('highlights')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Web Shows</span>
            <Smartphone size={20} color="#d946ef" opacity={0.5} />
          </div>
          <span>{reels.length}</span>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="vendor-tab-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Info size={18} /> Overview</button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}><Package size={18} /> Packages ({packages.length})</button>
        <button className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}><FileText size={18} /> Blogs ({blogs.length})</button>
        <button className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}><Quote size={18} /> Testimonials ({testimonials.length})</button>
        <button className={`tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`} onClick={() => setActiveTab('enquiries')}><MessageSquare size={18} /> Enquiries ({enquiries.length})</button>
        <button className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`} onClick={() => setActiveTab('highlights')}><Smartphone size={18} /> Highlights ({reels.length})</button>
        <button className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`} onClick={() => setActiveTab('disputes')}><AlertCircle size={18} /> Disputes ({complaints.length})</button>
      </div>

      {/* Tab Content Areas */}
      <div className="tab-content" style={{ paddingBottom: '60px' }}>
        
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
             <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Business Credentials</h3>
                <div style={{ display: 'grid', gap: '24px' }}>
                   {[
                     { label: 'Company Name', value: vendor.profile?.companyName || 'Not Set' },
                     { label: 'Account ID', value: vendor.customId || vendor._id },
                     { label: 'Registered On', value: new Date(vendor.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) },
                     { label: 'Account Role', value: vendor.role }
                   ].map((item, id) => (
                     <div key={id}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{item.value}</p>
                     </div>
                   ))}
                </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                   <Smartphone size={20} />
                   <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Subscription Tier</h4>
                 </div>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{vendor.profile?.subscriptionPlan?.toUpperCase() || 'FREE'}</h2>
                 <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px' }}>Currently active license for the travel portal.</p>
                 <button className="btn btn-primary btn-block" style={{ background: 'white', color: 'var(--text-main)' }}>Change Plan</button>
               </div>
               
               <div className="card">
                 <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Quick Meta</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Verified Entity</span>
                       <span style={{ fontWeight: '700', color: '#16a34a' }}>{vendor.isVerified ? 'YES' : 'NO'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Staff Members</span>
                                               <span style={{ fontWeight: '700' }}>{vendor.profile?.subscription?.staffLimit === -1 ? '∞' : (vendor.profile?.subscription?.staffLimit || 0)}</span>
                    </div>
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

        {activeTab === 'testimonials' && (
          <div className="cards-grid">
             {testimonials.length > 0 ? testimonials.map((t, idx) => (
                <div key={idx} className="card" style={{ padding: '24px' }}>
                   <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden' }}>
                         <img src={`https://ui-avatars.com/api/?name=${t.customerName}`} alt="" />
                      </div>
                      <div>
                         <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{t.customerName}</h4>
                         <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Rated: {t.rating}/5</p>
                      </div>
                   </div>
                   <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-main)', margin: 0 }}>"{t.content}"</p>
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
                                 padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', 
                                 background: isComplainant ? '#eff6ff' : '#fff1f2', 
                                 color: isComplainant ? '#1d4ed8' : '#9f1239',
                                 border: `1px solid ${isComplainant ? '#3b82f630' : '#ef444430'}`
                               }}>
                                 {isComplainant ? 'COMPLAINANT' : 'DEFENDANT'}
                               </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                               <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{isComplainant ? c.defendant?.name : c.complainant?.name}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isComplainant ? c.defendant?.role : c.complainant?.role}</span>
                               </div>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600' }}>{c.subject}</td>
                            <td style={{ padding: '16px 24px' }}>
                               <span style={{ 
                                 padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                                 background: c.status === 'Resolved' ? '#f0fdf4' : c.status === 'Pending' ? '#fffbeb' : '#f1f5f9',
                                 color: c.status === 'Resolved' ? '#166534' : c.status === 'Pending' ? '#92400e' : '#475569'
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
    </div>
  );
};

export default VendorView;
