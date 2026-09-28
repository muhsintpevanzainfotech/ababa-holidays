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
    LinearProgress,
    Divider,
    TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ShareIcon from '@mui/icons-material/Share';
import ClearIcon from '@mui/icons-material/Clear';

const initialFormState = {
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
    businessLicense: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    youtubeUrl: ''
};

const VendorsManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [formState, setFormState] = useState(initialFormState);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);

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
                setVendors(response.data || []);
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
        setPage(0);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = (status) => {
        if (status) {
            setStatusFilter(status);
            setPage(0);
        }
        setFilterAnchorEl(null);
    };

    const handleStatFilter = (status) => {
        setStatusFilter(status);
        setPage(0);
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/vendors/${id}/approve`);
            fetchVendors();
        } catch (error) {
            alert(error.message || 'Failed to approve vendor');
        }
    };

    const handleDeleteClick = (id) => {
        setVendorToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!vendorToDelete) return;
        try {
            await api.delete(`/vendors/${vendorToDelete}`);
            fetchVendors();
            setDeleteModalOpen(false);
            setVendorToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete vendor');
        }
    };

    const handleOpenDialog = (vendor = null) => {
        setSelectedVendor(vendor);
        if (vendor) {
            const p = vendor.profile || {};
            const sl = p.socialLinks || {};
            setFormState({
                name: vendor.name || '',
                email: vendor.email || '',
                password: '',
                companyName: p.companyName || '',
                phone: vendor.phone || p.phone || '',
                businessLicense: p.businessLicense || p.registrationNumber || '',
                websiteUrl: p.websiteUrl || sl.website || '',
                instagramUrl: sl.instagram || '',
                facebookUrl: sl.facebook || '',
                linkedinUrl: sl.linkedin || '',
                twitterUrl: sl.twitter || '',
                youtubeUrl: sl.youtube || ''
            });
        } else {
            setFormState(initialFormState);
        }
        setOpenDialog(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveVendor = async () => {
        try {
            setSaving(true);
            const payload = {
                name: formState.name,
                email: formState.email,
                phone: formState.phone,
                companyName: formState.companyName,
                businessLicense: formState.businessLicense,
                websiteUrl: formState.websiteUrl,
                socialLinks: {
                    website: formState.websiteUrl,
                    instagram: formState.instagramUrl,
                    facebook: formState.facebookUrl,
                    linkedin: formState.linkedinUrl,
                    twitter: formState.twitterUrl,
                    youtube: formState.youtubeUrl
                }
            };

            if (selectedVendor) {
                if (formState.password) payload.password = formState.password;
                await api.put(`/vendors/${selectedVendor._id}`, payload);
            } else {
                payload.password = formState.password || 'Vendor@123456';
                await api.post('/vendors', payload);
            }

            setOpenDialog(false);
            fetchVendors();
        } catch (error) {
            alert(error.message || 'Failed to save vendor details');
        } finally {
            setSaving(false);
        }
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

    const paginatedVendors = filteredVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header Section */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Vendor Network</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage and monitor agency partners, verification status, and social profiles
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
                            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Add New Vendor
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Stats Grid */}
            <Grid size={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            count={stats.total} 
                            label="Total Vendors" 
                            icon={<PersonIcon />} 
                            variant="dark" 
                            colorScheme="primary"
                            onClick={() => handleStatFilter('All')}
                            active={statusFilter === 'All'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            count={stats.active} 
                            label="Approved Partners" 
                            icon={<VerifiedUserIcon />} 
                            variant="light" 
                            colorScheme="success"
                            onClick={() => handleStatFilter('Approved')}
                            active={statusFilter === 'Approved'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            count={stats.pending} 
                            label="Pending Review" 
                            icon={<ErrorOutlineIcon />} 
                            variant="light" 
                            colorScheme="warning"
                            onClick={() => handleStatFilter('Pending')}
                            active={statusFilter === 'Pending'}
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Main Search & Filter Toolbar */}
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
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <TextField
                        placeholder="Search vendors by name, email, or company..."
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
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            startIcon={<FilterListIcon />}
                            onClick={handleFilterClick}
                            size="small"
                            sx={{ borderRadius: '8px', px: 2, py: 0.8 }}
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
                            <MenuItem onClick={() => handleFilterClose('Pending')}>Pending Review Only</MenuItem>
                        </Menu>
                    </Stack>
                </Paper>
            </Grid>

            {loading && (
                <Grid size={12}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Grid>
            )}

            {/* Vendors Table */}
            {!loading && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 750 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Vendor Info</TableCell>
                                        <TableCell>Business Details</TableCell>
                                        <TableCell>Social Profiles</TableCell>
                                        <TableCell>Services</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedVendors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                                <PersonIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="h4" fontWeight="bold">No Vendors Found</Typography>
                                                <Typography variant="body2" color="text.secondary">No partner accounts match your current filter or search criteria.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedVendors.map((vendor) => {
                                            const p = vendor.profile || {};
                                            const sl = p.socialLinks || {};
                                            const web = p.websiteUrl || sl.website;

                                            return (
                                                <TableRow key={vendor._id} hover>
                                                    <TableCell sx={{ pl: 3 }}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar 
                                                                src={vendor.avatar ? `${import.meta.env.VITE_APP_API_URL}/${vendor.avatar}` : ''}
                                                                sx={{ width: 42, height: 42, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}
                                                            >
                                                                {vendor.name ? vendor.name.charAt(0).toUpperCase() : 'V'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold">{vendor.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{vendor.email}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                                                <BusinessIcon sx={{ fontSize: 16 }} color="action" />
                                                                {p.companyName || 'Not Set'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Lic: {p.businessLicense || p.registrationNumber || 'N/A'}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            {web && (
                                                                <Tooltip title="Website">
                                                                    <IconButton size="small" component="a" href={web} target="_blank" color="primary">
                                                                        <LanguageIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {sl.instagram && (
                                                                <Tooltip title="Instagram">
                                                                    <IconButton size="small" component="a" href={sl.instagram} target="_blank" color="secondary">
                                                                        <InstagramIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {sl.facebook && (
                                                                <Tooltip title="Facebook">
                                                                    <IconButton size="small" component="a" href={sl.facebook} target="_blank" color="primary">
                                                                        <FacebookIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {sl.linkedin && (
                                                                <Tooltip title="LinkedIn">
                                                                    <IconButton size="small" component="a" href={sl.linkedin} target="_blank" color="primary">
                                                                        <LinkedInIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {sl.twitter && (
                                                                <Tooltip title="Twitter / X">
                                                                    <IconButton size="small" component="a" href={sl.twitter} target="_blank" color="info">
                                                                        <TwitterIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {sl.youtube && (
                                                                <Tooltip title="YouTube">
                                                                    <IconButton size="small" component="a" href={sl.youtube} target="_blank" color="error">
                                                                        <YouTubeIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {!web && !sl.instagram && !sl.facebook && !sl.linkedin && !sl.twitter && !sl.youtube && (
                                                                <Typography variant="caption" color="text.secondary">None</Typography>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                            {p.selectedServices?.slice(0, 2).map((s, i) => (
                                                                <Chip key={i} label={s.title} size="small" variant="outlined" />
                                                            ))}
                                                            {(p.selectedServices?.length > 2) && (
                                                                <Typography variant="caption">+{p.selectedServices.length - 2} more</Typography>
                                                            )}
                                                            {(!p.selectedServices || p.selectedServices.length === 0) && (
                                                                <Typography variant="caption" color="text.secondary">None</Typography>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={p.isApproved ? 'Approved' : 'Pending'} 
                                                            size="small" 
                                                            color={p.isApproved ? 'success' : 'warning'} 
                                                            icon={p.isApproved ? <CheckCircleIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
                                                            sx={{ borderRadius: '6px', fontWeight: 600 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ pr: 3 }}>
                                                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                            {!p.isApproved && (
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
                                                            <Tooltip title="Edit Profile & Socials">
                                                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(vendor)}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Account">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error" 
                                                                    onClick={() => handleDeleteClick(vendor._id)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </MainCard>
                </Grid>
            )}

            {/* Pagination */}
            {!loading && filteredVendors.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={filteredVendors.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </Paper>
                </Grid>
            )}

            {/* Vendor Form Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {selectedVendor ? `Edit Vendor Profile: ${selectedVendor.name}` : 'Register New Vendor Partner'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          1. Basic Account & Company Info
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label="Full Name *" 
                                name="name" 
                                value={formState.name} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label="Email Address *" 
                                type="email" 
                                name="email" 
                                value={formState.email} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label={selectedVendor ? 'New Password (Leave blank to keep unchanged)' : 'Initial Password *'} 
                                type="password" 
                                name="password" 
                                value={formState.password} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label="Company / Agency Display Name" 
                                name="companyName" 
                                value={formState.companyName} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label="Phone Number" 
                                name="phone" 
                                value={formState.phone} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                              <TextField 
                                fullWidth 
                                label="Business License / GST Number" 
                                name="businessLicense" 
                                value={formState.businessLicense} 
                                onChange={handleInputChange} 
                              />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShareIcon fontSize="small" /> 2. Social Media Profiles & Web Links
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="Official Website URL" 
                              name="websiteUrl"
                              value={formState.websiteUrl}
                              onChange={handleInputChange}
                              placeholder="https://www.ababatravels.com"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" color="primary" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="Instagram Profile URL" 
                              name="instagramUrl"
                              value={formState.instagramUrl}
                              onChange={handleInputChange}
                              placeholder="https://instagram.com/vendor"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><InstagramIcon fontSize="small" color="secondary" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="Facebook Page URL" 
                              name="facebookUrl"
                              value={formState.facebookUrl}
                              onChange={handleInputChange}
                              placeholder="https://facebook.com/vendor"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><FacebookIcon fontSize="small" color="primary" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="LinkedIn Company Page" 
                              name="linkedinUrl"
                              value={formState.linkedinUrl}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/company/vendor"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><LinkedInIcon fontSize="small" color="primary" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="Twitter / X Profile URL" 
                              name="twitterUrl"
                              value={formState.twitterUrl}
                              onChange={handleInputChange}
                              placeholder="https://x.com/vendor"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><TwitterIcon fontSize="small" color="primary" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                          <Grid size={{ md: 6, xs: 12 }}>
                            <TextField 
                              fullWidth 
                              label="YouTube Channel URL" 
                              name="youtubeUrl"
                              value={formState.youtubeUrl}
                              onChange={handleInputChange}
                              placeholder="https://youtube.com/@vendor"
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start"><YouTubeIcon fontSize="small" color="error" /></InputAdornment>
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={handleSaveVendor}
                        disabled={saving}
                        sx={{ fontWeight: 700, px: 3 }}
                    >
                        {saving ? 'Saving Profile...' : (selectedVendor ? 'Update Vendor Profile' : 'Create Vendor Partner')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Vendor Partner</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this vendor account? This action will disable their access and services.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Account
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default VendorsManagement;
