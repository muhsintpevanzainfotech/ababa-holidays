import { Grid, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box, Rating } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TestimonialManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Customer Testimonials</Typography>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                        Add New Review
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="Verified Customer Feedback">
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Comment / Feedback</TableCell>
                                    <TableCell>Source/Package</TableCell>
                                    <TableCell>Approval</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { name: 'John Doe', rating: 5, comment: 'Loved the service provided by Ababa Travels team!', package: 'Wayand Tour Pack', approved: true },
                                    { name: 'Anjali Sharma', rating: 4, comment: 'Very professional communication throughout the trip.', package: 'Kerala Backwaters', approved: false }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="bold">{row.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Location: Dubai, UAE</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Rating value={row.rating} size="small" readOnly />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 200 }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>"{row.comment}"</Typography>
                                        </TableCell>
                                        <TableCell>{row.package}</TableCell>
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

export default TestimonialManagement;
