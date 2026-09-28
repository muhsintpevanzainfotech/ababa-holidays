import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import ImageUpload from '../components/ImageUpload';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
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
  List,
  Power,
  CheckCircle,
  UserX,
  Filter,
  MoreVertical,
  AlertTriangle,
  XCircle,
  Info,
  Image as ImageIcon,
  Globe,
  FileText,
  Layers,
  PlusCircle,
  Wrench
} from 'lucide-react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
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
import { fetchSubServicesRequest } from '../store/slices/subServicesSlice';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import FormGenerator from '../components/FormGenerator';

const Packages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customId, serviceName } = useParams();
  const serviceParam = searchParams.get('service');

  const { packages, loading, error } = useSelector((state) => state.packages);
  const { services } = useSelector((state) => state.services);
  const { subServices } = useSelector((state) => state.subServices || { subServices: [] });
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const { vendors } = useSelector((state) => state.vendors);

  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentPkg, setCurrentPkg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState(serviceParam || 'all');
  const [subServiceFilter, setSubServiceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected Service based on customId or serviceName URL params
  const selectedService = services.find(s => 
    (customId && (s.customId === customId || s._id === customId)) ||
    (serviceName && s.title && s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === serviceName)
  );

  useEffect(() => {
    setServiceFilter(searchParams.get('service') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setSubServiceFilter('all');
    setCategoryFilter('all');
  }, [customId, serviceFilter]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itinerary: '',
    price: 0,
    priceType: 'Per Person',
    duration: '',
    location: '',
    serviceCategory: '',
    subService: '',
    category: '',
    selectedSubServices: [],
    selectedCategories: [],
    vendor: '',
    isActive: true,
    availabilityDates: [],
    includedServices: [],
    exclusions: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    dispatch(fetchPackagesRequest());
    dispatch(fetchServicesRequest());
    dispatch(fetchVendorsRequest());
    dispatch(fetchSubServicesRequest({ limit: 100 }));
    dispatch(fetchCategoriesRequest({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (formData.serviceCategory) {
      fetchCustomFields(formData.serviceCategory);
    } else {
      setCustomFields([]);
    }
  }, [formData.serviceCategory]);

  const fetchCustomFields = async (serviceId) => {
    try {
      const res = await api.get(`/package-fields/setup/${serviceId}`);
      setCustomFields(res.data.data);
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
    }
  };

  const handleOpenModal = (type, pkg = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && pkg) {
      setCurrentPkg(pkg);
      const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || '';
      const pkgSubSvcId = pkg.subService?._id || pkg.subService || '';
      const pkgCatId = pkg.category?._id || pkg.category || '';
      setFormData({
        title: pkg.title || '',
        description: pkg.description || '',
        itinerary: pkg.itinerary || '',
        price: pkg.price || 0,
        priceType: pkg.priceType || 'Per Person',
        duration: pkg.duration || '',
        location: pkg.location || '',
        serviceCategory: pkgSvcId,
        subService: pkgSubSvcId,
        category: pkgCatId,
        selectedSubServices: pkg.subServices ? pkg.subServices.map(s => s._id || s) : (pkgSubSvcId ? [pkgSubSvcId] : []),
        selectedCategories: pkg.categories ? pkg.categories.map(c => c._id || c) : (pkgCatId ? [pkgCatId] : []),
        vendor: pkg.vendor?._id || pkg.vendor || '',
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
        availabilityDates: pkg.availabilityDates ? pkg.availabilityDates.map(d => d.split('T')[0]) : [],
        includedServices: pkg.includedServices || [],
        exclusions: pkg.exclusions || [],
        seoTitle: pkg.seoTitle || '',
        seoDescription: pkg.seoDescription || '',
        seoKeywords: pkg.seoKeywords || ''
      });
      setCustomData(pkg.customData || {});
      if (pkgSvcId) fetchCustomFields(pkgSvcId);
      setImagePreviews(pkg.images ? pkg.images.map(img => getImageUrl(img)) : []);
      setSelectedImages([]);
    } else {
      const activeSvcId = selectedService?._id || (serviceFilter !== 'all' ? serviceFilter : (services[0]?._id || ''));
      setFormData({
        title: '', description: '', itinerary: '', price: 0, priceType: 'Per Person', 
        duration: '', location: '', 
        serviceCategory: activeSvcId, 
        subService: '',
        category: '',
        selectedSubServices: [],
        selectedCategories: [],
        vendor: vendors[0]?._id || '',
        isActive: true,
        availabilityDates: [new Date().toISOString().split('T')[0]],
        includedServices: [],
        exclusions: [],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
      setCustomData({});
      if (activeSvcId) fetchCustomFields(activeSvcId);
      setImagePreviews([]);
      setSelectedImages([]);
    }
    setShowModal(true);
  };

  const handleImagesSelect = (files) => {
    if (!files) {
      setSelectedImages([]);
      setImagePreviews([]);
      return;
    }
    const fileList = Array.isArray(files) ? files : [files];
    setSelectedImages(fileList);
    setImagePreviews(fileList.map(f => typeof f === 'string' ? f : URL.createObjectURL(f)));
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

    // Append custom data
    // For files in custom data, we'll append them with a specific prefix
    const dataToSend = { ...customData };
    Object.keys(customData).forEach(key => {
      const field = customFields.find(f => f.fieldName === key);
      if (field?.fieldType === 'upload') {
        const files = Array.isArray(customData[key]) ? customData[key] : [];
        files.forEach((file, idx) => {
          if (file instanceof File) {
            data.append(`customFile_${key}`, file);
            // We'll replace the File object in the JSON with a placeholder
            // The backend will then map the uploaded file back to this field
          }
        });
      }
    });
    data.append('customData', JSON.stringify(customData));

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

  const activeServiceId = selectedService?._id || (serviceFilter !== 'all' ? serviceFilter : null);

  const availableSubServices = subServices.filter(sub => {
    if (!activeServiceId) return true;
    const subSvcId = sub.service?._id || sub.service;
    return subSvcId === activeServiceId;
  });

  const availableCategories = categories || [];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'active' ? pkg.isActive : !pkg.isActive;

    const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service;
    const pkgSvcCustomId = pkg.serviceCategory?.customId || pkg.service?.customId;
    const activeSvcCustomId = selectedService?.customId;

    const matchesService = !activeServiceId || 
                           pkgSvcId === activeServiceId || 
                           (activeSvcCustomId && pkgSvcCustomId === activeSvcCustomId);

    const pkgSubSvcId = pkg.subService?._id || pkg.subService;
    const matchesSubService = subServiceFilter === 'all' || pkgSubSvcId === subServiceFilter;

    const pkgCatId = pkg.category?._id || pkg.category;
    const matchesCategory = categoryFilter === 'all' || pkgCatId === categoryFilter;

    return matchesSearch && matchesStatus && matchesService && matchesSubService && matchesCategory;
  }).reverse();

  const hasSelectedService = Boolean(selectedService || (serviceFilter && serviceFilter !== 'all'));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>{selectedService ? selectedService.title : 'Packages Management'}</h1>
          <p>{selectedService ? `Explore and manage packages for ${selectedService.title}` : 'Craft and manage premium travel experiences'}</p>
        </div>
        {hasSelectedService && (
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const targetSvcId = selectedService?._id || (serviceFilter !== 'all' ? serviceFilter : '');
              navigate(targetSvcId ? `/packages/create?service=${targetSvcId}` : '/packages/create');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: '700' }}
          >
            <Plus size={18} /> Add New Package
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}><PackageIcon size={24} /></div>
          <div className="stat-info"><h3>Total Packages</h3><p>{filteredPackages.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}><CheckCircle size={24} /></div>
          <div className="stat-info"><h3>Active</h3><p>{filteredPackages.filter(p => p.isActive).length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}><XCircle size={24} /></div>
          <div className="stat-info"><h3>Inactive</h3><p>{filteredPackages.filter(p => !p.isActive).length}</p></div>
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

          <div className="filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />

            {/* Services Filter Dropdown - Only shown on general /packages route */}
            {!customId && (
              <FilterSelect 
                options={[
                  { value: 'all', label: 'All Services' },
                  ...services.map(s => ({ value: s._id, label: s.title }))
                ]}
                value={serviceFilter}
                onChange={(val) => {
                  setServiceFilter(val);
                  if (val === 'all') {
                    searchParams.delete('service');
                    setSearchParams(searchParams);
                  } else {
                    setSearchParams({ service: val });
                  }
                }}
                width="180px"
              />
            )}

            {/* Sub-Services Filter Dropdown */}
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Sub-Services' },
                ...availableSubServices.map(sub => ({ value: sub._id, label: sub.title }))
              ]}
              value={subServiceFilter}
              onChange={setSubServiceFilter}
              width="180px"
            />

            {/* Categories Filter Dropdown */}
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Categories' },
                ...availableCategories.map(cat => ({ value: cat._id, label: cat.title }))
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              width="170px"
            />

            {/* Status Filter Dropdown */}
            <FilterSelect 
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active', color: '#16a34a' },
                { value: 'inactive', label: 'Inactive', color: '#dc2626' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              width="140px"
            />
            
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
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : pkg.currency === 'AED' ? 'AED ' : '₹'}{pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price}</span>
                  {pkg.priceType && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>/ {pkg.priceType}</span>}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>{pkg.customId || 'PKG-AUTO'}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: (pkg.status || (pkg.isActive ? 'Active' : 'Inactive')) === 'Active' ? '#16a34a' : ((pkg.status || (pkg.isActive ? 'Active' : 'Inactive')) === 'Inactive' ? '#dc2626' : '#d97706') }}>
                    ● {pkg.status || (pkg.isActive ? 'Active' : 'Inactive')}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{pkg.title}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {pkg.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {pkg.duration}</span>
                </div>
                {pkg.customData && Object.keys(pkg.customData).length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {Object.entries(pkg.customData).slice(0, 3).map(([key, val]) => {
                      if (val === undefined || val === null || val === '') return null;
                      const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                      if (displayVal.length > 30) return null;
                      return (
                        <span key={key} style={{ fontSize: '11px', background: 'rgba(var(--primary-rgb), 0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          {key}: {displayVal}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>BY {pkg.vendor?.companyName || 'ADMIN'}</span>
                  <div className="action-group">
                    <button className="action-btn" onClick={() => navigate(`/packages/edit/${pkg._id}?correction=true`)} title="Correction"><Wrench size={16} /></button>
                    <button className="action-btn" onClick={() => handleOpenModal('view', pkg)} title="View Details"><Info size={16} /></button>
                    <button className="action-btn" onClick={() => navigate(`/packages/edit/${pkg._id}`)} title="Edit Package"><Edit size={16} /></button>
                    <button className="action-btn danger" onClick={() => handleDelete(pkg._id)} title="Delete Package"><Trash2 size={16} /></button>
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Package ID & Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Price & Billing</th>
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
                          <div style={{ fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{pkg.title}</span>
                            <span style={{ fontSize: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{pkg.customId || 'PKG-AUTO'}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pkg.location} • {pkg.duration}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>
                        {pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : pkg.currency === 'AED' ? 'AED ' : '₹'}{pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price}
                        {pkg.priceType && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '4px' }}>/ {pkg.priceType}</span>}
                      </div>
                      {pkg.originalPrice > (pkg.discountPrice || pkg.price) && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : pkg.currency === 'AED' ? 'AED ' : '₹'}{pkg.originalPrice}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        color: (pkg.status || (pkg.isActive ? 'Active' : 'Inactive')) === 'Active' ? '#16a34a' : ((pkg.status || (pkg.isActive ? 'Active' : 'Inactive')) === 'Inactive' ? '#dc2626' : '#d97706'), 
                        fontWeight: '700', 
                        fontSize: '13px' 
                      }}>
                        ● {pkg.status || (pkg.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="action-group">
                        <button className="action-btn" onClick={() => navigate(`/packages/edit/${pkg._id}?correction=true`)} title="Correction"><Wrench size={16} /></button>
                        <button className="action-btn" onClick={() => handleOpenModal('view', pkg)} title="View Details"><Info size={16} /></button>
                        <button className="action-btn" onClick={() => navigate(`/packages/edit/${pkg._id}`)} title="Edit Package"><Edit size={16} /></button>
                        <button className="action-btn danger" onClick={() => handleDelete(pkg._id)} title="Delete Package"><Trash2 size={16} /></button>
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
        title={modalType === 'add' ? 'Add New Travel Package' : modalType === 'view' ? `Package Overview - ${currentPkg?.title || ''}` : 'Edit Package Details'}
        size="lg"
      >
        {modalType === 'view' && currentPkg ? (
          <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {(currentPkg.serviceCategory?.title || currentPkg.service?.title) && (
                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                      {currentPkg.serviceCategory?.title || currentPkg.service?.title}
                    </span>
                  )}
                  {(currentPkg.subService?.title || currentPkg.subService?.name) && (
                    <span className="badge badge-secondary" style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                      Sub: {currentPkg.subService?.title || currentPkg.subService?.name}
                    </span>
                  )}
                  {(currentPkg.category?.title || currentPkg.category?.name) && (
                    <span className="badge badge-secondary" style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                      Cat: {currentPkg.category?.title || currentPkg.category?.name}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0' }}>{currentPkg.title}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {currentPkg.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {currentPkg.duration}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>₹{currentPkg.price}</div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: currentPkg.isActive ? '#16a34a' : '#dc2626' }}>
                  {currentPkg.isActive ? '● Live' : '○ Inactive'}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Offered By</span>
              <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>{currentPkg.vendor?.companyName || currentPkg.vendor?.name || 'ABABA Travels Admin'}</span>
            </div>

            {currentPkg.images && currentPkg.images.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ height: '260px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', background: '#f8fafc' }}>
                  <img src={getImageUrl(currentPkg.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {currentPkg.images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {currentPkg.images.map((img, idx) => (
                      <img key={idx} src={getImageUrl(img)} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentPkg.description && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Description</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{currentPkg.description}</p>
              </div>
            )}

            {customFields && customFields.length > 0 && currentPkg.customData && (
              <div style={{ marginBottom: '24px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)' }}>Category Setup Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {customFields.map(field => {
                    const val = currentPkg.customData ? currentPkg.customData[field.fieldName] : undefined;
                    if (val === undefined || val === null || val === '') return null;
                    return (
                      <div key={field._id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {field.label}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>
                          {Array.isArray(val) ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {val.map((v, i) => <span key={i} className="badge badge-secondary" style={{ fontSize: '11px' }}>{String(v)}</span>)}
                            </div>
                          ) : typeof val === 'boolean' ? (
                            <span style={{ color: val ? '#16a34a' : '#dc2626' }}>{val ? 'Yes' : 'No'}</span>
                          ) : (
                            String(val)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentPkg.itinerary && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Full Itinerary</h4>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: currentPkg.itinerary }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#16a34a' }}>Inclusions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentPkg.includedServices && currentPkg.includedServices.length > 0 ? (
                    currentPkg.includedServices.map((inc, i) => (
                      <div key={i} style={{ fontSize: '12px', background: 'rgba(34,197,94,0.08)', color: '#15803d', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                        ✓ {inc}
                      </div>
                    ))
                  ) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None specified</span>}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#dc2626' }}>Exclusions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentPkg.exclusions && currentPkg.exclusions.length > 0 ? (
                    currentPkg.exclusions.map((exc, i) => (
                      <div key={i} style={{ fontSize: '12px', background: 'rgba(239,68,68,0.08)', color: '#b91c1c', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                        ✕ {exc}
                      </div>
                    ))
                  ) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None specified</span>}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', height: '44px' }} onClick={() => { setShowModal(false); navigate(`/packages/edit/${currentPkg._id}`); }}>
              <Edit size={16} /> Edit Package Details
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="package-form packages-form" style={{ paddingBottom: '40px' }}>
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
            <div className="form-group">
              <FormSelect 
                label="Service Category" 
                required 
                options={services.map(s => ({ value: s._id, label: s.title }))} 
                value={formData.serviceCategory} 
                onChange={(val) => {
                  setFormData({...formData, serviceCategory: val, subService: ''});
                  fetchCustomFields(val);
                }} 
              />
            </div>
            <div className="form-group">
              <FormSelect 
                label="Sub Service" 
                options={availableSubServices.map(sub => ({ value: sub._id, label: sub.title }))} 
                value={formData.subService} 
                onChange={(val) => setFormData({ ...formData, subService: val })} 
                placeholder={availableSubServices.length === 0 ? 'No sub services for this service' : 'Select Sub Service...'}
                disabled={availableSubServices.length === 0}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <FormSelect 
                label="Package Category" 
                options={availableCategories.map(c => ({ value: c._id, label: c.title || c.name }))} 
                value={formData.category} 
                onChange={(val) => setFormData({ ...formData, category: val })} 
                placeholder="Select Category..."
              />
            </div>
            <div className="form-group">
              <FormSelect 
                label="Vendor" 
                required 
                options={vendors.map(v => ({ value: v._id, label: v.companyName || v.name }))} 
                value={formData.vendor} 
                onChange={(val) => setFormData({...formData, vendor: val})} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <SearchableMultiSelect
              label="Multiple Sub Services (Searchable Multi-Select)"
              options={availableSubServices.map(s => ({ value: s._id, label: s.title }))}
              value={formData.selectedSubServices}
              onChange={(val) => setFormData({ ...formData, selectedSubServices: val })}
              placeholder="Search & select sub services..."
            />
            <SearchableMultiSelect
              label="Multiple Categories & Tags (Searchable Multi-Select)"
              options={availableCategories.map(c => ({ value: c._id, label: c.title || c.name }))}
              value={formData.selectedCategories}
              onChange={(val) => setFormData({ ...formData, selectedCategories: val })}
              placeholder="Search & select categories..."
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" className="form-control" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="form-group">
            <ImageUpload
              label="Package Photos & Gallery"
              value={selectedImages.length > 0 ? selectedImages : imagePreviews}
              onChange={handleImagesSelect}
              multiple={true}
              title="Drag & drop package photos here, or click to browse"
              caption="Supports PNG, JPG, WEBP (Max 5MB each)"
              maxSizeMB={5}
            />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea className="form-control" style={{ height: '80px' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          {customFields && customFields.length > 0 && (
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h4 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '700' }}>Custom Category Fields</h4>
              <FormGenerator 
                fields={customFields} 
                values={customData} 
                onChange={setCustomData} 
                errors={fieldErrors}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Full Itinerary (Rich Text)</label>
            <div className="editor-container" style={{ border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginTop: '8px' }}>
              <div className="editor-toolbar" style={{ background: 'var(--bg-main)', padding: '8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
                {['bold', 'italic', 'insertUnorderedList'].map(cmd => (
                  <button key={cmd} type="button" onClick={() => document.execCommand(cmd)} style={{ width: '30px', height: '30px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>{cmd === 'insertUnorderedList' ? <List size={14} /> : cmd.charAt(0).toUpperCase()}</button>
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
        )}
      </Drawer>
    </div>
  );
};

export default Packages;
