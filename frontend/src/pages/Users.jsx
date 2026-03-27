import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ActionDropdown from '../components/ActionDropdown';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserX,
  CheckCircle,
  X,
  LayoutGrid,
  List as ListIcon,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  Upload,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUsersRequest,
  deleteUserRequest,
  updateUserStatusRequest,
  addUserRequest,
  updateUserRequest
} from '../store/slices/usersSlice';

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.users);
  const { user: authUser } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentUser, setCurrentUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'User',
    password: '',
    avatar: null
  });

  useEffect(() => {
    dispatch(fetchUsersRequest());
  }, [dispatch]);



  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    if (type === 'edit' && user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '',
        avatar: null
      });
      setImagePreview(user.avatar);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'User',
        password: '',
        avatar: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    if (modalType === 'add') {
      dispatch(addUserRequest(data));
      showToast('User created successfully', 'success');
    } else {
      dispatch(updateUserRequest({ id: currentUser._id, data }));
      showToast('User updated successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (await confirm('Are you sure?', 'This will permanently delete this user account.')) {
      dispatch(deleteUserRequest(id));
      showToast('User deleted successfully', 'success');
    }
  };

  const toggleSuspension = async (user) => {
    const action = user.isSuspended ? 'unsuspend' : 'suspend';
    if (await confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} User?`, `Are you sure you want to ${action} ${user.name}?`)) {
      dispatch(updateUserStatusRequest({ id: user._id, isSuspended: !user.isSuspended }));
      showToast(`User ${action}ed successfully`, 'success');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.customId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = user.role === 'User';
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'suspended' ? user.isSuspended : !user.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  }).reverse();

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const allTravelers = users.filter(u => u.role === 'User');
  const roles = ['Admin', 'Sub-Admin', 'Vendor', 'Vendor-Staff', 'User'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Platform Users</h1>
          <p>Manage all registered accounts, roles, and access levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1e40af' }}><UserIcon size={24} /></div>
          <div className="stat-info"><h3>Total Travelers</h3><p>{allTravelers.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#166534' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Active Profiles</h3><p>{allTravelers.filter(u => !u.isSuspended).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#9f1239' }}><UserX size={24} /></div>
          <div className="stat-info"><h3>Suspended</h3><p>{allTravelers.filter(u => u.isSuspended).length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
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
                  { value: 'active', label: 'Active', color: '#16a34a' },
                  { value: 'suspended', label: 'Suspended', color: '#dc2626' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                width="160px"
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
        <p>Loading users...</p>
      ) : currentUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <UserIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No users found matching your criteria.</p>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="cards-grid mobile-slider">
              {currentUsers.map((user) => (
                <div key={user._id} className="card" style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name}
                        alt={user.name}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }}
                      />
                      {user.isOnline && (
                        <div style={{
                          position: 'absolute', bottom: '2px', right: '2px',
                          width: '12px', height: '12px', background: '#22c55e',
                          borderRadius: '50%', border: '2px solid white'
                        }}></div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{user.name}</h3>
                        {user.isOnline && (
                          <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700', textTransform: 'uppercase' }}>Online</span>
                        )}
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '11px' }}>{user.role}</span>
                      {user.isSuspended && <span className="badge badge-error" style={{ fontSize: '11px', marginLeft: '4px' }}>Suspended</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {user.email}
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Phone size={14} /> {user.phone}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Shield size={14} /> {user.customId}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created {new Date(user.createdAt).toLocaleDateString()}</div>
                    <div className="action-group">
                      <button onClick={() => navigate(`/users/view/${user._id}`)} className="action-btn view" title="View History"><Eye size={16} /></button>
                      <button onClick={() => toggleSuspension(user)} className={`action-btn ${user.isSuspended ? 'view' : 'delete'}`} title={user.isSuspended ? 'Unsuspend' : 'Suspend Account'}>
                        {user.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                      </button>
                      <button onClick={() => handleOpenModal('edit', user)} className="action-btn edit" title="Edit User"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(user._id)} className="action-btn delete" title="Delete User"><Trash2 size={16} /></button>
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
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px', width: '50px' }}>#</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px' }}>User</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px' }}>ID</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px' }}>Role</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {startIndex + index + 1}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                              <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                              {user.isOnline && (
                                <div style={{
                                  position: 'absolute', bottom: '0', right: '0',
                                  width: '10px', height: '10px', background: '#22c55e',
                                  borderRadius: '50%', border: '20% solid white', // using border trick for white ring
                                  boxShadow: '0 0 0 2px white'
                                }}></div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {user.name}
                                {user.isOnline && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{user.customId}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '11px' }}>{user.role}</span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span className={`badge ${user.isSuspended ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '11px' }}>
                            {user.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div className="action-group">
                            <button className="action-btn view" title="View History" onClick={() => navigate(`/users/view/${user._id}`)}>
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" title={user.isSuspended ? 'Unsuspend' : 'Suspend'} onClick={() => toggleSuspension(user)}>
                              {user.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                            </button>
                            <button className="action-btn" title="Edit User" onClick={() => handleOpenModal('edit', user)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn danger" title="Delete User" onClick={() => handleDelete(user._id)}>
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

          {!loading && currentUsers.length > 0 && (
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
        </>
      )}

      <Drawer isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'add' ? 'Add New User' : 'Edit User'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              className="form-control"
              value="User"
              readOnly
              style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
            />
          </div>

          {modalType === 'add' && (
            <div className="form-group">
              <label>Initial Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="form-group">
            <label>Profile Picture</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}
              onClick={() => document.getElementById('userAvatar').click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: 'auto' }} />
              ) : (
                <div style={{ padding: '12px' }}>
                  <Upload size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Click to upload avatar</p>
                </div>
              )}
              <input id="userAvatar" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}>
            {modalType === 'add' ? 'Create User' : 'Save Changes'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default Users;
