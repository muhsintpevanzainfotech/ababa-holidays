import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/constants';
import Pagination from '../components/Pagination';
import FilterSelect from '../components/FilterSelect';
import ActionDropdown from '../components/ActionDropdown';
import { useToast } from '../context/ToastContext';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import {
  Landmark,
  Building,
  Search,
  Copy,
  Check,
  FileText,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  CreditCard,
  X,
  Download,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Phone
} from 'lucide-react';

const VendorBanks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { vendors, loading } = useSelector((state) => state.vendors);

  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchVendorsRequest());
  }, [dispatch]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast('Copied', `${fieldName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter calculation
  const filteredVendors = vendors.filter((v) => {
    const bank = v.profile?.bankDetails || {};
    const company = v.profile?.companyName || '';
    const name = v.name || '';
    const email = v.email || '';
    
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bank.bankName && bank.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bank.accountNumber && bank.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bank.ifscCode && bank.ifscCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const hasBankDetails = Boolean(bank.accountNumber || bank.bankName);

    if (statusFilter === 'configured') return matchesSearch && hasBankDetails;
    if (statusFilter === 'missing') return matchesSearch && !hasBankDetails;
    return matchesSearch;
  }).reverse();

  // Statistics
  const totalVendors = vendors.length;
  const configuredBanks = vendors.filter((v) => Boolean(v.profile?.bankDetails?.accountNumber || v.profile?.bankDetails?.bankName)).length;
  const missingBanks = totalVendors - configuredBanks;
  const verifiedVendors = vendors.filter((v) => v.profile?.isApproved).length;

  // Pagination
  const totalItems = filteredVendors.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Vendor Bank Accounts</h1>
          <p>Overview of vendor settlement bank details, IFSC codes, account numbers, and proof documents</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/vendors')}>
          <Building size={18} /> View All Vendors
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
            <Landmark size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Vendors</h3>
            <p>{totalVendors}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Banks Configured</h3>
            <p>{configuredBanks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending Bank Info</h3>
            <p>{missingBanks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Verified Partners</h3>
            <p>{verifiedVendors}</p>
          </div>
        </div>
      </div>

      {/* CONTROLS & FILTER ROW CARD */}
      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search vendor, bank, A/C number, or IFSC..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && (
              <X
                size={16}
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }}
              />
            )}
          </div>

          <div className="filter-actions">
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'configured', label: 'Bank Details Added', color: '#16a34a' },
                  { value: 'missing', label: 'Bank Details Missing', color: '#d97706' }
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                width="190px"
              />
            </div>

            <div className="results-count">
              <span className="badge badge-primary">{totalItems}</span>
              <span style={{ marginLeft: '4px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
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

      {/* CONTENT: GRID VIEW OR LIST VIEW */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading vendor bank list...
        </div>
      ) : currentVendors.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Landmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5, margin: 'auto' }} />
          <h3 style={{ margin: '0 0 8px 0' }}>No Bank Accounts Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search query or status filter'
              : 'No vendor bank accounts have been registered yet'}
          </p>
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div className="cards-grid mobile-slider" style={{ marginBottom: '24px' }}>
          {currentVendors.map((vendor) => {
            const bank = vendor.profile?.bankDetails || {};
            const isConfigured = Boolean(bank.accountNumber || bank.bankName);
            const bankUploadUrl = bank.upload ? getImageUrl(bank.upload) : null;

            return (
              <div key={vendor._id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* TOP VENDOR INFO ROW */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'var(--bg-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '2px solid var(--border)',
                        flexShrink: 0
                      }}
                    >
                      {vendor.avatar && !vendor.avatar.includes('ui-avatars') ? (
                        <img
                          src={getImageUrl(vendor.avatar)}
                          alt={vendor.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                          {vendor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: 'var(--text-main)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onClick={() => navigate(`/vendors/view/${vendor._id}`)}
                      >
                        {vendor.name}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vendor.profile?.companyName || vendor.email}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {isConfigured ? (
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>Bank Added</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '10px' }}>Bank Pending</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BANK DETAILS BOX */}
                  <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Landmark size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-main)' }}>
                        {bank.bankName || 'Bank Name Not Added'}
                      </span>
                    </div>

                    {isConfigured ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        {bank.branch && (
                          <div style={{ color: 'var(--text-muted)' }}>
                            Branch: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{bank.branch}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle, rgba(0,0,0,0.02))', padding: '6px 10px', borderRadius: '8px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>A/C:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                              {bank.accountNumber || '—'}
                            </span>
                            {bank.accountNumber && (
                              <button
                                className="btn-icon"
                                title="Copy A/C"
                                style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                                onClick={() => handleCopy(bank.accountNumber, 'Account Number')}
                              >
                                {copiedId === bank.accountNumber ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle, rgba(0,0,0,0.02))', padding: '6px 10px', borderRadius: '8px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>IFSC:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary)' }}>
                              {bank.ifscCode || '—'}
                            </span>
                            {bank.ifscCode && (
                              <button
                                className="btn-icon"
                                title="Copy IFSC"
                                style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                                onClick={() => handleCopy(bank.ifscCode, 'IFSC Code')}
                              >
                                {copiedId === bank.ifscCode ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {bank.accountName && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                            Holder: <span style={{ fontWeight: '600' }}>{bank.accountName}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No settlement bank details have been added by vendor yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTTOM ACTIONS BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '8px' }}>
                  {bankUploadUrl ? (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px', gap: '6px' }}
                      onClick={() => setPreviewDoc({ url: bankUploadUrl, title: `${vendor.name} - Bank Proof` })}
                    >
                      <Eye size={14} /> Bank Proof
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Proof Doc</span>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ padding: '4px 12px', fontSize: '12px', gap: '6px' }}
                    onClick={() => navigate(`/vendors/view/${vendor._id}`)}
                  >
                    View Vendor <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor Partner</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bank Name & Branch</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>IFSC Code</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bank Proof</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVendors.map((vendor, index) => {
                  const bank = vendor.profile?.bankDetails || {};
                  const isConfigured = Boolean(bank.accountNumber || bank.bankName);
                  const bankUploadUrl = bank.upload ? getImageUrl(bank.upload) : null;

                  return (
                    <tr key={vendor._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {startIndex + index + 1}
                      </td>

                      {/* VENDOR PARTNER */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: 'var(--bg-subtle)',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--border)',
                              flexShrink: 0
                            }}
                          >
                            {vendor.avatar && !vendor.avatar.includes('ui-avatars') ? (
                              <img
                                src={getImageUrl(vendor.avatar)}
                                alt={vendor.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Building size={20} style={{ color: 'var(--text-muted)' }} />
                            )}
                          </div>
                          <div>
                            <div
                              style={{ fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}
                              onClick={() => navigate(`/vendors/view/${vendor._id}`)}
                            >
                              {vendor.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {vendor.profile?.companyName || vendor.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* BANK NAME & BRANCH */}
                      <td style={{ padding: '16px 24px' }}>
                        {isConfigured ? (
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                              {bank.bankName || 'N/A'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {bank.branch || 'Branch N/A'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Not Provided
                          </span>
                        )}
                      </td>

                      {/* ACCOUNT DETAILS */}
                      <td style={{ padding: '16px 24px' }}>
                        {bank.accountNumber ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.5px' }}>
                                {bank.accountNumber}
                              </span>
                              <button
                                className="btn-icon"
                                title="Copy Account Number"
                                style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                                onClick={() => handleCopy(bank.accountNumber, 'Account Number')}
                              >
                                {copiedId === bank.accountNumber ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                              </button>
                            </div>
                            {bank.accountName && (
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Holder: {bank.accountName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* IFSC CODE */}
                      <td style={{ padding: '16px 24px' }}>
                        {bank.ifscCode ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(var(--primary-rgb), 0.08)',
                                color: 'var(--primary)',
                                fontFamily: 'monospace'
                              }}
                            >
                              {bank.ifscCode}
                            </span>
                            <button
                              className="btn-icon"
                              title="Copy IFSC"
                              style={{ padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                              onClick={() => handleCopy(bank.ifscCode, 'IFSC Code')}
                            >
                              {copiedId === bank.ifscCode ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* BANK PROOF */}
                      <td style={{ padding: '16px 24px' }}>
                        {bankUploadUrl ? (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px', gap: '6px' }}
                            onClick={() => setPreviewDoc({ url: bankUploadUrl, title: `${vendor.name} - Bank Proof` })}
                          >
                            <Eye size={14} /> View Proof
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Doc</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: '16px 24px' }}>
                        {isConfigured ? (
                          <span className="badge badge-success" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={13} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={13} /> Missing
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <ActionDropdown
                          actions={[
                            {
                              label: 'View Vendor Profile',
                              icon: <ExternalLink size={14} />,
                              onClick: () => navigate(`/vendors/view/${vendor._id}`)
                            },
                            ...(isConfigured
                              ? [
                                  {
                                    label: 'Copy Full Bank Details',
                                    icon: <Copy size={14} />,
                                    onClick: () => {
                                      const text = `Bank: ${bank.bankName || 'N/A'}\nA/C Holder: ${bank.accountName || 'N/A'}\nA/C No: ${bank.accountNumber || 'N/A'}\nIFSC: ${bank.ifscCode || 'N/A'}\nBranch: ${bank.branch || 'N/A'}`;
                                      handleCopy(text, 'Full Bank Details');
                                    }
                                  }
                                ]
                              : [])
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {filteredVendors.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(num) => {
              setItemsPerPage(num);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle)'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{previewDoc.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', gap: '6px' }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  className="btn-icon"
                  onClick={() => setPreviewDoc(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewDoc.url} title="Bank Proof PDF" style={{ width: '100%', height: '500px', border: 'none' }} />
              ) : (
                <img
                  src={previewDoc.url}
                  alt="Bank Proof Document"
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBanks;
