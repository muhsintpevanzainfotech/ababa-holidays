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
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Tooltip,
    LinearProgress
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
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const VendorsManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // Stats
    const stats = {
        total: vendors.length,
        active: vendors.filter(v => v.profile?.isApproved).length,
        pending: vendors.filter(v => !v.profile?.isApproved).length
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vendors');
            if (response.success) {
                setVendors(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = (status) => {
        if (status) setStatusFilter(status);
        setFilterAnchorEl(null);
    };

    const handleStatFilter = (status) => {
        setStatusFilter(status);
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/vendors/${id}/approve`);
            fetchVendors();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await api.delete(`/vendors/${id}`);
                fetchVendors();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleOpenDialog = (vendor = null) => {
        setSelectedVendor(vendor);
        setOpenDialog(true);
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = 
            v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.profile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'All' || 
            (statusFilter === 'Approved' && v.profile?.isApproved) ||
            (statusFilter === 'Pending' && !v.profile?.isApproved);

        return matchesSearch && matchesStatus;
    });

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header Section */}
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Vendor Network</Typography>
                        <Typography variant="caption" color="text.secondary">Manage and monitor all platform partners</Typography>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Add New Vendor
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Stats Grid */}
            <Grid size={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <MainCard 
                            content={false} 
                            sx={(theme) => ({ 
                                bgcolor: statusFilter === 'All' ? 'primary.main' : 'primary.light',
                                color: statusFilter === 'All' ? 'white' : 'text.primary',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                ...theme.applyStyles('dark', {
                                    bgcolor: statusFilter === 'All' ? 'primary.main' : 'background.paper'
                                })
                            })}
                            onClick={() => handleStatFilter('All')}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: statusFilter === 'All' ? 'white' : 'primary.main', color: statusFilter === 'All' ? 'primary.main' : 'white' }}>
                                    <PersonIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" color="inherit">{stats.total}</Typography>
                                    <Typography variant="subtitle2" color="inherit">Total Vendors</Typography>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <MainCard 
                            content={false} 
                            sx={(theme) => ({ 
                                bgcolor: statusFilter === 'Approved' ? '#2e7d32' : '#e8f5e9',
                                color: statusFilter === 'Approved' ? 'white' : 'text.primary',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                ...theme.applyStyles('dark', {
                                    bgcolor: statusFilter === 'Approved' ? '#2e7d32' : 'background.paper'
                                })
                            })}
                            onClick={() => handleStatFilter('Approved')}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: statusFilter === 'Approved' ? 'white' : '#2e7d32', color: statusFilter === 'Approved' ? '#2e7d32' : 'white' }}>
                                    <VerifiedUserIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" color="inherit">{stats.active}</Typography>
                                    <Typography variant="subtitle2" color="inherit">Approved Partners</Typography>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <MainCard 
                            content={false} 
                            sx={(theme) => ({ 
                                bgcolor: statusFilter === 'Pending' ? '#ef6c00' : '#fff3e0',
                                color: statusFilter === 'Pending' ? 'white' : 'text.primary',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                ...theme.applyStyles('dark', {
                                    bgcolor: statusFilter === 'Pending' ? '#ef6c00' : 'background.paper'
                                })
                            })}
                            onClick={() => handleStatFilter('Pending')}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: statusFilter === 'Pending' ? 'white' : '#ef6c00', color: statusFilter === 'Pending' ? '#ef6c00' : 'white' }}>
                                    <ErrorOutlineIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" color="inherit">{stats.pending}</Typography>
                                    <Typography variant="subtitle2" color="inherit">Pending Review</Typography>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                </Grid>
            </Grid>

            {/* Main Content Area */}
            <Grid size={12}>
                <MainCard 
                    title={
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <TextField
                                placeholder="Search vendors..."
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
                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                startIcon={<FilterListIcon />}
                                onClick={handleFilterClick}
                                size="small"
                            >
                                Filter: {statusFilter}
                            </Button>
                            <Menu
                                anchorEl={filterAnchorEl}
                                open={Boolean(filterAnchorEl)}
                                onClose={() => handleFilterClose()}
                            >
                                <MenuItem onClick={() => handleFilterClose('All')}>All Vendors</MenuItem>
                                <MenuItem onClick={() => handleFilterClose('Approved')}>Approved Only</MenuItem>
                                <MenuItem onClick={() => handleFilterClose('Pending')}>Pending Only</MenuItem>
                            </Menu>
                        </Stack>
                    }
                >
                    {loading && <LinearProgress sx={{ mb: 2 }} />}
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Vendor Info</TableCell>
                                    <TableCell>Business Details</TableCell>
                                    <TableCell>Services</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1">No vendors found matching your criteria</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVendors.map((vendor) => (
                                        <TableRow key={vendor._id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar 
                                                        src={vendor.avatar ? `${import.meta.env.VITE_APP_API_URL}/${vendor.avatar}` : ''}
                                                        sx={{ width: 40, height: 40 }}
                                                    >
                                                        {vendor.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1">{vendor.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{vendor.email}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <BusinessIcon sx={{ fontSize: 16 }} color="action" />
                                                        {vendor.profile?.companyName || 'Not Set'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Lic: {vendor.profile?.businessLicense || 'N/A'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                    {vendor.profile?.selectedServices?.slice(0, 2).map((s, i) => (
                                                        <Chip key={i} label={s.title} size="small" variant="outlined" />
                                                    ))}
                                                    {(vendor.profile?.selectedServices?.length > 2) && (
                                                        <Typography variant="caption">+{vendor.profile.selectedServices.length - 2} more</Typography>
                                                    )}
                                                    {(!vendor.profile?.selectedServices || vendor.profile.selectedServices.length === 0) && (
                                                        <Typography variant="caption" color="text.secondary">None</Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={vendor.profile?.isApproved ? 'Approved' : 'Pending'} 
                                                    size="small" 
                                                    color={vendor.profile?.isApproved ? 'success' : 'warning'} 
                                                    icon={vendor.profile?.isApproved ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                                                    sx={{ borderRadius: '6px' }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    {!vendor.profile?.isApproved && (
                                                        <Tooltip title="Approve Vendor">
                                                            <IconButton 
                                                                size="small" 
                                                                color="success" 
                                                                onClick={() => handleApprove(vendor._id)}
                                                            >
                                                                <CheckCircleIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" color="primary">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleDelete(vendor._id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>

            {/* Vendor Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedVendor ? 'Edit Vendor Profile' : 'Register New Vendor Partner'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField fullWidth label="Full Name" placeholder="e.g. John Doe" />
                        <TextField fullWidth label="Email Address" type="email" />
                        {!selectedVendor && <TextField fullWidth label="Initial Password" type="password" />}
                        <TextField fullWidth label="Company Name" />
                        <TextField fullWidth label="Phone Number" />
                        <TextField 
                            fullWidth 
                            label="Business License / GST" 
                            placeholder="Registration number"
                        />
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Business Logo</Typography>
                            <FileUpload 
                                onFileSelect={(file) => console.log('Logo selected:', file)}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                                title="Drag and drop brand logo"
                                caption="Square logo (512x512) recommended."
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => {
                            // Implement save logic here if needed
                            setOpenDialog(false);
                            fetchVendors();
                        }}
                    >
                        {selectedVendor ? 'Update Profile' : 'Create Vendor'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default VendorsManagement;
