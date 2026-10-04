import { useState, useEffect } from 'react';

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
    Avatar
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

const BannerManagement = () => {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: ''
    });

    const fetchBanners = async () => {
        try {
            setLoading(true);
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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await api.delete(`/banners/${id}`);
                fetchBanners();
            } catch (error) {
                alert(error.message || 'Failed to delete banner');
            }
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
            fetchBanners();
        } catch (error) {
            alert(error.message || 'Failed to update status');
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
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            alert('Banner title is required');
            return;
        }

        if (!selectedBanner && !file) {
            alert('Please select a banner image to upload');
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
                fetchBanners();
            }
        } catch (error) {
            alert(error.message || 'Failed to save banner');
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

    return (
        <Box>
            <SaasHeader
                title="Marketing Banners"
                subtitle="Manage homepage slides, promotional banners, and marketing campaigns."
                actionLabel="Add New Banner"
                actionIcon={<AddIcon />}
                onActionClick={() => handleOpenDialog()}
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
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
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
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
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
                                        <Typography variant="h4" fontWeight="bold" gutterBottom noWrap title={row.title}>
                                            {row.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineClamp: 2 }}>
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
                                                    <IconButton size="small" color="secondary" onClick={() => handleOpenDialog(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Banner">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
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
                                        <Typography variant="subtitle1" fontWeight="600">{row.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.description}</Typography>
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
                                        <IconButton size="small" color="secondary" onClick={() => handleOpenDialog(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
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
                        p: 3
                    }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h3">{selectedBanner ? 'Edit Banner' : 'Add New Banner'}</Typography>
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

                    <Typography variant="subtitle2">Banner Image (16:9 ratio recommended)</Typography>

                    <FileUpload
                        onFileSelect={(f) => setFile(f)}
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
        </Box>
    );
};

export default BannerManagement;
