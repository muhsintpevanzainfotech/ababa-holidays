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
    Drawer,
    MenuItem,
    Button,
    Divider,
    Avatar,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ClearIcon from '@mui/icons-material/Clear';

const EnquiryManagement = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enquiries, setEnquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'New' | 'In Progress' | 'Resolved'
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [status, setStatus] = useState('New');
    const [followUpNote, setFollowUpNote] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enquiries');
            if (response.success) {
                setEnquiries(response.data || []);
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

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/enquiries/${itemToDelete}`);
            fetchEnquiries();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete enquiry');
        }
    };

    const handleOpenDrawer = (item) => {
        setSelectedEnquiry(item);
        setStatus(item.status || 'New');
        setFollowUpNote('');
        setOpenDrawer(true);
    };

    const handleSaveFollowUp = async () => {
        if (!selectedEnquiry) return;
        setSubmitting(true);
        try {
            if (followUpNote.trim()) {
                await api.post(`/enquiries/${selectedEnquiry._id}/followup`, {
                    note: followUpNote,
                    status: status
                });
            } else if (status !== selectedEnquiry.status) {
                await api.put(`/enquiries/${selectedEnquiry._id}`, { status });
            }

            setOpenDrawer(false);
            fetchEnquiries();
        } catch (error) {
            alert(error.message || 'Failed to save details');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEnquiries = enquiries.filter(e => {
        const matchesSearch = 
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'All' ? true : e.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const newCount = enquiries.filter(e => e.status === 'New').length;
    const inProgressCount = enquiries.filter(e => e.status === 'In Progress').length;
    const resolvedCount = enquiries.filter(e => e.status === 'Resolved').length;

    const paginatedEnquiries = filteredEnquiries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Website Enquiries & Leads</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Track, follow up, and convert service leads and traveler inquiries
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            {/* Quick Stats Summary */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={enquiries.length} 
                            label="Total Enquiries" 
                            icon={<QuestionAnswerIcon />} 
                            variant="dark" 
                            colorScheme="primary"
                            onClick={() => { setStatusFilter('All'); setPage(0); }}
                            active={statusFilter === 'All'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={newCount} 
                            label="New Leads" 
                            icon={<NewReleasesIcon />} 
                            variant="light" 
                            colorScheme="warning"
                            onClick={() => { setStatusFilter('New'); setPage(0); }}
                            active={statusFilter === 'New'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={resolvedCount} 
                            label="Resolved Enquiries" 
                            icon={<CheckCircleIcon />} 
                            variant="light" 
                            colorScheme="success"
                            onClick={() => { setStatusFilter('Resolved'); setPage(0); }}
                            active={statusFilter === 'Resolved'}
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Filter and Search Bar */}
            <Grid size={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { md: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <TextField
                        placeholder="Search leads by customer name, email, phone, or topic..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        sx={{ width: { xs: '100%', md: 380 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }}
                    />

                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                        {['All', 'New', 'In Progress', 'Resolved'].map((st) => (
                            <Chip
                                key={st}
                                label={st === 'All' ? `All (${enquiries.length})` : st === 'New' ? `New (${newCount})` : st === 'In Progress' ? `In Progress (${inProgressCount})` : `Resolved (${resolvedCount})`}
                                onClick={() => { setStatusFilter(st); setPage(0); }}
                                color={statusFilter === st ? 'secondary' : 'default'}
                                variant={statusFilter === st ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Grid>

            {loading && (
                <Grid size={12}>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                </Grid>
            )}

            {/* Enquiries Table */}
            {!loading && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Date & Time</TableCell>
                                        <TableCell>Customer Details</TableCell>
                                        <TableCell>Service / Subject</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedEnquiries.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Typography variant="body2" fontWeight="600">{new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{row.name}</Typography>
                                                <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <EmailIcon sx={{ fontSize: 13 }} /> {row.email}
                                                    </Typography>
                                                    {row.phone && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <PhoneIcon sx={{ fontSize: 13 }} /> {row.phone}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 280 }}>
                                                <Typography variant="body2" fontWeight="600" noWrap title={row.subject}>{row.subject || 'General Service Enquiry'}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                                    {row.message || 'No additional notes'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.status || 'New'} 
                                                    size="small" 
                                                    color={row.status === 'New' ? 'warning' : row.status === 'Resolved' ? 'success' : 'primary'} 
                                                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="View & Respond">
                                                        <IconButton size="small" color="secondary" onClick={() => handleOpenDrawer(row)}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(row._id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedEnquiries.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <QuestionAnswerIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="h4" fontWeight="bold">No Enquiries Found</Typography>
                                                <Typography variant="body2" color="text.secondary">No customer lead matches your search criteria.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </MainCard>
                </Grid>
            )}

            {/* Pagination */}
            {!loading && filteredEnquiries.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={filteredEnquiries.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </Paper>
                </Grid>
            )}

            {/* Right-Side Drawer Enquiry Details & Follow-up Log */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                sx={{ zIndex: 1400 }}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 540, md: 620 }, p: 0, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 36px rgba(0,0,0,0.25)' }
                }}
            >
                {selectedEnquiry && (
                    <>
                        <Box sx={{ p: 2.5, bgcolor: 'secondary.main', color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" color="inherit" fontWeight="bold">
                                    Enquiry Details & Follow-up
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                                    Received on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setOpenDrawer(false)} sx={{ color: 'common.white' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box 
                            sx={{ 
                                p: 3, 
                                flexGrow: 1, 
                                overflowY: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}
                        >
                            <Stack spacing={3}>
                                {/* Customer Card */}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: 'grey.50' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff' }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">{selectedEnquiry.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Lead Traveler</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon fontSize="small" color="action" /> {selectedEnquiry.email}
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon fontSize="small" color="action" /> {selectedEnquiry.phone || 'Phone N/A'}
                                        </Typography>
                                    </Stack>
                                </Paper>

                                {/* Enquiry Subject & Message */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">Interested Service / Subject</Typography>
                                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>
                                        {selectedEnquiry.subject || 'General Service Enquiry'}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">Customer Message</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px', bgcolor: 'background.paper', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                                        {selectedEnquiry.message || 'No additional details provided.'}
                                    </Paper>
                                </Box>

                                <Divider />

                                {/* Status Update */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Update Lead Status</Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <MenuItem value="New">🟡 New Lead</MenuItem>
                                        <MenuItem value="In Progress">🔵 In Progress</MenuItem>
                                        <MenuItem value="Resolved">🟢 Resolved</MenuItem>
                                        <MenuItem value="Closed">⚪ Closed</MenuItem>
                                    </TextField>
                                </Box>

                                {/* Follow-up History */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Follow-up Notes & Conversation Log</Typography>
                                    {selectedEnquiry.followUps && selectedEnquiry.followUps.length > 0 ? (
                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            {selectedEnquiry.followUps.map((fu, idx) => (
                                                <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: '8px', bgcolor: 'grey.50' }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                        {new Date(fu.date).toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2">{fu.note}</Typography>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                            No follow-up notes recorded yet.
                                        </Typography>
                                    )}

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Add a new follow-up remark or phone response summary..."
                                        value={followUpNote}
                                        onChange={(e) => setFollowUpNote(e.target.value)}
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                            <Button onClick={() => setOpenDrawer(false)} color="inherit">
                                Close
                            </Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<SendIcon />}
                                onClick={handleSaveFollowUp} 
                                disabled={submitting} 
                                sx={{ borderRadius: '8px', px: 2.5, fontWeight: 700 }}
                            >
                                {submitting ? 'Saving...' : 'Update Lead Status'}
                            </Button>
                        </Box>
                    </>
                )}
            </Drawer>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Enquiry</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this enquiry lead? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Enquiry
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default EnquiryManagement;
