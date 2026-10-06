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
    TextField,
    InputAdornment,
    Tooltip,
    LinearProgress,
    Drawer,
    MenuItem,
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
    Alert,
    FormHelperText
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

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const resolveImageUrl = (imgSrc) => {
    if (!imgSrc) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
    if (typeof imgSrc !== 'string') return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) {
        return imgSrc;
    }
    const envApi = import.meta.env.VITE_APP_API_URL || '';
    const baseUrl = envApi ? envApi.replace(/\/api\/?$/, '') : 'http://localhost:9000';
    const path = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`;
    return `${baseUrl}${path}`;
};

// Yup Validation Schema
const blogValidationSchema = Yup.object().shape({
    title: Yup.string()
        .trim()
        .required('Article title is required')
        .min(3, 'Title must be at least 3 characters'),
    category: Yup.string()
        .required('Category is required'),
    status: Yup.string()
        .oneOf(['Published', 'Draft'], 'Invalid status')
        .required('Publish status is required'),
    content: Yup.string()
        .trim()
        .required('Article content is required')
        .min(10, 'Content must be at least 10 characters')
});

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const BlogManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [file, setFile] = useState(null);

    // Toast Alert State
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    // Subscription Plan Modal State
    const [subPlanModalOpen, setSubPlanModalOpen] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    // Modals
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [blogToPreview, setBlogToPreview] = useState(null);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ blogsNewsEnabled: false, blogLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

            let response;
            try {
                response = await api.get('/blogs/my-blogs');
            } catch (err) {
                response = await api.get('/blogs');
            }

            if (response && response.success) {
                setBlogs(response.data || response.blogs || []);
            } else if (Array.isArray(response)) {
                setBlogs(response);
            } else if (response && Array.isArray(response.data)) {
                setBlogs(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const blogLimit = subscription?.blogLimit !== undefined ? subscription.blogLimit : -1;
    const isBlogAllowed = subscription ? (subscription?.blogsNewsEnabled !== false && blogLimit !== 0) : true;
    const isBlogLimitReached = blogLimit !== -1 && blogs.length >= blogLimit;

    const handleErrorMessage = (errorMsg) => {
        const message = typeof errorMsg === 'string' ? errorMsg : errorMsg?.message || 'Something went wrong';
        if (
            message.toLowerCase().includes('subcription plan') ||
            message.toLowerCase().includes('subscription plan') ||
            message.toLowerCase().includes('does not support blogs') ||
            message.toLowerCase().includes('limit reached')
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

    // Formik Form Management
    const formik = useFormik({
        initialValues: {
            title: '',
            content: '',
            category: 'Travel Guide',
            status: 'Published'
        },
        validationSchema: blogValidationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const data = new FormData();
                data.append('title', values.title.trim());
                data.append('content', values.content.trim());
                data.append('category', values.category);
                data.append('status', values.status);
                if (file) {
                    data.append('image', file);
                }

                let response;
                if (selectedBlog) {
                    response = await api.put(`/blogs/${selectedBlog._id}`, data, true);
                } else {
                    response = await api.post('/blogs', data, true);
                }

                if (response && (response.success || response._id || response.data)) {
                    setOpenDialog(false);
                    setFile(null);
                    resetForm();
                    setToast({
                        open: true,
                        message: selectedBlog ? 'Article updated successfully!' : 'Article published successfully!',
                        severity: 'success'
                    });
                    fetchBlogs();
                }
            } catch (error) {
                handleErrorMessage(error.message || 'Failed to save article');
            } finally {
                setSubmitting(false);
            }
        }
    });



    const handleOpenDialog = (blog = null) => {
        setFile(null);
        if (blog) {
            setSelectedBlog(blog);
            formik.setValues({
                title: blog.title || '',
                content: blog.content || '',
                category: blog.category || 'Travel Guide',
                status: blog.status || 'Published'
            });
        } else {
            setSelectedBlog(null);
            formik.resetForm();
        }
        setOpenDialog(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        try {
            await api.delete(`/blogs/${blogToDelete._id}`);
            setToast({
                open: true,
                message: 'Article deleted successfully',
                severity: 'info'
            });
            fetchBlogs();
            setDeleteModalOpen(false);
            setBlogToDelete(null);
        } catch (error) {
            setDeleteModalOpen(false);
            handleErrorMessage(error.message || 'Failed to delete article');
        }
    };

    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const filteredBlogs = safeBlogs.filter((b) => {
        const matchesSearch =
            !searchTerm ||
            b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.content?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Published' && b.status === 'Published') ||
            (statusFilter === 'Draft' && b.status === 'Draft');

        return matchesSearch && matchesStatus;
    });

    const publishedCount = safeBlogs.filter((b) => b.status === 'Published').length;
    const draftCount = safeBlogs.length - publishedCount;

    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#090d16' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    if (!loading && !isBlogAllowed) {
        return (
            <Box>
                <SaasHeader title="Platform Blogs & News" subtitle="Publish and manage travel stories, news, and guides." />
                <SubscriptionRestrictedCard featureName="Blogs & News" reason={blogLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            <SaasHeader
                title="Platform Blogs & News"
                subtitle="Publish and manage travel stories, news, and guides for your platform."
                actionLabel="Write New Article"
                actionIcon={<AddIcon />}
                onActionClick={() => handleOpenDialog()}
                loading={loading}
            />

            {/* Quick Stats Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={blogs.length}
                        label="Total Articles"
                        icon={<ArticleIcon />}
                        colorScheme="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={publishedCount}
                        label="Published Articles"
                        icon={<CheckCircleIcon />}
                        colorScheme="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={draftCount}
                        label="Draft Articles"
                        icon={<EditNoteIcon />}
                        colorScheme="warning"
                    />
                </Grid>
            </Grid>

            {/* Search & Layout Control Bar */}
            <Box sx={{ mb: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: borderLineColor,
                        bgcolor: surfaceBgColor,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { md: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <TextField
                        placeholder="Search articles by title, category, or content..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        sx={{
                            width: { xs: '100%', md: 380 },
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

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={(e, val) => val && setStatusFilter(val)}
                            size="small"
                        >
                            <ToggleButton value="All">All ({safeBlogs.length})</ToggleButton>
                            <ToggleButton value="Published">Published ({publishedCount})</ToggleButton>
                            <ToggleButton value="Draft">Drafts ({draftCount})</ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, val) => val && setViewMode(val)}
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="grid">
                                <GridViewIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="table">
                                <ViewListIcon fontSize="small" />
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

            {/* Grid View */}
            {!loading && viewMode === 'grid' && (
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={gridSpacing}>
                        {filteredBlogs
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row._id}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: '16px',
                                            border: '1px solid',
                                            borderColor: borderLineColor,
                                            bgcolor: cardBgColor,
                                            overflow: 'hidden',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', bgcolor: surfaceBgColor }}>
                                            <Box
                                                component="img"
                                                src={resolveImageUrl(row.image)}
                                                alt={row.title || 'Blog'}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                                                }}
                                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                                <Chip
                                                    label={row.status}
                                                    color={row.status === 'Published' ? 'success' : 'warning'}
                                                    size="small"
                                                    sx={{ fontWeight: 800, borderRadius: '6px' }}
                                                />
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="caption" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                                                {row.category || 'Travel Article'}
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold" gutterBottom noWrap title={row.title} sx={{ color: textColor }}>
                                                {row.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: subTextColor, mb: 2, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {row.content || 'No summary text.'}
                                            </Typography>

                                            <Divider sx={{ mb: 2, borderColor: borderLineColor }} />

                                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: subTextColor, fontWeight: 500 }}>
                                                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton size="small" color="info" onClick={() => { setBlogToPreview(row); setPreviewModalOpen(true); }}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => { setBlogToDelete(row); setDeleteModalOpen(true); }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>
                </Box>
            )}

            {/* Table View */}
            {!loading && viewMode === 'table' && (
                <Box sx={{ mb: 3 }}>
                    <DataTable
                        columns={[
                            {
                                headerName: 'Article',
                                field: 'title',
                                render: (row) => (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            variant="rounded"
                                            src={resolveImageUrl(row.image)}
                                            sx={{ width: 52, height: 40, borderRadius: '8px' }}
                                        />
                                        <Typography variant="subtitle1" fontWeight="700" sx={{ color: textColor }}>{row.title}</Typography>
                                    </Stack>
                                )
                            },
                            {
                                headerName: 'Category',
                                field: 'category',
                                render: (row) => <Chip label={row.category || 'General'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                            },
                            {
                                headerName: 'Status',
                                field: 'status',
                                render: (row) => <StatusBadge status={row.status} />
                            },
                            {
                                headerName: 'Date',
                                field: 'createdAt',
                                render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
                            },
                            {
                                headerName: 'Actions',
                                align: 'center',
                                render: (row) => (
                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                        <IconButton size="small" color="info" onClick={() => { setBlogToPreview(row); setPreviewModalOpen(true); }}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => { setBlogToDelete(row); setDeleteModalOpen(true); }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )
                            }
                        ]}
                        rows={filteredBlogs}
                        loading={loading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={filteredBlogs ? filteredBlogs.length : 0}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </Box>
            )}

            {/* Write / Edit Article Drawer with Formik & Yup */}
            <Drawer
                anchor="right"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 520 },
                        p: 3,
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h3" sx={{ color: textColor, fontWeight: 800 }}>
                        {selectedBlog ? 'Edit Article' : 'Write New Article'}
                    </Typography>
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            id="title"
                            name="title"
                            label="Article Title"
                            placeholder="e.g. Top 10 Hidden Gems in Kerala"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                        />

                        <TextField
                            fullWidth
                            select
                            id="category"
                            name="category"
                            label="Category"
                            value={formik.values.category}
                            onChange={(e) => formik.setFieldValue('category', e.target.value)}
                            onBlur={formik.handleBlur}
                            error={formik.touched.category && Boolean(formik.errors.category)}
                            helperText={formik.touched.category && formik.errors.category}
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
                            <MenuItem value="Travel Guide">Travel Guide</MenuItem>
                            <MenuItem value="Destination Highlights">Destination Highlights</MenuItem>
                            <MenuItem value="Tips & Tricks">Tips & Tricks</MenuItem>
                            <MenuItem value="Company News">Company News</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            select
                            id="status"
                            name="status"
                            label="Publish Status"
                            value={formik.values.status}
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
                            <MenuItem value="Published">Published</MenuItem>
                            <MenuItem value="Draft">Draft</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            id="content"
                            name="content"
                            label="Article Content / Body"
                            placeholder="Write complete travel article story, highlights, and travel details..."
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
                                Featured Cover Image (Drag & Drop)
                            </Typography>
                            <FileUpload
                                onFileSelect={(f) => setFile(f)}
                                previewUrl={selectedBlog ? resolveImageUrl(selectedBlog.image) : null}
                                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                title="Drag & drop article cover image here or click to browse"
                                caption="Recommended 16:9 banner image up to 10MB"
                            />
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={formik.isSubmitting}
                            sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                        >
                            {formik.isSubmitting ? 'Publishing...' : selectedBlog ? 'Update Article' : 'Publish Article'}
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            {/* Full Article Preview Modal */}
            <Dialog
                open={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>Article Preview</Typography>
                    <IconButton onClick={() => setPreviewModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: borderLineColor }}>
                    {blogToPreview && (
                        <Stack spacing={2.5}>
                            <Box
                                component="img"
                                src={resolveImageUrl(blogToPreview.image)}
                                alt={blogToPreview.title}
                                sx={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: '12px' }}
                            />
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={blogToPreview.category || 'General'} color="primary" size="small" sx={{ fontWeight: 700 }} />
                                <Chip label={blogToPreview.status} color={blogToPreview.status === 'Published' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                                <Typography variant="caption" sx={{ color: subTextColor, ml: 'auto' }}>
                                    Published on: {blogToPreview.createdAt ? new Date(blogToPreview.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </Typography>
                            </Stack>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: textColor }}>
                                {blogToPreview.title}
                            </Typography>
                            <Divider sx={{ borderColor: borderLineColor }} />
                            <Typography variant="body1" sx={{ color: textColor, lineHeight: 1.8, whitespace: 'pre-line' }}>
                                {blogToPreview.content}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant="outlined" onClick={() => setPreviewModalOpen(false)} sx={{ borderRadius: '8px', fontWeight: 700 }}>Close Preview</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>Remove Article?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to delete article <strong>"{blogToDelete?.title}"</strong>?
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
                        This vendor subscription plan does not support Blogs & News publishing.
                    </Alert>
                    <Typography variant="body2" sx={{ color: subTextColor, lineHeight: 1.6, fontWeight: 500 }}>
                        Your current subscription plan limits access to Platform Blogs & News publishing. Upgrade your vendor plan to write articles, post travel highlights, and publish news updates.
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

export default BlogManagement;
