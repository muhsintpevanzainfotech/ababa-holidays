import { useState, useEffect } from 'react';

// material-ui
import {
    Grid,
    Typography,
    Stack,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
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
                setBrands(response.data || []);
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
        <Box>
            <SaasHeader
                title="Agency Brands & Socials"
                subtitle="Manage multiple agency brands, identity assets, and social media connections."
                actionLabel="Add New Brand"
                actionIcon={<AddIcon />}
            />

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
                <DataTable
                    columns={[
                        {
                            headerName: 'Brand Identity',
                            field: 'name',
                            render: (row) => (
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
                            )
                        },
                        {
                            headerName: 'Connected Socials',
                            field: 'socialLinks',
                            render: (row) => (
                                <Stack direction="row" spacing={1}>
                                    {row.socialLinks?.instagram && <InstagramIcon sx={{ fontSize: 18, color: '#E1306C' }} />}
                                    {row.socialLinks?.facebook && <FacebookIcon sx={{ fontSize: 18, color: '#1877F2' }} />}
                                    {row.socialLinks?.twitter && <TwitterIcon sx={{ fontSize: 18, color: '#1DA1F2' }} />}
                                    {!row.socialLinks && <Typography variant="caption" color="text.disabled">None connected</Typography>}
                                </Stack>
                            )
                        },
                        {
                            headerName: 'Owner',
                            field: 'vendor',
                            render: (row) => <Typography variant="body2">{row.vendor?.name || 'Platform'}</Typography>
                        },
                        {
                            headerName: 'Status',
                            field: 'isActive',
                            render: (row) => <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} />
                        },
                        {
                            headerName: 'Actions',
                            align: 'center',
                            render: (row) => (
                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                    <Tooltip title="Edit Brand">
                                        <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Tooltip>
                                </Stack>
                            )
                        }
                    ]}
                    rows={filteredBrands}
                    loading={loading}
                    emptyTitle="No Brands Found"
                    emptySubtitle="No agency brands match your search query."
                />
            </MainCard>
        </Box>
    );
};

export default BrandManagement;
