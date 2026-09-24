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
    LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';

const TestimonialManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [testimonials, setTestimonials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/testimonials');
            if (response.success) {
                setTestimonials(response.data);
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                await api.delete(`/testimonials/${id}`);
                fetchTestimonials();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredTestimonials = testimonials.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Customer Testimonials</Typography>
                        <Typography variant="caption" color="text.secondary">Review and manage verified customer feedback</Typography>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                        Add New Review
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search feedback..."
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
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Comment / Feedback</TableCell>
                                    <TableCell>Source/Role</TableCell>
                                    <TableCell>Approval</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTestimonials.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="bold">{row.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Location: {row.location || 'N/A'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Rating value={row.rating} size="small" readOnly />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 250 }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.4 }} noWrap title={row.comment}>"{row.comment}"</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.vendor ? row.vendor.name : 'Platform'} 
                                                size="small" 
                                                variant="outlined" 
                                                color={row.userRole === 'Admin' ? 'primary' : 'secondary'} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={row.approved ? <CheckCircleIcon fontSize="small" /> : null } 
                                                label={row.approved ? 'Approved' : 'Pending Review'} 
                                                size="small" 
                                                color={row.approved ? 'success' : 'warning'} 
                                                variant={row.approved ? 'filled' : 'outlined'}
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
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
                                {filteredTestimonials.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            No testimonials found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default TestimonialManagement;
