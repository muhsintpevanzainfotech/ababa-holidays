import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import FormSelect from '../components/FormSelect';
import FormGenerator from '../components/FormGenerator';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
import { 
  ArrowLeft, 
  Save, 
  Package as PackageIcon, 
  AlertCircle,
  Wrench,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Layers,
  FolderTree,
  Tag,
  DollarSign,
  Receipt,
  TrendingDown
} from 'lucide-react';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchSubServicesRequest } from '../store/slices/subServicesSlice';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { addPackageRequest, updatePackageRequest } from '../store/slices/packagesSlice';
import { useToast } from '../context/ToastContext';

const PackageCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const queryServiceId = searchParams.get('service');
  const targetServiceId = serviceId || queryServiceId;
  const isCorrection = searchParams.get('correction') === 'true';
  const { showToast } = useToast();

  const { services } = useSelector((state) => state.services || { services: [] });
  const { subServices } = useSelector((state) => state.subServices || { subServices: [] });
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const { vendors } = useSelector((state) => state.vendors || { vendors: [] });

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customId: '',
    serviceCategory: '',
    subService: '',
    category: '',
    selectedSubServices: [],
    selectedCategories: [],
    vendor: '',
    isActive: true,
    status: 'Active',
    // Package Pricing & Rate Section
    price: '',
    originalPrice: '',
    discountPrice: '',
    priceType: 'Per Person',
    currency: 'INR',
    taxPercentage: '',
    isTaxIncluded: true,
    priceNotes: ''
  });

  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'multiple'
  const [isCustomPriceType, setIsCustomPriceType] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const STANDARD_PRICE_TYPES = [
    'Per Person', 'Per Adult', 'Per Child', 'Per Couple', 'Per Group', 
    'Per Room', 'Per Night', 'Per Day', 'Per Vehicle', 'Per Hour', 'Per Km', 
    'Fixed Rate', 'Starting From'
  ];

  const selectedService = services.find(
    s => s._id === formData.serviceCategory || s.customId === formData.serviceCategory
  );
  const selectedServiceTitle = selectedService ? selectedService.title : 'Selected Service Category';

  // Filter sub-services belonging to selected Service Category
  const availableSubServices = subServices.filter(sub => {
    if (!formData.serviceCategory) return true;
    const parentId = sub.service?._id || sub.service;
    return parentId === formData.serviceCategory;
  });

  useEffect(() => {
    dispatch(fetchServicesRequest());
    dispatch(fetchSubServicesRequest({ limit: 100 }));
    dispatch(fetchCategoriesRequest({ limit: 100 }));
    dispatch(fetchVendorsRequest());
  }, [dispatch]);

  // Load existing package if in Edit mode, or resolve initial serviceCategory in Create mode
  useEffect(() => {
    if (isEditMode) {
      fetchPackageDetails();
    } else if (services.length > 0) {
      let matchedSvc = null;
      if (targetServiceId) {
        matchedSvc = services.find(s => s._id === targetServiceId || s.customId === targetServiceId);
      }
      const activeSvcId = matchedSvc ? matchedSvc._id : services[0]._id;
      
      setFormData(prev => ({
        ...prev,
        serviceCategory: prev.serviceCategory || activeSvcId,
        vendor: prev.vendor || (vendors[0]?._id || '')
      }));

      if (activeSvcId) {
        fetchCustomFields(activeSvcId);
      }
    }
  }, [id, serviceId, targetServiceId, isEditMode, services, vendors]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/packages/${id}`);
      const pkg = res.data.data;
      
      const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || '';
      const pkgSubSvcId = pkg.subService?._id || pkg.subService || '';
      const pkgCategoryId = pkg.category?._id || pkg.category || '';
      const pkgVendorId = pkg.vendor?._id || pkg.vendor || '';

      const fetchedPriceType = pkg.priceType || 'Per Person';
      if (fetchedPriceType && !STANDARD_PRICE_TYPES.includes(fetchedPriceType)) {
        setIsCustomPriceType(true);
      }

      const isMultiMode = (pkg.subServices && pkg.subServices.length > 1) || 
                          (pkg.categories && pkg.categories.length > 1) || 
                          (pkg.selectedSubServices && pkg.selectedSubServices.length > 1) || 
                          (pkg.selectedCategories && pkg.selectedCategories.length > 1);
      setSelectionMode(isMultiMode ? 'multiple' : 'single');

      setFormData({
        customId: pkg.customId || '',
        serviceCategory: pkgSvcId,
        subService: pkgSubSvcId,
        category: pkgCategoryId,
        selectedSubServices: pkg.subServices ? pkg.subServices.map(s => s._id || s) : (pkgSubSvcId ? [pkgSubSvcId] : []),
        selectedCategories: pkg.categories ? pkg.categories.map(c => c._id || c) : (pkgCategoryId ? [pkgCategoryId] : []),
        vendor: pkgVendorId,
        isActive: isCorrection ? false : (pkg.isActive !== undefined ? pkg.isActive : true),
        status: isCorrection ? 'Correction' : (pkg.status || (pkg.isActive ? 'Active' : 'Inactive')),
        price: pkg.price !== undefined && pkg.price !== null ? pkg.price : (pkg.customData?.price || pkg.customData?.amount || ''),
        originalPrice: pkg.originalPrice !== undefined && pkg.originalPrice !== null ? pkg.originalPrice : '',
        discountPrice: pkg.discountPrice !== undefined && pkg.discountPrice !== null ? pkg.discountPrice : '',
        priceType: fetchedPriceType,
        currency: pkg.currency || 'INR',
        taxPercentage: pkg.taxPercentage !== undefined && pkg.taxPercentage !== null ? pkg.taxPercentage : '',
        isTaxIncluded: pkg.isTaxIncluded !== undefined ? pkg.isTaxIncluded : true,
        priceNotes: pkg.priceNotes || ''
      });

      setCustomData(pkg.customData || {});

      if (pkgSvcId) {
        fetchCustomFields(pkgSvcId);
      }
    } catch (error) {
      showToast('Error', 'Failed to load package details', 'error');
      navigate('/packages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom fields whenever service category changes
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
      setCustomFields(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceCategory) {
      showToast('Validation Error', 'Please select a Service Category', 'error');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    
    // Intelligent pricing resolution & fallback
    const rawPrice = Number(formData.price) || Number(formData.discountPrice) || Number(customData.price) || Number(customData.amount) || Number(customData.rate) || 0;
    const rawDiscount = Number(formData.discountPrice) || 0;
    const rawOriginal = Number(formData.originalPrice) || (rawDiscount > 0 ? rawPrice : 0);

    const finalPrice = rawDiscount > 0 ? rawDiscount : rawPrice;
    const pkgOriginalPrice = rawOriginal > 0 ? rawOriginal : finalPrice;

    const pkgTitle = customData.title || customData.packageName || customData.name || customData.packageTitle || `${selectedServiceTitle} Package`;
    const pkgDesc = customData.description || customData.details || customData.summary || 'Package record created via form setup';
    const pkgDuration = customData.duration || customData.days || 'N/A';
    const pkgLocation = customData.location || customData.destination || customData.city || 'N/A';

    // Keep customData price synced
    const updatedCustomData = {
      ...customData,
      price: finalPrice,
      originalPrice: pkgOriginalPrice,
      discountPrice: rawDiscount
    };

    const finalSubService = selectionMode === 'single' ? formData.subService : (formData.selectedSubServices[0] || '');
    const finalCategory = selectionMode === 'single' ? formData.category : (formData.selectedCategories[0] || '');
    const finalSubServices = selectionMode === 'multiple' ? formData.selectedSubServices : (formData.subService ? [formData.subService] : []);
    const finalCategories = selectionMode === 'multiple' ? formData.selectedCategories : (formData.category ? [formData.category] : []);

    const payload = {
      ...formData,
      subService: finalSubService,
      category: finalCategory,
      selectedSubServices: finalSubServices,
      selectedCategories: finalCategories,
      title: pkgTitle,
      price: finalPrice,
      originalPrice: pkgOriginalPrice,
      discountPrice: rawDiscount,
      priceType: formData.priceType || 'Per Person',
      currency: formData.currency || 'INR',
      taxPercentage: Number(formData.taxPercentage) || 0,
      isTaxIncluded: Boolean(formData.isTaxIncluded),
      priceNotes: formData.priceNotes || '',
      description: pkgDesc,
      duration: pkgDuration,
      location: pkgLocation
    };

    Object.keys(payload).forEach(key => {
      const val = payload[key];
      // Do not append empty string values for ObjectId reference fields
      if (['subService', 'category', 'service'].includes(key) && (val === '' || val === null || val === undefined)) {
        return;
      }
      if (Array.isArray(val)) {
        val.forEach(v => data.append(key, v));
      } else if (val !== null && val !== undefined) {
        data.append(key, val);
      }
    });

    // Append custom data files if any
    Object.keys(customData).forEach(key => {
      const field = customFields.find(f => f.fieldName === key);
      if (field?.fieldType === 'upload') {
        const files = Array.isArray(customData[key]) ? customData[key] : [];
        files.forEach(file => {
          if (file instanceof File) {
            data.append(`customFile_${key}`, file);
          }
        });
      }
    });
    data.append('customData', JSON.stringify(updatedCustomData));

    try {
      if (isEditMode) {
        dispatch(updatePackageRequest({ id, data }));
        showToast('Updated', 'Package updated successfully.', 'success');
      } else {
        dispatch(addPackageRequest(data));
        showToast('Published', 'New package published successfully.', 'success');
      }
      navigate('/packages');
    } catch (err) {
      showToast('Error', err.message || 'Failed to save package', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px auto', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Loading Package Form...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            type="button" 
            className="action-btn" 
            onClick={() => navigate('/packages')} 
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{isEditMode ? (isCorrection ? 'Package Correction' : 'Edit Travel Package') : 'Add New Travel Package'}</h1>
            <p>{isEditMode ? 'Update package details, sub services, and custom specifications' : 'Create and publish a new package experience'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => navigate('/packages')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={18} /> {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Publish Package')}
          </button>
        </div>
      </div>

      {isCorrection && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#b45309' }}>
          <Wrench size={20} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Correction Mode Active: Review and update all fields carefully before re-publishing.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="package-form package-create-form">
        {/* Core Package Configuration Card: Package ID, Status, Service Category, Sub Service & Categories */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <PackageIcon size={18} /> Package Specifications, Services & Categories
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Package ID</span>
                <span style={{ fontSize: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>AUTO</span>
              </label>
              <input 
                type="text" 
                className="form-control" 
                value={isEditMode ? (formData.customId || 'PKG-AUTO') : 'Auto-Generated (e.g. PKG202600001)'} 
                disabled 
                style={{ 
                  background: 'var(--bg-main)', 
                  fontWeight: '700', 
                  color: 'var(--primary)', 
                  letterSpacing: '0.5px',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <FormSelect 
                label="Package Status" 
                required 
                options={[
                  { value: 'Active', label: '🟢 Active (Published & Bookable)' },
                  { value: 'Inactive', label: '🔴 Inactive (Hidden / Disabled)' },
                  { value: 'Draft', label: '🟡 Draft (Working Draft)' },
                  { value: 'Pending', label: '🔵 Pending (Pending Review)' },
                  { value: 'Correction', label: '🟠 Correction (Needs Correction)' },
                  { value: 'Archived', label: '⚪ Archived' }
                ]} 
                value={formData.status || (isCorrection ? 'Correction' : 'Active')} 
                onChange={(val) => setFormData({
                  ...formData, 
                  status: val, 
                  isActive: val === 'Active'
                })} 
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <FormSelect 
                label="Service Category" 
                required 
                options={services.map(s => ({ value: s._id, label: s.title }))} 
                value={formData.serviceCategory} 
                onChange={(val) => setFormData({ ...formData, serviceCategory: val, subService: '' })} 
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <FormSelect 
                label="Offering Vendor / Partner" 
                required 
                options={vendors.map(v => ({ value: v._id, label: v.companyName || v.name }))} 
                value={formData.vendor} 
                onChange={(val) => setFormData({ ...formData, vendor: val })} 
              />
            </div>

            {/* Selection Mode Toggle: Single vs Multiple */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12', marginTop: '4px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  Sub Service & Category Mode
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>(Choose single or multiple selection)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
                <button
                  type="button"
                  onClick={() => setSelectionMode('single')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${selectionMode === 'single' ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectionMode === 'single' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-main)',
                    color: selectionMode === 'single' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎯 Single Select
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('multiple')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${selectionMode === 'multiple' ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectionMode === 'multiple' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-main)',
                    color: selectionMode === 'multiple' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📚 Multiple Select
                </button>
              </div>
            </div>

            {selectionMode === 'single' ? (
              <>
                <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
                  <FormSelect 
                    label="Sub Service" 
                    options={availableSubServices.map(sub => ({ value: sub._id, label: sub.title }))} 
                    value={formData.subService} 
                    onChange={(val) => setFormData({ ...formData, subService: val, selectedSubServices: val ? [val] : [] })} 
                    placeholder={availableSubServices.length === 0 ? 'No sub services for this service' : 'Select Sub Service...'}
                    disabled={availableSubServices.length === 0}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
                  <FormSelect 
                    label="Package Category" 
                    options={categories.map(c => ({ value: c._id, label: c.name || c.title }))} 
                    value={formData.category} 
                    onChange={(val) => setFormData({ ...formData, category: val, selectedCategories: val ? [val] : [] })} 
                    placeholder="Select Category..."
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ gridColumn: 'span 6 / span 6' }}>
                  <SearchableMultiSelect
                    label="Multiple Sub Services (Searchable Multi-Select)"
                    options={availableSubServices.map(s => ({ value: s._id, label: s.title }))}
                    value={formData.selectedSubServices}
                    onChange={(val) => setFormData({ ...formData, selectedSubServices: val, subService: val[0] || '' })}
                    placeholder="Search & select multiple sub services..."
                  />
                </div>

                <div style={{ gridColumn: 'span 6 / span 6' }}>
                  <SearchableMultiSelect
                    label="Multiple Categories & Tags (Searchable Multi-Select)"
                    options={categories.map(c => ({ value: c._id, label: c.name || c.title }))}
                    value={formData.selectedCategories}
                    onChange={(val) => setFormData({ ...formData, selectedCategories: val, category: val[0] || '' })}
                    placeholder="Search & select multiple categories..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Package Pricing & Rate Details Section */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <DollarSign size={18} /> Package Pricing & Rate Details
            </h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              Billing, Discounts & Tax Setup
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px' }}>
            {/* Base / Regular Price */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Standard Base Price <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'AED' ? 'AED' : '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 15000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ paddingLeft: formData.currency === 'AED' ? '46px' : '28px', fontWeight: '700', fontSize: '15px' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard rate before discounts</span>
            </div>

            {/* Special / Discounted Offer Price */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Offer / Discounted Price
                <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>OFFER</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#16a34a' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'AED' ? 'AED' : '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 12000"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  style={{ paddingLeft: formData.currency === 'AED' ? '46px' : '28px', fontWeight: '700', fontSize: '15px', borderColor: formData.discountPrice ? '#16a34a' : 'var(--border)' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optional promotional price</span>
            </div>

            {/* MRP / Original Price */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>Original MRP Price (Strike-through)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'AED' ? 'AED' : '₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 18000"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  style={{ paddingLeft: formData.currency === 'AED' ? '46px' : '28px' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Shows crossed-out price</span>
            </div>

            {/* Price Type / Billing Basis with Customizable Unit */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>
                  Billing Model / Unit <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {isCustomPriceType ? (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCustomPriceType(false);
                      setFormData(prev => ({ ...prev, priceType: 'Per Person' }));
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline', padding: 0 }}
                  >
                    ← Standard Presets
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCustomPriceType(true);
                      setFormData(prev => ({ ...prev, priceType: '' }));
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline', padding: 0 }}
                  >
                    + Custom Unit
                  </button>
                )}
              </div>

              {!isCustomPriceType ? (
                <FormSelect
                  label=""
                  required
                  options={[
                    { value: 'Per Person', label: '👤 Per Person' },
                    { value: 'Per Adult', label: '👨 Per Adult' },
                    { value: 'Per Child', label: '🧒 Per Child' },
                    { value: 'Per Couple', label: '👩‍❤️‍👨 Per Couple' },
                    { value: 'Per Group', label: '👨‍👩‍👧‍👦 Per Group' },
                    { value: 'Per Room', label: '🏨 Per Room / Suite' },
                    { value: 'Per Night', label: '🌙 Per Night' },
                    { value: 'Per Day', label: '☀️ Per Day' },
                    { value: 'Per Vehicle', label: '🚗 Per Vehicle / Cab' },
                    { value: 'Per Hour', label: '⏱️ Per Hour' },
                    { value: 'Per Km', label: '📍 Per Km' },
                    { value: 'Fixed Rate', label: '🏷️ Fixed Rate (Entire Package)' },
                    { value: 'Starting From', label: '🚀 Starting From (Base Rate)' },
                    { value: 'CUSTOM_INPUT_MODE', label: '✏️ + Type Custom Unit...' }
                  ]}
                  value={formData.priceType}
                  onChange={(val) => {
                    if (val === 'CUSTOM_INPUT_MODE') {
                      setIsCustomPriceType(true);
                      setFormData(prev => ({ ...prev, priceType: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, priceType: val }));
                    }
                  }}
                />
              ) : (
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Per Seat, Per Ticket, Per Villa"
                    value={formData.priceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceType: e.target.value }))}
                    autoFocus
                    style={{ fontWeight: '700', borderColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Custom unit label (displays as / {formData.priceType || 'unit'})
                  </span>
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <FormSelect
                label="Currency"
                required
                options={[
                  { value: 'INR', label: '🇮🇳 INR (₹)' },
                  { value: 'USD', label: '🇺🇸 USD ($)' },
                  { value: 'EUR', label: '🇪🇺 EUR (€)' },
                  { value: 'AED', label: '🇦🇪 AED (د.إ)' }
                ]}
                value={formData.currency}
                onChange={(val) => setFormData({ ...formData, currency: val })}
              />
            </div>

            {/* Tax Percentage */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>Tax / GST Rate (%)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 5, 12, 18"
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--text-muted)' }}>%</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Applicable GST/VAT percentage</span>
            </div>

            {/* Tax Inclusion Toggle */}
            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Tax Policy</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${formData.isTaxIncluded ? 'var(--primary)' : 'var(--border)'}`,
                    background: formData.isTaxIncluded ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: formData.isTaxIncluded ? '700' : '500'
                  }}
                >
                  <input
                    type="radio"
                    name="taxInclusion"
                    checked={formData.isTaxIncluded === true}
                    onChange={() => setFormData({ ...formData, isTaxIncluded: true })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Inclusive of Taxes (GST Included)</span>
                </label>
                <label 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${!formData.isTaxIncluded ? 'var(--primary)' : 'var(--border)'}`,
                    background: !formData.isTaxIncluded ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: !formData.isTaxIncluded ? '700' : '500'
                  }}
                >
                  <input
                    type="radio"
                    name="taxInclusion"
                    checked={formData.isTaxIncluded === false}
                    onChange={() => setFormData({ ...formData, isTaxIncluded: false })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Exclusive (+ Tax Added at Checkout)</span>
                </label>
              </div>
            </div>

            {/* Pricing Terms / Notes */}
            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>Pricing Terms & Booking Deposit Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Requires 20% advance booking deposit. Non-refundable cancellation within 48h."
                value={formData.priceNotes}
                onChange={(e) => setFormData({ ...formData, priceNotes: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Special pricing policy or deposit instructions</span>
            </div>

            {/* Live Pricing Customer Preview Banner */}
            <div style={{ gridColumn: 'span 12 / span 12', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.06) 0%, rgba(16, 185, 129, 0.08) 100%)', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(var(--primary-rgb), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800', color: 'var(--text-muted)' }}>
                    Customer Price Card Preview
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)' }}>
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'AED' ? 'AED ' : '₹'}
                      {(formData.discountPrice && Number(formData.discountPrice) > 0 ? Number(formData.discountPrice) : Number(formData.price) || 0).toLocaleString()}
                    </span>
                    {(formData.originalPrice || (formData.discountPrice && formData.price)) && Number(formData.originalPrice || formData.price) > (formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price)) && (
                      <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'AED' ? 'AED ' : '₹'}
                        {Number(formData.originalPrice || formData.price).toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                      / {formData.priceType || 'Per Person'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {formData.discountPrice && Number(formData.discountPrice) > 0 && Number(formData.price || formData.originalPrice) > Number(formData.discountPrice) && (
                  <span style={{ background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingDown size={14} />
                    {Math.round(((Number(formData.price || formData.originalPrice) - Number(formData.discountPrice)) / Number(formData.price || formData.originalPrice)) * 100)}% OFF
                  </span>
                )}
                <span style={{ background: formData.isTaxIncluded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: formData.isTaxIncluded ? '#15803d' : '#b45309', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>
                  {formData.isTaxIncluded ? `Incl. ${formData.taxPercentage || 0}% GST` : `+${formData.taxPercentage || 0}% GST Extra`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Form Setup Fields Section */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Sparkles size={18} /> Form Setup Fields
            </h3>
            {selectedService && (
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '800', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                background: 'rgba(var(--primary-rgb), 0.1)', 
                color: 'var(--primary)',
                border: '1px solid rgba(var(--primary-rgb), 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Briefcase size={14} /> Service Setup: {selectedService.title}
              </span>
            )}
          </div>

          {customFields && customFields.length > 0 ? (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Form fields configured for <strong>{selectedServiceTitle}</strong> in Form Setup.
              </p>
              <FormGenerator 
                fields={customFields} 
                values={customData} 
                onChange={setCustomData} 
                errors={fieldErrors}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1.5px dashed var(--border)' }}>
              <AlertCircle size={36} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                Form fields not available.
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                No custom form fields have been configured for <strong>{selectedServiceTitle}</strong> in Form Setup.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => navigate('/packages')}
            disabled={submitting}
            style={{ height: '48px', padding: '0 24px' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
            style={{ height: '48px', padding: '0 32px', fontWeight: '700' }}
          >
            <Save size={18} /> {submitting ? 'Saving...' : (isEditMode ? 'Save Package Changes' : 'Publish Package')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageCreate;
