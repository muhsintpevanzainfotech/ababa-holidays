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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import FileUpload from 'ui-component/extended/FileUpload';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const BannerManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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
            const response = await api.get('/banners');
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

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
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

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Marketing Banners</Typography>
                        <Typography variant="caption" color="text.secondary">Manage homepage sliders and promotional placements</Typography>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Add New Banner
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search banners..."
                            size="small"
                            value={searchTerm}
                            onChange={handleSearch}
                            sx={{ width: { xs: '100%', sm: 300 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    }
                >
                    {loading && <LinearProgress sx={{ mb: 2 }} />}
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Preview</TableCell>
                                    <TableCell>Title/Campaign</TableCell>
                                    <TableCell>Owner</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBanners.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Box 
                                                component="img"
                                                src={`${import.meta.env.VITE_APP_API_URL}/${row.image}`}
                                                sx={{ width: 100, height: 56, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1">{row.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.description?.substring(0, 50)}...</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={row.userRole} size="small" variant="outlined" color={row.userRole === 'Admin' ? 'primary' : 'secondary'} />
                                        </TableCell>
                                        <TableCell>
                                            <Switch 
                                                checked={row.isActive} 
                                                onChange={() => handleToggleStatus(row._id)}
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredBanners.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            No banners found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>

            {/* Banner Form Dialog */}
            <Dialog open={openDialog} onClose={() => !submitting && setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField 
                            fullWidth 
                            label="Banner Title" 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        />
                        <TextField 
                            fullWidth 
                            label="Description" 
                            multiline 
                            rows={2} 
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
                            <Typography variant="subtitle2" gutterBottom>Banner Image</Typography>
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
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={submitting}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Processing...' : (selectedBanner ? 'Update Banner' : 'Publish Banner')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default BannerManagement;
