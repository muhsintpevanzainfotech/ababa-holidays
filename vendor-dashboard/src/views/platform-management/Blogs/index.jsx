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
    MenuItem,
    Card,
    CardContent,
    CardActions,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Avatar,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const BlogManagement = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Published' | 'Draft'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [file, setFile] = useState(null);
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    // Preview Modal
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [blogToPreview, setBlogToPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        status: 'Published'
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/blogs/my-blogs');
            if (response.success) {
                setBlogs(response.data || []);
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

    const handleDeleteClick = (id) => {
        setBlogToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        try {
            await api.delete(`/blogs/${blogToDelete}`);
            fetchBlogs();
            setDeleteModalOpen(false);
            setBlogToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete article');
        }
    };

    const handleOpenDialog = (blog = null) => {
        if (blog) {
            setSelectedBlog(blog);
            setFormData({
                title: blog.title || '',
                content: blog.content || '',
                category: blog.category || '',
                status: blog.status || 'Published'
            });
        } else {
            setSelectedBlog(null);
            setFormData({ title: '', content: '', category: '', status: 'Published' });
        }
        setFile(null);
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) {
            alert('Title and content are required');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (file) data.append('image', file);

            let response;
            if (selectedBlog) {
                response = await api.put(`/blogs/${selectedBlog._id}`, data, true);
            } else {
                response = await api.post('/blogs', data, true);
            }

            if (response.success) {
                setOpenDialog(false);
                fetchBlogs();
            }
        } catch (error) {
            alert(error.message || 'Failed to save article');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter Logic
    const filteredBlogs = blogs.filter(b => {
        const matchesSearch = 
            b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.content?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'All' ? true : b.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const publishedCount = blogs.filter(b => b.status === 'Published').length;
    const draftCount = blogs.filter(b => b.status === 'Draft').length;

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedBlogs = filteredBlogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header Title & Create Button */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Platform Blogs & News</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Publish and manage travel stories, news, and guides for your platform
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
                        Write New Article
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Stats Summary Widgets */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={blogs.length} 
                            label="Total Articles" 
                            icon={<ArticleIcon />} 
                            variant="dark" 
                            colorScheme="primary" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={publishedCount} 
                            label="Published Articles" 
                            icon={<CheckCircleIcon />} 
                            variant="light" 
                            colorScheme="success" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={draftCount} 
                            label="Draft Articles" 
                            icon={<EditNoteIcon />} 
                            variant="light" 
                            colorScheme="warning" 
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Filter, Search & View Switcher Bar */}
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
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    {/* Search Field */}
                    <TextField
                        placeholder="Search articles by title, category, or content..."
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

                    {/* Filter Status Pills & View Mode Switcher */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                            {['All', 'Published', 'Draft'].map((status) => (
                                <Chip
                                    key={status}
                                    label={status === 'All' ? `All (${blogs.length})` : status === 'Published' ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
                                    onClick={() => { setStatusFilter(status); setPage(0); }}
                                    color={statusFilter === status ? 'secondary' : 'default'}
                                    variant={statusFilter === status ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                                />
                            ))}
                        </Stack>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, val) => val && setViewMode(val)}
                            size="small"
                            color="secondary"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <Tooltip title="Grid View">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <GridViewIcon fontSize="small" />
                                        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>Grid</Typography>
                                    </Stack>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="table" aria-label="table view">
                                <Tooltip title="Table View">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ViewListIcon fontSize="small" />
                                        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>List</Typography>
                                    </Stack>
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>
            </Grid>

            {loading && (
                <Grid size={12}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Grid>
            )}

            {/* Grid View */}
            {!loading && viewMode === 'grid' && (
                <Grid size={12}>
                    <Grid container spacing={gridSpacing}>
                        {paginatedBlogs.map((row) => (
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
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                                            borderColor: 'secondary.light'
                                        }
                                    }}
                                >
                                    {/* Cover Image */}
                                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', bgcolor: 'grey.100', overflow: 'hidden' }}>
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
                                                transition: 'transform 0.4s ease',
                                                '&:hover': { transform: 'scale(1.04)' }
                                            }}
                                        />
                                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                            <Chip
                                                label={row.status || 'Published'}
                                                color={row.status === 'Published' ? 'success' : 'default'}
                                                size="small"
                                                sx={{ fontWeight: 700, fontSize: '0.75rem', backdropFilter: 'blur(8px)' }}
                                            />
                                        </Box>
                                        {row.category && (
                                            <Box sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 2 }}>
                                                <Chip
                                                    label={row.category}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Card Body */}
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
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.5,
                                                minHeight: '60px'
                                            }}
                                        >
                                            {row.content?.replace(/<[^>]*>?/gm, '') || 'No summary available.'}
                                        </Typography>

                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 'auto', pt: 1, color: 'text.secondary' }}>
                                            <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                            <Typography variant="caption">
                                                {new Date(row.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Typography>
                                        </Stack>
                                    </CardContent>

                                    <Divider />

                                    {/* Footer Actions */}
                                    <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                                            {row.createdBy?.name || (row.userRole === 'Vendor' ? 'Vendor Author' : 'Official Admin')}
                                        </Typography>

                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Preview Article">
                                                <IconButton size="small" color="info" onClick={() => { setBlogToPreview(row); setPreviewModalOpen(true); }}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Article">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Article">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(row._id)}>
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

            {/* Table View */}
            {!loading && viewMode === 'table' && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Preview</TableCell>
                                        <TableCell>Title / Article</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Author</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedBlogs.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Box
                                                    component="img"
                                                    src={`${import.meta.env.VITE_APP_API_URL}/${row.image}`}
                                                    alt={row.title}
                                                    sx={{ width: 70, height: 48, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: 280 }}>{row.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Published: {new Date(row.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.category || 'General'} size="small" variant="outlined" color="secondary" />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="600">
                                                    {row.createdBy?.name || (row.userRole === 'Vendor' ? 'Vendor Author' : 'Platform Admin')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status || 'Published'}
                                                    size="small"
                                                    color={row.status === 'Published' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="Preview">
                                                        <IconButton size="small" color="info" onClick={() => { setBlogToPreview(row); setPreviewModalOpen(true); }}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
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
            {!loading && filteredBlogs.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[6, 12, 24]}
                            component="div"
                            count={filteredBlogs.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Grid>
            )}

            {/* Empty State */}
            {!loading && filteredBlogs.length === 0 && (
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
                        <ArticleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" gutterBottom>No Articles Found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 3 }}>
                            {searchTerm ? `No article matches "${searchTerm}". Try resetting your filter criteria.` : 'You have not written any news articles or blog stories yet. Create your first article to engage visitors!'}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: '8px', px: 3 }}
                        >
                            Write Article Now
                        </Button>
                    </Paper>
                </Grid>
            )}

            {/* Drawer Form for Write / Edit Blog */}
            <Drawer
                anchor="right"
                open={openDialog}
                onClose={() => !submitting && setOpenDialog(false)}
                sx={{ zIndex: 1400 }}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 560, md: 660 }, p: 0, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 36px rgba(0,0,0,0.25)' }
                }}
            >
                <Box sx={{ p: 2.5, bgcolor: 'secondary.main', color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4" color="inherit" fontWeight="bold">
                            {selectedBlog ? 'Edit Article' : 'Write New Article'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                            {selectedBlog ? 'Update existing blog post details and headline' : 'Publish a new travel story or news update for your audience'}
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
                            label="Article Title *"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Category"
                                placeholder="e.g. Travel Guide, Kerala Tour"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="Published">Published</MenuItem>
                                <MenuItem value="Draft">Draft</MenuItem>
                            </TextField>
                        </Stack>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">Featured Cover Image</Typography>
                            <FileUpload
                                onFileSelect={(selectedFile) => setFile(selectedFile)}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                                title="Drop cover image here"
                                caption="Recommended aspect ratio 16:9 (Max size 2MB)"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Article Content *"
                            multiline
                            rows={12}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </Stack>
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting} sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}>
                        {submitting ? 'Saving...' : (selectedBlog ? 'Update Article' : 'Publish Article')}
                    </Button>
                </Box>
            </Drawer>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Article</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this article? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Article
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} maxWidth="md" fullWidth>
                {blogToPreview && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h3" fontWeight="bold">{blogToPreview.title}</Typography>
                                <Chip label={blogToPreview.category || 'General'} size="small" color="secondary" sx={{ mt: 0.5 }} />
                            </Box>
                            <IconButton onClick={() => setPreviewModalOpen(false)}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            {blogToPreview.image && (
                                <Box component="img" src={`${import.meta.env.VITE_APP_API_URL}/${blogToPreview.image}`} sx={{ width: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 2, mb: 3 }} />
                            )}
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                {blogToPreview.content}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setPreviewModalOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Grid>
    );
};

export default BlogManagement;
