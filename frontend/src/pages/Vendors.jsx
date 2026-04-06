import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  CreditCard,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Edit,
  Phone,
  Mail,
  Lock,
  Building,
  Upload,
  Eye,
  EyeOff,
  LayoutGrid,
  List as ListIcon,
  Power,
  ShieldCheck,
  Globe,
  Smartphone,
  Check
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchVendorsRequest,
  addVendorRequest,
  updateVendorRequest,
  deleteVendorRequest
} from '../store/slices/vendorsSlice';

const Vendors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendors, loading, error } = useSelector((state) => state.vendors);

  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchVendorsRequest());
  }, [dispatch]);

  const handleApprove = async (id) => {
    // Correctly structure the data for the backend userController
    dispatch(updateVendorRequest({ 
      id, 
      data: { 
        profile: JSON.stringify({ isApproved: true }) 
      } 
    }));
    showToast('Approved', 'Vendor account has been approved.', 'success');
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Vendor?',
      'Are you sure you want to delete this vendor account? This action is permanent and cannot be undone.'
    );

    if (isConfirmed) {
      dispatch(deleteVendorRequest(id));
      showToast('Deleted', 'Vendor account has been removed.', 'success');
    }
  };

  const handleToggleSuspension = async (vendor) => {
    const action = vendor.isSuspended ? 'unsuspend' : 'suspend';
    const isConfirmed = await confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Partner?`,
      `Are you sure you want to ${action} ${vendor.name}? They will lose access to the dashboard until reinstated.`
    );

    if (isConfirmed) {
      dispatch(updateVendorRequest({ id: vendor._id, data: { isSuspended: !vendor.isSuspended } }));
      showToast('Status Updated', `Vendor has been ${action}ed.`, 'success');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const isApproved = v.profile?.isApproved;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && isApproved) ||
      (statusFilter === 'pending' && !isApproved);
    return matchesSearch && matchesStatus;
  }).reverse();

  // Pagination calculations
  const totalItems = filteredVendors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Vendor Partners</h1>
          <p>Manage travel partners, approve accounts, and track status</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/vendors/create')}>
          <Plus size={20} /> Add Vendor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><Building size={24} /></div>
          <div className="stat-info"><h3>Total Partners</h3><p>{vendors.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Approved</h3><p>{vendors.filter(v => v.profile?.isApproved).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}><XCircle size={24} /></div>
          <div className="stat-info"><h3>Pending</h3><p>{vendors.filter(v => !v.profile?.isApproved).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}><UserX size={24} /></div>
          <div className="stat-info"><h3>Suspended</h3><p>{vendors.filter(v => v.isSuspended).length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search vendors by name or email..."
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
                  { value: 'all', label: 'All Status' },
                  { value: 'approved', label: 'Approved', color: '#16a34a' },
                  { value: 'pending', label: 'Pending Approval', color: '#d97706' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="180px"
              />
            </div>

            <div className="results-count">
              <span className="badge badge-primary">{totalItems}</span>
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
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading vendors...</p>
      ) : currentVendors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Building size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No vendors found matching filters.</p>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="cards-grid mobile-slider">
              {currentVendors.map((vendor) => (
                <div key={vendor._id} className="card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--bg-main)' }}>
                        {vendor.avatar && !vendor.avatar.includes('ui-avatars') ? (
                          <img src={getImageUrl(vendor.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px' }}>
                            {vendor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        position: 'absolute', bottom: '2px', right: '2px', 
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: vendor.isTrulyOnline ? '#22c55e' : '#94a3b8',
                        border: '2px solid white',
                        boxShadow: vendor.isTrulyOnline ? '0 0 10px rgba(34, 197, 94, 0.4)' : 'none'
                      }} className={vendor.isTrulyOnline ? 'pulse-green' : ''}></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{vendor.name}</h3>
                        <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: vendor.isTrulyOnline ? '#22c55e' : '#94a3b8' }}>
                           {vendor.isTrulyOnline ? 'Live' : 'Offline'}
                        </span>
                      </div>
                        <span className="badge badge-primary" style={{ fontSize: '10px' }}>{vendor.role}</span>
                        <span style={{ padding: '0 8px', borderRadius: '12px', fontSize: '10px', background: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>{vendor.profile?.subscriptionPlan || 'Free'}</span>
                        {vendor.profile?.subscription && (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '4px' }}>
                            {vendor.profile.subscription.crmEnabled && <ShieldCheck size={12} title="CRM" color="#22c55e" />}
                            {vendor.profile.subscription.websiteEnabled && <Globe size={12} title="Website" color="#3b82f6" />}
                          </div>
                        )}
                      </div>
                    </div>

                  {vendor.profile?.subscription && (
                    <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>U: {vendor.profile.subscription.userLimit === -1 ? '∞' : vendor.profile.subscription.userLimit}</span>
                      <span>P: {vendor.profile.subscription.packageLimit === -1 ? '∞' : vendor.profile.subscription.packageLimit}</span>
                      <span>S: {vendor.profile.subscription.staffLimit === -1 ? '∞' : vendor.profile.subscription.staffLimit}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{vendor.email}</span>
                    </div>
                    {vendor.profile?.companyName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Building size={14} /> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{vendor.profile.companyName}</span>
                      </div>
                    )}
                    {vendor.brand && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>
                         <ShieldCheck size={14} /> <span>{vendor.brand.title}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                        background: vendor.profile?.isApproved ? '#dcfce7' : '#fee2e2',
                        color: vendor.profile?.isApproved ? '#166534' : '#b91c1c'
                      }}>
                        {vendor.profile?.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created {new Date(vendor.createdAt).toLocaleDateString()}</div>
                    <div className="action-group">
                      <button className={`action-btn ${vendor.isSuspended ? 'view' : 'delete'}`} onClick={() => handleToggleSuspension(vendor)} title={vendor.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}>
                        {vendor.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                      </button>
                      <button className="action-btn" onClick={() => navigate(`/vendors/view/${vendor._id}`)} title="View Details"><Eye size={16} /></button>
                      <button className="action-btn edit" onClick={() => navigate(`/vendors/edit/${vendor._id}`)} title="Edit Account"><Edit size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(vendor._id)} title="Delete Account"><Trash2 size={16} /></button>
                    </div>
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
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approval</th>
                      <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVendors.map((vendor, index) => (
                      <tr key={vendor._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {startIndex + index + 1}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {vendor.avatar && !vendor.avatar.includes('ui-avatars') ? (
                                  <img src={getImageUrl(vendor.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                                    {vendor.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div style={{ 
                                position: 'absolute', bottom: '0', right: '0', 
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: vendor.isTrulyOnline ? '#22c55e' : '#94a3b8',
                                border: '2px solid white'
                              }}></div>
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', fontSize: '14px' }}>{vendor.name}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{vendor.email}</p>
                              {vendor.brand && (
                                <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>
                                  Brand: {vendor.brand.title}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="badge" style={{
                              background: vendor.profile?.subscriptionPlan === 'Free' ? '#f1f5f9' : '#dbeafe',
                              color: vendor.profile?.subscriptionPlan === 'Free' ? '#64748b' : '#1e40af',
                              width: 'fit-content'
                            }}>
                              {vendor.profile?.subscriptionPlan || 'Free'}
                            </span>
                            {vendor.profile?.subscription && (
                              <>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                  <span>U: {vendor.profile.subscription.userLimit === -1 ? '∞' : vendor.profile.subscription.userLimit}</span>
                                  <span>P: {vendor.profile.subscription.packageLimit === -1 ? '∞' : vendor.profile.subscription.packageLimit}</span>
                                  <span>S: {vendor.profile.subscription.staffLimit === -1 ? '∞' : vendor.profile.subscription.staffLimit}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                  {vendor.profile.subscription.crmEnabled && <ShieldCheck size={12} title="CRM" color="#22c55e" />}
                                  {vendor.profile.subscription.websiteEnabled && <Globe size={12} title="Website" color="#3b82f6" />}
                                  {vendor.profile.subscription.instagramReelsEnabled && <Smartphone size={12} title="Insta" color="#d946ef" />}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {vendor.isSuspended ? (
                              <span style={{
                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                background: '#fee2e2', color: '#b91c1c'
                              }}>Suspended</span>
                            ) : (
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: vendor.isVerified ? '#dcfce7' : '#fee2e2',
                                color: vendor.isVerified ? '#166534' : '#b91c1c'
                              }}>
                                {vendor.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {vendor.profile?.isApproved ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '13px' }}>
                              <CheckCircle size={16} /> Approved
                            </div>
                          ) : (
                            <button
                              className="btn"
                              style={{ padding: '4px 12px', fontSize: '12px', background: '#f8fafc', border: '1px solid var(--border)', width: 'auto' }}
                              onClick={() => handleApprove(vendor._id)}
                            >
                              Approve Now
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div className="action-group">
                            <button className={`action-btn ${vendor.isSuspended ? 'view' : 'delete'}`} title={vendor.isSuspended ? 'Unsuspend' : 'Suspend'} onClick={() => handleToggleSuspension(vendor)}>
                              {vendor.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                            </button>
                            <button className="action-btn" title="View Details" onClick={() => navigate(`/vendors/view/${vendor._id}`)}>
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" title="Edit Vendor" onClick={() => navigate(`/vendors/edit/${vendor._id}`)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn danger" title="Delete Partner" onClick={() => handleDelete(vendor._id)}>
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
        </>
      )}

      {!loading && currentVendors.length > 0 && (
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};

export default Vendors;
