import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import {
    Grid,
    Typography,
    Button,
    Stack,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Switch,
    FormControlLabel,
    FormHelperText,
    Snackbar,
    Alert
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';

// project imports
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
import FileUpload from 'ui-component/extended/FileUpload';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import useThemeMode from 'hooks/useThemeMode';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// helper for full image url
const getFullImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const baseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:9000';
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
};

// Yup validation schema
const testimonialValidationSchema = Yup.object().shape({
    customerName: Yup.string()
        .trim()
        .required('Customer Name is required')
        .min(2, 'Customer Name must be at least 2 characters'),
    customerDesignation: Yup.string()
        .required('Traveler Role / Designation is required'),
    location: Yup.string().nullable(),
    rating: Yup.number()
        .required('Rating is required')
        .min(1, 'Rating must be at least 1 star')
        .max(5, 'Rating cannot exceed 5 stars'),
    content: Yup.string()
        .trim()
        .required('Review Comment is required')
        .min(5, 'Review Comment must be at least 5 characters'),
    image: Yup.mixed().nullable(),
    video: Yup.string()
        .nullable()
        .test('is-url-or-empty', 'Must be a valid video URL (e.g. https://youtube.com/...)', (value) => {
            if (!value || !value.trim()) return true;
            return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
        }),
    status: Yup.string()
        .oneOf(['Approved', 'Pending', 'Rejected'], 'Invalid status')
        .required('Publication Status is required'),
    isTopPick: Yup.boolean()
});

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const TestimonialManagement = () => {
    const { isDark: isDarkMode, theme } = useThemeMode();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [testimonials, setTestimonials] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Toast Alert State
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    // Subscription Plan Modal State
    const [subPlanModalOpen, setSubPlanModalOpen] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ testimonialEnabled: false, testimonialLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

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

    const testimonialLimit = subscription?.testimonialLimit !== undefined ? subscription.testimonialLimit : -1;
    const isTestimonialAllowed = subscription ? (subscription?.testimonialEnabled !== false && testimonialLimit !== 0) : true;

    const handleErrorMessage = (errorMsg) => {
        const message = typeof errorMsg === 'string' ? errorMsg : errorMsg?.message || 'Something went wrong';
        if (
            message.toLowerCase().includes('subcription plan') ||
            message.toLowerCase().includes('subscription plan') ||
            message.toLowerCase().includes('does not support testimonials')
        ) {
            setSubPlanModalOpen(true);
        } else {
            setToast({
                open: true,
                message: message,
                severity: 'error'
            });
        }
    };

    // Formik setup
    const formik = useFormik({
        initialValues: {
            customerName: '',
            customerDesignation: 'Verified Traveler',
            location: '',
            rating: 5,
            content: '',
            image: '',
            video: '',
            status: 'Approved',
            isTopPick: false
        },
        validationSchema: testimonialValidationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                let response;
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('customerName', values.customerName.trim());
                    formData.append('name', values.customerName.trim());
                    formData.append('customerDesignation', values.customerDesignation ? values.customerDesignation.trim() : 'Verified Traveler');
                    formData.append('role', values.customerDesignation ? values.customerDesignation.trim() : 'Verified Traveler');
                    formData.append('location', values.location ? values.location.trim() : '');
                    formData.append('rating', Number(values.rating || 5));
                    formData.append('content', values.content.trim());
                    formData.append('comment', values.content.trim());
                    formData.append('status', values.status || 'Approved');
                    formData.append('isTopPick', Boolean(values.isTopPick));
                    if (values.video) formData.append('video', values.video);
                    formData.append('image', imageFile);

                    if (selectedTestimonial) {
                        response = await api.put(`/testimonials/${selectedTestimonial._id}`, formData, true);
                    } else {
                        response = await api.post('/testimonials', formData, true);
                    }
                } else {
                    const payload = {
                        customerName: values.customerName.trim(),
                        name: values.customerName.trim(),
                        customerDesignation: values.customerDesignation ? values.customerDesignation.trim() : 'Verified Traveler',
                        role: values.customerDesignation ? values.customerDesignation.trim() : 'Verified Traveler',
                        location: values.location ? values.location.trim() : '',
                        rating: Number(values.rating || 5),
                        content: values.content.trim(),
                        comment: values.content.trim(),
                        image: values.image || '',
                        video: values.video || '',
                        status: values.status || 'Approved',
                        isTopPick: Boolean(values.isTopPick)
                    };

                    if (selectedTestimonial) {
                        response = await api.put(`/testimonials/${selectedTestimonial._id}`, payload);
                    } else {
                        response = await api.post('/testimonials', payload);
                    }
                }

                if (response.success) {
                    setOpenDrawer(false);
                    setImageFile(null);
                    resetForm();
                    setToast({
                        open: true,
                        message: selectedTestimonial ? 'Testimonial updated successfully!' : 'New testimonial created successfully!',
                        severity: 'success'
                    });
                    fetchTestimonials();
                }
            } catch (error) {
                handleErrorMessage(error.message || 'Failed to save testimonial');
            } finally {
                setSubmitting(false);
            }
        }
    });



    const handleOpenDrawer = (item = null) => {
        setImageFile(null);
        if (item) {
            setSelectedTestimonial(item);
            formik.setValues({
                customerName: item.customerName || item.name || '',
                customerDesignation: item.customerDesignation || item.role || 'Verified Traveler',
                location: item.location || '',
                rating: item.rating || 5,
                content: item.content || item.comment || '',
                image: item.image || item.avatar || '',
                video: item.video || '',
                status: item.status || 'Approved',
                isTopPick: Boolean(item.isTopPick)
            });
        } else {
            setSelectedTestimonial(null);
            formik.resetForm();
        }
        setOpenDrawer(true);
    };

    const handleToggleTopPick = async (item) => {
        try {
            const response = await api.put(`/testimonials/${item._id}`, { isTopPick: !item.isTopPick });
            if (response.success) {
                setToast({
                    open: true,
                    message: item.isTopPick ? 'Unmarked from Top Pick' : 'Marked as Top Pick',
                    severity: 'info'
                });
                fetchTestimonials();
            }
        } catch (error) {
            handleErrorMessage(error.message || 'Failed to toggle top pick');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/testimonials/${itemToDelete._id}`);
            setToast({
                open: true,
                message: 'Testimonial deleted successfully',
                severity: 'info'
            });
            fetchTestimonials();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            setDeleteModalOpen(false);
            handleErrorMessage(error.message || 'Failed to delete testimonial');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setRatingFilter('All');
        setRoleFilter('All');
        setStatusFilter('All');
        setSortBy('newest');
        setPage(0);
    };

    const hasActiveFilters = searchTerm !== '' || ratingFilter !== 'All' || roleFilter !== 'All' || statusFilter !== 'All' || sortBy !== 'newest';

    const filteredTestimonials = testimonials
        .filter((t) => {
            const name = t.customerName || t.name || '';
            const content = t.content || t.comment || '';
            const location = t.location || '';
            const role = t.customerDesignation || t.role || '';
            const status = t.status || 'Approved';

            const matchesSearch =
                !searchTerm ||
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.toLowerCase().includes(searchTerm.toLowerCase());

            const ratingVal = Number(t.rating || 5);
            const matchesRating =
                ratingFilter === 'All'
                    ? true
                    : ratingFilter === '5'
                    ? ratingVal === 5
                    : ratingFilter === '4'
                    ? ratingVal === 4
                    : ratingFilter === '3'
                    ? ratingVal === 3
                    : ratingFilter === '2'
                    ? ratingVal === 2
                    : ratingFilter === '1'
                    ? ratingVal === 1
                    : ratingFilter === '3_below'
                    ? ratingVal <= 3
                    : true;

            const matchesRole =
                roleFilter === 'All'
                    ? true
                    : role.toLowerCase() === roleFilter.toLowerCase();

            const matchesStatus =
                statusFilter === 'All'
                    ? true
                    : status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesRating && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (sortBy === 'highest_rating') return (b.rating || 5) - (a.rating || 5);
            if (sortBy === 'lowest_rating') return (a.rating || 5) - (b.rating || 5);
            if (sortBy === 'name_asc') return (a.customerName || a.name || '').localeCompare(b.customerName || b.name || '');
            return 0;
        });

    const fiveStarCount = testimonials.filter((t) => t.rating === 5).length;
    const avgRating =
        testimonials.length > 0
            ? (testimonials.reduce((acc, curr) => acc + (curr.rating || 5), 0) / testimonials.length).toFixed(1)
            : '5.0';

    const textColor = isDarkMode ? '#f9fafb' : '#0f172a';
    const subTextColor = isDarkMode ? '#9ca3af' : '#64748b';
    const cardBgColor = isDarkMode ? '#16152b' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#212040' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    if (!loading && !isTestimonialAllowed) {
        return (
            <Box>
                <SaasHeader title="Customer Testimonials & Reviews" subtitle="Manage client reviews and travel testimonials." />
                <SubscriptionRestrictedCard featureName="Customer Testimonials" reason={testimonialLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            <SaasHeader
                title="Customer Testimonials & Reviews"
                subtitle="Manage client reviews, travel testimonials, and traveler feedback."
                actionLabel="Add Testimonial"
                actionIcon={<AddIcon />}
                onActionClick={() => handleOpenDrawer()}
                loading={loading}
            />
            {/* Stat Cards */}
            <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={testimonials.length}
                        label="Total Testimonials"
                        icon={<RateReviewIcon />}
                        colorScheme="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={fiveStarCount}
                        label="5-Star Rating Reviews"
                        icon={<StarIcon />}
                        colorScheme="warning"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={avgRating}
                        label="Average Customer Rating"
                        icon={<CheckCircleIcon />}
                        colorScheme="success"
                    />
                </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    backgroundColor: surfaceBgColor
                }}
            >
                {/* Search on Left Side, Filters on Right Side */}
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    {/* Search Field on the Left Side */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search testimonials by customer name, location, comment..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: cardBgColor,
                                    color: textColor,
                                    '& fieldset': { borderColor: borderLineColor }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: subTextColor }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Filters on the Right Side */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                            <TextField
                                select
                                size="small"
                                label="Rating"
                                value={ratingFilter}
                                onChange={(e) => { setRatingFilter(e.target.value); setPage(0); }}
                                SelectProps={{ MenuProps: { disablePortal: true } }}
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: cardBgColor,
                                        color: textColor,
                                        '& fieldset': { borderColor: borderLineColor }
                                    }
                                }}
                            >
                                <MenuItem value="All">All Ratings</MenuItem>
                                <MenuItem value="5">5 Stars ⭐⭐⭐⭐⭐</MenuItem>
                                <MenuItem value="4">4 Stars ⭐⭐⭐⭐</MenuItem>
                                <MenuItem value="3">3 Stars ⭐⭐⭐</MenuItem>
                                <MenuItem value="2">2 Stars ⭐⭐</MenuItem>
                                <MenuItem value="1">1 Star ⭐</MenuItem>
                                <MenuItem value="3_below">3 Stars & Below</MenuItem>
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Traveler Role"
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                                SelectProps={{ MenuProps: { disablePortal: true } }}
                                sx={{
                                    minWidth: 130,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: cardBgColor,
                                        color: textColor,
                                        '& fieldset': { borderColor: borderLineColor }
                                    }
                                }}
                            >
                                <MenuItem value="All">All Roles</MenuItem>
                                <MenuItem value="Verified Traveler">Verified Traveler</MenuItem>
                                <MenuItem value="Family Traveler">Family Traveler</MenuItem>
                                <MenuItem value="Solo Traveler">Solo Traveler</MenuItem>
                                <MenuItem value="Honeymoon Couple">Honeymoon Couple</MenuItem>
                                <MenuItem value="Corporate Client">Corporate Client</MenuItem>
                                <MenuItem value="VIP Member">VIP Member</MenuItem>
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Status"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                SelectProps={{ MenuProps: { disablePortal: true } }}
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: cardBgColor,
                                        color: textColor,
                                        '& fieldset': { borderColor: borderLineColor }
                                    }
                                }}
                            >
                                <MenuItem value="All">All Statuses</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Sort By"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                SelectProps={{ MenuProps: { disablePortal: true } }}
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        backgroundColor: cardBgColor,
                                        color: textColor,
                                        '& fieldset': { borderColor: borderLineColor }
                                    }
                                }}
                            >
                                <MenuItem value="newest">Newest</MenuItem>
                                <MenuItem value="highest_rating">Highest Rated</MenuItem>
                                <MenuItem value="lowest_rating">Lowest Rated</MenuItem>
                                <MenuItem value="name_asc">Name A-Z</MenuItem>
                                <MenuItem value="oldest">Oldest</MenuItem>
                            </TextField>

                            {hasActiveFilters && (
                                <Tooltip title="Reset All Filters">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={handleResetFilters}
                                        startIcon={<RestartAltIcon />}
                                        sx={{
                                            borderRadius: '10px',
                                            height: 40,
                                            fontWeight: 700,
                                            px: 1.5
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Tooltip>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Data Table */}
            <DataTable
                columns={[
                    {
                        headerName: 'Customer',
                        field: 'customerName',
                        render: (row) => {
                            const name = row.customerName || row.name || 'Anonymous Traveler';
                            const role = row.customerDesignation || row.role || 'Verified Traveler';
                            const imageUrl = getFullImageUrl(row.image || row.avatar);
                            const initial = name.charAt(0).toUpperCase();

                            return (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar
                                        src={imageUrl}
                                        alt={name}
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            fontWeight: 700,
                                            width: 42,
                                            height: 42,
                                            border: '2px solid',
                                            borderColor: theme.palette.primary.light
                                        }}
                                    >
                                        {initial}
                                    </Avatar>
                                    <Box>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>
                                                {name}
                                            </Typography>
                                            {row.isTopPick && (
                                                <Tooltip title="Featured Top Pick Testimonial">
                                                    <Chip
                                                        label="Featured"
                                                        size="small"
                                                        color="secondary"
                                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                        <Typography variant="caption" sx={{ color: subTextColor, fontWeight: 500 }}>
                                            {role} {row.location ? `• ${row.location}` : ''}
                                        </Typography>
                                    </Box>
                                </Stack>
                            );
                        }
                    },
                    {
                        headerName: 'Rating',
                        field: 'rating',
                        render: (row) => (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Rating value={row.rating || 5} readOnly size="small" precision={0.5} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#faaf00' }}>
                                    {(row.rating || 5).toFixed(1)}
                                </Typography>
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Review Comment',
                        field: 'content',
                        render: (row) => {
                            const text = row.content || row.comment || '';
                            return (
                                <Box sx={{ maxWidth: 340 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: textColor,
                                            fontWeight: 500,
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        "{text}"
                                    </Typography>
                                    {row.video && (
                                        <Chip
                                            icon={<PlayCircleOutlineIcon style={{ fontSize: 14 }} />}
                                            label="Video Review"
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                            component="a"
                                            href={row.video}
                                            target="_blank"
                                            clickable
                                            sx={{ mt: 0.5, height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                                        />
                                    )}
                                </Box>
                            );
                        }
                    },
                    {
                        headerName: 'Status',
                        field: 'status',
                        align: 'center',
                        render: (row) => {
                            const currentStatus = row.status || 'Approved';

                            return (
                                <Stack direction="column" spacing={0.5} alignItems="center">
                                    <StatusBadge status={currentStatus} />
                                    <Typography variant="caption" sx={{ color: subTextColor, fontSize: '0.7rem' }}>
                                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                    </Typography>
                                </Stack>
                            );
                        }
                    },
                    {
                        headerName: 'Actions',
                        align: 'center',
                        render: (row) => (
                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <Tooltip title={row.isTopPick ? 'Unmark Top Pick' : 'Mark as Top Pick'}>
                                    <IconButton
                                        size="small"
                                        color={row.isTopPick ? 'warning' : 'default'}
                                        onClick={() => handleToggleTopPick(row)}
                                    >
                                        <StarIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Testimonial">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenDrawer(row)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Testimonial">
                                    <IconButton size="small" color="error" onClick={() => { setItemToDelete(row); setDeleteModalOpen(true); }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )
                    }
                ]}
                rows={filteredTestimonials}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredTestimonials.length}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                emptyTitle="No Testimonials Found"
                emptySubtitle="No customer review matches your search criteria."
            />

            {/* Create/Edit Drawer with Formik & Yup */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480 },
                        p: 3,
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h3" sx={{ color: textColor, fontWeight: 800 }}>
                        {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                    </Typography>
                    <IconButton onClick={() => setOpenDrawer(false)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            id="customerName"
                            name="customerName"
                            label="Customer Name"
                            placeholder="e.g. Rahul Sharma"
                            value={formik.values.customerName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                            helperText={formik.touched.customerName && formik.errors.customerName}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <TextField
                            fullWidth
                            id="customerDesignation"
                            name="customerDesignation"
                            label="Traveler Role / Designation"
                            placeholder="e.g. Verified Traveler, Software Engineer, Solo Traveler"
                            value={formik.values.customerDesignation}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.customerDesignation && Boolean(formik.errors.customerDesignation)}
                            helperText={formik.touched.customerDesignation && formik.errors.customerDesignation}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <TextField
                            fullWidth
                            id="location"
                            name="location"
                            label="Location (City, Country)"
                            placeholder="e.g. Mumbai, India or Kerala"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && Boolean(formik.errors.location)}
                            helperText={formik.touched.location && formik.errors.location}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOnIcon fontSize="small" sx={{ color: subTextColor }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
                                Rating Score ({formik.values.rating} Stars)
                            </Typography>
                            <Rating
                                name="rating"
                                value={formik.values.rating}
                                onChange={(e, newValue) => formik.setFieldValue('rating', newValue || 5)}
                                size="large"
                            />
                            {formik.touched.rating && formik.errors.rating && (
                                <FormHelperText error>{formik.errors.rating}</FormHelperText>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            id="content"
                            name="content"
                            label="Testimonial / Review Comment"
                            placeholder="Write traveler experience feedback..."
                            value={formik.values.content}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.content && Boolean(formik.errors.content)}
                            helperText={formik.touched.content && formik.errors.content}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
                                Customer Photo (Drag & Drop)
                            </Typography>
                            <FileUpload
                                onFileSelect={(selectedFile) => {
                                    if (selectedFile instanceof File) {
                                        setImageFile(selectedFile);
                                        formik.setFieldValue('image', selectedFile.name);
                                    } else if (selectedFile && typeof selectedFile === 'object' && selectedFile.preview) {
                                        setImageFile(selectedFile);
                                        formik.setFieldValue('image', selectedFile.name || 'uploaded_image');
                                    } else if (typeof selectedFile === 'string') {
                                        setImageFile(null);
                                        formik.setFieldValue('image', selectedFile);
                                    } else {
                                        setImageFile(null);
                                        formik.setFieldValue('image', '');
                                    }
                                }}
                                previewUrl={
                                    imageFile
                                        ? (imageFile.preview || (imageFile instanceof File ? URL.createObjectURL(imageFile) : null))
                                        : formik.values.image
                                        ? getFullImageUrl(formik.values.image)
                                        : null
                                }
                                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                title="Drag & drop customer photo here or click to browse"
                                caption="Supports PNG, JPG, WEBP formats up to 10MB"
                            />
                            {formik.touched.image && formik.errors.image && (
                                <FormHelperText error>{formik.errors.image}</FormHelperText>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            id="video"
                            name="video"
                            label="Video Review Link (Optional)"
                            placeholder="https://youtube.com/watch?v=..."
                            value={formik.values.video}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.video && Boolean(formik.errors.video)}
                            helperText={formik.touched.video && formik.errors.video}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <TextField
                            select
                            fullWidth
                            id="status"
                            name="status"
                            label="Publication Status"
                            value={formik.values.status || 'Approved'}
                            onChange={(e) => formik.setFieldValue('status', e.target.value)}
                            onBlur={formik.handleBlur}
                            error={formik.touched.status && Boolean(formik.errors.status)}
                            helperText={formik.touched.status && formik.errors.status}
                            SelectProps={{
                                MenuProps: {
                                    disablePortal: true,
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 260,
                                            borderRadius: '10px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
                                        }
                                    }
                                }
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        >
                            <MenuItem value="Approved">Approved (Published)</MenuItem>
                            <MenuItem value="Pending">Pending Review</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </TextField>

                        <FormControlLabel
                            control={
                                <Switch
                                    id="isTopPick"
                                    name="isTopPick"
                                    checked={formik.values.isTopPick}
                                    onChange={(e) => formik.setFieldValue('isTopPick', e.target.checked)}
                                    color="secondary"
                                />
                            }
                            label={
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textColor }}>
                                    Mark as Top Pick / Featured Review
                                </Typography>
                            }
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={formik.isSubmitting}
                            sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                        >
                            {formik.isSubmitting ? 'Saving...' : selectedTestimonial ? 'Update Testimonial' : 'Save Testimonial'}
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>Remove Testimonial?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to delete testimonial by <strong>{itemToDelete?.customerName || itemToDelete?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: '8px', fontWeight: 700 }}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Subscription Plan Required Modal */}
            <Dialog
                open={subPlanModalOpen}
                onClose={() => setSubPlanModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 1.5,
                        maxWidth: 480,
                        backgroundColor: cardBgColor,
                        color: textColor,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: textColor, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <WorkspacePremiumIcon sx={{ color: '#ffb74d', fontSize: 32 }} />
                    Subscription Upgrade Required
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Alert severity="warning" variant="filled" sx={{ borderRadius: '12px', mb: 2, fontWeight: 700 }}>
                        This vendor subscription plan does not support Testimonials.
                    </Alert>
                    <Typography variant="body2" sx={{ color: subTextColor, lineHeight: 1.6, fontWeight: 500 }}>
                        Your current subscription plan limits access to Customer Testimonials & Reviews management. Upgrade your vendor plan to enable client review showcases, top pick features, and web testimonials.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setSubPlanModalOpen(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '8px' }}>
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
                            borderRadius: '10px',
                            fontWeight: 800,
                            px: 2.5,
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

export default TestimonialManagement;
