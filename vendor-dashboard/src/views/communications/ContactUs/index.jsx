import { Grid, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';

const ContactUsManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Contact Messages</Typography>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="General Web Inquiries">
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Sender</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { date: '08 Apr 2026', name: 'Mike Thompson', email: 'mike@example.com', subject: 'Partnership Inquiry', status: 'Unread' },
                                    { date: '06 Apr 2026', name: 'Emily Davis', email: 'emily.d@example.com', subject: 'Feedback on recent trip', status: 'Read' }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Typography variant="body2">{row.date}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EmailIcon sx={{ fontSize: 12 }} /> {row.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {row.subject}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status} 
                                                size="small" 
                                                color={row.status === 'Unread' ? 'error' : 'default'} 
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <IconButton size="small" color="secondary" title="Read Message"><VisibilityIcon fontSize="small" /></IconButton>
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

export default ContactUsManagement;
