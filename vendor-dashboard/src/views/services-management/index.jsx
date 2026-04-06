import { useState } from 'react';
import { Grid, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RoomServiceIcon from '@mui/icons-material/RoomService';

const ServicesManagement = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Services Catalog Manager</Typography>
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
                                                <TableCell>Icon Overlay</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[
                                                { name: 'Hotel & Stay', desc: 'Listing premium accommodations and resorts' },
                                                { name: 'Transport & Cab', desc: 'Professional car rental and pickup services' },
                                                { name: 'Tours & Packages', desc: 'Curated holiday itineraries and activities' }
                                            ].map((row, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{row.desc}</TableCell>
                                                    <TableCell><Box sx={{ width: 32, height: 32, bgcolor: 'primary.light', borderRadius: '8px' }} /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
                                <TableContainer component={Paper} elevation={0}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell>Sub-Service</TableCell>
                                                <TableCell>Parent Service</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[
                                                { name: 'Budget Hotels', parent: 'Hotel & Stay', status: 'Enabled' },
                                                { name: 'Luxury Villas', parent: 'Hotel & Stay', status: 'Enabled' },
                                                { name: 'Airport Pickup', parent: 'Transport & Cab', status: 'Disabled' }
                                            ].map((row, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                                    <TableCell><Chip label={row.parent} size="small" variant="outlined" /></TableCell>
                                                    <TableCell>
                                                        <Chip label={row.status} size="small" color={row.status === 'Enabled' ? 'success' : 'default'} />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Stack>
                        )}

                        {tab === 2 && (
                            <Stack spacing={gridSpacing}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h4">Categorical Classification</Typography>
                                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>Add New Category</Button>
                                </Stack>
                                <TableContainer component={Paper} elevation={0}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell>Category Title</TableCell>
                                                <TableCell>Mapping</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[
                                                { name: 'Honeymoon Special', mapping: 'Tours & Packages / Couple Packages' },
                                                { name: 'Family Group', mapping: 'Tours & Packages / Group Tours' }
                                            ].map((row, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{row.mapping}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Stack>
                        )}
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default ServicesManagement;
