import { Grid, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

const BrandManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Agency Brands & Socials</Typography>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="Website Brand Profiles">
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Brand Name</TableCell>
                                    <TableCell>Connected Socials</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { title: 'Ababa Holidays Main', socials: ['Instagram', 'Facebook'], status: 'Active' },
                                    { title: 'Premium Luxury Tours', socials: ['Instagram', 'Twitter'], status: 'Active' }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{row.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">Main branding for the website</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {row.socials.map(s => (
                                                    <Box key={s} sx={{ p: 0.5, bgcolor: 'grey.50', borderRadius: '4px', display: 'flex' }}>
                                                        {s === 'Instagram' && <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />}
                                                        {s === 'Facebook' && <FacebookIcon sx={{ fontSize: 16, color: '#1877F2' }} />}
                                                        {s === 'Twitter' && <TwitterIcon sx={{ fontSize: 16, color: '#1DA1F2' }} />}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                color="success" 
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

export default BrandManagement;
