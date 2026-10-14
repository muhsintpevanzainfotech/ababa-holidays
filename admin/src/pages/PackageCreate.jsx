import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import FormSelect from '../components/FormSelect';
import FormGenerator from '../components/FormGenerator';
import SearchableMultiSelect from '../components/SearchableMultiSelect';
import { getImageUrl } from '../utils/constants';
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
  TrendingDown,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Clock,
  MapPin,
  CheckCircle,
  X,
  FileText,
  FileEdit,
  Check,
  Info,
  Globe,
  Calendar,
  Star,
  Award,
  Compass,
  CalendarDays,
  Bookmark
} from 'lucide-react';
import { fetchServicesRequest } from '../store/slices/servicesSlice';
import { fetchSubServicesRequest } from '../store/slices/subServicesSlice';
import { fetchCategoriesRequest } from '../store/slices/categoriesSlice';
import { fetchVendorsRequest } from '../store/slices/vendorsSlice';
import { addPackageRequest, updatePackageRequest, addPackageSuccess, updatePackageSuccess } from '../store/slices/packagesSlice';
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

  // Core Form State matching complete backend Package Schema
  const [formData, setFormData] = useState({
    customId: '',
    title: '',
    packageName: '',
    description: '',
    packageDescription: '',
    duration: '',
    location: '',
    destination: '',
    serviceCategory: '',
    subService: '',
    category: '',
    selectedSubServices: [],
    selectedCategories: [],
    vendor: '',
    isActive: true,
    status: isCorrection ? 'Correction' : 'Active',
    // Package Badges & Featured flags
    isFeatured: true,
    isTopPick: false,
    topRated: true,
    badge: '',
    // Package Pricing & Rate Section
    price: '',
    originalPrice: '',
    discountPrice: '',
    priceType: 'Per Person',
    currency: 'INR',
    taxPercentage: '5',
    isTaxIncluded: true,
    priceNotes: '',
    // Inclusions, Exclusions & Correction
    inclusions: '',
    exclusions: '',
    correctionNotes: '',
    images: [],
    // Day-by-Day Itinerary: [{ day: 1, title: '', description: '' }]
    itinerary: [],
    // Availability / Departure Dates: ['YYYY-MM-DD']
    availabilityDates: [],
    // Search Engine Optimization (SEO Console)
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [newDateInput, setNewDateInput] = useState('');
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
    const parentId = (sub.service?._id || sub.service || '').toString();
    return parentId === formData.serviceCategory.toString();
  });

  // Filter categories belonging to selected Service Category and Sub-Service
  const availableCategories = categories.filter(c => {
    if (formData.subService) {
      const catSubId = (c.subService?._id || c.subService || '').toString();
      if (catSubId && catSubId === formData.subService.toString()) return true;
    }
    if (formData.serviceCategory) {
      const catSvcId = (c.service?._id || c.service || '').toString();
      if (catSvcId && catSvcId === formData.serviceCategory.toString()) return true;
    }
    if (!formData.serviceCategory && !formData.subService) return true;
    return false;
  });
  const categoriesForForm = availableCategories.length > 0 ? availableCategories : categories;

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

  // Ensure default vendor is set once vendors are loaded
  useEffect(() => {
    if (!formData.vendor && vendors.length > 0) {
      setFormData(prev => ({ ...prev, vendor: prev.vendor || vendors[0]._id }));
    }
  }, [vendors, formData.vendor]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/packages/${id}`);
      const pkg = res.data.data;
      
      const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service || '';
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

      const pkgSubServices = pkg.subServices?.length 
        ? pkg.subServices.map(s => s._id || s) 
        : (pkg.selectedSubServices?.length ? pkg.selectedSubServices : (pkgSubSvcId ? [pkgSubSvcId] : []));
      
      const pkgCategories = pkg.categories?.length 
        ? pkg.categories.map(c => c._id || c) 
        : (pkg.selectedCategories?.length ? pkg.selectedCategories : (pkgCategoryId ? [pkgCategoryId] : []));

      setFormData({
        customId: pkg.customId || '',
        title: pkg.title || pkg.packageName || '',
        packageName: pkg.packageName || pkg.title || '',
        description: pkg.description || pkg.packageDescription || '',
        packageDescription: pkg.packageDescription || pkg.description || '',
        duration: pkg.duration || '',
        location: pkg.location || pkg.destination || '',
        destination: pkg.destination || pkg.location || '',
        serviceCategory: pkgSvcId,
        subService: pkgSubSvcId,
        category: pkgCategoryId,
        selectedSubServices: pkgSubServices,
        selectedCategories: pkgCategories,
        vendor: pkgVendorId,
        isActive: isCorrection ? false : (pkg.isActive !== undefined ? pkg.isActive : true),
        status: isCorrection ? 'Correction' : (pkg.status || (pkg.isActive ? 'Active' : 'Inactive')),
        price: pkg.price !== undefined && pkg.price !== null ? pkg.price : (pkg.customData?.price || pkg.customData?.amount || ''),
        originalPrice: pkg.originalPrice !== undefined && pkg.originalPrice !== null ? pkg.originalPrice : '',
        discountPrice: pkg.discountPrice !== undefined && pkg.discountPrice !== null ? pkg.discountPrice : '',
        priceType: fetchedPriceType,
        currency: pkg.currency || 'INR',
        taxPercentage: pkg.taxPercentage !== undefined && pkg.taxPercentage !== null ? pkg.taxPercentage : '5',
        isTaxIncluded: pkg.isTaxIncluded !== undefined ? pkg.isTaxIncluded : true,
        priceNotes: pkg.priceNotes || '',
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : (pkg.inclusions || ''),
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : (pkg.exclusions || ''),
        correctionNotes: pkg.correctionNotes || '',
        images: Array.isArray(pkg.images) ? pkg.images : [],
        // Badges & Schema Visibility Flags
        isFeatured: pkg.isFeatured !== undefined ? pkg.isFeatured : true,
        isTopPick: pkg.isTopPick !== undefined ? pkg.isTopPick : false,
        topRated: pkg.topRated !== undefined ? pkg.topRated : true,
        badge: pkg.badge || '',
        // Day-by-Day Itinerary
        itinerary: Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 
          ? pkg.itinerary.map((item, idx) => ({
              day: item.day || idx + 1,
              title: item.title || '',
              description: item.description || ''
            }))
          : [],
        // Availability / Departure Dates
        availabilityDates: Array.isArray(pkg.availabilityDates)
          ? pkg.availabilityDates.map(d => typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0])
          : [],
        // Search Engine Optimization (SEO Console)
        seoTitle: pkg.seo?.title || pkg.seoTitle || '',
        seoDescription: pkg.seo?.description || pkg.seoDescription || '',
        seoKeywords: Array.isArray(pkg.seo?.keywords)
          ? pkg.seo.keywords.join(', ')
          : (pkg.seo?.keywords || pkg.seoKeywords || '')
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
      const raw = res.data?.data || res.data || [];
      const standardKeys = new Set([
        'title', 'packagename', 'package_name', 'name',
        'price', 'regularprice', 'originalprice', 'original_price', 'discountprice', 'discount_price',
        'pricetype', 'price_type', 'pricingunit', 'currency', 'taxrate', 'tax_rate', 'taxpercentage', 'tax_percentage', 'taxpolicy', 'tax_policy',
        'pricenotes', 'price_notes',
        'duration', 'days', 'nights',
        'location', 'destination', 'city', 'country',
        'description', 'packagedescription', 'package_description', 'overview', 'details',
        'inclusions', 'inclusion', 'exclusions', 'exclusion',
        'image', 'images', 'photos', 'gallery',
        'itinerary', 'schedule', 'dayschedule',
        'availability', 'availabilitydates', 'dates', 'departure_dates',
        'badge', 'tag', 'featured', 'isfeatured', 'toppick', 'istoppick', 'toprated',
        'status', 'isactive', 'active',
        'seotitle', 'seo_title', 'seodescription', 'seo_description', 'seokeywords', 'seo_keywords'
      ]);
      const filtered = Array.isArray(raw)
        ? raw.filter(f => {
            const key = (f.fieldName || f.name || f.key || f.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return !standardKeys.has(key);
          })
        : [];
      setCustomFields(filtered);
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      setCustomFields([]);
    }
  };

  // Image Upload & Gallery Handlers
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview blobs for UI display
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newPreviews]
    }));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const targetItem = formData.images[indexToRemove];
    
    // If it's a blob url from local upload, remove corresponding file from imageFiles
    if (typeof targetItem === 'string' && targetItem.startsWith('blob:')) {
      const blobIndex = formData.images
        .filter((img, i) => i <= indexToRemove && typeof img === 'string' && img.startsWith('blob:'))
        .length - 1;
      setImageFiles(prev => prev.filter((_, i) => i !== blobIndex));
    }

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  // Day-by-Day Itinerary Handlers
  const handleAddItineraryDay = () => {
    const nextDayNum = (formData.itinerary?.length || 0) + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        { day: nextDayNum, title: `Day ${nextDayNum}: `, description: '' }
      ]
    }));
  };

  const handleUpdateItineraryDay = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  const handleRemoveItineraryDay = (index) => {
    setFormData(prev => {
      const updated = (prev.itinerary || [])
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 }));
      return { ...prev, itinerary: updated };
    });
  };

  // Availability / Departure Dates Handlers
  const handleAddAvailabilityDate = () => {
    if (!newDateInput) return;
    if ((formData.availabilityDates || []).includes(newDateInput)) {
      setNewDateInput('');
      return;
    }
    setFormData(prev => ({
      ...prev,
      availabilityDates: [...(prev.availabilityDates || []), newDateInput].sort()
    }));
    setNewDateInput('');
  };

  const handleRemoveAvailabilityDate = (dateToRemove) => {
    setFormData(prev => ({
      ...prev,
      availabilityDates: (prev.availabilityDates || []).filter(d => d !== dateToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceCategory) {
      showToast('Validation Error', 'Please select a Service Category', 'error');
      return;
    }

    const pkgTitle = formData.title?.trim() || formData.packageName?.trim();
    if (!pkgTitle) {
      showToast('Validation Error', 'Please enter a Package Name / Title', 'error');
      return;
    }

    if (!formData.price && !formData.discountPrice) {
      showToast('Validation Error', 'Please specify a Base Price or Discount Price', 'error');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    
    // Intelligent pricing resolution & fallback
    const rawPrice = Number(formData.price) || Number(formData.discountPrice) || 0;
    const rawDiscount = Number(formData.discountPrice) || 0;
    const rawOriginal = Number(formData.originalPrice) || (rawDiscount > 0 ? rawPrice : 0);

    const finalPrice = rawDiscount > 0 ? rawDiscount : rawPrice;
    const pkgOriginalPrice = rawOriginal > 0 ? rawOriginal : finalPrice;
    const pkgDesc = formData.description?.trim() || formData.packageDescription?.trim() || 'Package details created via package manager';
    const pkgDuration = formData.duration?.trim() || 'N/A';
    const pkgLocation = formData.location?.trim() || formData.destination?.trim() || 'N/A';

    // Parse inclusions and exclusions into arrays
    const inclusionsArr = typeof formData.inclusions === 'string'
      ? formData.inclusions.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(formData.inclusions) ? formData.inclusions : []);

    const exclusionsArr = typeof formData.exclusions === 'string'
      ? formData.exclusions.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(formData.exclusions) ? formData.exclusions : []);

    // Filter out blob URLs from existing images list (only keep backend file paths or HTTP URLs)
    const existingRemoteImages = (formData.images || []).filter(
      img => typeof img === 'string' && !img.startsWith('blob:')
    );

    // Keep customData synced
    const updatedCustomData = {
      ...customData,
      title: pkgTitle,
      packageName: pkgTitle,
      description: pkgDesc,
      price: finalPrice,
      originalPrice: pkgOriginalPrice,
      discountPrice: rawDiscount
    };

    const finalSubService = selectionMode === 'single' ? formData.subService : (formData.selectedSubServices[0] || '');
    const finalCategory = selectionMode === 'single' ? formData.category : (formData.selectedCategories[0] || '');
    const finalSubServices = selectionMode === 'multiple' ? formData.selectedSubServices : (formData.subService ? [formData.subService] : []);
    const finalCategories = selectionMode === 'multiple' ? formData.selectedCategories : (formData.category ? [formData.category] : []);

    const targetStatus = formData.status || (isCorrection ? 'Correction' : 'Active');
    const targetIsActive = targetStatus === 'Active';

    // Clean itinerary: keep only items with title or description
    const cleanItinerary = (formData.itinerary || [])
      .filter(item => item.title?.trim() || item.description?.trim())
      .map((item, idx) => ({
        day: Number(item.day) || idx + 1,
        title: item.title?.trim() || `Day ${idx + 1}`,
        description: item.description?.trim() || ''
      }));

    // Clean availabilityDates: only valid dates
    const cleanAvailabilityDates = (formData.availabilityDates || []).filter(Boolean);

    // Prepare SEO metadata
    const seoKeywordsArr = typeof formData.seoKeywords === 'string'
      ? formData.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
      : (Array.isArray(formData.seoKeywords) ? formData.seoKeywords : []);

    const seoObj = {
      title: formData.seoTitle?.trim() || pkgTitle,
      description: formData.seoDescription?.trim() || (pkgDesc.length > 160 ? pkgDesc.substring(0, 157) + '...' : pkgDesc),
      keywords: seoKeywordsArr
    };

    const payload = {
      ...formData,
      title: pkgTitle,
      packageName: pkgTitle,
      description: pkgDesc,
      packageDescription: pkgDesc,
      duration: pkgDuration,
      location: pkgLocation,
      destination: pkgLocation,
      subService: finalSubService,
      category: finalCategory,
      selectedSubServices: finalSubServices,
      selectedCategories: finalCategories,
      subServices: finalSubServices,
      categories: finalCategories,
      price: finalPrice,
      originalPrice: pkgOriginalPrice,
      discountPrice: rawDiscount,
      priceType: formData.priceType || 'Per Person',
      currency: formData.currency || 'INR',
      taxPercentage: Number(formData.taxPercentage) || 0,
      isTaxIncluded: Boolean(formData.isTaxIncluded),
      priceNotes: formData.priceNotes || '',
      inclusions: inclusionsArr,
      exclusions: exclusionsArr,
      correctionNotes: formData.correctionNotes || '',
      status: targetStatus,
      isActive: targetIsActive,
      itinerary: cleanItinerary,
      availabilityDates: cleanAvailabilityDates,
      seo: seoObj,
      isFeatured: Boolean(formData.isFeatured),
      isTopPick: Boolean(formData.isTopPick),
      topRated: Boolean(formData.topRated),
      badge: formData.badge?.trim() || ''
    };

    Object.keys(payload).forEach(key => {
      // Exclude internal/UI-only helper fields
      if (['seoTitle', 'seoDescription', 'seoKeywords', 'newDateInput'].includes(key)) {
        return;
      }
      const val = payload[key];
      // Do not append empty string values for ObjectId reference fields
      if (['subService', 'category', 'service'].includes(key) && (val === '' || val === null || val === undefined)) {
        return;
      }
      if (key === 'images') {
        data.append('images', JSON.stringify(existingRemoteImages));
        return;
      }
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        data.append(key, JSON.stringify(val));
      } else if (val !== null && val !== undefined) {
        data.append(key, val);
      }
    });

    // Append newly uploaded image files for multer
    imageFiles.forEach(file => {
      data.append('images', file);
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
        const res = await api.put(`/packages/${id}`, data);
        const updatedPackage = res.data?.data || res.data;
        dispatch(updatePackageSuccess(updatedPackage));
        if (isCorrection || formData.status === 'Correction') {
          showToast('Correction Saved', 'Package correction details updated and submitted successfully.', 'success');
        } else {
          showToast('Updated', 'Package updated successfully.', 'success');
        }
      } else {
        const res = await api.post('/packages', data);
        const createdPackage = res.data?.data || res.data;
        dispatch(addPackageSuccess(createdPackage));
        showToast('Published', 'New package published successfully.', 'success');
      }
      navigate('/packages');
    } catch (err) {
      console.error('Package save error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save package';
      showToast('Error', errMsg, 'error');
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
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '70px' }}>
      {/* Top Header */}
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
            <p>
              {isCorrection 
                ? 'Review, correct and update package specifications before re-publishing' 
                : isEditMode 
                  ? 'Update package details, pricing, media and specifications' 
                  : 'Create and publish a new premium package experience'}
            </p>
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
            style={{ fontWeight: '700' }}
          >
            <Save size={18} /> {submitting ? 'Saving...' : (isCorrection ? 'Submit Corrections' : (isEditMode ? 'Save Changes' : 'Publish Package'))}
          </button>
        </div>
      </div>

      {/* SECTION: CORRECTION MODE NOTICE & INSTRUCTIONS BANNER */}
      {(isCorrection || formData.status === 'Correction') && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.12) 100%)', border: '1.5px solid #f59e0b', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wrench size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#b45309' }}>
                  Correction Mode Active
                </h4>
                <span style={{ fontSize: '11px', background: '#f59e0b', color: '#fff', padding: '1px 8px', borderRadius: '12px', fontWeight: '800' }}>
                  NEEDS CORRECTION
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                This package is flagged for correction. Review all package specifications, pricing, gallery photos, and dynamic fields below. Add or update correction instructions in the field below so vendors and reviewers are aligned.
              </p>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileEdit size={14} /> Correction Feedback & Required Changes Notes
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Detail the specific corrections needed or summary of changes made (e.g. Please update discount pricing, add high-resolution photos of hotel rooms, and clarify day 2 itinerary)..."
                  value={formData.correctionNotes}
                  onChange={(e) => setFormData({ ...formData, correctionNotes: e.target.value })}
                  style={{ background: '#ffffff', borderColor: '#f59e0b', fontSize: '13px', lineHeight: '1.5' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="package-form package-create-form">
        
        {/* ========================================================================= */}
        {/* SECTION 1: PACKAGE SPECIFICATIONS, SERVICES & CATEGORIES */}
        {/* ========================================================================= */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <PackageIcon size={18} /> Section 1: Package Specifications, Services & Categories
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              Core Details & Classification
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '20px' }}>
            
            {/* Package ID */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
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

            {/* Package Status */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <FormSelect 
                label="Package Status" 
                required 
                options={[
                  { value: 'Active', label: '🟢 Active (Published & Bookable)' },
                  { value: 'Correction', label: '🟠 Correction (Needs Correction)' },
                  { value: 'Draft', label: '🟡 Draft (Working Draft)' },
                  { value: 'Pending', label: '🔵 Pending (Review Required)' },
                  { value: 'Inactive', label: '🔴 Inactive (Hidden / Disabled)' },
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

            {/* Service Category */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <FormSelect 
                label="Service Category" 
                required 
                options={services.map(s => ({ value: s._id, label: s.title }))} 
                value={formData.serviceCategory} 
                onChange={(val) => setFormData(prev => ({
                  ...prev,
                  serviceCategory: val,
                  subService: '',
                  category: '',
                  selectedSubServices: [],
                  selectedCategories: []
                }))} 
              />
            </div>

            {/* Package Title / Name */}
            <div className="form-group" style={{ gridColumn: 'span 8 / span 8' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>
                Package Name / Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 5 Days Kashmir Luxury Tour Package"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, packageName: e.target.value })}
                style={{ fontWeight: '600', fontSize: '14px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Primary customer-facing title of the package experience</span>
            </div>

            {/* Offering Vendor */}
            <div className="form-group" style={{ gridColumn: 'span 4 / span 4' }}>
              <FormSelect 
                label="Offering Vendor / Partner" 
                required 
                options={vendors.map(v => ({ value: v._id, label: v.companyName || v.name }))} 
                value={formData.vendor} 
                onChange={(val) => setFormData({ ...formData, vendor: val })} 
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>
                Package Overview & Description
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Provide a comprehensive summary of the package, travel highlights, key sights, and tour schedule..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value, packageDescription: e.target.value })}
                style={{ fontSize: '13px', lineHeight: '1.6' }}
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
                    onChange={(val) => {
                      setFormData(prev => {
                        const updated = {
                          ...prev,
                          subService: val,
                          selectedSubServices: val ? [val] : []
                        };
                        if (prev.category) {
                          const catObj = categories.find(c => (c._id || '').toString() === prev.category.toString());
                          const catSubId = (catObj?.subService?._id || catObj?.subService || '').toString();
                          if (val && catSubId && catSubId !== val.toString()) {
                            updated.category = '';
                            updated.selectedCategories = [];
                          }
                        }
                        return updated;
                      });
                    }} 
                    placeholder={availableSubServices.length === 0 ? 'No sub services for this category' : 'Select Sub Service...'}
                    disabled={availableSubServices.length === 0}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
                  <FormSelect 
                    label="Package Category" 
                    options={categoriesForForm.map(c => ({ value: c._id, label: c.name || c.title }))} 
                    value={formData.category} 
                    onChange={(val) => setFormData({ ...formData, category: val, selectedCategories: val ? [val] : [] })} 
                    placeholder={categoriesForForm.length === 0 ? 'No categories found' : 'Select Category...'}
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
                    options={categoriesForForm.map(c => ({ value: c._id, label: c.name || c.title }))}
                    value={formData.selectedCategories}
                    onChange={(val) => setFormData({ ...formData, selectedCategories: val, category: val[0] || '' })}
                    placeholder="Search & select multiple categories..."
                  />
                </div>
              </>
            )}

            {/* Inclusions & Exclusions */}
            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                <CheckCircle size={14} /> Inclusions (Comma-Separated)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 4-Star Hotel, Daily Breakfast & Dinner, Airport Transfers, Tour Guide"
                value={formData.inclusions}
                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Items, amenities and services included in the cost</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 6 / span 6' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
                <X size={14} /> Exclusions (Comma-Separated)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Airfare, Personal Expenses, Lunch, Entry Tickets, GST Extra"
                value={formData.exclusions}
                onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Services not included in package price</span>
            </div>

            {/* Visibility, Badges & Showcase Highlights */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12', marginTop: '6px', padding: '16px 18px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Award size={16} color="var(--primary)" /> Promotional Badges & Showcase Visibility
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Control front-end ribbons and homepage highlights</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '16px' }}>
                {/* Promotional Ribbon Badge Text */}
                <div style={{ gridColumn: 'span 6 / span 12' }}>
                  <label style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bookmark size={13} color="var(--primary)" /> Promotional Ribbon Badge
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bestseller, Trending, Hot Deal, Luxury Special"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{ fontSize: '13px' }}
                  />
                  {/* Quick Preset Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {['BESTSELLER', 'HOT DEAL', 'TRENDING', 'TOP CHOICE', 'LIMITED SEATS', 'LUXURY'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: tag })}
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: formData.badge === tag ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: formData.badge === tag ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                          color: formData.badge === tag ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        +{tag}
                      </button>
                    ))}
                    {formData.badge && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: '' })}
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Checkbox Toggles: isFeatured, isTopPick, topRated */}
                <div style={{ gridColumn: 'span 6 / span 12', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: formData.isFeatured ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                      border: `1px solid ${formData.isFeatured ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: formData.isFeatured ? '700' : '500'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} color="#f59e0b" fill={formData.isFeatured ? "#f59e0b" : "none"} />
                      <span>Featured Experience (Highlight on Homepage & Discover)</span>
                    </div>
                  </label>

                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: formData.isTopPick ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      border: `1px solid ${formData.isTopPick ? '#10b981' : 'var(--border)'}`,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: formData.isTopPick ? '700' : '500'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isTopPick}
                      onChange={(e) => setFormData({ ...formData, isTopPick: e.target.checked })}
                      style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="#10b981" />
                      <span>Top Pick (Editor's Recommended Choice)</span>
                    </div>
                  </label>

                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: formData.topRated ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      border: `1px solid ${formData.topRated ? '#3b82f6' : 'var(--border)'}`,
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: formData.topRated ? '700' : '500'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.topRated}
                      onChange={(e) => setFormData({ ...formData, topRated: e.target.checked })}
                      style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="#3b82f6" />
                      <span>Top Rated (High Customer Review Badge)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Package Photo Gallery & Media Section */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12', marginTop: '10px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ImageIcon size={16} color="var(--primary)" /> Package Photo Gallery & Media
              </label>

              {/* Upload & Add URL controls */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                <label 
                  className="btn btn-outline" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    margin: 0
                  }}
                >
                  <Upload size={16} /> Choose Images from Device
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    style={{ display: 'none' }} 
                  />
                </label>

                <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleAddImageUrl}
                    style={{ padding: '0 16px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={16} /> Add URL
                  </button>
                </div>
              </div>

              {/* Image Previews Grid */}
              {formData.images && formData.images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', background: 'var(--bg-main)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  {formData.images.map((imgSrc, idx) => {
                    const resolvedUrl = typeof imgSrc === 'string' && imgSrc.startsWith('blob:') 
                      ? imgSrc 
                      : getImageUrl(imgSrc);
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          position: 'relative', 
                          height: '100px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: '#f1f5f9'
                        }}
                      >
                        <img 
                          src={resolvedUrl} 
                          alt={`Package preview ${idx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/public/defaults/default_travel.png'; }}
                        />
                        {idx === 0 && (
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--primary)', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px' }}>
                            COVER
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{ 
                            position: 'absolute', 
                            top: '4px', 
                            right: '4px', 
                            background: 'rgba(220, 38, 38, 0.9)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            width: '22px', 
                            height: '22px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer' 
                          }}
                          title="Remove image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px dashed var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No photos added yet. Upload high quality package photos to attract travellers.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: PACKAGE PRICING & RATE DETAILS */}
        {/* ========================================================================= */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <DollarSign size={18} /> Section 2: Package Pricing & Rate Details
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
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

            {/* Tax Inclusion Policy */}
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

        {/* ========================================================================= */}
        {/* SECTION 3: DAY-BY-DAY TOUR ITINERARY & SCHEDULE */}
        {/* ========================================================================= */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <CalendarDays size={18} /> Section 3: Day-by-Day Tour Itinerary & Schedule
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Outline the chronological travel plan, daily sightseeing spots, meal plans and activities for travelers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleAddItineraryDay}
                style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Add Day { (formData.itinerary?.length || 0) + 1 }
              </button>
            </div>
          </div>

          {formData.itinerary && formData.itinerary.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {formData.itinerary.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '16px 18px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ 
                        background: 'var(--primary)', 
                        color: '#fff', 
                        fontSize: '12px', 
                        fontWeight: '800', 
                        padding: '4px 10px', 
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        Day {item.day || idx + 1}
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`e.g. Day ${item.day || idx + 1}: Arrival, Transfer & Evening Sightseeing`}
                        value={item.title}
                        onChange={(e) => handleUpdateItineraryDay(idx, 'title', e.target.value)}
                        style={{ fontWeight: '600', fontSize: '13px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryDay(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Remove this day"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Describe the day's schedule, key sights visited, inclusions (breakfast/dinner), and hotel stay details..."
                      value={item.description}
                      onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                      style={{ fontSize: '13px', lineHeight: '1.5' }}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItineraryDay}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px dashed var(--primary)',
                  background: 'rgba(var(--primary-rgb), 0.04)',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <Plus size={16} /> Add Day { (formData.itinerary?.length || 0) + 1 } to Itinerary
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1.5px dashed var(--border)' }}>
              <Compass size={36} color="var(--primary)" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                No itinerary days added yet
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                Adding a day-by-day travel itinerary helps travelers visualize their trip and increases bookings.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddItineraryDay}
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '700' }}
                >
                  <Plus size={15} /> Add Day 1 Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: DYNAMIC FORM SETUP FIELDS */}
        {/* ========================================================================= */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Sparkles size={18} /> Section 4: Form Setup Fields & Custom Category Specifications
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
                <Briefcase size={14} /> Setup for: {selectedService.title}
              </span>
            )}
          </div>

          {customFields && customFields.length > 0 ? (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Form fields dynamically configured for <strong>{selectedServiceTitle}</strong> in Form Setup.
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
                No custom form setup fields configured.
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Service <strong>{selectedServiceTitle}</strong> uses standard package fields. Additional dynamic fields can be configured in Package Setup builder.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: SEARCH ENGINE OPTIMIZATION (SEO CONSOLE) */}
        {/* ========================================================================= */}
        <div className="card allow-overflow" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Globe size={18} /> Section 5: Search Engine Optimization (SEO Console & SERP)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Configure search engine meta tags and keywords to improve organic search rankings on Google and social shares.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              Meta & Indexing
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '18px' }}>
            {/* Meta Title */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>
                  SEO Meta Title
                </label>
                <span style={{ fontSize: '11px', color: (formData.seoTitle?.length || 0) > 60 ? '#ef4444' : 'var(--text-muted)' }}>
                  {formData.seoTitle?.length || 0}/60 characters (Recommended: 50-60)
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={formData.title || 'e.g. 5 Days Luxury Kashmir Tour Package | Ababa Travels'}
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                style={{ fontSize: '13px' }}
              />
            </div>

            {/* Meta Description */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>
                  SEO Meta Description
                </label>
                <span style={{ fontSize: '11px', color: (formData.seoDescription?.length || 0) > 160 ? '#ef4444' : 'var(--text-muted)' }}>
                  {formData.seoDescription?.length || 0}/160 characters (Recommended: 120-160)
                </span>
              </div>
              <textarea
                className="form-control"
                rows={2}
                placeholder={formData.description ? (formData.description.length > 155 ? formData.description.substring(0, 155) + '...' : formData.description) : 'Book your unforgettable holiday package with Ababa Travels. Top hotels, verified tours and 24/7 support.'}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>

            {/* Meta Keywords */}
            <div className="form-group" style={{ gridColumn: 'span 12 / span 12' }}>
              <label style={{ fontWeight: '600', fontSize: '13px' }}>
                SEO Keywords (Comma-Separated)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. kashmir tour, srinagar package, dal lake houseboat, gulmarg gondola, holiday package"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                style={{ fontSize: '13px' }}
              />
            </div>

            {/* Google SERP Live Snippet Box */}
            <div style={{ gridColumn: 'span 12 / span 12', marginTop: '6px' }}>
              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Google Search Snippet Preview
                </div>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ fontSize: '12px', color: '#202124', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>ababaholidays.com</span>
                    <span style={{ color: '#5f6368' }}>› packages › {(formData.title || 'package-name').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                  </div>
                  <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: '500', textDecoration: 'none', lineHeight: '1.3', marginBottom: '4px', cursor: 'pointer' }}>
                    {formData.seoTitle || formData.title || 'Discover Premium Holiday Packages | Ababa Travels'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: '1.4' }}>
                    {formData.seoDescription || formData.description || 'Explore curated vacation packages, custom itineraries, luxury stays, and memorable tour experiences with Ababa Travels.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <Save size={18} /> {submitting ? 'Saving...' : (isCorrection ? 'Submit Package Corrections' : (isEditMode ? 'Save Package Changes' : 'Publish Package'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageCreate;
