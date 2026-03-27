import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Package as PackageIcon,
  Edit, 
  Trash2, 
  X,
  LayoutGrid,
  List as ListIcon,
  Power,
  CheckCircle,
  UserX,
  Filter,
  MoreVertical,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
  Globe,
  FileText,
  Layers,
  PlusCircle
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import FormSelect from '../components/FormSelect';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchPackagesRequest, 
  addPackageRequest, 
  updatePackageRequest, 
  deletePackageRequest 
} from '../store/slices/packagesSlice';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const Packages = () => {
  const dispatch = useDispatch();
  const { packages, loading, error } = useSelector((state) => state.packages);
  const { services } = useSelector((state) => state.services);
  const { vendors } = useSelector((state) => state.vendors);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentPkg, setCurrentPkg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itinerary: '',
    price: 0,
    duration: '',
    location: '',
    serviceCategory: '',
    vendor: '',
    isActive: true,
    availabilityDates: [],
    includedServices: [],
    exclusions: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    dispatch(fetchPackagesRequest());
    dispatch(fetchServicesRequest());
    dispatch(fetchVendorsRequest());
  }, [dispatch]);

  const handleOpenModal = (type, pkg = null) => {
    setModalType(type);
    if (type === 'edit' && pkg) {
      setCurrentPkg(pkg);
      setFormData({
        title: pkg.title || '',
        description: pkg.description || '',
        itinerary: pkg.itinerary || '',
        price: pkg.price || 0,
        duration: pkg.duration || '',
        location: pkg.location || '',
        serviceCategory: pkg.serviceCategory?._id || pkg.serviceCategory || '',
        vendor: pkg.vendor?._id || pkg.vendor || '',
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
        availabilityDates: pkg.availabilityDates ? pkg.availabilityDates.map(d => d.split('T')[0]) : [],
        includedServices: pkg.includedServices || [],
        exclusions: pkg.exclusions || [],
        seoTitle: pkg.seoTitle || '',
        seoDescription: pkg.seoDescription || '',
        seoKeywords: pkg.seoKeywords || ''
      });
      setImagePreviews(pkg.images ? pkg.images.map(img => getImageUrl(img)) : []);
      setSelectedImages([]);
    } else {
      setFormData({
        title: '', description: '', itinerary: '', price: 0, 
        duration: '', location: '', 
        serviceCategory: services[0]?._id || '', 
        vendor: vendors[0]?._id || '',
        isActive: true,
        availabilityDates: [new Date().toISOString().split('T')[0]],
        includedServices: [],
        exclusions: [],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
      setImagePreviews([]);
      setSelectedImages([]);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePreview = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // If it was a newly selected file, remove it from selectedImages too
    // This is approximate but helps for new uploads
    if (index >= (imagePreviews.length - selectedImages.length)) {
      const selectedIdx = index - (imagePreviews.length - selectedImages.length);
      setSelectedImages(prev => prev.filter((_, i) => i !== selectedIdx));
    }
  };

  const addListItem = (field) => {
    const val = prompt(`Add to ${field === 'includedServices' ? 'Inclusions' : 'Exclusions'}:`);
    if (val) {
      setFormData({ ...formData, [field]: [...formData[field], val] });
    }
  };

  const removeListItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append standard fields
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(val => data.append(key, val));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Append images
    if (selectedImages.length > 0) {
      selectedImages.forEach(file => data.append('images', file));
    }

    if (modalType === 'add') {
      dispatch(addPackageRequest(data));
      showToast('Created', 'New package published successfully.', 'success');
    } else {
      dispatch(updatePackageRequest({ id: currentPkg._id, data }));
      showToast('Updated', 'Package updated successfully.', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Package?',
      'Are you sure you want to delete this travel package? This action cannot be undone.'
    );
    if (isConfirmed) {
      dispatch(deletePackageRequest(id));
      showToast('Deleted', 'Package has been removed.', 'success');
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'active' ? pkg.isActive : !pkg.isActive;
    return matchesSearch && matchesStatus;
  }).reverse();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Packages Management</h1>
          <p>Craft and manage premium travel experiences</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add Package
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><PackageIcon size={24} /></div>
          <div className="stat-info"><h3>Total Packages</h3><p>{packages.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Active</h3><p>{packages.filter(p => p.isActive).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}><XCircle size={24} /></div>
          <div className="stat-info"><h3>Inactive</h3><p>{packages.filter(p => !p.isActive).length}</p></div>
        </div>
      </div>

      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text" className="form-control" placeholder="Search packages..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
          </div>

          <div className="filter-actions">
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active', color: '#16a34a' },
                { value: 'inactive', label: 'Inactive', color: '#dc2626' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="160px"
            />
            
            <div className="view-toggles">
              <button onClick={() => setView('grid')} className={`view-btn ${view === 'grid' ? 'active' : ''}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setView('list')} className={`view-btn ${view === 'list' ? 'active' : ''}`}><ListIcon size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading packages...</p>
      ) : filteredPackages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <PackageIcon size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No packages found.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="cards-grid">
          {filteredPackages.map((pkg) => (
            <div key={pkg._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '180px', background: '#f8fafc', position: 'relative' }}>
                <img src={pkg.images?.[0] ? getImageUrl(pkg.images[0]) : '/public/defaults/default_travel.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>₹{pkg.price}</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{pkg.title}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {pkg.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {pkg.duration}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>BY {pkg.vendor?.companyName || 'ADMIN'}</span>
                  <div className="action-group">
                    <button className="action-btn" onClick={() => handleOpenModal('edit', pkg)}><Edit size={16} /></button>
                    <button className="action-btn danger" onClick={() => handleDelete(pkg._id)}><Trash2 size={16} /></button>
                  </div>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Package</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Price</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={pkg.images?.[0] ? getImageUrl(pkg.images[0]) : '/public/defaults/default_travel.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{pkg.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pkg.location} • {pkg.duration}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>₹{pkg.price}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: pkg.isActive ? '#16a34a' : '#dc2626', fontWeight: '600', fontSize: '13px' }}>{pkg.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" onClick={() => handleOpenModal('edit', pkg)}><Edit size={16} /></button>
                        <button className="action-btn danger" onClick={() => handleDelete(pkg._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer 
        isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add New Travel Package' : 'Edit Package Details'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ paddingBottom: '40px' }}>
          <div className="form-group">
            <label>Package Title</label>
            <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" className="form-control" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" className="form-control" required placeholder="e.g. 4 Days, 3 Nights" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><FormSelect label="Category" required options={services.map(s => ({ value: s._id, label: s.title }))} value={formData.serviceCategory} onChange={(val) => setFormData({...formData, serviceCategory: val})} /></div>
            <div className="form-group"><FormSelect label="Vendor" required options={vendors.map(v => ({ value: v._id, label: v.companyName || v.name }))} value={formData.vendor} onChange={(val) => setFormData({...formData, vendor: val})} /></div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" className="form-control" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Package Gallery</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {imagePreviews.map((prev, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={prev} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removePreview(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', padding: '2px' }}><X size={10} /></button>
                </div>
              ))}
              <div onClick={() => document.getElementById('pkg-gallery').click()} style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                <Plus size={16} />
                <span style={{ fontSize: '9px', marginTop: '4px' }}>Add Photo</span>
                <input type="file" id="pkg-gallery" hidden multiple accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea className="form-control" style={{ height: '80px' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Full Itinerary (Rich Text)</label>
            <div className="editor-container" style={{ border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
              <div className="editor-toolbar" style={{ background: 'var(--bg-main)', padding: '8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
                {['bold', 'italic', 'insertUnorderedList'].map(cmd => (
                  <button key={cmd} type="button" onClick={() => document.execCommand(cmd)} style={{ width: '30px', height: '30px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>{cmd === 'insertUnorderedList' ? <ListIcon size={14} /> : cmd.charAt(0).toUpperCase()}</button>
                ))}
              </div>
              <div 
                contentEditable className="editor-content"
                style={{ minHeight: '200px', padding: '16px', outline: 'none', background: 'white', fontSize: '14px', lineHeight: '1.6' }}
                onBlur={(e) => setFormData({...formData, itinerary: e.target.innerHTML})}
                dangerouslySetInnerHTML={{ __html: formData.itinerary }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>Inclusions <PlusCircle size={16} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => addListItem('includedServices')} /></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {formData.includedServices.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                    <span>{item}</span>
                    <X size={14} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => removeListItem('includedServices', idx)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>Exclusions <PlusCircle size={16} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => addListItem('exclusions')} /></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {formData.exclusions.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                    <span>{item}</span>
                    <X size={14} style={{ cursor: 'pointer', color: '#dc2626' }} onClick={() => removeListItem('exclusions', idx)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', padding: '20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}><Globe size={18} /><h4 style={{ margin: 0 }}>SEO Console</h4></div>
            <div className="form-group"><label>SEO Title</label><input type="text" className="form-control" value={formData.seoTitle} onChange={(e) => setFormData({...formData, seoTitle: e.target.value})} /></div>
            <div className="form-group"><label>Meta Description</label><textarea className="form-control" style={{ height: '70px' }} value={formData.seoDescription} onChange={(e) => setFormData({...formData, seoDescription: e.target.value})} /></div>
            <div className="form-group"><label>Keywords</label><input type="text" className="form-control" placeholder="comma separated" value={formData.seoKeywords} onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})} /></div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
              <span style={{ fontWeight: '600' }}>Package is Live</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '24px' }}>{modalType === 'add' ? 'Publish Package' : 'Save Changes'}</button>
        </form>
      </Drawer>
    </div>
  );
};

export default Packages;
