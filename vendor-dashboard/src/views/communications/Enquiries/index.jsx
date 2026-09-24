import { useState, useEffect } from 'react';

// material-ui
import {
    Grid,
    Typography,
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
    LinearProgress,
    Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';

const EnquiryManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [enquiries, setEnquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enquiries');
            if (response.success) {
                setEnquiries(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this enquiry?')) {
            try {
                await api.delete(`/enquiries/${id}`);
                fetchEnquiries();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredEnquiries = enquiries.filter(e => 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Website Enquiries</Typography>
                        <Typography variant="caption" color="text.secondary">Track and respond to service leads and customer interests</Typography>
                    </Box>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search enquiries..."
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
                                    <TableCell>Date</TableCell>
                                    <TableCell>Customer Details</TableCell>
                                    <TableCell>Interested Service</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredEnquiries.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Typography variant="body2">{new Date(row.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EmailIcon sx={{ fontSize: 12 }} /> {row.email}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PhoneIcon sx={{ fontSize: 12 }} /> {row.phone}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.subject || row.message?.substring(0, 30)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                color={row.status === 'New' ? 'primary' : 'warning'} 
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <Tooltip title="View Details">
                                                    <IconButton size="small" color="secondary"><VisibilityIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                                 <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}><DeleteIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredEnquiries.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            No enquiries found
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

export default EnquiryManagement;
