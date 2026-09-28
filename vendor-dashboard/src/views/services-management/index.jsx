import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Grid, Typography, Button, Stack, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Chip, IconButton, 
    Box, Tabs, Tab, TextField, InputAdornment, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
    Avatar, TablePagination, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';

const ServicesManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Data lists
    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [categories, setCategories] = useState([]);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        name: '',
        service: '',
        description: '',
        isActive: true
    });

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
            console.error('Failed to fetch services hierarchy:', error);
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

    const handleOpenDialog = (item = null) => {
        setEditItem(item);
        if (item) {
            setFormData({
                title: item.title || item.name || '',
                name: item.name || item.title || '',
                service: item.service?._id || item.service || (services[0]?._id || ''),
                description: item.description || '',
                isActive: item.isActive !== undefined ? item.isActive : true
            });
        } else {
            setFormData({
                title: '',
                name: '',
                service: services[0]?._id || '',
                description: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (tab === 0 && !formData.title) {
            alert('Service Title is required');
            return;
        }
        if (tab === 1 && !formData.title) {
            alert('Sub-Service Title is required');
            return;
        }
        if (tab === 2 && !formData.title && !formData.name) {
            alert('Category Name is required');
            return;
        }

        setSubmitting(true);
        try {
            if (tab === 0) {
                // Core Service
                const payload = { title: formData.title, description: formData.description, isActive: formData.isActive };
                if (editItem) {
                    await api.put(`/services/${editItem._id}`, payload);
                } else {
                    await api.post('/services', payload);
                }
            } else if (tab === 1) {
                // Sub Service
                const payload = { title: formData.title, service: formData.service, description: formData.description, isActive: formData.isActive };
                if (editItem) {
                    await api.put(`/sub-services/${editItem._id}`, payload);
                } else {
                    await api.post('/sub-services', payload);
                }
            } else if (tab === 2) {
                // Category
                const payload = { name: formData.title || formData.name, title: formData.title || formData.name, service: formData.service, description: formData.description, isActive: formData.isActive };
                if (editItem) {
                    await api.put(`/categories/${editItem._id}`, payload);
                } else {
                    await api.post('/categories', payload);
                }
            }
            setOpenDialog(false);
            fetchAllData();
        } catch (error) {
            alert(error.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id, type) => {
        setItemToDelete({ id, type });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const { id, type } = itemToDelete;
        try {
            if (type === 'service') await api.delete(`/services/${id}`);
            else if (type === 'sub-service') await api.delete(`/sub-services/${id}`);
            else if (type === 'category') await api.delete(`/categories/${id}`);
            fetchAllData();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete catalog item');
        }
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
                statusFilter === 'Active' ? item.isActive : !item.isActive;

            return matchesSearch && matchesStatus;
        });
    };

    const filteredServices = filterList(services, 'title');
    const filteredSubServices = filterList(subServices, 'title');
    const filteredCategories = filterList(categories, 'name');

    const activeList = tab === 0 ? filteredServices : tab === 1 ? filteredSubServices : filteredCategories;
    const paginatedList = activeList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Header */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Services Catalog Manager</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Configure core services, detailed sub-services, and categories across the platform
                        </Typography>
                    </Box>

                    {/* Search Field */}
                    <TextField
                        placeholder="Search catalog items..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        sx={{ width: { xs: '100%', sm: 320 } }}
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
                </Stack>
            </Grid>

            {/* Quick Summary Widgets */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={services.length} 
                            label="Core Services" 
                            icon={<RoomServiceIcon />} 
                            variant="dark" 
                            colorScheme="primary"
                            onClick={() => { setTab(0); setPage(0); }}
                            active={tab === 0}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={subServices.length} 
                            label="Sub-Services" 
                            icon={<SettingsSuggestIcon />} 
                            variant="light" 
                            colorScheme="secondary"
                            onClick={() => { setTab(1); setPage(0); }}
                            active={tab === 1}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={categories.length} 
                            label="Categories" 
                            icon={<CategoryIcon />} 
                            variant="light" 
                            colorScheme="success"
                            onClick={() => { setTab(2); setPage(0); }}
                            active={tab === 2}
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Tabbed Catalog Section */}
            <Grid size={12}>
                <MainCard content={false}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Tabs value={tab} onChange={handleTabChange} aria-label="services hierarchy tabs" textColor="secondary" indicatorColor="secondary">
                            <Tab icon={<RoomServiceIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label={`Core Services (${services.length})`} sx={{ fontWeight: 600 }} />
                            <Tab icon={<SettingsSuggestIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label={`Sub-Services (${subServices.length})`} sx={{ fontWeight: 600 }} />
                            <Tab icon={<CategoryIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label={`Categories (${categories.length})`} sx={{ fontWeight: 600 }} />
                        </Tabs>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Stack direction="row" spacing={0.5}>
                                {['All', 'Active', 'Inactive'].map((st) => (
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

                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                size="small"
                                sx={{ borderRadius: '8px', px: 2, py: 0.8, fontWeight: 700 }}
                            >
                                Add {tab === 0 ? 'Service' : tab === 1 ? 'Sub-Service' : 'Category'}
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ p: 0 }}>
                        {loading && <LinearProgress />}
                        
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Title / Name</TableCell>
                                        {tab === 1 && <TableCell>Parent Service</TableCell>}
                                        <TableCell>Description</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedList.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ pl: 3, fontWeight: 'bold' }}>
                                                {row.title || row.name}
                                            </TableCell>
                                            {tab === 1 && (
                                                <TableCell>
                                                    <Chip label={row.service?.title || 'General'} size="small" variant="outlined" color="primary" />
                                                </TableCell>
                                            )}
                                            <TableCell sx={{ color: 'text.secondary', maxWidth: 350 }}>
                                                {row.description || 'No description provided.'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.isActive ? 'Active' : 'Inactive'} 
                                                    size="small" 
                                                    color={row.isActive ? 'success' : 'default'} 
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    {tab === 0 && (
                                                        <Tooltip title="View Service Packages">
                                                            <IconButton color="secondary" size="small" onClick={() => navigate(`/platform/packages?service=${row._id}`)}>
                                                                <InventoryIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Edit Item">
                                                        <IconButton color="primary" size="small" onClick={() => handleOpenDialog(row)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Item">
                                                        <IconButton color="error" size="small" onClick={() => handleDeleteClick(row._id, tab === 0 ? 'service' : tab === 1 ? 'sub-service' : 'category')}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedList.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={tab === 1 ? 5 : 4} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No catalog entries found matching your search.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {!loading && activeList.length > 0 && (
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={activeList.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            />
                        )}
                    </Box>
                </MainCard>
            </Grid>

            {/* Add / Edit Dialog */}
            <Dialog open={openDialog} onClose={() => !submitting && setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle variant="h4" fontWeight="bold">
                    {editItem 
                        ? `Edit ${tab === 0 ? 'Service' : tab === 1 ? 'Sub-Service' : 'Category'}`
                        : `Add New ${tab === 0 ? 'Service' : tab === 1 ? 'Sub-Service' : 'Category'}`
                    }
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        <TextField
                            fullWidth
                            label={tab === 2 ? "Category Name *" : "Title *"}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        {tab === 1 && (
                            <TextField
                                fullWidth
                                select
                                label="Parent Service Category *"
                                value={formData.service}
                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            >
                                {services.map((svc) => (
                                    <MenuItem key={svc._id} value={svc._id}>{svc.title}</MenuItem>
                                ))}
                            </TextField>
                        )}
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
                            select
                            label="Status"
                            value={formData.isActive ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        >
                            <MenuItem value="true">🟢 Active</MenuItem>
                            <MenuItem value="false">🔴 Inactive</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={submitting}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting} sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}>
                        {submitting ? 'Saving...' : (editItem ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Catalog Item</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this item? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Item
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default ServicesManagement;
