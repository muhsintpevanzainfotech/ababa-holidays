import { useState, useEffect } from 'react';
import { 
    Grid, Typography, Button, Stack, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Chip, IconButton, 
    Box, Tabs, Tab, LinearProgress, Avatar, Tooltip, Drawer, Divider
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

// assets / icons
import CategoryIcon from '@mui/icons-material/Category';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ServicesManagement = () => {
    const theme = useTheme();
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDark = !isLightExplicit;

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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

    // Filters
    const filterList = (list, nameKey = 'title') => {
        return list.filter(item => {
            const name = item[nameKey] || item.name || '';
            const desc = item.description || '';
            const matchesSearch = 
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                desc.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'All' ? true :
                statusFilter === 'Active' ? item.isActive !== false : item.isActive === false;

            return matchesSearch && matchesStatus;
        });
    };

    const filteredServices = filterList(services, 'title');
    const filteredSubServices = filterList(subServices, 'title');
    const filteredCategories = filterList(categories, 'name');

    const activeList = tab === 0 ? filteredServices : tab === 1 ? filteredSubServices : filteredCategories;

    const cardBgColor = isDark ? '#111827' : '#ffffff';
    const surfaceBgColor = isDark ? '#1f2937' : '#f8fafc';
    const borderLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    return (
        <Box>
            {/* Page Header */}
            <SaasHeader
                title="Services Catalog Manager"
                subtitle="Browse system service categories, detailed sub-services, and attributes across the platform."
                loading={loading}
            />

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={services.length}
                        label="Core Services"
                        icon={<RoomServiceIcon />}
                        colorScheme="primary"
                        onClick={() => { setTab(0); setPage(0); }}
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
                        icon={<SettingsSuggestIcon />}
                        colorScheme="secondary"
                        onClick={() => { setTab(1); setPage(0); }}
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
                        icon={<CategoryIcon />}
                        colorScheme="success"
                        onClick={() => { setTab(2); setPage(0); }}
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
                    borderRadius: '8px',
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
                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: borderLineColor }}>
                            <Tabs
                                value={tab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: 44,
                                    '& .MuiTabs-indicator': {
                                        bgcolor: '#ff5252',
                                        height: 3,
                                        borderRadius: '3px 3px 0 0'
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
                                            color: isDark ? '#f9fafb' : '#0f172a',
                                            fontWeight: 800
                                        },
                                        '&:hover': {
                                            color: isDark ? '#e5e7eb' : '#334155'
                                        }
                                    }
                                }}
                            >
                                <Tab icon={<RoomServiceIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`Core Services (${services.length})`} />
                                <Tab icon={<SettingsSuggestIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`Sub-Services (${subServices.length})`} />
                                <Tab icon={<CategoryIcon sx={{ fontSize: '1.1rem' }} />} iconPosition="start" label={`Categories (${categories.length})`} />
                            </Tabs>
                        </Box>

                        {/* Right Controls: Filters & Search */}
                        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
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
                                width={240}
                            />
                        </Stack>
                    </Stack>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2, borderRadius: '4px' }} />}

                {/* Table */}
                <DataTable
                    columns={[
                        {
                            headerName: 'TITLE / NAME',
                            field: 'title',
                            render: (row) => (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#ff5252', fontWeight: 700, fontSize: '0.85rem' }}>
                                        {(row.title || row.name || 'S').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                            {row.title || row.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                                            {row.customId || row._id?.slice(-8)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            )
                        },
                        ...(tab === 1 ? [{
                            headerName: 'PARENT SERVICE',
                            field: 'service',
                            render: (row) => (
                                <Typography variant="body2" fontWeight="600" color="text.secondary">
                                    {row.service?.title || 'System Service'}
                                </Typography>
                            )
                        }] : []),
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
                                        maxWidth: 340,
                                        fontSize: '0.83rem',
                                        lineHeight: 1.4
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
                                <Tooltip title="View Details">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenViewDrawer(row)}>
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
                        borderRadius: '6px',
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
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }
                }}
            >
                {selectedViewItem && (
                    <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h3" fontWeight="800" color="text.primary">
                                {tab === 0 ? 'Core Service Details' : tab === 1 ? 'Sub-Service Details' : 'Category Details'}
                            </Typography>
                            <IconButton onClick={() => setDrawerOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                        <Stack spacing={2.5}>
                            {/* Main Title & Type Card */}
                            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Avatar 
                                        src={selectedViewItem.image || selectedViewItem.icon || selectedViewItem.thumbnail} 
                                        sx={{ width: 48, height: 48, bgcolor: '#ff5252', fontWeight: 800, fontSize: '1.2rem' }}
                                    >
                                        {(selectedViewItem.title || selectedViewItem.name || 'C').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Typography variant="h4" fontWeight="800" color="text.primary">
                                            {selectedViewItem.title || selectedViewItem.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={tab === 0 ? 'Core Service' : tab === 1 ? 'Sub-Service' : 'Category'}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255, 82, 82, 0.15)', color: '#ff5252', fontWeight: 800, fontSize: '0.72rem' }}
                                            />
                                            <StatusBadge label={selectedViewItem.isActive !== false ? 'Active' : 'Inactive'} status={selectedViewItem.isActive !== false ? 'Active' : 'Inactive'} />
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Custom ID</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                                            <Typography variant="body2" fontWeight="800" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                                                {selectedViewItem.customId || (selectedViewItem._id ? selectedViewItem._id.slice(-10) : 'N/A')}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopyId(selectedViewItem.customId || selectedViewItem._id)}>
                                                {copiedId ? <CheckCircleIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                            </IconButton>
                                        </Stack>
                                    </Grid>

                                    {/* Parent Linkage for Sub-Services or Categories */}
                                    {(selectedViewItem.subService || selectedViewItem.service || selectedViewItem.parent) && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                                                {tab === 2 ? 'Parent Link' : 'Parent Service'}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color="text.primary" sx={{ mt: 0.3 }}>
                                                {selectedViewItem.subService?.title || selectedViewItem.service?.title || selectedViewItem.parent?.name || 'System Link'}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {/* Category Slug / Code */}
                                    {selectedViewItem.slug && (
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Category Slug</Typography>
                                            <Typography variant="body2" fontWeight="600" sx={{ mt: 0.3, color: 'primary.main', fontFamily: 'monospace' }}>
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
                                <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ lineHeight: 1.6, whitespace: 'pre-line' }}>
                                    {selectedViewItem.description || 'No detailed description recorded for this item.'}
                                </Typography>
                            </Box>

                            {/* Form Schema Summary (For Core Services) */}
                            {tab === 0 && selectedViewItem.formSchema && (
                                <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: surfaceBgColor, border: '1px solid', borderColor: borderLineColor }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                                        Dynamic Form Schema Attributes
                                    </Typography>
                                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                        <Chip label={`${selectedViewItem.formSchema.fields?.length || 0} Configured Fields`} size="small" variant="outlined" color="primary" />
                                        <Chip label={`${selectedViewItem.formSchema.groups?.length || 0} Field Groups`} size="small" variant="outlined" color="secondary" />
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

