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
    MenuItem
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
import VisibilityIcon from '@mui/icons-material/Visibility';

const BlogManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        status: 'Published'
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/blogs'); 
            if (response.success) {
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await api.delete(`/blogs/${id}`);
                fetchBlogs();
            } catch (error) {
                alert(error.message);
            }
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
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBlogs = blogs.filter(b => 
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Platform Blogs & News</Typography>
                        <Typography variant="caption" color="text.secondary">Share updates and travel stories with your audience</Typography>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Write New Article
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search articles..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <TableCell>Title / Headline</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Author</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBlogs.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Box 
                                                component="img"
                                                src={`${import.meta.env.VITE_APP_API_URL}/${row.image}`}
                                                sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" noWrap sx={{ maxWidth: 250 }}>{row.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Published: {new Date(row.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={row.category || 'Uncategorized'} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.author?.name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.userRole}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                color={row.status === 'Published' ? 'success' : 'default'} 
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}><EditIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                                 <Tooltip title="View">
                                                    <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
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
                                {filteredBlogs.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            No articles found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>

            {/* Blog Dialog */}
            <Dialog open={openDialog} onClose={() => !submitting && setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedBlog ? 'Edit Article' : 'Write New Article'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3}>
                                <TextField 
                                    fullWidth 
                                    label="Article Title" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                />
                                <TextField 
                                    fullWidth 
                                    label="Content" 
                                    multiline 
                                    rows={10} 
                                    value={formData.content} 
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                <TextField 
                                    fullWidth 
                                    label="Category" 
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
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Featured Image</Typography>
                                    <FileUpload 
                                        onFileSelect={(selectedFile) => setFile(selectedFile)}
                                        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                                        title="Drop cover image"
                                    />
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={submitting}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Saving...' : (selectedBlog ? 'Update Article' : 'Publish Article')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default BlogManagement;
