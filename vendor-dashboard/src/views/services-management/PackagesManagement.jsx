import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid, Typography, Button, Stack, Box, TextField, InputAdornment,
  Paper, Chip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Card, CardContent, CardMedia, Divider, CircularProgress, Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service') || 'all';

  // Data states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);

  // Selected Service Filter ('all' or specific service _id)
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

  // Form State for Package (supporting multiple images + file uploads)
  const [formData, setFormData] = useState({
    title: '',
    serviceCategory: '',
    price: '',
    originalPrice: '',
    discountPrice: '',
    priceType: 'Per Person',
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
      const [profileRes, servicesRes, packagesRes] = await Promise.all([
        api.get('/vendors/profile').catch(() => ({ success: false })),
        api.get('/services').catch(() => ({ success: false })),
        api.get('/packages?limit=200').catch(() => ({ success: false }))
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data || []);
      }

      if (profileRes.success && profileRes.data) {
        setVendorProfile(profileRes.data.profile || {});
      }

      if (packagesRes.success) {
        setPackages(packagesRes.data || []);
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

  // Update selectedServiceId when URL query changes
  useEffect(() => {
    const qService = searchParams.get('service');
    if (qService) {
      setSelectedServiceId(qService);
    }
  }, [searchParams]);

  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setPage(0);
    if (serviceId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ service: serviceId });
    }
  };

  // Filter packages by selected Service & search/status filters
  const filteredPackages = packages.filter((pkg) => {
    let matchesService = true;
    if (selectedServiceId !== 'all') {
      const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service;
      matchesService = pkgSvcId === selectedServiceId;
    }

    const title = pkg.title || '';
    const loc = pkg.location || '';
    const customId = pkg.customId || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? pkg.status === 'Active' || pkg.isActive
        : pkg.status === statusFilter;

    return matchesService && matchesSearch && matchesStatus;
  });

  const paginatedPackages = filteredPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getPackageCountForService = (serviceId) => {
    if (serviceId === 'all') return packages.length;
    return packages.filter((pkg) => {
      const pkgSvcId = pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service;
      return pkgSvcId === serviceId;
    }).length;
  };

  // Open Create/Edit Package Dialog
  const handleOpenForm = (pkg = null) => {
    setSelectedPackage(pkg);
    setSelectedFiles([]);
    if (pkg) {
      const svcId = pkg.serviceCategory?._id || pkg.serviceCategory || pkg.service?._id || pkg.service || (services[0]?._id || '');
      const existingImages = Array.isArray(pkg.images) ? [...pkg.images] : (pkg.images ? [pkg.images] : []);
      
      setFormData({
        title: pkg.title || '',
        serviceCategory: svcId,
        price: pkg.price || '',
        originalPrice: pkg.originalPrice || '',
        discountPrice: pkg.discountPrice || '',
        priceType: pkg.priceType || 'Per Person',
        duration: pkg.duration || '',
        location: pkg.location || '',
        description: pkg.description || '',
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : pkg.inclusions || '',
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join(', ') : pkg.exclusions || '',
        status: pkg.status || 'Active',
        images: existingImages,
        newUrlInput: ''
      });
    } else {
      const defaultSvc = (selectedServiceId !== 'all' ? selectedServiceId : services[0]?._id) || '';
      setFormData({
        title: '',
        serviceCategory: defaultSvc,
        price: '',
        originalPrice: '',
        discountPrice: '',
        priceType: 'Per Person',
        duration: '',
        location: '',
        description: '',
        inclusions: '',
        exclusions: '',
        status: 'Active',
        images: [],
        newUrlInput: ''
      });
    }
    setOpenFormDialog(true);
  };

  // Image Form Handlers
  const handleAddImageUrl = () => {
    const url = formData.newUrlInput.trim();
    if (!url) return;
    if (formData.images.includes(url)) {
      alert('This image URL is already added');
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
    if (!formData.title.trim()) {
      alert('Package Title is required');
      return;
    }
    if (!formData.serviceCategory) {
      alert('Please select a Service Category for this package');
      return;
    }

    setSubmitting(true);
    try {
      const inclusionsArr = formData.inclusions
        ? formData.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const exclusionsArr = formData.exclusions
        ? formData.exclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const hasFiles = selectedFiles.length > 0;

      if (hasFiles) {
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('serviceCategory', formData.serviceCategory);
        fd.append('service', formData.serviceCategory);
        fd.append('price', Number(formData.price) || 0);
        fd.append('originalPrice', Number(formData.originalPrice) || 0);
        fd.append('discountPrice', Number(formData.discountPrice) || 0);
        fd.append('priceType', formData.priceType);
        fd.append('duration', formData.duration || '');
        fd.append('location', formData.location || '');
        fd.append('description', formData.description || '');
        fd.append('status', formData.status || 'Active');

        inclusionsArr.forEach((inc) => fd.append('inclusions', inc));
        exclusionsArr.forEach((exc) => fd.append('exclusions', exc));

        // Append existing image URL strings
        formData.images.forEach((img) => fd.append('images', img));

        // Append new binary files
        selectedFiles.forEach((file) => fd.append('images', file));

        if (selectedPackage) {
          await api.put(`/packages/${selectedPackage._id}`, fd, true);
        } else {
          await api.post('/packages', fd, true);
        }
      } else {
        const payload = {
          title: formData.title,
          serviceCategory: formData.serviceCategory,
          service: formData.serviceCategory,
          price: Number(formData.price) || 0,
          originalPrice: Number(formData.originalPrice) || 0,
          discountPrice: Number(formData.discountPrice) || 0,
          priceType: formData.priceType,
          duration: formData.duration,
          location: formData.location,
          description: formData.description,
          status: formData.status,
          inclusions: inclusionsArr,
          exclusions: exclusionsArr,
          images: formData.images
        };

        if (selectedPackage) {
          await api.put(`/packages/${selectedPackage._id}`, payload);
        } else {
          await api.post('/packages', payload);
        }
      }

      setOpenFormDialog(false);
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to save package');
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
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to delete package');
    }
  };

  const handledServices = (vendorProfile?.selectedServices && vendorProfile.selectedServices.length > 0)
    ? services.filter((svc) => {
        const handledIds = vendorProfile.selectedServices.map((s) => (s._id ? s._id.toString() : s.toString()));
        return handledIds.includes(svc._id.toString());
      })
    : services;

  const selectedServiceObj = handledServices.find((s) => s._id === selectedServiceId) || services.find((s) => s._id === selectedServiceId);

  return (
    <Grid container spacing={gridSpacing}>
      {/* PAGE HEADER */}
      <Grid size={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <InventoryIcon color="secondary" sx={{ fontSize: 32 }} />
              <Typography variant="h2" fontWeight="800">
                Vendor Packages Management
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Select a service category below to manage packages, upload image galleries, and configure pricing.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm(null)}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
              textTransform: 'none'
            }}
          >
            Create New Package
          </Button>
        </Stack>
      </Grid>

      {/* SERVICE SELECTOR CARDS BAR */}
      <Grid size={12}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.8px', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LayersIcon fontSize="small" color="secondary" /> Select Service Category to View Its Packages:
          </Typography>

          <Grid container spacing={1.5}>
            {/* "All Services" Tab Card */}
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Paper
                elevation={0}
                onClick={() => handleSelectService('all')}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: '2px solid',
                  borderColor: selectedServiceId === 'all' ? 'secondary.main' : 'divider',
                  bgcolor: selectedServiceId === 'all' ? 'secondary.light' : 'background.default',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-2px)' }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color={selectedServiceId === 'all' ? 'secondary.main' : 'text.primary'}>
                      All Services
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full Catalog
                    </Typography>
                  </Box>
                  <Chip
                    label={getPackageCountForService('all')}
                    size="small"
                    color={selectedServiceId === 'all' ? 'secondary' : 'default'}
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* Individual Handled Services Cards */}
            {handledServices.map((svc) => {
              const isSelected = selectedServiceId === svc._id;
              const count = getPackageCountForService(svc._id);

              return (
                <Grid key={svc._id} size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Paper
                    elevation={0}
                    onClick={() => handleSelectService(svc._id)}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      border: '2px solid',
                      borderColor: isSelected ? 'secondary.main' : 'divider',
                      bgcolor: isSelected ? 'secondary.light' : 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-2px)' }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ minWidth: 0, pr: 1 }}>
                        <Typography variant="subtitle1" fontWeight={800} noWrap color={isSelected ? 'secondary.main' : 'text.primary'}>
                          {svc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {svc.customId || 'Service Category'}
                        </Typography>
                      </Box>
                      <Chip
                        label={count}
                        size="small"
                        color={isSelected ? 'secondary' : 'default'}
                        sx={{ fontWeight: 800, flexShrink: 0 }}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>

      {/* FILTER & SEARCH TOOLBAR */}
      <Grid size={12}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h3" fontWeight="800">
                {selectedServiceId === 'all' ? 'All Package Listings' : `${selectedServiceObj?.title || 'Selected Service'} Packages`}
              </Typography>
              <Chip
                label={`${filteredPackages.length} Packages Found`}
                size="small"
                color="secondary"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
            {selectedServiceId !== 'all' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                Showing only package listings belonging to <strong>{selectedServiceObj?.title}</strong>
              </Typography>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              placeholder="Search packages by title, location, ID..."
              size="small"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              sx={{ width: { xs: '100%', sm: 260 } }}
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

            <Stack direction="row" spacing={0.5}>
              {['All', 'Active', 'Inactive', 'Draft'].map((st) => (
                <Chip
                  key={st}
                  label={st}
                  size="small"
                  onClick={() => { setStatusFilter(st); setPage(0); }}
                  color={statusFilter === st ? 'secondary' : 'default'}
                  variant={statusFilter === st ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                />
              ))}
            </Stack>

            <Stack direction="row" sx={{ bgcolor: 'grey.100', borderRadius: '8px', p: 0.3 }}>
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'secondary' : 'default'}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color={viewMode === 'table' ? 'secondary' : 'default'}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
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
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {pkg.customId || 'PKG-LISTING'}
                        </Typography>
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
          <MainCard content={false}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Package Info & Photos</TableCell>
                    <TableCell>Service Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPackages.map((pkg) => {
                    const svcTitle = pkg.serviceCategory?.title || pkg.service?.title || 'Service';
                    const pkgImages = Array.isArray(pkg.images) ? pkg.images : [];
                    const thumbUrl = pkgImages.length > 0 ? getFullImageUrl(pkgImages[0]) : '/public/defaults/default_travel.png';

                    return (
                      <TableRow key={pkg._id} hover>
                        <TableCell sx={{ pl: 3 }}>
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
                        </TableCell>
                        <TableCell>
                          <Chip label={svcTitle} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="800" color="secondary.main">
                            ₹{pkg.price?.toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">/{pkg.priceType || 'Person'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">{pkg.duration || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">{pkg.location || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pkg.status || (pkg.isActive ? 'Active' : 'Inactive')}
                            size="small"
                            color={pkg.status === 'Active' || pkg.isActive ? 'success' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ pr: 3 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton size="small" onClick={() => handleOpenView(pkg)} color="info"><VisibilityIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleOpenForm(pkg)} color="primary"><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => handleDeleteClick(pkg)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
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

      {/* CREATE / EDIT PACKAGE FORM DIALOG */}
      <Dialog open={openFormDialog} onClose={() => !submitting && setOpenFormDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle variant="h3" fontWeight="bold">
          {selectedPackage ? 'Edit Package & Photos' : 'Create New Package Listing'}
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Package Document Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 4 Days Luxury Kerala Houseboat & Resort Package"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Service Category *"
                value={formData.serviceCategory}
                onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                required
              >
                {handledServices.map((svc) => (
                  <MenuItem key={svc._id} value={svc._id}>
                    {svc.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Package Rate (₹) *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 12500"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Price Charge Type"
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
              >
                <MenuItem value="Per Person">Per Person</MenuItem>
                <MenuItem value="Per Day">Per Day</MenuItem>
                <MenuItem value="Per Vehicle">Per Vehicle</MenuItem>
                <MenuItem value="Per Houseboat">Per Houseboat</MenuItem>
                <MenuItem value="Flat Package Rate">Flat Package Rate</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 3 Days / 2 Nights"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Destination / Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Munnar & Alleppey, Kerala"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Publication Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Active">🟢 Active & Published</MenuItem>
                <MenuItem value="Draft">🟡 Draft</MenuItem>
                <MenuItem value="Inactive">🔴 Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Package Overview & Highlights"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe package highlights, accommodation type, meals included, and itinerary points..."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Inclusions (Comma-separated)"
                value={formData.inclusions}
                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                placeholder="Welcome Drink, Breakfast, AC Cab, Sightseeing"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Exclusions (Comma-separated)"
                value={formData.exclusions}
                onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                placeholder="Flight Tickets, Personal Expenses, Entry Fees"
              />
            </Grid>

            {/* PACKAGE MULTI-IMAGE MANAGEMENT SECTION */}
            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  border: '1.5px dashed',
                  borderColor: 'secondary.main',
                  bgcolor: 'secondary.light'
                }}
              >
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoLibraryIcon color="secondary" fontSize="small" /> Package Image Gallery & Photo Management
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Add multiple photo URLs or upload image files for this package. The first photo is set as the primary cover banner.
                </Typography>

                <Grid container spacing={2}>
                  {/* Add Image via URL */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add Photo Image URL"
                      value={formData.newUrlInput}
                      onChange={(e) => setFormData({ ...formData, newUrlInput: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-1593693397690-362cb9666fc2"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={handleAddImageUrl}
                              startIcon={<AddPhotoAlternateIcon />}
                              sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
                            >
                              Add URL
                            </Button>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Upload Local Image Files */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="label"
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        py: 1,
                        borderRadius: '8px',
                        borderStyle: 'dashed',
                        fontWeight: 700,
                        textTransform: 'none'
                      }}
                    >
                      Upload Image Files
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleSelectFiles}
                      />
                    </Button>
                  </Grid>
                </Grid>

                {/* CURRENT IMAGES PREVIEW GALLERY LIST */}
                {(formData.images.length > 0 || selectedFiles.length > 0) && (
                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Attached Photos ({formData.images.length + selectedFiles.length}):
                    </Typography>

                    <Grid container spacing={1.5}>
                      {/* Existing Image URLs */}
                      {formData.images.map((imgUrl, index) => (
                        <Grid key={`img-${index}`} size={{ xs: 6, sm: 4, md: 3 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              position: 'relative',
                              p: 1,
                              borderRadius: '12px',
                              border: '1px solid',
                              borderColor: index === 0 ? 'secondary.main' : 'divider',
                              bgcolor: 'background.paper',
                              textAlign: 'center'
                            }}
                          >
                            <Box
                              component="img"
                              src={getFullImageUrl(imgUrl)}
                              alt={`Photo ${index + 1}`}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/public/defaults/default_travel.png'; }}
                              sx={{
                                width: '100%',
                                height: 90,
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                            <Typography variant="caption" display="block" noWrap sx={{ mt: 0.5, fontWeight: 700, fontSize: '10px' }}>
                              {index === 0 ? '⭐ Primary Banner' : `Photo #${index + 1}`}
                            </Typography>
                            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
                              {index !== 0 && (
                                <Button
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  sx={{ fontSize: '9px', py: 0, px: 0.5, minWidth: 0 }}
                                >
                                  Make Cover
                                </Button>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveExistingImage(index)}
                              >
                                <DeleteIcon fontSize="small" style={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}

                      {/* Newly Uploaded Local Files */}
                      {selectedFiles.map((file, index) => (
                        <Grid key={`file-${index}`} size={{ xs: 6, sm: 4, md: 3 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              position: 'relative',
                              p: 1,
                              borderRadius: '12px',
                              border: '1px dashed',
                              borderColor: 'primary.main',
                              bgcolor: 'primary.light',
                              textAlign: 'center'
                            }}
                          >
                            <Box
                              component="img"
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              sx={{
                                width: '100%',
                                height: 90,
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                            <Typography variant="caption" display="block" noWrap sx={{ mt: 0.5, fontWeight: 700, fontSize: '10px' }}>
                              📁 {file.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveSelectedFile(index)}
                              sx={{ mt: 0.5 }}
                            >
                              <DeleteIcon fontSize="small" style={{ fontSize: 16 }} />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpenFormDialog(false)} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmitForm}
            disabled={submitting}
            sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}
          >
            {submitting ? 'Saving Package...' : selectedPackage ? 'Update Package & Photos' : 'Create Package'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Grid>
  );
};

export default PackagesManagement;
