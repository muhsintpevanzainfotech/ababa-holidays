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
  FormControlLabel, FormControl, FormLabel, Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import DynamicPackageForm from './DynamicPackageForm';

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

const getFullImageUrl = (path) => {
  const baseUrl = import.meta.env.VITE_APP_API_URL
    ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:9000';

  if (!path || typeof path !== 'string') return `${baseUrl}/public/defaults/default_travel.png`;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;

  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

const PackagesManagement = () => {
  const theme = useTheme();
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

  // Form State for Package (supporting multiple images + file uploads)
  const [formData, setFormData] = useState({
    title: '',
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
    inclusions: '',
    exclusions: '',
    status: 'Active',
    images: [],
    newUrlInput: ''
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
        const loadedPkgs = packagesRes.data || packagesRes || [];
        setPackages(loadedPkgs);
        const loadedUnits = loadedPkgs.map(p => p.priceType).filter(Boolean);
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
          ? pkg.status === 'Active' || pkg.isActive
          : pkg.status === statusFilter;

    return matchesService && matchesUserCreator && matchesSearch && matchesStatus;
  });

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
        title: pkg.title || '',
        price: pkg.price || '',
        originalPrice: pkg.originalPrice || '',
        discountPrice: pkg.discountPrice || '',
        priceType: pkg.priceType || '',
        duration: pkg.duration || '',
        location: pkg.location || '',
        description: pkg.description || '',
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : pkg.inclusions || '',
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : pkg.exclusions || '',
        status: pkg.status || 'Active'
      }
      : {
        title: '',
        price: '',
        priceType: '',
        duration: '',
        location: '',
        description: '',
        inclusions: '',
        exclusions: '',
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
      title: pkg?.title || '',
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
      location: pkg?.location || '',
      description: pkg?.description || '',
      inclusions: Array.isArray(pkg?.inclusions) ? pkg.inclusions.join(', ') : pkg?.inclusions || '',
      exclusions: Array.isArray(pkg?.exclusions) ? pkg.exclusions.join(', ') : pkg?.exclusions || '',
      status: pkg?.status || 'Active',
      images: existingImages,
      newUrlInput: ''
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
      const titleVal =
        dynamicValues.title ||
        dynamicValues.name ||
        dynamicValues.package_title ||
        dynamicValues.title_name ||
        formData.title ||
        'Package Listing';

      const priceVal = Number(
        dynamicValues.price || dynamicValues.rate || dynamicValues.amount || formData.price || 0
      );

      const inclusionsArr = typeof dynamicValues.inclusions === 'string'
        ? dynamicValues.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(dynamicValues.inclusions)
          ? dynamicValues.inclusions
          : [];

      const exclusionsArr = typeof dynamicValues.exclusions === 'string'
        ? dynamicValues.exclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(dynamicValues.exclusions)
          ? dynamicValues.exclusions
          : [];

      const hasFiles = selectedFiles.length > 0 || Object.keys(customFiles).length > 0;
      const payloadCustomData = { ...dynamicValues };

      if (hasFiles) {
        const fd = new FormData();
        fd.append('title', titleVal);
        fd.append('serviceCategory', formData.serviceCategory);
        fd.append('service', formData.serviceCategory);
        if (formData.subService) fd.append('subService', formData.subService);
        if (formData.category) fd.append('category', formData.category);
        fd.append('price', priceVal);
        fd.append('originalPrice', Number(formData.originalPrice || dynamicValues.originalPrice) || 0);
        fd.append('discountPrice', Number(formData.discountPrice || dynamicValues.discountPrice) || 0);
        fd.append('priceType', formData.priceType || dynamicValues.priceType || 'Per Person');
        if (formData.priceNotes) fd.append('priceNotes', formData.priceNotes);
        fd.append('duration', dynamicValues.duration || formData.duration || '');
        fd.append('location', dynamicValues.location || formData.location || '');
        fd.append('description', dynamicValues.description || formData.description || '');
        fd.append('selectionMode', formData.selectionMode || 'single');
        if (formData.selectionMode === 'multiple' && Array.isArray(formData.subServices)) {
          formData.subServices.forEach((subId) => fd.append('subServices', subId));
        }
        if (formData.selectionMode === 'multiple' && Array.isArray(formData.categories)) {
          formData.categories.forEach((catId) => fd.append('categories', catId));
        }
        fd.append('currency', formData.currency || 'INR (₹)');
        fd.append('taxRate', Number(formData.taxRate) || 0);
        fd.append('taxPolicy', formData.taxPolicy || 'inclusive');
        fd.append('status', formData.status || dynamicValues.status || 'Active');
        fd.append('customData', JSON.stringify(payloadCustomData));

        inclusionsArr.forEach((inc) => fd.append('inclusions', inc));
        exclusionsArr.forEach((exc) => fd.append('exclusions', exc));

        formData.images.forEach((img) => fd.append('images', img));
        selectedFiles.forEach((file) => fd.append('images', file));

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
          title: titleVal,
          serviceCategory: formData.serviceCategory,
          service: formData.serviceCategory,
          selectionMode: formData.selectionMode || 'single',
          subService: formData.subService || undefined,
          subServices: formData.selectionMode === 'multiple' ? formData.subServices : undefined,
          category: formData.category || undefined,
          categories: formData.selectionMode === 'multiple' ? formData.categories : undefined,
          price: priceVal,
          originalPrice: Number(formData.originalPrice || dynamicValues.originalPrice) || 0,
          discountPrice: Number(formData.discountPrice || dynamicValues.discountPrice) || 0,
          priceType: formData.priceType || dynamicValues.priceType || 'Per Person',
          currency: formData.currency || 'INR (₹)',
          taxRate: Number(formData.taxRate) || 0,
          taxPolicy: formData.taxPolicy || 'inclusive',
          priceNotes: formData.priceNotes || '',
          duration: dynamicValues.duration || formData.duration || '',
          location: dynamicValues.location || formData.location || '',
          description: dynamicValues.description || formData.description || '',
          status: formData.status || dynamicValues.status || 'Active',
          inclusions: inclusionsArr,
          exclusions: exclusionsArr,
          images: formData.images,
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

  if (!hasPackagePermission) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          backgroundColor: theme.palette.mode === 'dark' ? '#111936' : '#ffffff',
          mt: 3
        }}
      >
        <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 800 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b', mb: 3 }}>
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
                  <MenuItem value="Active">🟢 Active & Published</MenuItem>
                  <MenuItem value="Draft">🟡 Draft</MenuItem>
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
                    options={categories}
                    getOptionLabel={(option) => option.name || option.title || ''}
                    value={categories.filter((c) => (formData.categories || []).includes(c._id))}
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
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name || c.title}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
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
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                    border: '1.5px solid',
                    borderColor: 'secondary.main'
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
                    <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>
                      LIVE PREVIEW
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h1" fontWeight="900" color="secondary.main">
                      ₹{Number(formData.discountPrice || formData.price || 0).toLocaleString('en-IN')}
                    </Typography>

                    {formData.originalPrice && Number(formData.originalPrice) > Number(formData.discountPrice || formData.price || 0) && (
                      <Typography variant="h3" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ₹{Number(formData.originalPrice).toLocaleString('en-IN')}
                      </Typography>
                    )}

                    <Typography variant="h4" fontWeight="700" color="text.secondary">
                      {formData.priceType ? `/ ${formData.priceType}` : ''}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }} flexWrap="wrap">
                    <Chip
                      label={formData.taxPolicy === 'inclusive' ? `Incl. ${formData.taxRate || 0}% GST` : `+ ${formData.taxRate || 0}% GST Excl.`}
                      size="small"
                      color={formData.taxPolicy === 'inclusive' ? 'success' : 'info'}
                      sx={{ fontWeight: 800, borderRadius: '6px' }}
                    />

                    {formData.discountPrice && formData.price && Number(formData.price) > Number(formData.discountPrice) && (
                      <Chip
                        label={`Save ₹${(Number(formData.price) - Number(formData.discountPrice)).toLocaleString('en-IN')}`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 800, borderRadius: '6px' }}
                      />
                    )}

                    {formData.originalPrice && Number(formData.originalPrice) > Number(formData.discountPrice || formData.price || 0) && (
                      <Chip
                        label={`${Math.round(((Number(formData.originalPrice) - Number(formData.discountPrice || formData.price || 0)) / Number(formData.originalPrice)) * 100)}% OFF`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 800, borderRadius: '6px' }}
                      />
                    )}
                  </Stack>

                  {formData.priceNotes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}>
                      Deposit / Terms: {formData.priceNotes}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* CARD 3: FORM SETUP FIELDS CONFIGURED BY ADMIN */}
        <Grid size={12}>
          <MainCard title="Form Setup Fields & Packages Specifications">
            <DynamicPackageForm
              fields={configuredFields}
              values={dynamicValues}
              onChange={handleDynamicValueChange}
              onFileChange={handleDynamicFileChange}
              loading={loadingFields}
            />
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
                  <MenuItem value="Draft">🟡 Draft</MenuItem>
                  <MenuItem value="Inactive">🔴 Inactive</MenuItem>
                </TextField>

                {/* VIEW MODE SWITCHER */}
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.100', borderRadius: '10px', p: 0.5 }}>
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
                          label={pkg.status || (pkg.isActive ? 'Active' : 'Inactive')}
                          size="small"
                          color={pkg.status === 'Active' || pkg.isActive ? 'success' : 'default'}
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
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 1, lineHeight: 1.3 }}>
                          {pkg.title}
                        </Typography>

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
                headerName: 'Package Info & Photos',
                field: 'title',
                render: (pkg) => {
                  const pkgImages = Array.isArray(pkg.images) ? pkg.images : [];
                  const thumbUrl = pkgImages.length > 0 ? getFullImageUrl(pkgImages[0]) : '/public/defaults/default_travel.png';

                  return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ position: 'relative' }}>
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
                      <Box>
                        <Typography variant="subtitle1" fontWeight="800">{pkg.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
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

      {/* PAGINATION */}
      {!loading && filteredPackages.length > 0 && (
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

                        <Box sx={{ p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc', borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
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

