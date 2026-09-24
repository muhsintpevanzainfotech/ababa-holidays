import { useState, useEffect } from 'react';
import { Grid, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box, Tabs, Tab, TextField, InputAdornment, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import SearchIcon from '@mui/icons-material/Search';

const ServicesManagement = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/services');
            if (response.success) {
                setServices(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchServices();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredServices = services.filter(s => 
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Services Catalog Manager</Typography>
                        <Typography variant="caption" color="text.secondary">Configure platform-wide service offerings</Typography>
                    </Box>
                    <TextField
                        placeholder="Search services..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Grid>

            {/* Tabbed Navigation for Hierarchy */}
            <Grid size={12}>
                <MainCard content={false}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                        <Tabs value={tab} onChange={handleTabChange} aria-label="services hierarchy tabs" textColor="secondary" indicatorColor="secondary">
                            <Tab icon={<RoomServiceIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Core Services" />
                            <Tab icon={<SettingsSuggestIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Sub-Services" />
                            <Tab icon={<CategoryIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Categories" />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        {loading && <LinearProgress sx={{ mb: 2 }} />}
                        
                        {tab === 0 && (
                            <Stack spacing={gridSpacing}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h4">Main Platform Services</Typography>
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>Add Main Service</Button>
                                </Stack>
                                <TableContainer component={Paper} elevation={0}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell>Service Name</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredServices.map((row) => (
                                                <TableRow key={row._id} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.title}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{row.description}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={row.isActive ? 'Active' : 'Inactive'} 
                                                            size="small" 
                                                            color={row.isActive ? 'success' : 'default'} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton color="error" size="small" onClick={() => handleDelete(row._id)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredServices.length === 0 && !loading && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">No services found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Stack>
                        )}

                        {tab === 1 && (
                            <Stack spacing={gridSpacing}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h4">Detailed Sub-Services</Typography>
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>Add Sub-Service</Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">Sub-services management is coming soon in the next update.</Typography>
                            </Stack>
                        )}

                        {tab === 2 && (
                            <Stack spacing={gridSpacing}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h4">Categorical Classification</Typography>
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>Add New Category</Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">Categories management is coming soon in the next update.</Typography>
                            </Stack>
                        )}
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default ServicesManagement;
