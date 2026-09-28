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
    CardActions,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Avatar
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import FileUpload from 'ui-component/extended/FileUpload';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LaunchIcon from '@mui/icons-material/Launch';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

const BannerManagement = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
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
            const response = await api.get('/banners/my-banners');
            if (response.success) {
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
                alert(error.message);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/banners/${id}/toggle`);
            fetchBanners();
        } catch (error) {
            alert(error.message);
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
            setPreviewImage(`${import.meta.env.VITE_APP_API_URL}/${banner.image}`);
        } else {
            setSelectedBanner(null);
            setFormData({ title: '', description: '', link: '' });
            setPreviewImage(null);
        }
        setFile(null);
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || (!file && !selectedBanner)) {
            alert('Title and image are required');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('link', formData.link);
            if (file) {
                data.append('image', file);
            }

            let response;
            if (selectedBanner) {
                response = await api.put(`/banners/${selectedBanner._id}`, data, true);
            } else {
                response = await api.post('/banners', data, true);
            }

            if (response.success) {
                setOpenDialog(false);
                fetchBanners();
            }
        } catch (error) {
            alert(error.message);
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
        <Grid container spacing={gridSpacing}>
            {/* Header & Action Bar */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Marketing Banners</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage homepage slides, promotional banners, and marketing campaigns
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            borderRadius: '10px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 4px 14px rgba(103, 58, 183, 0.35)',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                        }}
                    >
                        Add New Banner
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Stats Summary */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={banners.length} 
                            label="Total Banners" 
                            icon={<PhotoLibraryIcon />} 
                            variant="dark" 
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
            </Grid>

            {/* Filter and View Toggle Header */}
            <Grid size={12}>
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
                        justify: 'space-between',
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
            </Grid>

            {loading && (
                <Grid size={12}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Grid>
            )}

            {/* List Body: Grid View or Table View */}
            {!loading && viewMode === 'grid' && (
                <Grid size={12}>
                    <Grid container spacing={ gridSpacing }>
                        {filteredBanners.map((row) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row._id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: '16px',
                                        border: '1px solid',
                                        borderColor: 'divider',
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
                                    {/* 16:9 Banner Image Showcase */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            pt: '56.25%', // 16:9 aspect ratio
                                            bgcolor: 'grey.100',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={`${import.meta.env.VITE_APP_API_URL}/${row.image}`}
                                            alt={row.title}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        {/* Status Chip Overlay */}
                                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                            <Chip
                                                label={row.isActive ? 'Active' : 'Inactive'}
                                                color={row.isActive ? 'success' : 'default'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    backdropFilter: 'blur(8px)',
                                                    bgcolor: row.isActive ? 'rgba(46, 125, 50, 0.9)' : 'rgba(97, 97, 97, 0.9)',
                                                    color: '#fff'
                                                }}
                                            />
                                        </Box>
                                        {/* Creator Overlay */}
                                        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                                            <Chip
                                                label={row.createdBy?.role === 'Vendor' || row.userRole === 'Vendor' ? (row.createdBy?.name || 'Partner') : 'Official Admin'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    backdropFilter: 'blur(8px)',
                                                    bgcolor: 'rgba(18, 18, 18, 0.75)',
                                                    color: '#fff'
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Card Content */}
                                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom noWrap title={row.title}>
                                            {row.title}
                                        </Typography>
                                        
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: '40px',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {row.description || 'No description provided.'}
                                        </Typography>

                                        {row.link && (
                                            <Box sx={{ mt: 'auto', pt: 1 }}>
                                                <Chip
                                                    icon={<LaunchIcon style={{ fontSize: 14 }} />}
                                                    label={row.link.replace(/^https?:\/\//, '')}
                                                    component="a"
                                                    href={row.link}
                                                    target="_blank"
                                                    clickable
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                />
                                            </Box>
                                        )}
                                    </CardContent>

                                    <Divider />

                                    {/* Card Footer Actions */}
                                    <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Switch
                                                checked={row.isActive}
                                                onChange={() => handleToggleStatus(row._id)}
                                                color="success"
                                                size="small"
                                            />
                                            <Typography variant="caption" color={row.isActive ? 'success.main' : 'text.secondary'} fontWeight="600">
                                                {row.isActive ? 'Active' : 'Disabled'}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Edit Banner">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(row)}
                                                    sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Banner">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(row._id)}
                                                    sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            )}

            {!loading && viewMode === 'table' && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Preview</TableCell>
                                        <TableCell>Title / Campaign</TableCell>
                                        <TableCell>Owner</TableCell>
                                        <TableCell>Redirect Link</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBanners.map((row) => (
                                        <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Box
                                                    component="img"
                                                    src={`${import.meta.env.VITE_APP_API_URL}/${row.image}`}
                                                    sx={{ width: 110, height: 62, objectFit: 'cover', borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle1" fontWeight="bold">{row.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300 }} noWrap>
                                                    {row.description || 'No description'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.createdBy?.role === 'Vendor' || row.userRole === 'Vendor' ? `Vendor: ${row.createdBy?.name || 'Partner'}` : 'Official Admin'}
                                                    size="small"
                                                    variant="outlined"
                                                    color={row.createdBy?.role === 'Vendor' || row.userRole === 'Vendor' ? 'secondary' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.link ? (
                                                    <Button
                                                        component="a"
                                                        href={row.link}
                                                        target="_blank"
                                                        size="small"
                                                        endIcon={<LaunchIcon style={{ fontSize: 12 }} />}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Visit Link
                                                    </Button>
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">None</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Switch
                                                        checked={row.isActive}
                                                        onChange={() => handleToggleStatus(row._id)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={row.isActive ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        color={row.isActive ? 'success' : 'default'}
                                                        variant="light"
                                                    />
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="Edit Banner">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Banner">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </MainCard>
                </Grid>
            )}

            {/* Empty State */}
            {!loading && filteredBanners.length === 0 && (
                <Grid size={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            borderRadius: '16px',
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" gutterBottom>No Banners Found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
                            {searchTerm ? `No banner matches your search term "${searchTerm}". Try resetting your filter.` : 'You have not uploaded any marketing banners yet. Create your first banner to showcase on the platform!'}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: '8px', px: 3 }}
                        >
                            Create Banner Now
                        </Button>
                    </Paper>
                </Grid>
            )}

            {/* Right-Side Drawer Banner Form */}
            <Drawer
                anchor="right"
                open={openDialog}
                onClose={() => !submitting && setOpenDialog(false)}
                sx={{ zIndex: 1400 }}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 540, md: 620 }, p: 0, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 36px rgba(0,0,0,0.25)' }
                }}
            >
                <Box sx={{ p: 2.5, bgcolor: 'secondary.main', color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4" color="inherit" fontWeight="bold">
                            {selectedBanner ? 'Edit Banner' : 'Create New Banner'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                            {selectedBanner ? 'Update existing promotional banner details' : 'Publish a new promotional banner to your agency showcase'}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'common.white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        p: 3,
                        flexGrow: 1,
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': { display: 'none' }
                    }}
                >
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Banner Title *"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Redirect Link (Optional)"
                            placeholder="https://..."
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Banner Image *</Typography>
                            <FileUpload
                                onFileSelect={(selectedFile) => setFile(selectedFile)}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                                title="Drag and drop banner image"
                                caption="Maximum size 2MB. Recommended resolution 1920x1080"
                            />
                            {previewImage && !file && (
                                <Box sx={{ mt: 2, position: 'relative', width: '100%', pt: '56.25%', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                    <Box
                                        component="img"
                                        src={previewImage}
                                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting} sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}>
                        {submitting ? 'Processing...' : (selectedBanner ? 'Update Banner' : 'Publish Banner')}
                    </Button>
                </Box>
            </Drawer>
        </Grid>
    );
};

export default BannerManagement;

