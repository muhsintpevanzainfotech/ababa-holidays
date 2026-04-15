import { Grid, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box, Button } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const EnquiryManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Website Enquiries</Typography>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="Incoming Service Leads">
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
                                {[
                                    { date: '08 Apr 2026', name: 'Robert Wilson', email: 'robert@example.com', phone: '+91 98765 43210', service: 'Luxury Honeymoon Package', status: 'New' },
                                    { date: '07 Apr 2026', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+91 88765 12345', service: 'Group Wayanad Tour', status: 'In Progress' }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Typography variant="body2">{row.date}</Typography>
                                            <Typography variant="caption" color="text.secondary">10:45 AM</Typography>
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
                                            <Typography variant="body2">{row.service}</Typography>
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
                                                 <IconButton size="small" color="secondary" title="View Details"><VisibilityIcon fontSize="small" /></IconButton>
                                                 <IconButton size="small" color="error" title="Delete"><DeleteIcon fontSize="small" /></IconButton>
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

export default EnquiryManagement;
