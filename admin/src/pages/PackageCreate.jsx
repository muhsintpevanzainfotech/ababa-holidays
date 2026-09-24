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
  Tag
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
    status: 'Active'
  });

  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

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

      setFormData({
        customId: pkg.customId || '',
        serviceCategory: pkgSvcId,
        subService: pkgSubSvcId,
        category: pkgCategoryId,
        selectedSubServices: pkg.subServices ? pkg.subServices.map(s => s._id || s) : (pkgSubSvcId ? [pkgSubSvcId] : []),
        selectedCategories: pkg.categories ? pkg.categories.map(c => c._id || c) : (pkgCategoryId ? [pkgCategoryId] : []),
        vendor: pkgVendorId,
        isActive: isCorrection ? false : (pkg.isActive !== undefined ? pkg.isActive : true),
        status: isCorrection ? 'Correction' : (pkg.status || (pkg.isActive ? 'Active' : 'Inactive'))
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
    
    // Provide intelligent fallback for Mongoose required schema fields
    const pkgTitle = customData.title || customData.packageName || customData.name || customData.packageTitle || `${selectedServiceTitle} Package`;
    const pkgPrice = customData.price || customData.amount || customData.rate || 0;
    const pkgDesc = customData.description || customData.details || customData.summary || 'Package record created via form setup';
    const pkgDuration = customData.duration || customData.days || 'N/A';
    const pkgLocation = customData.location || customData.destination || customData.city || 'N/A';

    const payload = {
      ...formData,
      title: pkgTitle,
      price: pkgPrice,
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
    data.append('customData', JSON.stringify(customData));

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

      <form onSubmit={handleSubmit}>
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
                label="Sub Service" 
                options={availableSubServices.map(sub => ({ value: sub._id, label: sub.title }))} 
                value={formData.subService} 
                onChange={(val) => setFormData({ ...formData, subService: val })} 
                placeholder={availableSubServices.length === 0 ? 'No sub services for this service' : 'Select Sub Service...'}
                disabled={availableSubServices.length === 0}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <FormSelect 
                label="Package Category" 
                options={categories.map(c => ({ value: c._id, label: c.name || c.title }))} 
                value={formData.category} 
                onChange={(val) => setFormData({ ...formData, category: val })} 
                placeholder="Select Category..."
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

            <div style={{ gridColumn: 'span 6 / span 6' }}>
              <SearchableMultiSelect
                label="Multiple Sub Services (Searchable Multi-Select)"
                options={availableSubServices.map(s => ({ value: s._id, label: s.title }))}
                value={formData.selectedSubServices}
                onChange={(val) => setFormData({ ...formData, selectedSubServices: val })}
                placeholder="Search & select multiple sub services..."
              />
            </div>

            <div style={{ gridColumn: 'span 6 / span 6' }}>
              <SearchableMultiSelect
                label="Multiple Categories & Tags (Searchable Multi-Select)"
                options={categories.map(c => ({ value: c._id, label: c.name || c.title }))}
                value={formData.selectedCategories}
                onChange={(val) => setFormData({ ...formData, selectedCategories: val })}
                placeholder="Search & select multiple categories..."
              />
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
