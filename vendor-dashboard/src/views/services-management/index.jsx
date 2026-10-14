import { useState, useEffect } from 'react';
import { 
    Grid, Typography, Button, Stack, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Chip, IconButton, 
    Box, Tabs, Tab, LinearProgress, Avatar, Tooltip, Drawer, Divider,
    Select, MenuItem, FormControl
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import SearchInput from 'ui-component/extended/SearchInput';
import StatusBadge from 'ui-component/extended/StatusBadge';
import SaasTablePagination from 'ui-component/extended/SaasTablePagination';
import FilterChip from 'ui-component/extended/FilterChip';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import useThemeMode from 'hooks/useThemeMode';

// assets / icons
import CategoryIcon from '@mui/icons-material/Category';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ExploreIcon from '@mui/icons-material/Explore';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LuggageIcon from '@mui/icons-material/Luggage';
import LayersIcon from '@mui/icons-material/Layers';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterListIcon from '@mui/icons-material/FilterList';

// Helper to build full backend asset URL
const getFullImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const baseUrl = import.meta.env.VITE_APP_API_URL 
        ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') 
        : 'http://localhost:9000';
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
};

// Smart service fallback icon based on title/category
const getServiceFallbackIcon = (title = '', isDark = true) => {
    const t = (title || '').toLowerCase();
    if (t.includes('hotel') || t.includes('resort') || t.includes('stay') || t.includes('room') || t.includes('resourt')) {
        return <HotelIcon sx={{ fontSize: 24, color: '#38bdf8' }} />;
    }
    if (t.includes('bus') || t.includes('transport') || t.includes('coach') || t.includes('shuttle')) {
        return <DirectionsBusIcon sx={{ fontSize: 24, color: '#34d399' }} />;
    }
    if (t.includes('wedding') || t.includes('event') || t.includes('party') || t.includes('marriage')) {
        return <CelebrationIcon sx={{ fontSize: 24, color: '#fb7185' }} />;
    }
    if (t.includes('tour') || t.includes('package') || t.includes('trip') || t.includes('holiday') || t.includes('travel')) {
        return <ExploreIcon sx={{ fontSize: 24, color: '#a78bfa' }} />;
    }
    if (t.includes('flight') || t.includes('air') || t.includes('plane') || t.includes('airline')) {
        return <FlightTakeoffIcon sx={{ fontSize: 24, color: '#60a5fa' }} />;
    }
    if (t.includes('car') || t.includes('taxi') || t.includes('cab') || t.includes('rental') || t.includes('drive')) {
        return <DirectionsCarIcon sx={{ fontSize: 24, color: '#fbbf24' }} />;
    }
    return <RoomServiceIcon sx={{ fontSize: 24, color: isDark ? '#41a0ae' : '#36669c' }} />;
};

// Dedicated Service Icon Avatar Component
const ServiceIconAvatar = ({ item, size = 44, isDark = true }) => {
    const [imgError, setImgError] = useState(false);
    const iconSrc = item?.icon || item?.image;
    const fullUrl = !imgError && iconSrc ? getFullImageUrl(iconSrc) : '';

    const isSvgOrImage = Boolean(fullUrl && (
        fullUrl.endsWith('.svg') ||
        fullUrl.endsWith('.png') ||
        fullUrl.endsWith('.jpg') ||
        fullUrl.endsWith('.jpeg') ||
        fullUrl.endsWith('.webp') ||
        fullUrl.includes('/uploads/') ||
        fullUrl.startsWith('data:')
    ));

    return (
        <Box
            sx={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark
                    ? 'linear-gradient(135deg, rgba(65, 160, 174, 0.16) 0%, rgba(54, 102, 156, 0.14) 100%)'
                    : 'linear-gradient(135deg, rgba(54, 102, 156, 0.08) 0%, rgba(65, 160, 174, 0.08) 100%)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)',
                boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                    : '0 2px 6px rgba(54, 102, 156, 0.08)',
                p: isSvgOrImage && !imgError ? '5px' : 0,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: '#41a0ae',
                    boxShadow: '0 4px 12px rgba(65, 160, 174, 0.3)'
                }
            }}
        >
            {isSvgOrImage && !imgError ? (
                <Box
                    component="img"
                    src={fullUrl}
                    alt={item?.title || item?.name || 'Icon'}
                    onError={() => setImgError(true)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '7px'
                    }}
                />
            ) : (
                getServiceFallbackIcon(item?.title || item?.name, isDark)
            )}
        </Box>
    );
};

// Mapping fallback for legacy category entries without stored ObjectId references
const CATEGORY_SERVICE_MAP = {
    'Adventure & Safari': {
        serviceTitle: 'Tour Packages',
        subServiceTitle: 'Adventure, Wildlife & Trekking Expeditions'
    },
    'Flights & Visa Solutions': {
        serviceTitle: 'Ticket & Visa Services',
        subServiceTitle: 'Domestic & International Flight Ticket Booking'
    },
    'Transport & Coach Fleet': {
        serviceTitle: 'Tourist Bus Booking',
        subServiceTitle: 'Luxury Multi-Axle Volvo & Scania AC Coach'
    },
    'Hajj & Umrah Pilgrimage': {
        serviceTitle: 'Hajj & Umrah Packages',
        subServiceTitle: 'Deluxe Umrah Package (5-Star Haram View)'
    },
    'Luxury Resorts & Hotels': {
        serviceTitle: 'Hotel & Resourt',
        subServiceTitle: 'Luxury Beach Resorts'
    },
    'Honeymoon & Couples': {
        serviceTitle: 'Wedding Trip Booking',
        subServiceTitle: 'Honeymoon Special Romantic Escapes'
    },
    'International Tours': {
        serviceTitle: 'Tour Packages',
        subServiceTitle: 'International Group & Luxury Tours'
    },
    'Domestic Holidays': {
        serviceTitle: 'Tour Packages',
        subServiceTitle: 'Domestic Holiday & Family Packages'
    }
};

const getCategoryParentInfo = (cat, servicesList = [], subServicesList = []) => {
    if (!cat) return {};
    let serviceObj = cat.service && typeof cat.service === 'object' ? cat.service : null;
    let subServiceObj = cat.subService && typeof cat.subService === 'object' ? cat.subService : null;

    if (!serviceObj && cat.service && typeof cat.service === 'string') {
        serviceObj = servicesList.find((s) => s._id === cat.service || s.customId === cat.service) || null;
    }
    if (!subServiceObj && cat.subService && typeof cat.subService === 'string') {
        subServiceObj = subServicesList.find((s) => s._id === cat.subService || s.customId === cat.subService) || null;
    }

    const titleKey = cat.title || cat.name || '';
    const mapMatch = CATEGORY_SERVICE_MAP[titleKey];
    if (mapMatch) {
        if (!serviceObj && mapMatch.serviceTitle) {
            serviceObj = servicesList.find((s) => (s.title || s.name)?.toLowerCase() === mapMatch.serviceTitle.toLowerCase()) || null;
        }
        if (!subServiceObj && mapMatch.subServiceTitle) {
            subServiceObj = subServicesList.find((s) => (s.title || s.name)?.toLowerCase() === mapMatch.subServiceTitle.toLowerCase()) || null;
        }
    }

    return {
        service: serviceObj,
        subService: subServiceObj,
        serviceId: serviceObj?._id || null,
        subServiceId: subServiceObj?._id || null,
        serviceTitle: serviceObj?.title || serviceObj?.name || mapMatch?.serviceTitle || null,
        subServiceTitle: subServiceObj?.title || subServiceObj?.name || mapMatch?.subServiceTitle || null
    };
};

const ServicesManagement = () => {
    const { isDark, theme } = useThemeMode();
    const cardBgColor = isDark ? '#16152b' : '#ffffff';
    const surfaceBgColor = isDark ? '#212040' : '#f8fafc';
    const borderLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Cascading Service, Sub-Service & Category Filters
    const [selectedServiceId, setSelectedServiceId] = useState('All');
    const [selectedSubServiceId, setSelectedSubServiceId] = useState('All');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Data lists
    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [categories, setCategories] = useState([]);

    // View Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedViewItem, setSelectedViewItem] = useState(null);
    const [copiedId, setCopiedId] = useState(false);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [svcRes, subRes, catRes] = await Promise.all([
                api.get('/services'),
                api.get('/sub-services?limit=100'),
                api.get('/categories?limit=100')
            ]);
            
            if (svcRes.success) setServices(svcRes.data || []);
            if (subRes.success) setSubServices(subRes.data || []);
            if (catRes.success) setCategories(catRes.data || []);
        } catch (error) {
            console.error('Failed to fetch services catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        setSearchTerm('');
        setStatusFilter('All');
        setSelectedServiceId('All');
        setSelectedSubServiceId('All');
        setSelectedCategoryId('All');
        setPage(0);
    };

    const handleOpenViewDrawer = (item) => {
        setSelectedViewItem(item);
        setDrawerOpen(true);
    };

    const handleCopyId = (idText) => {
        if (!idText) return;
        navigator.clipboard.writeText(idText);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    // Sub-services available for the current Service filter
    const availableSubServices = selectedServiceId === 'All'
        ? subServices
        : subServices.filter((sub) => {
            const svcId = (sub.service?._id || sub.service || '').toString();
            return svcId === selectedServiceId;
        });

    // Categories available for the current Service and Sub-Service filter
    const availableCategories = categories.filter((item) => {
        const parentInfo = getCategoryParentInfo(item, services, subServices);
        if (selectedServiceId !== 'All') {
            const itemSvcId = (parentInfo.serviceId || item.service?._id || item.service || '').toString();
            const matchesSvc = itemSvcId === selectedServiceId || 
                (parentInfo.serviceTitle && services.find((s) => s._id === selectedServiceId)?.title?.toLowerCase() === parentInfo.serviceTitle?.toLowerCase());
            if (!matchesSvc) return false;
        }
        if (selectedSubServiceId !== 'All') {
            const itemSubId = (parentInfo.subServiceId || item.subService?._id || item.subService || '').toString();
            const matchesSub = itemSubId === selectedSubServiceId ||
                (parentInfo.subServiceTitle && subServices.find((s) => s._id === selectedSubServiceId)?.title?.toLowerCase() === parentInfo.subServiceTitle?.toLowerCase());
            if (!matchesSub) return false;
        }
        return true;
    });

    // Filters for Core Services (Tab 0)
    const filteredServices = services.filter((item) => {
        const matchesStatus = 
            statusFilter === 'All' ? true :
            statusFilter === 'Active' ? item.isActive !== false : item.isActive === false;
        if (!matchesStatus) return false;

        const name = item.title || item.name || '';
        const desc = item.description || '';
        const idVal = item.customId || item._id || '';
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            idVal.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Filters for Sub-Services (Tab 1): Filter by Service, Sub-Service, Status, and Search
    const filteredSubServices = subServices.filter((item) => {
        // Filter by parent service
        if (selectedServiceId !== 'All') {
            const itemSvcId = (item.service?._id || item.service || '').toString();
            if (itemSvcId !== selectedServiceId) return false;
        }

        // Filter by specific sub-service
        if (selectedSubServiceId !== 'All') {
            const itemSubId = (item._id || '').toString();
            if (itemSubId !== selectedSubServiceId) return false;
        }

        const matchesStatus = 
            statusFilter === 'All' ? true :
            statusFilter === 'Active' ? item.isActive !== false : item.isActive === false;
        if (!matchesStatus) return false;

        const name = item.title || item.name || '';
        const desc = item.description || '';
        const idVal = item.customId || item._id || '';
        const svcName = item.service?.title || '';
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            idVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
            svcName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Filters for Categories (Tab 2): Filter by Service, Sub-Service, Category, Status, and Search
    const filteredCategories = categories.filter((item) => {
        const parentInfo = getCategoryParentInfo(item, services, subServices);

        // Filter by parent service
        if (selectedServiceId !== 'All') {
            const itemSvcId = (parentInfo.serviceId || item.service?._id || item.service || '').toString();
            const matchesSvc = itemSvcId === selectedServiceId || 
                (parentInfo.serviceTitle && services.find((s) => s._id === selectedServiceId)?.title?.toLowerCase() === parentInfo.serviceTitle?.toLowerCase());
            if (!matchesSvc) return false;
        }

        // Filter by parent sub-service
        if (selectedSubServiceId !== 'All') {
            const itemSubId = (parentInfo.subServiceId || item.subService?._id || item.subService || '').toString();
            const matchesSub = itemSubId === selectedSubServiceId ||
                (parentInfo.subServiceTitle && subServices.find((s) => s._id === selectedSubServiceId)?.title?.toLowerCase() === parentInfo.subServiceTitle?.toLowerCase());
            if (!matchesSub) return false;
        }

        // Filter by specific category
        if (selectedCategoryId !== 'All') {
            const itemCatId = (item._id || '').toString();
            if (itemCatId !== selectedCategoryId) return false;
        }

        const matchesStatus = 
            statusFilter === 'All' ? true :
            statusFilter === 'Active' ? item.isActive !== false : item.isActive === false;
        if (!matchesStatus) return false;

        const name = item.title || item.name || '';
        const desc = item.description || '';
        const idVal = item.customId || item._id || '';
        const svcName = parentInfo.serviceTitle || '';
        const subName = parentInfo.subServiceTitle || '';

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            idVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
            svcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const activeList = tab === 0 ? filteredServices : tab === 1 ? filteredSubServices : filteredCategories;

    return (
        <Box>
            {/* Page Header */}
            <SaasHeader
                title="Services Catalog Manager"
                subtitle="Browse system service categories, detailed sub-services, and catalog attributes across the platform."
                loading={loading}
            />

            {/* Stat Cards with Theme Color Palette */}
            <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={services.length}
                        label="Core Services"
                        icon={<RoomServiceIcon sx={{ color: '#41a0ae' }} />}
                        colorScheme="primary"
                        onClick={() => { setTab(0); setSelectedServiceId('All'); setSelectedSubServiceId('All'); setPage(0); }}
                        change="Catalog Core"
                        changeType="up"
                        active={tab === 0}
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={subServices.length}
                        label="Sub-Services"
                        icon={<SettingsSuggestIcon sx={{ color: '#38bdf8' }} />}
                        colorScheme="secondary"
                        onClick={() => { setTab(1); setSelectedServiceId('All'); setSelectedSubServiceId('All'); setPage(0); }}
                        change="Detailed Specs"
                        changeType="up"
                        active={tab === 1}
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={categories.length}
                        label="Categories"
                        icon={<CategoryIcon sx={{ color: '#3ec995' }} />}
                        colorScheme="success"
                        onClick={() => { setTab(2); setSelectedServiceId('All'); setSelectedSubServiceId('All'); setPage(0); }}
                        change="Classifications"
                        changeType="up"
                        active={tab === 2}
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Content Container Card */}
            <MainCard
                content={false}
                sx={{
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    bgcolor: cardBgColor,
                    p: { xs: 2, sm: 2.5 },
                    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                        transform: 'none',
                        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : borderLineColor
                    }
                }}
            >
                {/* Header Toolbar: Tabs + Search & Filters */}
                <Box sx={{ mb: 2.5 }}>
                    <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', lg: 'center' }}
                        spacing={2}
                    >
                        {/* Tabs with Theme Teal Accent */}
                        <Box sx={{ borderBottom: 1, borderColor: borderLineColor }}>
                            <Tabs
                                value={tab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: 44,
                                    '& .MuiTabs-indicator': {
                                        bgcolor: '#41a0ae',
                                        height: 3,
                                        borderRadius: '3px 3px 0 0',
                                        boxShadow: '0 0 10px rgba(65, 160, 174, 0.6)'
                                    },
                                    '& .MuiTab-root': {
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        fontSize: '0.88rem',
                                        minHeight: 44,
                                        py: 1,
                                        px: 2,
                                        color: isDark ? '#9ca3af' : '#64748b',
                                        transition: 'all 0.15s ease',
                                        '&.Mui-selected': {
                                            color: isDark ? '#ffffff !important' : '#36669c !important',
                                            fontWeight: 800
                                        },
                                        '&:hover': {
                                            color: isDark ? '#41a0ae' : '#36669c'
                                        }
                                    }
                                }}
                            >
                                <Tab icon={<RoomServiceIcon sx={{ fontSize: '1.15rem' }} />} iconPosition="start" label={`Core Services (${services.length})`} />
                                <Tab icon={<SettingsSuggestIcon sx={{ fontSize: '1.15rem' }} />} iconPosition="start" label={`Sub-Services (${subServices.length})`} />
                                <Tab icon={<CategoryIcon sx={{ fontSize: '1.15rem' }} />} iconPosition="start" label={`Categories (${categories.length})`} />
                            </Tabs>
                        </Box>

                        {/* Right Controls: Filters & Search */}
                        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" sx={{ gap: 1.25 }}>
                            {/* In Sub-Services (Tab 1): Filter by Service & Filter Sub-Service */}
                            {tab === 1 && (
                                <>
                                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                                        <Select
                                            value={selectedServiceId}
                                            onChange={(e) => {
                                                setSelectedServiceId(e.target.value);
                                                setSelectedSubServiceId('All');
                                                setPage(0);
                                            }}
                                            displayEmpty
                                            sx={{
                                                height: 38,
                                                borderRadius: '8px',
                                                bgcolor: surfaceBgColor,
                                                color: isDark ? '#ffffff' : '#0f172a',
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                border: '1px solid',
                                                borderColor: selectedServiceId !== 'All' ? '#41a0ae' : borderLineColor,
                                                boxShadow: selectedServiceId !== 'All' ? '0 0 0 1px #41a0ae' : 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover': { borderColor: '#41a0ae' }
                                            }}
                                            startAdornment={
                                                <RoomServiceIcon sx={{ fontSize: 18, color: '#41a0ae', mr: 1, ml: 0.5 }} />
                                            }
                                        >
                                            <MenuItem value="All" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Services</MenuItem>
                                            {services.map((svc) => (
                                                <MenuItem key={svc._id} value={svc._id} sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                    {svc.title || svc.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
                                        <Select
                                            value={selectedSubServiceId}
                                            onChange={(e) => { setSelectedSubServiceId(e.target.value); setPage(0); }}
                                            displayEmpty
                                            sx={{
                                                height: 38,
                                                borderRadius: '8px',
                                                bgcolor: surfaceBgColor,
                                                color: isDark ? '#ffffff' : '#0f172a',
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                border: '1px solid',
                                                borderColor: selectedSubServiceId !== 'All' ? '#3ec995' : borderLineColor,
                                                boxShadow: selectedSubServiceId !== 'All' ? '0 0 0 1px #3ec995' : 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover': { borderColor: '#3ec995' }
                                            }}
                                            startAdornment={
                                                <SettingsSuggestIcon sx={{ fontSize: 18, color: '#3ec995', mr: 1, ml: 0.5 }} />
                                            }
                                        >
                                            <MenuItem value="All" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                {selectedServiceId === 'All' ? 'All Sub-Services' : 'All Service Sub-Services'}
                                            </MenuItem>
                                            {availableSubServices.map((sub) => (
                                                <MenuItem key={sub._id} value={sub._id} sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                    {sub.title || sub.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            {/* In Categories (Tab 2): Filter by Service, Sub-Service, and Category */}
                            {tab === 2 && (
                                <>
                                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 } }}>
                                        <Select
                                            value={selectedServiceId}
                                            onChange={(e) => {
                                                setSelectedServiceId(e.target.value);
                                                setSelectedSubServiceId('All');
                                                setSelectedCategoryId('All');
                                                setPage(0);
                                            }}
                                            displayEmpty
                                            sx={{
                                                height: 38,
                                                borderRadius: '8px',
                                                bgcolor: surfaceBgColor,
                                                color: isDark ? '#ffffff' : '#0f172a',
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                border: '1px solid',
                                                borderColor: selectedServiceId !== 'All' ? '#41a0ae' : borderLineColor,
                                                boxShadow: selectedServiceId !== 'All' ? '0 0 0 1px #41a0ae' : 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover': { borderColor: '#41a0ae' }
                                            }}
                                            startAdornment={
                                                <RoomServiceIcon sx={{ fontSize: 18, color: '#41a0ae', mr: 1, ml: 0.5 }} />
                                            }
                                        >
                                            <MenuItem value="All" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Services</MenuItem>
                                            {services.map((svc) => (
                                                <MenuItem key={svc._id} value={svc._id} sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                    {svc.title || svc.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                                        <Select
                                            value={selectedSubServiceId}
                                            onChange={(e) => {
                                                setSelectedSubServiceId(e.target.value);
                                                setSelectedCategoryId('All');
                                                setPage(0);
                                            }}
                                            displayEmpty
                                            sx={{
                                                height: 38,
                                                borderRadius: '8px',
                                                bgcolor: surfaceBgColor,
                                                color: isDark ? '#ffffff' : '#0f172a',
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                border: '1px solid',
                                                borderColor: selectedSubServiceId !== 'All' ? '#3ec995' : borderLineColor,
                                                boxShadow: selectedSubServiceId !== 'All' ? '0 0 0 1px #3ec995' : 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover': { borderColor: '#3ec995' }
                                            }}
                                            startAdornment={
                                                <SettingsSuggestIcon sx={{ fontSize: 18, color: '#3ec995', mr: 1, ml: 0.5 }} />
                                            }
                                        >
                                            <MenuItem value="All" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                {selectedServiceId === 'All' ? 'All Sub-Services' : 'All Service Sub-Services'}
                                            </MenuItem>
                                            {availableSubServices.map((sub) => (
                                                <MenuItem key={sub._id} value={sub._id} sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                    {sub.title || sub.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                                        <Select
                                            value={selectedCategoryId}
                                            onChange={(e) => { setSelectedCategoryId(e.target.value); setPage(0); }}
                                            displayEmpty
                                            sx={{
                                                height: 38,
                                                borderRadius: '8px',
                                                bgcolor: surfaceBgColor,
                                                color: isDark ? '#ffffff' : '#0f172a',
                                                fontSize: '0.84rem',
                                                fontWeight: 600,
                                                border: '1px solid',
                                                borderColor: selectedCategoryId !== 'All' ? '#f59e0b' : borderLineColor,
                                                boxShadow: selectedCategoryId !== 'All' ? '0 0 0 1px #f59e0b' : 'none',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover': { borderColor: '#f59e0b' }
                                            }}
                                            startAdornment={
                                                <CategoryIcon sx={{ fontSize: 18, color: '#f59e0b', mr: 1, ml: 0.5 }} />
                                            }
                                        >
                                            <MenuItem value="All" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                {selectedSubServiceId !== 'All' ? 'All Sub-Service Categories' : selectedServiceId !== 'All' ? 'All Service Categories' : 'All Categories'}
                                            </MenuItem>
                                            {availableCategories.map((cat) => (
                                                <MenuItem key={cat._id} value={cat._id} sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                                                    {cat.title || cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            {/* Reset Filters Button */}
                            {(selectedServiceId !== 'All' || selectedSubServiceId !== 'All' || selectedCategoryId !== 'All') && (
                                <Tooltip title="Clear Service, Sub-Service & Category Filters">
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSelectedServiceId('All');
                                            setSelectedSubServiceId('All');
                                            setSelectedCategoryId('All');
                                            setPage(0);
                                        }}
                                        startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            height: 38,
                                            px: 1.5,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            color: '#ef4444',
                                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)',
                                            borderRadius: '8px',
                                            '&:hover': {
                                                bgcolor: 'rgba(239, 68, 68, 0.2)'
                                            }
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Tooltip>
                            )}

                            {/* Status Filter Chips */}
                            <FilterChip
                                label="All"
                                active={statusFilter === 'All'}
                                onClick={() => { setStatusFilter('All'); setPage(0); }}
                            />
                            <FilterChip
                                label="Active"
                                active={statusFilter === 'Active'}
                                onClick={() => { setStatusFilter('Active'); setPage(0); }}
                            />
                            <FilterChip
                                label="Inactive"
                                active={statusFilter === 'Inactive'}
                                onClick={() => { setStatusFilter('Inactive'); setPage(0); }}
                            />

                            <SearchInput
                                placeholder="Search catalog items..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                width={220}
                            />
                        </Stack>
                    </Stack>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2, borderRadius: '4px', bgcolor: 'rgba(65, 160, 174, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#41a0ae' } }} />}

                {/* Table with Service Icons, Cover Previews & Elevated Design */}
                <DataTable
                    columns={[
                        {
                            headerName: 'SERVICE / ICON',
                            field: 'title',
                            render: (row) => (
                                <Stack direction="row" spacing={1.75} alignItems="center">
                                    <ServiceIconAvatar item={row} size={44} isDark={isDark} />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="subtitle2" fontWeight="800" sx={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.92rem' }}>
                                            {row.title || row.name}
                                        </Typography>
                                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.3 }}>
                                            <Chip
                                                label={row.customId || (row._id ? row._id.slice(-8) : 'N/A')}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.68rem',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    bgcolor: isDark ? 'rgba(65, 160, 174, 0.14)' : 'rgba(54, 102, 156, 0.08)',
                                                    color: isDark ? '#41a0ae' : '#36669c',
                                                    border: '1px solid',
                                                    borderColor: isDark ? 'rgba(65, 160, 174, 0.28)' : 'rgba(54, 102, 156, 0.2)'
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                </Stack>
                            )
                        },
                        {
                            headerName: 'COVER MEDIA',
                            field: 'image',
                            render: (row) => {
                                const imgSrc = row.image && row.image !== '/public/defaults/default_travel.png' 
                                    ? getFullImageUrl(row.image) 
                                    : null;
                                return (
                                    <Box
                                        sx={{
                                            width: 62,
                                            height: 40,
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        {imgSrc ? (
                                            <Box
                                                component="img"
                                                src={imgSrc}
                                                alt={row.title || 'Cover'}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
                                                No cover
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            }
                        },
                        ...(tab === 1 ? [{
                            headerName: 'PARENT SERVICE',
                            field: 'service',
                            render: (row) => (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <RoomServiceIcon sx={{ fontSize: 16, color: '#41a0ae' }} />
                                    <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.84rem' }}>
                                        {row.service?.title || 'System Service'}
                                    </Typography>
                                </Stack>
                            )
                        }] : []),
                        ...(tab === 2 ? [
                            {
                                headerName: 'PARENT SERVICE',
                                field: 'service',
                                render: (row) => {
                                    const parentInfo = getCategoryParentInfo(row, services, subServices);
                                    return (
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <RoomServiceIcon sx={{ fontSize: 16, color: '#41a0ae' }} />
                                            <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.84rem' }}>
                                                {parentInfo.serviceTitle || 'General Service'}
                                            </Typography>
                                        </Stack>
                                    );
                                }
                            },
                            {
                                headerName: 'SUB-SERVICE',
                                field: 'subService',
                                render: (row) => {
                                    const parentInfo = getCategoryParentInfo(row, services, subServices);
                                    return (
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <SettingsSuggestIcon sx={{ fontSize: 16, color: '#3ec995' }} />
                                            <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.84rem' }}>
                                                {parentInfo.subServiceTitle || 'All Sub-Services'}
                                            </Typography>
                                        </Stack>
                                    );
                                }
                            }
                        ] : []),
                        {
                            headerName: 'DESCRIPTION',
                            field: 'description',
                            render: (row) => (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        maxWidth: 320,
                                        fontSize: '0.82rem',
                                        lineHeight: 1.45
                                    }}
                                >
                                    {row.description || 'No description provided.'}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'STATUS',
                            field: 'isActive',
                            render: (row) => (
                                <StatusBadge label={row.isActive !== false ? 'Active' : 'Inactive'} status={row.isActive !== false ? 'Active' : 'Inactive'} />
                            )
                        },
                        {
                            headerName: 'ACTIONS',
                            align: 'center',
                            render: (row) => (
                                <Tooltip title="View Catalog Details">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenViewDrawer(row)}
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '8px',
                                            color: isDark ? '#41a0ae' : '#36669c',
                                            bgcolor: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.08)',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.15)',
                                            transition: 'all 0.15s ease-in-out',
                                            '&:hover': {
                                                bgcolor: isDark ? '#41a0ae' : '#36669c',
                                                color: '#ffffff'
                                            }
                                        }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    ]}
                    rows={activeList}
                    loading={loading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={activeList.length}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    emptyTitle="No Catalog Items Found"
                    emptySubtitle={searchTerm ? 'Try adjusting your search query.' : 'No catalog items recorded yet.'}
                    sx={{
                        borderRadius: '8px',
                        boxShadow: 'none'
                    }}
                />
            </MainCard>

            {/* View Details Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal + 200
                }}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480, md: 520 },
                        p: 3,
                        backgroundColor: cardBgColor,
                        color: 'text.primary',
                        boxShadow: isDark ? '0 8px 36px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(15, 23, 42, 0.15)'
                    }
                }}
            >
                {selectedViewItem && (
                    <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h3" fontWeight="800" sx={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                                {tab === 0 ? 'Core Service Details' : tab === 1 ? 'Sub-Service Details' : 'Category Details'}
                            </Typography>
                            <IconButton onClick={() => setDrawerOpen(false)} sx={{ borderRadius: '8px' }}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                        <Stack spacing={2.5}>
                            {/* Main Title, Icon & Type Card */}
                            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <ServiceIconAvatar item={selectedViewItem} size={54} isDark={isDark} />
                                    <Box flex={1} minWidth={0}>
                                        <Typography variant="h4" fontWeight="800" sx={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                                            {selectedViewItem.title || selectedViewItem.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                                            <Chip
                                                label={tab === 0 ? 'Core Service' : tab === 1 ? 'Sub-Service' : 'Category'}
                                                size="small"
                                                sx={{
                                                    bgcolor: isDark ? 'rgba(65, 160, 174, 0.16)' : 'rgba(54, 102, 156, 0.1)',
                                                    color: isDark ? '#41a0ae' : '#36669c',
                                                    fontWeight: 800,
                                                    fontSize: '0.72rem',
                                                    border: '1px solid',
                                                    borderColor: isDark ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)'
                                                }}
                                            />
                                            <StatusBadge label={selectedViewItem.isActive !== false ? 'Active' : 'Inactive'} status={selectedViewItem.isActive !== false ? 'Active' : 'Inactive'} />
                                        </Stack>
                                    </Box>
                                </Stack>

                                {/* Cover Media Banner if available */}
                                {selectedViewItem.image && selectedViewItem.image !== '/public/defaults/default_travel.png' && (
                                    <Box sx={{ mb: 2, borderRadius: '10px', overflow: 'hidden', height: 140, border: '1px solid', borderColor: borderLineColor }}>
                                        <Box
                                            component="img"
                                            src={getFullImageUrl(selectedViewItem.image)}
                                            alt={selectedViewItem.title || 'Cover Banner'}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                )}

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Custom ID</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                            <Typography variant="body2" fontWeight="800" sx={{ fontFamily: 'monospace', color: isDark ? '#41a0ae' : '#36669c' }}>
                                                {selectedViewItem.customId || (selectedViewItem._id ? selectedViewItem._id.slice(-10) : 'N/A')}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopyId(selectedViewItem.customId || selectedViewItem._id)}>
                                                {copiedId ? <CheckCircleIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                    </Grid>

                                    {/* Parent Linkage for Sub-Services or Categories */}
                                    {tab === 2 ? (
                                        <>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                                    Parent Service
                                                </Typography>
                                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.3 }}>
                                                    <RoomServiceIcon sx={{ fontSize: 16, color: '#41a0ae' }} />
                                                    <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? '#41a0ae' : '#36669c' }}>
                                                        {getCategoryParentInfo(selectedViewItem, services, subServices).serviceTitle || 'General Service'}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                                    Sub-Service
                                                </Typography>
                                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.3 }}>
                                                    <SettingsSuggestIcon sx={{ fontSize: 16, color: '#3ec995' }} />
                                                    <Typography variant="body2" fontWeight="700" sx={{ color: isDark ? '#3ec995' : '#10b981' }}>
                                                        {getCategoryParentInfo(selectedViewItem, services, subServices).subServiceTitle || 'All Sub-Services'}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </>
                                    ) : (
                                        (selectedViewItem.subService || selectedViewItem.service || selectedViewItem.parent) && (
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                                    Parent Service
                                                </Typography>
                                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.3 }}>
                                                    <RoomServiceIcon sx={{ fontSize: 16, color: '#41a0ae' }} />
                                                    <Typography variant="body2" fontWeight="700" color="text.primary">
                                                        {selectedViewItem.service?.title || selectedViewItem.subService?.title || selectedViewItem.parent?.name || 'System Link'}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        )
                                    )}

                                    {/* Category Slug / Code */}
                                    {selectedViewItem.slug && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Category Slug</Typography>
                                            <Typography variant="body2" fontWeight="700" sx={{ mt: 0.3, color: '#41a0ae', fontFamily: 'monospace' }}>
                                                {selectedViewItem.slug}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {/* Sort / Display Order */}
                                    {(selectedViewItem.displayOrder !== undefined || selectedViewItem.order !== undefined) && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Display Order</Typography>
                                            <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mt: 0.3 }}>
                                                {selectedViewItem.displayOrder ?? selectedViewItem.order}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {selectedViewItem.createdAt && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Created Date</Typography>
                                            <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mt: 0.3 }}>
                                                {new Date(selectedViewItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {selectedViewItem.updatedAt && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Last Modified</Typography>
                                            <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mt: 0.3 }}>
                                                {new Date(selectedViewItem.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {/* Detailed Description */}
                            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                                    Full Description & Overview
                                </Typography>
                                <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                    {selectedViewItem.description || 'No detailed description recorded for this item.'}
                                </Typography>
                            </Box>

                            {/* Form Schema Summary (For Core Services) */}
                            {tab === 0 && selectedViewItem.formSchema && (
                                <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                                        Dynamic Form Schema Attributes
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                        <Chip
                                            label={`${selectedViewItem.formSchema.fields?.length || 0} Configured Fields`}
                                            size="small"
                                            sx={{ bgcolor: isDark ? 'rgba(65, 160, 174, 0.16)' : 'rgba(54, 102, 156, 0.1)', color: isDark ? '#41a0ae' : '#36669c', fontWeight: 700 }}
                                        />
                                        <Chip
                                            label={`${selectedViewItem.formSchema.groups?.length || 0} Field Groups`}
                                            size="small"
                                            sx={{ bgcolor: isDark ? 'rgba(62, 201, 149, 0.16)' : 'rgba(46, 125, 50, 0.1)', color: isDark ? '#3ec995' : '#2e7d32', fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Box>
                            )}

                            {/* SEO Meta Information */}
                            {selectedViewItem.seo && (selectedViewItem.seo.title || selectedViewItem.seo.description || selectedViewItem.seo.keywords?.length > 0) && (
                                <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                                        SEO Metadata & Search Engine Indexing
                                    </Typography>

                                    {selectedViewItem.seo.title && (
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary">SEO Meta Title:</Typography>
                                            <Typography variant="body2" fontWeight="700" color="text.primary">{selectedViewItem.seo.title}</Typography>
                                        </Box>
                                    )}

                                    {selectedViewItem.seo.description && (
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary">SEO Meta Description:</Typography>
                                            <Typography variant="body2" color="text.primary">{selectedViewItem.seo.description}</Typography>
                                        </Box>
                                    )}

                                    {selectedViewItem.seo.keywords?.length > 0 && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>SEO Keywords:</Typography>
                                            <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                {selectedViewItem.seo.keywords.map((kw, i) => (
                                                    <Chip key={i} label={kw} size="small" sx={{ fontSize: '0.72rem' }} />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Stack>
                    </>
                )}
            </Drawer>
        </Box>
    );
};

export default ServicesManagement;
