import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
    Grid,
    Typography,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Box,
    TextField,
    InputAdornment,
    Tooltip,
    LinearProgress,
    Drawer,
    Switch,
    Card,
    CardContent,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';

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
import FileUpload from 'ui-component/extended/FileUpload';

const resolveImageUrl = (imgSrc) => {
    if (!imgSrc) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
    if (typeof imgSrc !== 'string') return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) {
        return imgSrc;
    }
    const envApi = import.meta.env.VITE_APP_API_URL || '';
    const baseUrl = envApi ? envApi.replace(/\/api\/?$/, '') : '';
    const path = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
    return baseUrl ? `${baseUrl}${path}` : imgSrc;
};

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const BannerManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [banners, setBanners] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [file, setFile] = useState(null);

    // Toast Alert State
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    // Subscription Plan Modal State
    const [subPlanModalOpen, setSubPlanModalOpen] = useState(false);
    // Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: ''
    });

    const fetchBanners = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ bannerEnabled: false, bannerLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

            let response;
            try {
                response = await api.get('/banners/my-banners');
            } catch (err) {
                response = await api.get('/banners');
            }

            if (response && response.success) {
                setBanners(response.data || response.banners || []);
            } else if (Array.isArray(response)) {
                setBanners(response);
            } else if (response && Array.isArray(response.data)) {
                setBanners(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const bannerLimit = subscription?.bannerLimit !== undefined ? subscription.bannerLimit : -1;
    const isBannerAllowed = subscription ? (subscription?.bannerEnabled !== false && bannerLimit !== 0) : true;
    const isBannerLimitReached = bannerLimit !== -1 && banners.length >= bannerLimit;

    if (!loading && !isBannerAllowed) {
        return (
            <Box>
                <SaasHeader title="Marketing Banners" subtitle="Manage homepage slides and promotional banners." />
                <SubscriptionRestrictedCard featureName="Banner Showcase" reason={bannerLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    const handleOpenDialogCustom = (banner = null) => {
        if (isBannerLimitReached && !banner) {
            setSubPlanModalOpen(true);
            return;
        }
        handleOpenDialog(banner);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const promptDelete = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/banners/${itemToDelete}`);
            setToast({ open: true, message: 'Banner deleted successfully!', severity: 'success' });
            fetchBanners();
        } catch (error) {
            setToast({ open: true, message: error.message || 'Failed to delete banner', severity: 'error' });
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            let res;
            try {
                res = await api.put(`/banners/${id}/toggle`);
            } catch (err) {
                try {
                    res = await api.patch(`/banners/${id}/toggle-status`);
                } catch (err2) {
                    res = await api.patch(`/banners/${id}`, { isActive: !banners.find(b => b._id === id)?.isActive });
                }
            }
            setToast({ open: true, message: 'Banner status updated successfully!', severity: 'success' });
            fetchBanners();
        } catch (error) {
            setToast({ open: true, message: error.message || 'Failed to update status', severity: 'error' });
        }
    };

    const handleOpenDialog = (banner = null) => {
        if (banner) {
            setSelectedBanner(banner);
            setFormData({
                title: banner.title || '',
                description: banner.description || '',
                link: banner.link || ''
            });
            setPreviewImage(banner.image ? resolveImageUrl(banner.image) : null);
        } else {
            setSelectedBanner(null);
            setFormData({ title: '', description: '', link: '' });
            setPreviewImage(null);
        }
        setFile(null);
        setFormError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setFormError('');
        if (!formData.title) {
            setFormError('Banner title is required');
            setToast({ open: true, message: 'Banner title is required', severity: 'warning' });
            return;
        }

        if (!selectedBanner && !file) {
            setFormError('Please select a banner image to upload');
            setToast({ open: true, message: 'Please select a banner image to upload', severity: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description || '');
            data.append('link', formData.link || '');
            if (file) {
                data.append('image', file);
            }

            let response;
            if (selectedBanner) {
                response = await api.put(`/banners/${selectedBanner._id}`, data, true);
            } else {
                response = await api.post('/banners', data, true);
            }

            if (response && (response.success || response._id || response.data)) {
                setOpenDialog(false);
                setToast({
                    open: true,
                    message: selectedBanner ? 'Banner updated successfully!' : 'New banner created successfully!',
                    severity: 'success'
                });
                fetchBanners();
            }
        } catch (error) {
            if (
                error.message?.toLowerCase().includes('subscription plan') ||
                error.message?.toLowerCase().includes('limit reached')
            ) {
                setSubPlanModalOpen(true);
            } else {
                setToast({ open: true, message: error.message || 'Failed to save banner', severity: 'error' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBanners = banners.filter(b =>
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = banners.filter(b => b.isActive).length;
    const inactiveCount = banners.length - activeCount;

    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';

    return (
        <Box>
            <SaasHeader
                title="Marketing Banners"
                subtitle="Manage homepage slides, promotional banners, and marketing campaigns."
                actionLabel="Add New Banner"
                actionIcon={<AddIcon />}
                onActionClick={() => handleOpenDialogCustom()}
                loading={loading}
            />

            {/* Quick Stats Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        count={banners.length} 
                        label="Total Banners" 
                        icon={<PhotoLibraryIcon />} 
                        variant={isDarkMode ? 'dark' : 'light'}
                        colorScheme="primary" 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        count={activeCount} 
                        label="Active Campaigns" 
                        icon={<CheckCircleIcon />} 
                        variant="light" 
                        colorScheme="success" 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        count={inactiveCount} 
                        label="Inactive Banners" 
                        icon={<PauseCircleOutlineIcon />} 
                        variant="light" 
                        colorScheme="warning" 
                    />
                </Grid>
            </Grid>

            {/* Filter and View Toggle Header */}
            <Box sx={{ mb: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider',
                        bgcolor: cardBgColor,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <TextField
                        placeholder="Search banners by title or description..."
                        size="small"
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 360 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            View:
                        </Typography>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, val) => val && setViewMode(val)}
                            size="small"
                            color="secondary"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <Tooltip title="Card Grid View">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <GridViewIcon fontSize="small" />
                                        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}>Grid</Typography>
                                    </Stack>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="table" aria-label="table view">
                                <Tooltip title="Table View">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ViewListIcon fontSize="small" />
                                        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}>List</Typography>
                                    </Stack>
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Paper>
            </Box>

            {loading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Box>
            )}

            {/* List Body: Grid View or Table View */}
            {!loading && viewMode === 'grid' && (
                <Box>
                    <Grid container spacing={gridSpacing}>
                        {filteredBanners.map((row) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row._id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: '16px',
                                        border: '1px solid',
                                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider',
                                        bgcolor: cardBgColor,
                                        overflow: 'hidden',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                                            borderColor: 'secondary.light'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            pt: '56.25%',
                                            bgcolor: 'grey.100',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={resolveImageUrl(row.image)}
                                            alt={row.title || 'Banner'}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                            <Chip
                                                label={row.isActive ? 'Active' : 'Inactive'}
                                                color={row.isActive ? 'success' : 'default'}
                                                size="small"
                                                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                                            />
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom noWrap title={row.title} sx={{ color: textColor }}>
                                            {row.title}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: subTextColor, mb: 2, flexGrow: 1, lineClamp: 2 }}>
                                            {row.description || 'No description provided.'}
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Switch
                                                checked={row.isActive}
                                                onChange={() => handleToggleStatus(row._id)}
                                                size="small"
                                                color="secondary"
                                            />

                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Edit Banner">
                                                    <IconButton size="small" color="secondary" onClick={() => handleOpenDialogCustom(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Banner">
                                                    <IconButton size="small" color="error" onClick={() => promptDelete(row._id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {!loading && viewMode === 'table' && (
                <Box sx={{ mb: 3 }}>
                    <DataTable
                        columns={[
                            {
                                headerName: 'Preview',
                                field: 'image',
                                render: (row) => (
                                    <Avatar
                                        variant="rounded"
                                        src={resolveImageUrl(row.image)}
                                        sx={{ width: 64, height: 40 }}
                                    />
                                )
                            },
                            {
                                headerName: 'Banner Title',
                                field: 'title',
                                render: (row) => (
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ color: textColor }}>{row.title}</Typography>
                                        <Typography variant="caption" sx={{ color: subTextColor }}>{row.description}</Typography>
                                    </Box>
                                )
                            },
                            {
                                headerName: 'Status',
                                field: 'isActive',
                                render: (row) => (
                                    <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
                                )
                            },
                            {
                                headerName: 'Actions',
                                align: 'center',
                                render: (row) => (
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton size="small" color="secondary" onClick={() => handleOpenDialogCustom(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => promptDelete(row._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )
                            }
                        ]}
                        rows={filteredBanners}
                        loading={loading}
                    />
                </Box>
            )}

            {/* Create/Edit Drawer */}
            <Drawer
                anchor="right"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 460 },
                        p: 3,
                        bgcolor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h3" sx={{ color: textColor }}>{selectedBanner ? 'Edit Banner' : 'Add New Banner'}</Typography>
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2.5}>
                    <TextField
                        fullWidth
                        label="Banner Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <TextField
                        fullWidth
                        label="Redirect Link (Optional)"
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />

                    <Typography variant="subtitle2" sx={{ color: textColor }}>Banner Image (16:9 ratio recommended)</Typography>

                    {formError && (
                        <Alert severity="warning" variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                            {formError}
                        </Alert>
                    )}

                    <FileUpload
                        onFileSelect={(f) => { setFile(f); setFormError(''); }}
                        previewUrl={previewImage}
                    />

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{ borderRadius: '10px', py: 1.2, fontWeight: 600 }}
                    >
                        {submitting ? 'Saving...' : selectedBanner ? 'Update Banner' : 'Create Banner'}
                    </Button>
                </Stack>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 1,
                        bgcolor: cardBgColor,
                        color: textColor,
                        maxWidth: 440
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: textColor, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WarningAmberIcon color="error" sx={{ fontSize: 32 }} />
                    Delete Banner
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor, fontWeight: 500 }}>
                        Are you sure you want to delete this marketing banner? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: '10px', fontWeight: 800, px: 3 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Subscription Limit Upgrade Warning Modal */}
            <Dialog
                open={subPlanModalOpen}
                onClose={() => setSubPlanModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1.5,
                        bgcolor: cardBgColor,
                        color: textColor,
                        maxWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: textColor, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <WorkspacePremiumIcon sx={{ color: '#ffb74d', fontSize: 36 }} />
                    Subscription Upgrade Required
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Alert severity="warning" variant="filled" sx={{ borderRadius: '14px', mb: 2.5, fontWeight: 700 }}>
                        Resource Limit Reached: Your current plan allows up to {bannerLimit === -1 ? 'unlimited' : bannerLimit} banner(s).
                    </Alert>
                    <Typography variant="body1" sx={{ color: subTextColor, lineHeight: 1.6, fontWeight: 500 }}>
                        You have reached the maximum allowed banner quota under your active subscription plan. Upgrade your vendor membership tier to unlock higher limits and showcase more marketing banners.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setSubPlanModalOpen(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>
                        Dismiss
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            setSubPlanModalOpen(false);
                            navigate('/system/settings/subscription');
                        }}
                        startIcon={<WorkspacePremiumIcon />}
                        sx={{
                            borderRadius: '12px',
                            fontWeight: 800,
                            px: 3,
                            py: 1.2,
                            bgcolor: '#ff9800',
                            color: '#ffffff',
                            '&:hover': { bgcolor: '#f57c00' }
                        }}
                    >
                        Upgrade Plan Now
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Notification Snackbar */}
            <Snackbar
                open={toast.open}
                autoHideDuration={5000}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 700,
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BannerManagement;
