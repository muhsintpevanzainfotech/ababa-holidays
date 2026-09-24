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
    Tooltip,
    Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const BrandManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api.get('/brands');
            if (response.success) {
                setBrands(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this brand profile?')) {
            try {
                await api.delete(`/brands/${id}`);
                fetchBrands();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredBrands = brands.filter(b => 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Agency Brands & Socials</Typography>
                        <Typography variant="caption" color="text.secondary">Manage multiple agency brands and their social connections</Typography>
                    </Box>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                        Add New Brand
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search brands..."
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
                                    <TableCell>Brand Identity</TableCell>
                                    <TableCell>Connected Socials</TableCell>
                                    <TableCell>Owner</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBrands.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box 
                                                    component="img"
                                                    src={row.logos?.small ? `${import.meta.env.VITE_APP_API_URL}/${row.logos.small}` : ''}
                                                    sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '4px', bgcolor: 'grey.50' }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{row.companyName}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {row.socialLinks?.instagram && <InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} />}
                                                {row.socialLinks?.facebook && <FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} />}
                                                {row.socialLinks?.twitter && <TwitterIcon sx={{ fontSize: 18, color: '#1DA1F2' }} />}
                                                {!row.socialLinks && <Typography variant="caption" color="text.disabled">None connected</Typography>}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.vendor?.name || 'Platform'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.isActive ? 'Active' : 'Inactive'} 
                                                size="small" 
                                                color={row.isActive ? 'success' : 'default'} 
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <Tooltip title="Edit Brand">
                                                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                                 <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}><DeleteIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredBrands.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            No brands found
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

export default BrandManagement;
