import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Grid, Typography, Button, Stack, Box, TextField, InputAdornment,
  Paper, Chip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Card, CardContent, CardMedia, Divider, CircularProgress, Avatar,
  Snackbar, Alert, ToggleButton, ToggleButtonGroup, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Autocomplete, Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import DynamicPackageForm from './DynamicPackageForm';
import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

// assets / icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LayersIcon from '@mui/icons-material/Layers';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TuneIcon from '@mui/icons-material/Tune';
import SellIcon from '@mui/icons-material/Sell';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PublicIcon from '@mui/icons-material/Public';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CloseIcon from '@mui/icons-material/Close';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckIcon from '@mui/icons-material/Check';

const getFullImageUrl = (path) => {
  const baseUrl = import.meta.env.VITE_APP_API_URL
    ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '')
    : '';

  if (!path || typeof path !== 'string') return `${baseUrl}/public/defaults/default_travel.png`;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;

  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

const PackagesManagement = () => {
  const theme = useTheme();
  const { isDark: isDarkMode } = useThemeMode();
  const { user } = useSelector((state) => state.auth);
  const isAdminUser = ['Admin', 'Sub-Admin', 'Staff'].includes(user?.role);
  const isSystemAdmin = ['Admin', 'Sub-Admin'].includes(user?.role);
  const isVendorStaff = user && (user.role === 'Vendor-Staff' || user.role === 'vendor-staff');
  const isVendorAdmin = ['Admin', 'Sub-Admin', 'Vendor', 'vendor', 'Vendor-Admin'].includes(user?.role);
  const currentUserId = (user?._id || user?.id || '').toString();
  const hasPackagePermission = !isVendorStaff || (Array.isArray(user?.permissions) ? user.permissions.includes('manage_packages') : true);

  const [searchParams, setSearchParams] = useSearchParams();
  const { customId, serviceName } = useParams();
  const initialServiceId = searchParams.get('service') || 'all';

  // Data states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);

  // Selected Service & Filter states
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Multi-image state for grid cards & quick view modal
  const [cardActiveImages, setCardActiveImages] = useState({});
  const [viewImageIndex, setViewImageIndex] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Toast notifications state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const [subServices, setSubServices] = useState([]);
  const [categories, setCategories] = useState([]);

  // Custom Billing Units State
  const [customUnits, setCustomUnits] = useState([
    'Per Person', 'Per Adult', 'Per Child', 'Per Couple', 'Per Group',
    'Per Room', 'Per Night', 'Per Day', 'Per Vehicle', 'Fixed Rate', 'Starting From'
  ]);
  const [openCustomUnitDialog, setOpenCustomUnitDialog] = useState(false);
  const [newCustomUnitInput, setNewCustomUnitInput] = useState('');

  // Form Setup fields states
  const [configuredFields, setConfiguredFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [dynamicValues, setDynamicValues] = useState({});
  const [customFiles, setCustomFiles] = useState({});

  // Form State for Package (supporting full backend schema)
  const [formData, setFormData] = useState({
    title: '',
    packageName: '',
    serviceCategory: '',
    selectionMode: 'single', // 'single' | 'multiple'
    subService: '',
    subServices: [],
    category: '',
    categories: [],
    price: '',
    originalPrice: '',
    discountPrice: '',
    priceType: '',
    currency: 'INR (₹)',
    taxRate: '18',
    taxPolicy: 'inclusive', // 'inclusive' | 'exclusive'
    priceNotes: '',
    duration: '',
    location: '',
    description: '',
    packageDescription: '',
    inclusions: '',
    exclusions: '',
    status: 'Active',
    badge: '',
    isFeatured: true,
    isTopPick: false,
    topRated: true,
    images: [],
    newUrlInput: '',
    itinerary: [],
    availabilityDates: [],
    newDateInput: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, servicesRes, packagesRes, subServicesRes, categoriesRes] = await Promise.all([
        api.get('/vendors/profile').catch(() => ({ success: false })),
        api.get('/services').catch(() => ({ success: false })),
        api.get('/packages?limit=200').catch(() => ({ success: false })),
        api.get('/sub-services?limit=200').catch(() => ({ success: false })),
        api.get('/categories?limit=200').catch(() => ({ success: false }))
      ]);

      if (servicesRes.success || servicesRes.data) {
        setServices(servicesRes.data || servicesRes || []);
      }

      if (profileRes.success && profileRes.data) {
        setVendorProfile(profileRes.data.profile || {});
      }

      if (packagesRes.success || packagesRes.data) {
        const rawPkgs = packagesRes.data || packagesRes || [];
        const loadedPkgs = Array.isArray(rawPkgs) ? rawPkgs : (Array.isArray(rawPkgs.data) ? rawPkgs.data : []);
        // Deduplicate packages by ID to prevent repeated data items
        const uniqueMap = new Map();
        loadedPkgs.forEach((p) => {
          const key = (p._id || p.customId || '').toString();
          if (key && !uniqueMap.has(key)) {
            uniqueMap.set(key, p);
          }
        });
        const uniquePkgs = Array.from(uniqueMap.values());
        setPackages(uniquePkgs);
        const loadedUnits = uniquePkgs.map(p => p.priceType).filter(Boolean);
        if (loadedUnits.length > 0) {
          setCustomUnits(prev => Array.from(new Set([...prev, ...loadedUnits])));
        }
      }

      if (subServicesRes.success || subServicesRes.data) {
        setSubServices(subServicesRes.data || subServicesRes || []);
      }

      if (categoriesRes.success || categoriesRes.data) {
        setCategories(categoriesRes.data || categoriesRes || []);
      }
    } catch (error) {
      console.error('Failed to load packages or services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update selectedServiceId when URL query or route parameters change
  useEffect(() => {
    const qService = searchParams.get('service');
    if (qService) {
      setSelectedServiceId(qService);
    } else if (customId || serviceName) {
      const match = services.find(
        (s) =>
          (customId && (s.customId === customId || s._id === customId)) ||
          (serviceName && s.title && s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === serviceName)
      );
      if (match) {
        setSelectedServiceId(match._id);
      } else if (customId) {
        setSelectedServiceId(customId);
      }
    } else {
      setSelectedServiceId('all');
    }
  }, [searchParams, customId, serviceName, services]);

  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setPage(0);
    if (serviceId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ service: serviceId });
    }
  };

  // Check if a package matches the service filter (by ID or title keyword)
  const matchesServiceFilter = (pkg, filterVal) => {
    if (!filterVal || filterVal === 'all') return true;
    const pkgSvcId = (pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service || '').toString();
    if (pkgSvcId && pkgSvcId === filterVal.toString()) return true;

    const pkgSvcTitle = (
      pkg.serviceCategory?.title ||
      pkg.serviceCategory?.name ||
      pkg.service?.title ||
      pkg.service?.name ||
      pkg.serviceName ||
      pkg.category ||
      ''
    ).toLowerCase();

    const searchVal = filterVal.toLowerCase();
    return pkgSvcTitle.includes(searchVal) || searchVal.includes(pkgSvcTitle);
  };

  const matchesCreator = (pkg) => {
    // System Admins (Admin, Sub-Admin) can view and control ALL packages
    if (isSystemAdmin) return true;

    // Vendors & Vendor Staff can ONLY view & control packages created by themselves or belonging to their vendor account
    const creatorId = (pkg.createdBy?._id || pkg.createdBy?.id || pkg.createdBy || '').toString();
    const pkgVendorId = (pkg.vendor?._id || pkg.vendor?.id || pkg.vendor || '').toString();
    const effectiveVendorId = (user?.effectiveVendorId || user?.managedBy || currentUserId).toString();

    if (!creatorId && !pkgVendorId) return true;

    return (
      creatorId === currentUserId ||
      creatorId === effectiveVendorId ||
      pkgVendorId === currentUserId ||
      pkgVendorId === effectiveVendorId
    );
  };

  const getCreatorDetails = (pkg) => {
    if (!pkg) return { isStaff: false, staffName: '', mainVendorName: 'Vendor', fullLabel: 'Vendor' };

    const mainVendorName = pkg.vendor?.companyName || pkg.vendor?.name || '';
    const staffName = pkg.createdBy?.name || '';
    const staffRole = (pkg.createdBy?.role || '').toLowerCase();

    const createdById = (pkg.createdBy?._id || pkg.createdBy?.id || pkg.createdBy || '').toString();
    const vendorId = (pkg.vendor?._id || pkg.vendor?.id || pkg.vendor || '').toString();

    const isStaff = staffRole.includes('staff') || (createdById && vendorId && createdById !== vendorId);

    if (isStaff && staffName) {
      return {
        isStaff: true,
        staffName,
        mainVendorName: mainVendorName || 'Main Vendor',
        fullLabel: `Staff: ${staffName} • Vendor: ${mainVendorName || 'Main Vendor'}`
      };
    }

    const name = mainVendorName || staffName || 'Vendor Admin';
    return {
      isStaff: false,
      staffName: '',
      mainVendorName: name,
      fullLabel: name
    };
  };

  // Filter packages by selected Service, Creator, & search/status filters
  const filteredPackages = packages.filter((pkg) => {
    const matchesService = matchesServiceFilter(pkg, selectedServiceId);
    const matchesUserCreator = matchesCreator(pkg);

    const title = pkg.title || '';
    const loc = pkg.location || '';
    const customId = pkg.customId || '';
    const creatorName = (pkg.createdBy?.name || pkg.vendor?.companyName || pkg.vendor?.name || '').toLowerCase();
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatorName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
          ? (pkg.status === 'Active' || (pkg.status === undefined && pkg.isActive)) && pkg.status !== 'Correction'
          : statusFilter === 'Correction'
            ? pkg.status === 'Correction'
            : pkg.status === statusFilter;

    return matchesService && matchesUserCreator && matchesSearch && matchesStatus;
  });

  // Filter categories for the Package Form Dialog based on selected serviceCategory and subService
  const formFilteredCategories = categories.filter((c) => {
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
  const categoriesForForm = formFilteredCategories.length > 0 ? formFilteredCategories : categories;

  const paginatedPackages = filteredPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getPackageCountForService = (serviceId) => {
    if (serviceId === 'all') return filteredPackages.length;
    return filteredPackages.filter((pkg) => matchesServiceFilter(pkg, serviceId)).length;
  };

  const fetchFormSetupFields = async (svcId) => {
    if (!svcId) {
      setConfiguredFields([]);
      return;
    }
    setLoadingFields(true);
    try {
      const res = await api.get(`/package-fields/setup/${svcId}`);
      let fieldsArr = [];
      if (res) {
        if (Array.isArray(res.data)) fieldsArr = res.data;
        else if (Array.isArray(res.data?.data)) fieldsArr = res.data.data;
        else if (Array.isArray(res)) fieldsArr = res;
      }
      setConfiguredFields(fieldsArr);
    } catch (err) {
      console.error('Failed to load form setup fields:', err);
      setConfiguredFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const standardFieldKeys = new Set([
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

  const uniqueCustomFields = configuredFields.filter((f) => {
    const key = (f.fieldName || f.name || f.key || f.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return !standardFieldKeys.has(key);
  });

  // Open Create/Edit Package Dialog
  const handleOpenForm = (pkg = null) => {
    setSelectedPackage(pkg);
    setSelectedFiles([]);
    setCustomFiles({});

    const activeSvcId = pkg
      ? (pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service || (handledServices[0]?._id || services[0]?._id || ''))
      : ((selectedServiceId !== 'all' ? selectedServiceId : handledServices[0]?._id || services[0]?._id) || '');

    const existingImages = pkg ? (Array.isArray(pkg.images) ? [...pkg.images] : (pkg.images ? [pkg.images] : [])) : [];

    const initialDynamic = pkg
      ? {
        ...(pkg.customData || {}),
        packageName: pkg.packageName || pkg.title || '',
        title: pkg.title || pkg.packageName || '',
        price: pkg.price || '',
        originalPrice: pkg.originalPrice || '',
        discountPrice: pkg.discountPrice || '',
        priceType: pkg.priceType || '',
        duration: pkg.duration || '',
        location: pkg.location || '',
        packageDescription: pkg.packageDescription || pkg.description || '',
        description: pkg.description || pkg.packageDescription || '',
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : pkg.inclusions || '',
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : pkg.exclusions || '',
        correctionNotes: pkg.correctionNotes || '',
        status: pkg.status || 'Active'
      }
      : {
        packageName: '',
        title: '',
        price: '',
        priceType: '',
        duration: '',
        location: '',
        packageDescription: '',
        description: '',
        inclusions: '',
        exclusions: '',
        correctionNotes: '',
        status: 'Active'
      };

    const isMultiMode = (Array.isArray(pkg?.subServices) && pkg.subServices.length > 0) || (Array.isArray(pkg?.categories) && pkg.categories.length > 0);
    const subSvcSelected = pkg?.subServices && pkg.subServices.length > 0
      ? pkg.subServices.map(s => s._id || s)
      : (pkg?.subService ? [pkg.subService._id || pkg.subService] : []);
    const catSelected = pkg?.categories && pkg.categories.length > 0
      ? pkg.categories.map(c => c._id || c)
      : (pkg?.category ? [pkg.category._id || pkg.category] : []);

    const pkgPriceType = pkg ? (pkg.priceType || '') : '';
    if (pkgPriceType && !customUnits.includes(pkgPriceType)) {
      setCustomUnits((prev) => [...prev, pkgPriceType]);
    }

    setFormData({
      packageName: pkg?.packageName || pkg?.title || '',
      title: pkg?.title || pkg?.packageName || '',
      serviceCategory: activeSvcId,
      selectionMode: isMultiMode ? 'multiple' : 'single',
      subService: pkg?.subService?._id || pkg?.subService || (subSvcSelected[0] || ''),
      subServices: subSvcSelected,
      category: pkg?.category?._id || pkg?.category || (catSelected[0] || ''),
      categories: catSelected,
      price: pkg?.price !== undefined && pkg?.price !== null ? pkg.price : '',
      originalPrice: pkg?.originalPrice !== undefined && pkg?.originalPrice !== null ? pkg.originalPrice : '',
      discountPrice: pkg?.discountPrice !== undefined && pkg?.discountPrice !== null ? pkg.discountPrice : '',
      priceType: pkgPriceType,
      currency: pkg?.currency || 'INR (₹)',
      taxRate: pkg?.taxRate !== undefined && pkg?.taxRate !== null ? pkg.taxRate : '18',
      taxPolicy: pkg?.taxPolicy || 'inclusive',
      priceNotes: pkg?.priceNotes || '',
      duration: pkg?.duration || '',
      location: pkg?.location || pkg?.destination || '',
      packageDescription: pkg?.packageDescription || pkg?.description || '',
      description: pkg?.description || pkg?.packageDescription || '',
      inclusions: Array.isArray(pkg?.inclusions) ? pkg.inclusions.join(', ') : (pkg?.inclusions || ''),
      exclusions: Array.isArray(pkg?.exclusions) ? pkg.exclusions.join(', ') : (pkg?.exclusions || ''),
      correctionNotes: pkg?.correctionNotes || '',
      status: pkg?.status || 'Active',
      badge: pkg?.badge || '',
      isFeatured: pkg?.isFeatured !== undefined ? pkg.isFeatured : true,
      isTopPick: pkg?.isTopPick !== undefined ? pkg.isTopPick : false,
      topRated: pkg?.topRated !== undefined ? pkg.topRated : true,
      images: existingImages,
      newUrlInput: '',
      itinerary: Array.isArray(pkg?.itinerary) && pkg.itinerary.length > 0
        ? pkg.itinerary.map((item, idx) => ({
            day: item.day || idx + 1,
            title: item.title || '',
            description: item.description || ''
          }))
        : [],
      availabilityDates: Array.isArray(pkg?.availabilityDates)
        ? pkg.availabilityDates.map(d => typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0])
        : [],
      newDateInput: '',
      seoTitle: pkg?.seo?.title || pkg?.seoTitle || '',
      seoDescription: pkg?.seo?.description || pkg?.seoDescription || '',
      seoKeywords: Array.isArray(pkg?.seo?.keywords)
        ? pkg.seo.keywords.join(', ')
        : (pkg?.seo?.keywords || pkg?.seoKeywords || '')
    });

    setDynamicValues(initialDynamic);
    if (activeSvcId) {
      fetchFormSetupFields(activeSvcId);
    }
    setOpenFormDialog(true);
  };

  const handleServiceCategoryChange = (newSvcId) => {
    setFormData((prev) => ({ ...prev, serviceCategory: newSvcId }));
    if (newSvcId) {
      fetchFormSetupFields(newSvcId);
    }
  };

  const handleDynamicValueChange = (fieldName, val) => {
    setDynamicValues((prev) => ({ ...prev, [fieldName]: val }));
    if (['title', 'price', 'priceType', 'duration', 'location', 'description', 'inclusions', 'exclusions', 'status'].includes(fieldName)) {
      setFormData((prev) => ({ ...prev, [fieldName]: val }));
    }
  };

  const handleDynamicFileChange = (fieldName, filesArr) => {
    setCustomFiles((prev) => ({ ...prev, [fieldName]: filesArr }));
  };

  // Itinerary Handlers
  const handleAddItineraryDay = () => {
    const nextDay = (formData.itinerary?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        { day: nextDay, title: `Day ${nextDay}: `, description: '' }
      ]
    }));
  };

  const handleUpdateItineraryDay = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.itinerary || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  const handleRemoveItineraryDay = (index) => {
    setFormData((prev) => {
      const updated = (prev.itinerary || [])
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 }));
      return { ...prev, itinerary: updated };
    });
  };

  // Availability / Departure Dates Handlers
  const handleAddAvailabilityDate = () => {
    if (!formData.newDateInput) return;
    if ((formData.availabilityDates || []).includes(formData.newDateInput)) {
      setFormData((prev) => ({ ...prev, newDateInput: '' }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availabilityDates: [...(prev.availabilityDates || []), prev.newDateInput].sort(),
      newDateInput: ''
    }));
  };

  const handleRemoveAvailabilityDate = (dateToRemove) => {
    setFormData((prev) => ({
      ...prev,
      availabilityDates: (prev.availabilityDates || []).filter((d) => d !== dateToRemove)
    }));
  };

  // Image Form Handlers
  const handleAddImageUrl = () => {
    const url = formData.newUrlInput.trim();
    if (!url) return;
    if (formData.images.includes(url)) {
      showToast('This image URL is already added', 'warning');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
      newUrlInput: ''
    }));
  };

  const handleSelectFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const newImgs = [...prev.images];
      const [target] = newImgs.splice(index, 1);
      newImgs.unshift(target);
      return { ...prev, images: newImgs };
    });
  };

  // Submit Package Form (JSON or FormData if local files attached)
  const handleSubmitForm = async () => {
    if (!formData.serviceCategory) {
      showToast('Please select a Service Category for this package', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const titleVal = (formData.packageName || formData.title || dynamicValues.packageName || dynamicValues.title || '').trim();
      if (!titleVal) {
        showToast('Please enter a Package Name / Title', 'error');
        setSubmitting(false);
        return;
      }

      const descVal = (formData.packageDescription || formData.description || dynamicValues.packageDescription || dynamicValues.description || '').trim();
      const rawPrice = Number(formData.price) || Number(formData.discountPrice) || 0;
      const rawDiscount = Number(formData.discountPrice) || 0;
      const rawOriginal = Number(formData.originalPrice) || (rawDiscount > 0 ? rawPrice : 0);
      const finalPrice = rawDiscount > 0 ? rawDiscount : rawPrice;
      const finalOriginal = rawOriginal > 0 ? rawOriginal : finalPrice;

      const inclusionsArr = typeof formData.inclusions === 'string'
        ? formData.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(formData.inclusions)
          ? formData.inclusions
          : [];

      const exclusionsArr = typeof formData.exclusions === 'string'
        ? formData.exclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(formData.exclusions)
          ? formData.exclusions
          : [];

      const cleanItinerary = (formData.itinerary || [])
        .filter((item) => item.title?.trim() || item.description?.trim())
        .map((item, idx) => ({
          day: Number(item.day) || idx + 1,
          title: item.title?.trim() || `Day ${idx + 1}`,
          description: item.description?.trim() || ''
        }));

      const cleanAvailabilityDates = (formData.availabilityDates || []).filter(Boolean);

      const seoKeywordsArr = typeof formData.seoKeywords === 'string'
        ? formData.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
        : Array.isArray(formData.seoKeywords)
          ? formData.seoKeywords
          : [];

      const seoObj = {
        title: formData.seoTitle?.trim() || titleVal,
        description: formData.seoDescription?.trim() || (descVal.length > 160 ? descVal.substring(0, 157) + '...' : descVal),
        keywords: seoKeywordsArr
      };

      const hasFiles = selectedFiles.length > 0 || Object.keys(customFiles).length > 0;
      const payloadCustomData = { ...dynamicValues };

      if (hasFiles) {
        const fd = new FormData();
        fd.append('packageName', titleVal);
        fd.append('title', titleVal);
        fd.append('serviceCategory', formData.serviceCategory);
        fd.append('service', formData.serviceCategory);
        if (formData.subService) fd.append('subService', formData.subService);
        if (formData.category) fd.append('category', formData.category);
        fd.append('price', finalPrice);
        fd.append('originalPrice', finalOriginal);
        fd.append('discountPrice', rawDiscount);
        fd.append('priceType', formData.priceType || 'Per Person');
        if (formData.priceNotes) fd.append('priceNotes', formData.priceNotes);
        fd.append('duration', formData.duration || dynamicValues.duration || 'N/A');
        fd.append('location', formData.location || dynamicValues.location || 'N/A');
        fd.append('destination', formData.location || dynamicValues.location || 'N/A');
        fd.append('packageDescription', descVal);
        fd.append('description', descVal);
        fd.append('selectionMode', formData.selectionMode || 'single');
        if (formData.selectionMode === 'multiple' && Array.isArray(formData.subServices)) {
          formData.subServices.forEach((subId) => fd.append('subServices', subId));
        }
        if (formData.selectionMode === 'multiple' && Array.isArray(formData.categories)) {
          formData.categories.forEach((catId) => fd.append('categories', catId));
        }
        fd.append('currency', formData.currency || 'INR (₹)');
        fd.append('taxRate', Number(formData.taxRate) || 0);
        fd.append('taxPercentage', Number(formData.taxRate) || 0);
        fd.append('taxPolicy', formData.taxPolicy || 'inclusive');
        fd.append('isTaxIncluded', formData.taxPolicy === 'inclusive');
        fd.append('status', formData.status || 'Active');
        fd.append('isActive', formData.status === 'Active');
        fd.append('correctionNotes', formData.correctionNotes || '');
        fd.append('badge', formData.badge?.trim() || '');
        fd.append('isFeatured', Boolean(formData.isFeatured));
        fd.append('isTopPick', Boolean(formData.isTopPick));
        fd.append('topRated', Boolean(formData.topRated));
        fd.append('itinerary', JSON.stringify(cleanItinerary));
        fd.append('availabilityDates', JSON.stringify(cleanAvailabilityDates));
        fd.append('seo', JSON.stringify(seoObj));
        fd.append('inclusions', JSON.stringify(inclusionsArr));
        fd.append('exclusions', JSON.stringify(exclusionsArr));
        fd.append('customData', JSON.stringify(payloadCustomData));

        // Existing remote images
        fd.append('images', JSON.stringify(formData.images || []));

        // Newly selected image files from local disk
        selectedFiles.forEach((file) => fd.append('images', file));

        // Custom data files
        Object.keys(customFiles).forEach((fName) => {
          const filesArr = customFiles[fName];
          if (Array.isArray(filesArr)) {
            filesArr.forEach((file) => fd.append(`customFile_${fName}`, file));
          }
        });

        if (selectedPackage) {
          await api.put(`/packages/${selectedPackage._id}`, fd, true);
        } else {
          await api.post('/packages', fd, true);
        }
      } else {
        const payload = {
          packageName: titleVal,
          title: titleVal,
          serviceCategory: formData.serviceCategory,
          service: formData.serviceCategory,
          selectionMode: formData.selectionMode || 'single',
          subService: formData.subService || undefined,
          subServices: formData.selectionMode === 'multiple' ? formData.subServices : undefined,
          category: formData.category || undefined,
          categories: formData.selectionMode === 'multiple' ? formData.categories : undefined,
          price: finalPrice,
          originalPrice: finalOriginal,
          discountPrice: rawDiscount,
          priceType: formData.priceType || 'Per Person',
          currency: formData.currency || 'INR (₹)',
          taxRate: Number(formData.taxRate) || 0,
          taxPercentage: Number(formData.taxRate) || 0,
          taxPolicy: formData.taxPolicy || 'inclusive',
          isTaxIncluded: formData.taxPolicy === 'inclusive',
          priceNotes: formData.priceNotes || '',
          duration: formData.duration || dynamicValues.duration || 'N/A',
          location: formData.location || dynamicValues.location || 'N/A',
          destination: formData.location || dynamicValues.location || 'N/A',
          packageDescription: descVal,
          description: descVal,
          status: formData.status || 'Active',
          isActive: formData.status === 'Active',
          correctionNotes: formData.correctionNotes || '',
          badge: formData.badge?.trim() || '',
          isFeatured: Boolean(formData.isFeatured),
          isTopPick: Boolean(formData.isTopPick),
          topRated: Boolean(formData.topRated),
          itinerary: cleanItinerary,
          availabilityDates: cleanAvailabilityDates,
          seo: seoObj,
          inclusions: inclusionsArr,
          exclusions: exclusionsArr,
          images: formData.images || [],
          customData: payloadCustomData
        };

        if (selectedPackage) {
          await api.put(`/packages/${selectedPackage._id}`, payload);
        } else {
          await api.post('/packages', payload);
        }
      }

      setOpenFormDialog(false);
      showToast(selectedPackage ? 'Package updated successfully!' : 'Package created successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to save package', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Package View Dialog & Reset Gallery View Index
  const handleOpenView = (pkg) => {
    setSelectedPackage(pkg);
    setViewImageIndex(0);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (pkg) => {
    setItemToDelete(pkg);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/packages/${itemToDelete._id}`);
      setOpenDeleteDialog(false);
      setItemToDelete(null);
      showToast('Package deleted successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to delete package', 'error');
    }
  };

  const handledServices = (isAdminUser || !vendorProfile?.selectedServices || vendorProfile.selectedServices.length === 0)
    ? services
    : services.filter((svc) => {
      const handledIds = vendorProfile.selectedServices.map((s) => (s._id ? s._id.toString() : s.toString()));
      return handledIds.includes(svc._id.toString());
    });

  const selectedServiceObj = handledServices.find((s) => s._id === selectedServiceId) || services.find((s) => s._id === selectedServiceId);

  const packageLimit = vendorProfile?.subscription?.packageLimit !== undefined ? vendorProfile.subscription.packageLimit : -1;
  const isPackagesAllowed = vendorProfile?.subscription?.packagesEnabled !== false && packageLimit !== 0;
  const isPackageLimitReached = packageLimit !== -1 && packages.length >= packageLimit;

  if (!loading && !isPackagesAllowed) {
    return (
      <Box>
        <SaasHeader title="Packages & Catalog" subtitle="Manage your travel packages and listings." />
        <SubscriptionRestrictedCard featureName="Packages Catalog" reason={packageLimit === 0 ? 'limit' : 'permission'} />
      </Box>
    );
  }

  if (!hasPackagePermission) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          backgroundColor: isDarkMode ? '#16152b' : '#ffffff',
          mt: 3
        }}
      >
        <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 800 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 3 }}>
          Your staff account does not have authorization to access Packages &amp; Listings management.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.href = '/dashboard'} sx={{ borderRadius: '10px', fontWeight: 700 }}>
          Return to Dashboard
        </Button>
      </Paper>
    );
  }

  if (openFormDialog) {
    return (
      <Grid container spacing={gridSpacing}>
        {/* TOAST SNACKBAR NOTIFICATION */}
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

        {/* FULL PAGE HEADER */}
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setOpenFormDialog(false)}
                  startIcon={<ChevronLeftIcon />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Back to Packages
                </Button>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {selectedPackage ? 'Edit Package Listing' : 'Create New Package Listing'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedPackage
                      ? `Update pricing, photos, location, and custom fields for "${selectedPackage.title}"`
                      : 'Fill in the package details, setup dynamic fields, and upload image galleries.'}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <Button onClick={() => setOpenFormDialog(false)} color="inherit" disabled={submitting} sx={{ borderRadius: '10px', px: 2.5 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmitForm}
                  disabled={submitting}
                  sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
                >
                  {submitting ? 'Saving Package...' : selectedPackage ? 'Update Package & Photos' : 'Create Package Listing'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {(selectedPackage?.status === 'Correction' || selectedPackage?.correctionNotes || formData.status === 'Correction') && (
          <Grid size={12}>
            <Alert 
              severity="warning" 
              variant="outlined"
              sx={{ 
                borderRadius: '14px', 
                bgcolor: 'rgba(245, 158, 11, 0.08)', 
                borderColor: '#f59e0b',
                p: 2
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="#b45309" gutterBottom>
                🟠 Correction Mode / Admin Review Feedback
              </Typography>
              <Typography variant="body2" color="#78350f" sx={{ mb: 1.5 }}>
                {selectedPackage?.correctionNotes || 'This package has been flagged for correction by the admin. Please update the relevant sections (pricing, photos, specifications) and submit your changes.'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Correction Notes / Response to Reviewer"
                value={formData.correctionNotes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, correctionNotes: e.target.value }))}
                placeholder="Note actions taken or changes made for the reviewer..."
              />
            </Alert>
          </Grid>
        )}

        {/* CARD 1: PACKAGE SPECIFICATIONS, SERVICES & CATEGORIES */}
        <Grid size={12}>
          <MainCard title="Package Specifications, Services & Categories">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  disabled
                  label="Package ID"
                  value={selectedPackage?.customId || 'AUTO'}
                  helperText="Auto-Generated (e.g. PKG202600001)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Chip label="AUTO" size="small" color="primary" sx={{ height: 20, fontSize: '10px', fontWeight: 800 }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Package Name *"
                  value={formData.packageName || formData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, packageName: val, title: val }));
                    handleDynamicValueChange('packageName', val);
                    handleDynamicValueChange('title', val);
                  }}
                  placeholder="e.g. 5 Days Kerala Luxury Tour Package"
                  required
                  helperText="Primary title/name of the package"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Package Description"
                  value={formData.packageDescription || formData.description || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, packageDescription: val, description: val }));
                    handleDynamicValueChange('packageDescription', val);
                    handleDynamicValueChange('description', val);
                  }}
                  placeholder="Detailed overview, highlights and summary of this package offering..."
                  helperText="Main description and overview of the package"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Package Status *"
                  value={formData.status}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, status: e.target.value }));
                    handleDynamicValueChange('status', e.target.value);
                  }}
                >
                  <MenuItem value="Active">🟢 Active &amp; Published</MenuItem>
                  <MenuItem value="Correction">🟠 Needs Correction</MenuItem>
                  <MenuItem value="Draft">🟡 Draft</MenuItem>
                  <MenuItem value="Pending">🔵 Pending Review</MenuItem>
                  <MenuItem value="Inactive">🔴 Inactive</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>
                    Offering Vendor / Partner *
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StorefrontIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="800">
                      {vendorProfile?.companyName || vendorProfile?.name || user?.name || 'Ababa Vendor Partner'}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Service Category *"
                  value={formData.serviceCategory}
                  onChange={(e) => handleServiceCategoryChange(e.target.value)}
                  required
                >
                  {handledServices.map((svc) => (
                    <MenuItem key={svc._id} value={svc._id}>
                      {svc.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.8 }}>
                    Sub Service & Category Mode (Choose single or multiple selection)
                  </FormLabel>
                  <ToggleButtonGroup
                    value={formData.selectionMode || 'single'}
                    exclusive
                    onChange={(e, val) => {
                      if (val) setFormData((prev) => ({ ...prev, selectionMode: val }));
                    }}
                    size="small"
                    color="secondary"
                  >
                    <ToggleButton value="single" sx={{ px: 2.5, fontWeight: 700 }}>
                      🎯 Single Select
                    </ToggleButton>
                    <ToggleButton value="multiple" sx={{ px: 2.5, fontWeight: 700 }}>
                      📚 Multiple Select
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Grid>

              {/* Sub Service Field (Single or Multi) */}
              <Grid size={{ xs: 12, md: 6 }}>
                {formData.selectionMode === 'multiple' ? (
                  <Autocomplete
                    multiple
                    options={subServices.filter((sub) => !formData.serviceCategory || (sub.service?._id || sub.service) === formData.serviceCategory)}
                    getOptionLabel={(option) => option.title || ''}
                    value={subServices.filter((s) => (formData.subServices || []).includes(s._id))}
                    onChange={(e, newValues) => {
                      setFormData((prev) => ({
                        ...prev,
                        subServices: newValues.map((v) => v._id),
                        subService: newValues.length > 0 ? newValues[0]._id : ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Sub Services (Multiple)" placeholder="Select sub services..." />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option.title} size="small" key={option._id} {...getTagProps({ index })} />
                      ))
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    select
                    label="Sub Service"
                    value={formData.subService}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subService: e.target.value, subServices: [e.target.value] }))}
                  >
                    <MenuItem value="">-- Select Sub Service --</MenuItem>
                    {subServices
                      .filter((sub) => !formData.serviceCategory || (sub.service?._id || sub.service) === formData.serviceCategory)
                      .map((sub) => (
                        <MenuItem key={sub._id} value={sub._id}>
                          {sub.title}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              </Grid>

              {/* Category Field (Single or Multi) */}
              <Grid size={{ xs: 12, md: 6 }}>
                {formData.selectionMode === 'multiple' ? (
                  <Autocomplete
                    multiple
                    options={categoriesForForm}
                    getOptionLabel={(option) => option.name || option.title || ''}
                    value={categoriesForForm.filter((c) => (formData.categories || []).includes(c._id))}
                    onChange={(e, newValues) => {
                      setFormData((prev) => ({
                        ...prev,
                        categories: newValues.map((v) => v._id),
                        category: newValues.length > 0 ? newValues[0]._id : ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Package Categories (Multiple)" placeholder="Select categories..." />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option.name || option.title} size="small" key={option._id} {...getTagProps({ index })} />
                      ))
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    select
                    label="Package Category"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value, categories: [e.target.value] }))}
                  >
                    <MenuItem value="">-- Select Category --</MenuItem>
                    {categoriesForForm.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name || c.title}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>

              {/* Inclusions & Exclusions */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Inclusions (Comma-Separated)"
                  value={formData.inclusions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, inclusions: e.target.value }))}
                  placeholder="e.g. 4-Star Hotel, Breakfast & Dinner, Cab Transfers, Sightseeing Guide"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  helperText="Features, amenities, and complimentary services included"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Exclusions (Comma-Separated)"
                  value={formData.exclusions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exclusions: e.target.value }))}
                  placeholder="e.g. Airfare, Personal Expenses, Lunch, Entry Tickets, GST Extra"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CloseIcon sx={{ color: '#dc2626' }} fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  helperText="Services and items not covered by this package rate"
                />
              </Grid>

              {/* Promotional Badges & Showcase Highlights */}
              <Grid size={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    borderColor: 'divider'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkspacePremiumIcon color="secondary" fontSize="small" /> Promotional Badges & Showcase Visibility
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Attract more bookings with front-end ribbons and homepage highlights
                    </Typography>
                  </Stack>

                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Promotional Ribbon Badge"
                        value={formData.badge}
                        onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                        placeholder="e.g. BESTSELLER, HOT DEAL, TRENDING"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BookmarkIcon color="secondary" fontSize="small" />
                            </InputAdornment>
                          )
                        }}
                      />
                      <Stack direction="row" spacing={0.8} sx={{ mt: 1 }} flexWrap="wrap">
                        {['BESTSELLER', 'HOT DEAL', 'TRENDING', 'TOP CHOICE', 'LIMITED SEATS', 'LUXURY'].map((tag) => (
                          <Chip
                            key={tag}
                            label={`+${tag}`}
                            size="small"
                            onClick={() => setFormData((prev) => ({ ...prev, badge: tag }))}
                            variant={formData.badge === tag ? 'filled' : 'outlined'}
                            color={formData.badge === tag ? 'secondary' : 'default'}
                            sx={{ fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', mb: 0.5 }}
                          />
                        ))}
                        {formData.badge && (
                          <Chip
                            label="Clear"
                            size="small"
                            onClick={() => setFormData((prev) => ({ ...prev, badge: '' }))}
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', mb: 0.5 }}
                          />
                        )}
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isFeatured}
                              onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                              color="secondary"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} /> Featured Experience (Homepage Showcase)
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isTopPick}
                              onChange={(e) => setFormData((prev) => ({ ...prev, isTopPick: e.target.checked }))}
                              color="success"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <VerifiedIcon sx={{ color: '#10b981', fontSize: 16 }} /> Top Pick (Curated Recommended Choice)
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.topRated}
                              onChange={(e) => setFormData((prev) => ({ ...prev, topRated: e.target.checked }))}
                              color="primary"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WorkspacePremiumIcon sx={{ color: '#3b82f6', fontSize: 16 }} /> Top Rated (High Review Badge)
                            </Typography>
                          }
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Photo Gallery & Media Section */}
              <Grid size={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <PhotoLibraryIcon color="secondary" fontSize="small" /> Package Photo Gallery & Media
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      color="secondary"
                      sx={{ borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap', py: 1 }}
                    >
                      Choose Images from Device
                      <input type="file" multiple accept="image/*" hidden onChange={handleSelectFiles} />
                    </Button>

                    <TextField
                      fullWidth
                      size="small"
                      label="Or Add External Image URL"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={formData.newUrlInput}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newUrlInput: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={handleAddImageUrl}
                              disabled={!formData.newUrlInput.trim()}
                              sx={{ fontWeight: 700, borderRadius: '8px' }}
                            >
                              Add URL
                            </Button>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Stack>

                  {/* Previews Grid */}
                  {(formData.images.length > 0 || selectedFiles.length > 0) ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#f1f5f9'
                      }}
                    >
                      {/* Existing remote images */}
                      {formData.images.map((img, idx) => (
                        <Box
                          key={`remote-${idx}`}
                          sx={{
                            position: 'relative',
                            height: 100,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: idx === 0 ? '2px solid' : '1px solid',
                            borderColor: idx === 0 ? 'secondary.main' : 'divider',
                            bgcolor: '#e2e8f0'
                          }}
                        >
                          <img
                            src={getFullImageUrl(img)}
                            alt={`Package image ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/public/defaults/default_travel.png'; }}
                          />
                          {idx === 0 && (
                            <Chip
                              label="COVER"
                              size="small"
                              color="secondary"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                height: 18,
                                fontSize: '9px',
                                fontWeight: 800
                              }}
                            />
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingImage(idx)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(220, 38, 38, 0.9)',
                              color: '#fff',
                              width: 22,
                              height: 22,
                              '&:hover': { bgcolor: '#dc2626' }
                            }}
                            title="Remove image"
                          >
                            <CloseIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          {idx > 0 && (
                            <Button
                              size="small"
                              onClick={() => handleSetPrimaryImage(idx)}
                              sx={{
                                position: 'absolute',
                                bottom: 2,
                                left: 2,
                                right: 2,
                                fontSize: '9px',
                                fontWeight: 800,
                                py: 0.2,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
                              }}
                            >
                              Make Cover
                            </Button>
                          )}
                        </Box>
                      ))}

                      {/* Newly selected files from device */}
                      {selectedFiles.map((file, idx) => {
                        const blobUrl = URL.createObjectURL(file);
                        return (
                          <Box
                            key={`local-${idx}`}
                            sx={{
                              position: 'relative',
                              height: 100,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1.5px dashed',
                              borderColor: 'secondary.main',
                              bgcolor: '#e2e8f0'
                            }}
                          >
                            <img
                              src={blobUrl}
                              alt={`Selected ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Chip
                              label="NEW FILE"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                height: 18,
                                fontSize: '8px',
                                fontWeight: 800
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveSelectedFile(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(220, 38, 38, 0.9)',
                                color: '#fff',
                                width: 22,
                                height: 22,
                                '&:hover': { bgcolor: '#dc2626' }
                              }}
                              title="Remove selected file"
                            >
                              <CloseIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: '8px', border: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        No photos added yet. Upload high-resolution images from your device or paste image URLs to attract travellers.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* CARD 2: PACKAGE PRICING & RATE DETAILS */}
        <Grid size={12}>
          <MainCard title="Package Pricing & Rate Details">
            <Typography variant="h4" fontWeight="800" sx={{ mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon /> Billing, Discounts &amp; Tax Setup
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Standard Base Price (₹) *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 15000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                  helperText="Standard rate before discounts"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Offer / Discounted Price (₹)"
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountPrice: e.target.value }))}
                  placeholder="e.g. 12000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip label="OFFER" size="small" color="secondary" sx={{ height: 20, fontSize: '9px', fontWeight: 800 }} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Optional promotional price"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Original MRP Price (Strike-through) (₹)"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="e.g. 18000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                  helperText="Shows crossed-out price"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={customUnits}
                    value={formData.priceType || ''}
                    inputValue={formData.priceType || ''}
                    onInputChange={(event, newInputValue) => {
                      setFormData((prev) => ({ ...prev, priceType: newInputValue }));
                    }}
                    onChange={(event, newValue) => {
                      const val = typeof newValue === 'string' ? newValue : newValue?.label || newValue || '';
                      if (val) {
                        setFormData((prev) => ({ ...prev, priceType: val }));
                        setCustomUnits((prev) => Array.from(new Set([...prev, val])));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Billing Model / Unit *"
                        placeholder="Enter Custom"
                        helperText="Select preset or type custom unit"
                      />
                    )}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCustomUnitDialog(true)}
                    sx={{
                      height: 53,
                      px: 2.5,
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(103, 58, 183, 0.25)',
                      flexShrink: 0
                    }}
                  >
                    Custom Unit
                  </Button>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Currency *"
                  value={formData.currency || 'INR (₹)'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  <MenuItem value="INR (₹)">INR (₹)</MenuItem>
                  <MenuItem value="USD ($)">USD ($)</MenuItem>
                  <MenuItem value="AED (AED)">AED (AED)</MenuItem>
                  <MenuItem value="EUR (€)">EUR (€)</MenuItem>
                  <MenuItem value="GBP (£)">GBP (£)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Tax / GST Rate (%)"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, taxRate: e.target.value }))}
                  placeholder="e.g. 5, 12, 18"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  helperText="Applicable GST/VAT percentage"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Tax Policy
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.taxPolicy || 'inclusive'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, taxPolicy: e.target.value }))}
                  >
                    <FormControlLabel
                      value="inclusive"
                      control={<Radio color="secondary" />}
                      label={<Typography variant="body2" fontWeight={600}>Inclusive of Taxes (GST Included)</Typography>}
                    />
                    <FormControlLabel
                      value="exclusive"
                      control={<Radio color="secondary" />}
                      label={<Typography variant="body2" fontWeight={600}>Exclusive (+ Tax Added at Checkout)</Typography>}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Pricing Terms & Booking Deposit Notes"
                  value={formData.priceNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceNotes: e.target.value }))}
                  placeholder="e.g. Requires 20% advance booking deposit. Non-refundable cancellation within 48h."
                  helperText="Special pricing policy or deposit instructions"
                />
              </Grid>

              {/* LIVE CUSTOMER PRICE CARD PREVIEW */}
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #16152b 0%, #212040 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                    border: '1.5px solid',
                    borderColor: isDarkMode ? 'rgba(124,58,237,0.4)' : 'secondary.main',
                    boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 18px rgba(0,0,0,0.03)'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      icon={<ReceiptIcon style={{ fontSize: 16 }} />}
                      label="Customer Price Card Preview"
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#a78bfa' : 'text.secondary' }} fontWeight={800} letterSpacing={1}>
                      LIVE PREVIEW
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2, borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'divider' }} />

                  <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h1" fontWeight="900" sx={{ color: isDarkMode ? '#ffffff' : 'secondary.main', textShadow: isDarkMode ? '0 0 12px rgba(167,139,250,0.3)' : 'none' }}>
                      ₹{Number(formData.discountPrice || formData.price || 0).toLocaleString('en-IN')}
                    </Typography>

                    {formData.originalPrice && Number(formData.originalPrice) > Number(formData.discountPrice || formData.price || 0) && (
                      <Typography variant="h3" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', textDecoration: 'line-through' }}>
                        ₹{Number(formData.originalPrice).toLocaleString('en-IN')}
                      </Typography>
                    )}

                    <Typography variant="h4" fontWeight="700" sx={{ color: isDarkMode ? '#cbd5e1' : 'text.secondary' }}>
                      {formData.priceType ? `/ ${formData.priceType}` : ''}
                    </Typography>
                  </Stack>

                  {/* LIVE PRICE CALCULATOR & GST DETAILS */}
                  {(() => {
                    const basePriceNum = Number(formData.discountPrice || formData.price || 0);
                    const taxRateNum = Number(formData.taxRate || 0);
                    let taxAmount = 0;
                    let finalCalculatedPrice = basePriceNum;

                    if (basePriceNum > 0 && taxRateNum > 0) {
                      if (formData.taxPolicy === 'exclusive') {
                        taxAmount = Math.round((basePriceNum * taxRateNum) / 100);
                        finalCalculatedPrice = basePriceNum + taxAmount;
                      } else {
                        taxAmount = Math.round(basePriceNum - (basePriceNum / (1 + taxRateNum / 100)));
                        finalCalculatedPrice = basePriceNum;
                      }
                    }

                    return (
                      <>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.8 }} flexWrap="wrap">
                          <Chip
                            label={formData.taxPolicy === 'inclusive' ? `Incl. ${formData.taxRate || 0}% GST` : `+ ${formData.taxRate || 0}% GST Excl.`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              borderRadius: '8px',
                              py: 0.3,
                              px: 0.5,
                              fontSize: '0.75rem',
                              bgcolor: formData.taxPolicy === 'inclusive'
                                ? (isDarkMode ? 'rgba(34, 197, 94, 0.16)' : '#f0fdf4')
                                : (isDarkMode ? 'rgba(56, 189, 248, 0.16)' : '#f0f9ff'),
                              color: formData.taxPolicy === 'inclusive'
                                ? (isDarkMode ? '#4ade80' : '#15803d')
                                : (isDarkMode ? '#38bdf8' : '#0284c7'),
                              border: '1px solid',
                              borderColor: formData.taxPolicy === 'inclusive'
                                ? (isDarkMode ? 'rgba(34, 197, 94, 0.4)' : '#bbf7d0')
                                : (isDarkMode ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd')
                            }}
                          />

                          {formData.discountPrice && formData.price && Number(formData.price) > Number(formData.discountPrice) && (
                            <Chip
                              label={`Save ₹${(Number(formData.price) - Number(formData.discountPrice)).toLocaleString('en-IN')}`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                bgcolor: isDarkMode ? 'rgba(234, 179, 8, 0.16)' : '#fefce8',
                                color: isDarkMode ? '#facc15' : '#a16207',
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(234, 179, 8, 0.4)' : '#fef08a'
                              }}
                            />
                          )}

                          {formData.originalPrice && Number(formData.originalPrice) > Number(formData.discountPrice || formData.price || 0) && (
                            <Chip
                              label={`${Math.round(((Number(formData.originalPrice) - Number(formData.discountPrice || formData.price || 0)) / Number(formData.originalPrice)) * 100)}% OFF`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.16)' : '#fef2f2',
                                color: isDarkMode ? '#f87171' : '#b91c1c',
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.4)' : '#fecaca'
                              }}
                            />
                          )}
                        </Stack>

                        {/* PRICE CALCULATOR BREAKDOWN BOX */}
                        {basePriceNum > 0 && taxRateNum > 0 && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 1.8,
                              borderRadius: '12px',
                              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                              border: '1px dashed',
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'
                            }}
                          >
                            <Typography variant="caption" fontWeight={800} letterSpacing={0.5} sx={{ color: isDarkMode ? '#a78bfa' : 'secondary.main', display: 'block', mb: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              🧮 Live Price Calculator Breakdown
                            </Typography>
                            <Stack spacing={0.6}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                                  Base Package Rate:
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>
                                  ₹{basePriceNum.toLocaleString('en-IN')}
                                </Typography>
                              </Stack>

                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                                  {formData.taxPolicy === 'exclusive' ? `+ ${taxRateNum}% GST Amount:` : `Incl. ${taxRateNum}% GST Portion:`}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                                  ₹{taxAmount.toLocaleString('en-IN')}
                                </Typography>
                              </Stack>

                              <Divider sx={{ my: 0.5, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider' }} />

                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight={800} sx={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
                                  Total Final Customer Price:
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={900} sx={{ color: isDarkMode ? '#4ade80' : '#16a34a', fontSize: '0.95rem' }}>
                                  ₹{finalCalculatedPrice.toLocaleString('en-IN')}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Paper>
                        )}
                      </>
                    );
                  })()}

                  {formData.priceNotes && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic', color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                      Deposit / Terms: {formData.priceNotes}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* CARD 3: DAY-BY-DAY TOUR ITINERARY & SCHEDULE */}
        <Grid size={12}>
          <MainCard title="Day-by-Day Tour Itinerary & Schedule">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormatListNumberedIcon /> Day-by-Day Tour Itinerary &amp; Schedule
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', display: 'block', mt: 0.5 }}>
                  Outline the chronological travel plan, daily sightseeing spots, meal plans and activities for travellers.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddItineraryDay}
                sx={{ borderRadius: '8px', fontWeight: 700 }}
              >
                Add Day {(formData.itinerary?.length || 0) + 1}
              </Button>
            </Box>

            {formData.itinerary && formData.itinerary.length > 0 ? (
              <Stack spacing={2}>
                {formData.itinerary.map((item, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: isDarkMode ? 'background.default' : '#f8fafc'
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 'auto' }}>
                        <Chip
                          label={`Day ${item.day || idx + 1}`}
                          color="secondary"
                          sx={{ fontWeight: 800, borderRadius: '8px', px: 1 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: true }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Day ${item.day || idx + 1} Title / Heading`}
                          placeholder={`e.g. Day ${item.day || idx + 1}: Arrival, Transfer & Evening Sightseeing`}
                          value={item.title}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 'auto' }}>
                        <Tooltip title="Remove this day from itinerary">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          label="Day Plan & Sightseeing Highlights"
                          placeholder="Describe the day's schedule, key sights visited, included meals (breakfast/dinner), and stay details..."
                          value={item.description}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleAddItineraryDay}
                  sx={{
                    py: 1.5,
                    borderRadius: '10px',
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                    fontWeight: 700
                  }}
                >
                  Add Day {(formData.itinerary?.length || 0) + 1} to Itinerary
                </Button>
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  bgcolor: isDarkMode ? 'background.default' : '#f8fafc'
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1, opacity: 0.8 }} />
                <Typography variant="subtitle1" fontWeight="700">
                  No itinerary days added yet
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', display: 'block', mb: 2 }}>
                  Adding a day-by-day travel itinerary helps travellers visualize their trip and increases bookings.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddItineraryDay}
                  sx={{ borderRadius: '8px', fontWeight: 700 }}
                >
                  Add Day 1 Plan
                </Button>
              </Box>
            )}
          </MainCard>
        </Grid>

        {/* CARD 4: FORM SETUP FIELDS & CUSTOM CATEGORY SPECIFICATIONS */}
        <Grid size={12}>
          <MainCard title="Form Setup Fields & Custom Category Specifications">
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon /> Additional Category Specifications
            </Typography>
            <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', display: 'block', mb: 2 }}>
              Custom specifications configured by the administrator for this specific travel service category.
            </Typography>
            <DynamicPackageForm
              fields={uniqueCustomFields}
              values={dynamicValues}
              onChange={handleDynamicValueChange}
              onFileChange={handleDynamicFileChange}
              loading={loadingFields}
            />
          </MainCard>
        </Grid>

        {/* CARD 5: SEARCH ENGINE OPTIMIZATION (SEO CONSOLE) */}
        <Grid size={12}>
          <MainCard title="Search Engine Optimization (SEO Console & Google SERP)">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon /> SEO Console &amp; Google Snippet Preview
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', display: 'block', mt: 0.5 }}>
                  Configure search engine meta tags and keywords to improve organic search rankings on Google and social shares.
                </Typography>
              </Box>
              <Chip label="Meta &amp; Indexing" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="SEO Meta Title"
                  placeholder={formData.packageName || formData.title || 'e.g. 5 Days Luxury Kashmir Tour Package | Ababa Travels'}
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  helperText={`${formData.seoTitle?.length || 0}/60 characters (Recommended: 50-60 characters)`}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="SEO Meta Description"
                  placeholder={formData.packageDescription || formData.description || 'Book your unforgettable holiday package with Ababa Travels. Top hotels, verified tours and 24/7 support.'}
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  helperText={`${formData.seoDescription?.length || 0}/160 characters (Recommended: 120-160 characters)`}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="SEO Keywords (Comma-Separated)"
                  placeholder="e.g. kashmir tour, srinagar package, dal lake houseboat, gulmarg gondola, holiday package"
                  value={formData.seoKeywords || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                  helperText="Separate keywords with commas to boost search discoverability"
                />
              </Grid>

              {/* Google SERP Live Snippet Box */}
              <Grid size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isDarkMode ? 'background.default' : '#f8fafc'
                  }}
                >
                  <Typography variant="caption" fontWeight="800" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', display: 'block', mb: 1 }}>
                    Google Search Snippet Preview
                  </Typography>
                  <Box sx={{ maxWidth: 650 }}>
                    <Typography variant="caption" sx={{ color: '#202124', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Box component="span" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                        ababaholidays.com
                      </Box>
                      <Box component="span" sx={{ color: isDarkMode ? '#94a3b8' : '#5f6368' }}>
                        › packages › {((formData.packageName || formData.title || 'package-name')).toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </Box>
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: isDarkMode ? '#90caf9' : '#1a0dab',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        mb: 0.5,
                        cursor: 'pointer'
                      }}
                    >
                      {formData.seoTitle || formData.packageName || formData.title || 'Package Title | Ababa Travels'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? '#cbd5e1' : '#4d5156',
                        fontSize: '13px',
                        lineHeight: 1.5
                      }}
                    >
                      {formData.seoDescription || (
                        (formData.packageDescription || formData.description)
                          ? (formData.packageDescription || formData.description).substring(0, 155) + '...'
                          : 'Book your unforgettable holiday package with Ababa Travels. Top hotels, verified tours and 24/7 support.'
                      )}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* BOTTOM ACTION BAR */}
        <Grid size={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => setOpenFormDialog(false)} color="inherit" disabled={submitting} sx={{ borderRadius: '10px', px: 3 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmitForm}
              disabled={submitting}
              sx={{ borderRadius: '10px', px: 4, fontWeight: 700 }}
            >
              {submitting ? 'Saving Package...' : selectedPackage ? 'Update Package & Photos' : 'Create Package Listing'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      {/* TOAST SNACKBAR NOTIFICATION */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
      {/* PAGE HEADER */}
      <Grid size={12}>
        <SaasHeader
          title={selectedServiceId !== 'all' ? `${selectedServiceObj?.title || 'Service'} Packages` : 'All Packages'}
          subtitle={
            selectedServiceId !== 'all'
              ? `Manage package listings and pricing for ${selectedServiceObj?.title || 'this service category'}.`
              : 'Browse all registered packages across all service categories. Select a service category from the side menu to create a new package.'
          }
          actionLabel={selectedServiceId !== 'all' ? 'Create New Package' : undefined}
          actionIcon={selectedServiceId !== 'all' ? <AddIcon /> : undefined}
          onActionClick={selectedServiceId !== 'all' ? () => handleOpenForm(null) : undefined}
          loading={loading}
        />
      </Grid>

      {/* FILTER & SEARCH TOOLBAR */}
      <Grid size={12}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
          }}
        >
          <Stack spacing={2}>
            {/* ROW 1: TITLE & COUNT */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h3" fontWeight="800">
                  {selectedServiceId === 'all' ? 'All Package Listings' : `${selectedServiceObj?.title || 'Selected Service'} Packages`}
                </Typography>
                <Chip
                  label={`${filteredPackages.length} Package${filteredPackages.length !== 1 ? 's' : ''} Found`}
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 800, borderRadius: '6px' }}
                />
              </Stack>
              {selectedServiceId !== 'all' && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Showing packages under <strong>{selectedServiceObj?.title}</strong>
                </Typography>
              )}
            </Stack>

            <Divider />

            {/* ROW 2: SEARCH (LEFT) & STATUS FILTER + VIEW MODE (RIGHT) */}
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2}>
              {/* LEFT: SEARCH INPUT */}
              <TextField
                placeholder="Search title, location, ID, creator..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                sx={{ width: { xs: '100%', sm: 300, md: 360 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />

              {/* RIGHT SIDE: STATUS FILTER & VIEW MODE SWITCHER */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="flex-end">
                {/* STATUS FILTER DROPDOWN */}
                <TextField
                  select
                  size="small"
                  label="Filter Status"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Active">🟢 Active &amp; Published</MenuItem>
                  <MenuItem value="Correction">🟠 Needs Correction</MenuItem>
                  <MenuItem value="Draft">🟡 Draft</MenuItem>
                  <MenuItem value="Pending">🔵 Pending Review</MenuItem>
                  <MenuItem value="Inactive">🔴 Inactive</MenuItem>
                </TextField>

                {/* VIEW MODE SWITCHER */}
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'grey.100', borderRadius: '10px', p: 0.5 }}>
                  <Button
                    size="small"
                    variant={viewMode === 'grid' ? 'contained' : 'text'}
                    color={viewMode === 'grid' ? 'secondary' : 'inherit'}
                    onClick={() => setViewMode('grid')}
                    startIcon={<GridViewIcon fontSize="small" />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, py: 0.5, px: 1.5 }}
                  >
                    Grid
                  </Button>
                  <Button
                    size="small"
                    variant={viewMode === 'table' ? 'contained' : 'text'}
                    color={viewMode === 'table' ? 'secondary' : 'inherit'}
                    onClick={() => setViewMode('table')}
                    startIcon={<ViewListIcon fontSize="small" />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, py: 0.5, px: 1.5 }}
                  >
                    Table
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* PACKAGES CONTENT AREA */}
      <Grid size={12}>
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
              Fetching package listings & image galleries...
            </Typography>
          </Box>
        ) : filteredPackages.length === 0 ? (
          <MainCard>
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="h3" fontWeight="800">
                No Packages Found for {selectedServiceId === 'all' ? 'this criteria' : selectedServiceObj?.title || 'Selected Service'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                {selectedServiceId === 'all'
                  ? 'No packages match your search or filter. Click Create New Package to add one.'
                  : `You currently have no package listings created under ${selectedServiceObj?.title}. Click below to add a package.`}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm(null)}
                sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
              >
                Create Package for {selectedServiceId === 'all' ? 'Service' : selectedServiceObj?.title}
              </Button>
            </Box>
          </MainCard>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW WITH FULL MULTI-IMAGE GALLERY SUPPORT */
          <Grid container spacing={2.5}>
            {paginatedPackages.map((pkg) => {
              const svcTitle = pkg.serviceCategory?.title || pkg.service?.title || 'Service Category';
              const pkgImages = Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images : [];
              const activeIdx = cardActiveImages[pkg._id] || 0;
              const currentImgPath = pkgImages.length > 0 ? pkgImages[activeIdx] || pkgImages[0] : null;
              const imgUrl = getFullImageUrl(currentImgPath);

              return (
                <Grid key={pkg._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: 'secondary.main'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', bgcolor: '#0f172a' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imgUrl}
                        alt={pkg.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/public/defaults/default_travel.png'; }}
                        sx={{ objectFit: 'cover', width: '100%' }}
                      />

                      {/* Top Left: Service Category Badge */}
                      <Chip
                        label={svcTitle}
                        size="small"
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          fontWeight: 800,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                        }}
                      />

                      {/* Top Right: Status & Total Photos Tag */}
                      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 12 }}>
                        {pkgImages.length > 0 && (
                          <Chip
                            icon={<PhotoLibraryIcon style={{ fontSize: 14, color: '#fff' }} />}
                            label={`${pkgImages.length} Photo${pkgImages.length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(15, 23, 42, 0.75)',
                              color: '#fff',
                              fontWeight: 700,
                              backdropFilter: 'blur(4px)',
                              borderRadius: '8px'
                            }}
                          />
                        )}
                        <Chip
                          label={pkg.status === 'Correction' ? 'Needs Correction' : (pkg.status || (pkg.isActive ? 'Active' : 'Inactive'))}
                          size="small"
                          color={pkg.status === 'Active' || (pkg.status === undefined && pkg.isActive) ? 'success' : pkg.status === 'Correction' ? 'warning' : 'default'}
                          sx={{ fontWeight: 800, borderRadius: '8px' }}
                        />
                      </Stack>

                      {/* Interactive Gallery Thumbnail Strip on Card (if multiple images exist) */}
                      {pkgImages.length > 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            p: 0.5,
                            bgcolor: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '10px',
                            display: 'flex',
                            gap: 0.8,
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': { height: 4 }
                          }}
                        >
                          {pkgImages.map((img, idx) => (
                            <Box
                              key={idx}
                              component="img"
                              src={getFullImageUrl(img)}
                              alt={`Thumb ${idx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardActiveImages((prev) => ({ ...prev, [pkg._id]: idx }));
                              }}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/public/defaults/default_travel.png'; }}
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '6px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: idx === activeIdx ? theme.palette.secondary.main : 'transparent',
                                opacity: idx === activeIdx ? 1 : 0.6,
                                transition: 'all 0.2s ease',
                                '&:hover': { opacity: 1, transform: 'scale(1.08)' }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        {pkg.status === 'Correction' && (
                          <Box sx={{ mb: 1.5, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TuneIcon sx={{ fontSize: 16, color: '#b45309' }} />
                            <Typography variant="caption" fontWeight={800} color="#b45309">
                              Correction Required {pkg.correctionNotes ? `• ${pkg.correctionNotes.slice(0, 45)}...` : ''}
                            </Typography>
                          </Box>
                        )}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {pkg.customId || 'PKG-LISTING'}
                          </Typography>
                          {(() => {
                            const creatorDetails = getCreatorDetails(pkg);
                            return (
                              <Tooltip title={creatorDetails.isStaff ? `Created by Staff: ${creatorDetails.staffName} | Main Vendor: ${creatorDetails.mainVendorName}` : `Vendor: ${creatorDetails.mainVendorName}`}>
                                <Chip
                                  icon={<StorefrontIcon style={{ fontSize: 13 }} />}
                                  label={creatorDetails.isStaff ? `Staff: ${creatorDetails.staffName} (${creatorDetails.mainVendorName})` : `By: ${creatorDetails.mainVendorName}`}
                                  size="small"
                                  variant="outlined"
                                  color={creatorDetails.isStaff ? "secondary" : "info"}
                                  sx={{ fontWeight: 700, borderRadius: '6px', height: 'auto', py: 0.2, px: 0.6, fontSize: '0.7rem' }}
                                />
                              </Tooltip>
                            );
                          })()}
                        </Stack>
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5, lineHeight: 1.3 }}>
                          {pkg.packageName || pkg.title}
                        </Typography>
                        {(pkg.packageDescription || pkg.description) && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem' }}>
                            {pkg.packageDescription || pkg.description}
                          </Typography>
                        )}

                        <Stack spacing={0.8} sx={{ mb: 2 }}>
                          {pkg.duration && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {pkg.duration}
                              </Typography>
                            </Stack>
                          )}
                          {pkg.location && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
                                {pkg.location}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>

                      <Box>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Package Rate
                            </Typography>
                            <Stack direction="row" alignItems="baseline" spacing={0.5}>
                              <Typography variant="h3" fontWeight="900" color="secondary.main">
                                ₹{pkg.price?.toLocaleString('en-IN') || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                /{pkg.priceType || 'Person'}
                              </Typography>
                            </Stack>
                          </Box>

                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View Photo Gallery & Details">
                              <IconButton size="small" onClick={() => handleOpenView(pkg)} color="info">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Package & Photos">
                              <IconButton size="small" onClick={() => handleOpenForm(pkg)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Package">
                              <IconButton size="small" onClick={() => handleDeleteClick(pkg)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* TABLE VIEW */
          <DataTable
            columns={[
              {
                headerName: 'Package Name & Details',
                field: 'packageName',
                render: (pkg) => {
                  const pkgImages = Array.isArray(pkg.images) ? pkg.images : [];
                  const thumbUrl = pkgImages.length > 0 ? getFullImageUrl(pkgImages[0]) : '/public/defaults/default_travel.png';
                  const pkgName = pkg.packageName || pkg.title || 'Untitled Package';
                  const pkgDesc = pkg.packageDescription || pkg.description || '';

                  return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar
                          src={thumbUrl}
                          variant="rounded"
                          sx={{ width: 50, height: 50, borderRadius: '8px', bgcolor: 'grey.200' }}
                        />
                        {pkgImages.length > 1 && (
                          <Chip
                            label={`+${pkgImages.length - 1}`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              height: 16,
                              fontSize: '9px',
                              fontWeight: 800,
                              bgcolor: 'secondary.main',
                              color: '#fff',
                              px: 0.5
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0, maxWidth: 280 }}>
                        <Typography variant="subtitle1" fontWeight="800" noWrap>{pkgName}</Typography>
                        {pkgDesc && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {pkgDesc}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {pkg.customId || 'ID'} • {pkgImages.length} Photo{pkgImages.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                }
              },
              {
                headerName: 'Service Category',
                field: 'serviceCategory',
                render: (pkg) => {
                  const svcTitle = pkg.serviceCategory?.title || pkg.service?.title || 'Service';
                  return <Chip label={svcTitle} size="small" color="secondary" sx={{ fontWeight: 600 }} />;
                }
              },
              {
                headerName: 'Price',
                field: 'price',
                render: (pkg) => (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="800" color="secondary.main">
                      ₹{pkg.price?.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">/{pkg.priceType || 'Person'}</Typography>
                  </Box>
                )
              },
              {
                headerName: 'Duration',
                field: 'duration',
                render: (pkg) => <Typography variant="body2" fontWeight="600">{pkg.duration || 'N/A'}</Typography>
              },
              {
                headerName: 'Location',
                field: 'location',
                render: (pkg) => <Typography variant="body2" fontWeight="600">{pkg.location || 'N/A'}</Typography>
              },
              {
                headerName: 'Created By & Vendor',
                field: 'createdBy',
                render: (pkg) => {
                  const details = getCreatorDetails(pkg);
                  const creatorId = (pkg.createdBy?._id || pkg.createdBy?.id || pkg.createdBy || '').toString();
                  const isMe = creatorId === currentUserId;

                  return (
                    <Box>
                      {details.isStaff ? (
                        <Stack spacing={0.3}>
                          <Chip
                            label={isMe ? `Staff: ${details.staffName} (You)` : `Staff: ${details.staffName}`}
                            size="small"
                            color={isMe ? 'secondary' : 'info'}
                            variant="filled"
                            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                          />
                          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                            Main: <strong>{details.mainVendorName}</strong>
                          </Typography>
                        </Stack>
                      ) : (
                        <Chip
                          label={isMe ? `${details.mainVendorName} (You)` : details.mainVendorName}
                          size="small"
                          color={isMe ? 'secondary' : 'default'}
                          variant={isMe ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  );
                }
              },
              {
                headerName: 'Status',
                field: 'status',
                render: (pkg) => <StatusBadge status={pkg.status || (pkg.isActive ? 'Active' : 'Inactive')} />
              },
              {
                headerName: 'Actions',
                align: 'center',
                render: (pkg) => (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => handleOpenView(pkg)} color="info"><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleOpenForm(pkg)} color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(pkg)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                )
              }
            ]}
            rows={filteredPackages}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredPackages.length}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            emptyTitle="No Packages Found"
            emptySubtitle="No packages match your criteria."
          />
        )}
      </Grid>

      {/* PAGINATION FOR GRID CARDS VIEW (Table View uses built-in DataTable pagination) */}
      {!loading && filteredPackages.length > 0 && viewMode === 'grid' && (
        <Grid size={12}>
          <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              rowsPerPageOptions={[6, 9, 18]}
              component="div"
              count={filteredPackages.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </Paper>
        </Grid>
      )}



      {/* QUICK VIEW PACKAGE & PHOTO GALLERY MODAL */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        {selectedPackage && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold">{selectedPackage.title}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedPackage.serviceCategory?.title || selectedPackage.service?.title || 'Service Category'}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={selectedPackage.status || (selectedPackage.isActive ? 'Active' : 'Inactive')}
                      size="small"
                      color={selectedPackage.status === 'Active' || selectedPackage.isActive ? 'success' : 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      icon={<StorefrontIcon style={{ fontSize: 13 }} />}
                      label={`Created by: ${selectedPackage.createdBy?.name || selectedPackage.vendor?.companyName || selectedPackage.vendor?.name || 'Vendor Admin'}`}
                      size="small"
                      variant="outlined"
                      color="info"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Box>
                <Typography variant="h2" fontWeight="900" color="secondary.main">
                  ₹{selectedPackage.price?.toLocaleString('en-IN')}
                  <Typography component="span" variant="caption">/{selectedPackage.priceType || 'Person'}</Typography>
                </Typography>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent dividers sx={{ p: 3 }}>
              {selectedPackage.correctionNotes && (
                <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '10px' }}>
                  <Typography variant="subtitle2" fontWeight={800}>Correction Feedback &amp; Required Changes</Typography>
                  <Typography variant="body2">{selectedPackage.correctionNotes}</Typography>
                </Alert>
              )}
              {(() => {
                const viewImages = Array.isArray(selectedPackage.images) && selectedPackage.images.length > 0 ? selectedPackage.images : [];
                const currentViewPath = viewImages.length > 0 ? viewImages[viewImageIndex] || viewImages[0] : null;
                const viewImgUrl = getFullImageUrl(currentViewPath);

                return (
                  <Grid container spacing={3}>
                    {/* PHOTO GALLERY VIEWER */}
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={viewImgUrl}
                          alt={selectedPackage.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/public/defaults/default_travel.png'; }}
                          sx={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
                        />

                        {/* Prev / Next Image Navigation overlay buttons */}
                        {viewImages.length > 1 && (
                          <>
                            <IconButton
                              onClick={() => setViewImageIndex((prev) => (prev > 0 ? prev - 1 : viewImages.length - 1))}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: 12,
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setViewImageIndex((prev) => (prev < viewImages.length - 1 ? prev + 1 : 0))}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                right: 12,
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                            <Chip
                              label={`Photo ${viewImageIndex + 1} of ${viewImages.length}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                fontWeight: 700
                              }}
                            />
                          </>
                        )}
                      </Box>

                      {/* THUMBNAIL GALLERY STRIP */}
                      {viewImages.length > 1 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Package Photos ({viewImages.length}):
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                            {viewImages.map((img, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={getFullImageUrl(img)}
                                alt={`Thumbnail ${idx + 1}`}
                                onClick={() => setViewImageIndex(idx)}
                                onError={(e) => { e.target.onerror = null; e.target.src = '/public/defaults/default_travel.png'; }}
                                sx={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  border: '2px solid',
                                  borderColor: idx === viewImageIndex ? theme.palette.secondary.main : 'transparent',
                                  opacity: idx === viewImageIndex ? 1 : 0.6,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { opacity: 1, transform: 'scale(1.05)' }
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Grid>

                    {/* DETAILS COLUMN */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 0.5 }}>Package Overview</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                            {selectedPackage.description || 'No description provided.'}
                          </Typography>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 0.5 }}>Key Specs</Typography>
                          <Typography variant="body2"><strong>Duration:</strong> {selectedPackage.duration || 'N/A'}</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Location:</strong> {selectedPackage.location || 'N/A'}</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Custom Package ID:</strong> {selectedPackage.customId || 'N/A'}</Typography>
                        </Box>

                        <Box sx={{ p: 1.5, bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc', borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 0.8 }}>
                            Ownership &amp; Vendor Info
                          </Typography>
                          {(() => {
                            const details = getCreatorDetails(selectedPackage);
                            return details.isStaff ? (
                              <Stack spacing={0.5}>
                                <Typography variant="body2" fontWeight={700} color="info.main">
                                  👤 <strong>Staff Member:</strong> {details.staffName} {selectedPackage.createdBy?.email ? `(${selectedPackage.createdBy.email})` : ''}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} color="secondary.main">
                                  🏢 <strong>Main Vendor Account:</strong> {details.mainVendorName} {selectedPackage.vendor?.email ? `(${selectedPackage.vendor.email})` : ''}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" fontWeight={700} color="secondary.main">
                                🏢 <strong>Vendor Account:</strong> {details.mainVendorName} {selectedPackage.vendor?.email ? `(${selectedPackage.vendor.email})` : ''}
                              </Typography>
                            );
                          })()}
                        </Box>

                        {Array.isArray(selectedPackage.inclusions) && selectedPackage.inclusions.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="800" color="success.main" sx={{ mb: 0.5 }}>Included</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {selectedPackage.inclusions.map((inc, i) => (
                                <Chip key={i} label={`✓ ${inc}`} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                );
              })()}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle variant="h4" fontWeight="bold">Delete Package Listing</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete <strong>{itemToDelete?.title}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
            Delete Package
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD CUSTOM BILLING UNIT DIALOG */}
      <Dialog open={openCustomUnitDialog} onClose={() => setOpenCustomUnitDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle variant="h4" fontWeight="bold">Add Custom Billing Unit</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Specify a custom billing unit or pricing basis for your package (e.g., Per Session, Per Slot, Per Boat, Per Flight).
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Custom Unit Name *"
            value={newCustomUnitInput}
            onChange={(e) => setNewCustomUnitInput(e.target.value)}
            placeholder="Enter Custom"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCustomUnitDialog(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              const val = newCustomUnitInput.trim();
              if (val) {
                if (!customUnits.includes(val)) {
                  setCustomUnits((prev) => [...prev, val]);
                }
                setFormData((prev) => ({ ...prev, priceType: val }));
                setNewCustomUnitInput('');
                setOpenCustomUnitDialog(false);
                showToast(`Added custom unit "${val}"`, 'success');
              }
            }}
            sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}
          >
            Add &amp; Select Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PackagesManagement;

