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
    Rating,
    TextField,
    InputAdornment,
    Tooltip,
    LinearProgress,
    Drawer,
    MenuItem,
    Avatar,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    CardActions
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const TestimonialManagement = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Approved' | 'Pending'
    const [ratingFilter, setRatingFilter] = useState('All'); // 'All' | '5' | '4' | '3'
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        rating: 5,
        comment: '',
        role: 'Verified Traveler',
        approved: true
    });

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/testimonials');
            if (response.success) {
                setTestimonials(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/testimonials/${itemToDelete}`);
            fetchTestimonials();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete review');
        }
    };

    const handleOpenDrawer = (item = null) => {
        if (item) {
            setSelectedTestimonial(item);
            setFormData({
                name: item.name || '',
                location: typeof item.location === 'object' && item.location !== null ? (item.location.city || item.location.fullAddress || '') : (item.location || ''),
                rating: item.rating || 5,
                comment: item.comment || '',
                role: item.role || 'Verified Traveler',
                approved: item.approved !== undefined ? item.approved : true
            });
        } else {
            setSelectedTestimonial(null);
            setFormData({
                name: '',
                location: '',
                rating: 5,
                comment: '',
                role: 'Verified Traveler',
                approved: true
            });
        }
        setOpenDrawer(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.comment) {
            alert('Customer name and feedback comment are required');
            return;
        }

        setSubmitting(true);
        try {
            let response;
            if (selectedTestimonial) {
                response = await api.put(`/testimonials/${selectedTestimonial._id}`, formData);
            } else {
                response = await api.post('/testimonials', formData);
            }

            if (response.success) {
                setOpenDrawer(false);
                fetchTestimonials();
            }
        } catch (error) {
            alert(error.message || 'Failed to save review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleApprove = async (testimonial) => {
        try {
            await api.put(`/testimonials/${testimonial._id}`, {
                ...testimonial,
                approved: !testimonial.approved
            });
            fetchTestimonials();
        } catch (error) {
            alert(error.message || 'Failed to update approval status');
        }
    };

    // Filters
    const filteredTestimonials = testimonials.filter(t => {
        const matchesSearch = 
            t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof t.location === 'string' && t.location.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = 
            statusFilter === 'All' ? true :
            statusFilter === 'Approved' ? t.approved : !t.approved;
        
        const matchesRating = 
            ratingFilter === 'All' ? true : Math.floor(t.rating) === parseInt(ratingFilter, 10);

        return matchesSearch && matchesStatus && matchesRating;
    });

    const approvedCount = testimonials.filter(t => t.approved).length;
    const pendingCount = testimonials.length - approvedCount;
    const avgRating = testimonials.length > 0 
        ? (testimonials.reduce((acc, curr) => acc + (curr.rating || 0), 0) / testimonials.length).toFixed(1)
        : '5.0';

    const paginatedTestimonials = filteredTestimonials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Customer Testimonials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Review and manage verified traveler reviews displayed on your vendor showcase
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDrawer()}
                        sx={{
                            borderRadius: '10px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Add New Review
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Stats Summary */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={testimonials.length} 
                            label="Total Reviews" 
                            icon={<RateReviewIcon />} 
                            variant="dark" 
                            colorScheme="primary" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={approvedCount} 
                            label="Approved Reviews" 
                            icon={<CheckCircleIcon />} 
                            variant="light" 
                            colorScheme="success" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={`${avgRating} / 5.0`} 
                            label="Average Rating" 
                            icon={<StarIcon />} 
                            variant="light" 
                            colorScheme="warning" 
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Filter and Search Header */}
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
                        justify: 'space-between',
                        gap: 2
                    }}
                >
                    <TextField
                        placeholder="Search feedback by reviewer name or comment..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        sx={{ width: { xs: '100%', md: 360 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }}
                    />

                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                        {['All', 'Approved', 'Pending'].map((status) => (
                            <Chip
                                key={status}
                                label={status === 'All' ? `All (${testimonials.length})` : status === 'Approved' ? `Approved (${approvedCount})` : `Pending (${pendingCount})`}
                                onClick={() => { setStatusFilter(status); setPage(0); }}
                                color={statusFilter === status ? 'secondary' : 'default'}
                                variant={statusFilter === status ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Grid>

            {loading && (
                <Grid size={12}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Grid>
            )}

            {/* List Table */}
            {!loading && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Customer</TableCell>
                                        <TableCell>Rating</TableCell>
                                        <TableCell>Comment / Feedback</TableCell>
                                        <TableCell>Role Tag</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedTestimonials.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 38, height: 38, fontWeight: 'bold' }}>
                                                        {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">{row.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                            <LocationOnIcon sx={{ fontSize: 12 }} />
                                                            {typeof row.location === 'object' && row.location !== null ? (row.location.city || row.location.fullAddress || 'Location N/A') : (row.location || 'Location N/A')}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Rating value={row.rating || 5} precision={0.5} size="small" readOnly />
                                                    <Typography variant="caption" fontWeight="bold">({row.rating || 5})</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 300 }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.primary' }} noWrap title={row.comment}>
                                                    "{row.comment}"
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.role || 'Verified Traveler'}
                                                    size="small"
                                                    variant="outlined"
                                                    color="secondary"
                                                    sx={{ borderRadius: '6px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={row.approved ? <CheckCircleIcon fontSize="small" /> : <PendingActionsIcon fontSize="small" />}
                                                    label={row.approved ? 'Approved' : 'Pending'}
                                                    size="small"
                                                    color={row.approved ? 'success' : 'warning'}
                                                    onClick={() => handleToggleApprove(row)}
                                                    clickable
                                                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="Edit Review">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDrawer(row)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Review">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(row._id)}>
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

            {/* Pagination Controls */}
            {!loading && filteredTestimonials.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={filteredTestimonials.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </Paper>
                </Grid>
            )}

            {/* Empty State */}
            {!loading && filteredTestimonials.length === 0 && (
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
                        <RateReviewIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" gutterBottom>No Testimonials Found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
                            {searchTerm ? `No customer review matches "${searchTerm}". Try adjusting your search query.` : 'No reviews have been recorded yet. Add customer testimonials to build trust with travelers!'}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDrawer()}
                            sx={{ borderRadius: '8px', px: 3 }}
                        >
                            Add Review Now
                        </Button>
                    </Paper>
                </Grid>
            )}

            {/* Right-Side Drawer Form */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => !submitting && setOpenDrawer(false)}
                sx={{ zIndex: 1400 }}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 540, md: 620 }, p: 0, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 36px rgba(0,0,0,0.25)' }
                }}
            >
                <Box sx={{ p: 2.5, bgcolor: 'secondary.main', color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4" color="inherit" fontWeight="bold">
                            {selectedTestimonial ? 'Edit Customer Review' : 'Add Customer Review'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                            {selectedTestimonial ? 'Update traveler rating and feedback notes' : 'Record a verified customer review to highlight on your website'}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenDrawer(false)} sx={{ color: 'common.white' }}>
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
                            label="Customer Full Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Location / City"
                            placeholder="e.g. Kochi, Kerala"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Customer Role / Title"
                            placeholder="e.g. Verified Traveler, Family Vacationer"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Star Rating *</Typography>
                            <Rating
                                value={Number(formData.rating)}
                                onChange={(e, newValue) => setFormData({ ...formData, rating: newValue || 5 })}
                                size="large"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Feedback / Review Comment *"
                            multiline
                            rows={5}
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        />
                    </Stack>
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button onClick={() => setOpenDrawer(false)} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting} sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}>
                        {submitting ? 'Saving...' : (selectedTestimonial ? 'Update Review' : 'Add Review')}
                    </Button>
                </Box>
            </Drawer>

            {/* Confirm Delete Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Review</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this customer review? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Review
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default TestimonialManagement;
