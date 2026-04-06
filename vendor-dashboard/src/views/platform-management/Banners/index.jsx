import { Grid, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const BannerManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Website Banners</Typography>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                        Upload New Banner
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="Active Marketing Banners">
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Preview</TableCell>
                                    <TableCell>Title/Campaign</TableCell>
                                    <TableCell>Placement</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { title: 'Summer Holiday Sale - 20% OFF', placement: 'Home Main Slider', status: 'Active' },
                                    { title: 'Kerala Packages Early Bird', placement: 'Package Sidebar', status: 'Active' },
                                    { title: 'New Year Special Discounts', placement: 'Home Main Slider', status: 'Expired' }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Box sx={{ width: 80, height: 45, bgcolor: 'grey.100', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1">{row.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">Published on: 01 Apr 2026</Typography>
                                        </TableCell>
                                        <TableCell>{row.placement}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                color={row.status === 'Active' ? 'success' : 'default'} 
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default BannerManagement;
