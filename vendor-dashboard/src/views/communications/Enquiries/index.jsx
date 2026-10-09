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
import { useColorScheme, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const EnquiryManagement = () => {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enquiries, setEnquiries] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
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
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ enquiriesFollowupEnabled: false, enquiryLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

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

    const enquiryLimit = subscription?.enquiryLimit !== undefined ? subscription.enquiryLimit : -1;
    const isEnquiriesAllowed = subscription ? (subscription?.enquiriesFollowupEnabled !== false && enquiryLimit !== 0) : true;

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/enquiries/${itemToDelete}`);
            fetchEnquiries();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleOpenDrawer = (item) => {
        setSelectedEnquiry(item);
        setStatus(item.status || 'New');
        setFollowUpNote('');
        setOpenDrawer(true);
    };

    const handleAddFollowUp = async () => {
        if (!selectedEnquiry) return;
        setSubmitting(true);
        try {
            const response = await api.post(`/enquiries/${selectedEnquiry._id}/follow-up`, {
                note: followUpNote,
                status
            });
            if (response.success) {
                setFollowUpNote('');
                setSelectedEnquiry(response.data);
                fetchEnquiries();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEnquiries = enquiries
        .filter(e => {
            const matchesSearch =
                e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.phone?.includes(searchTerm) ||
                e.message?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const newCount = enquiries.filter(e => e.status === 'New').length;
    const inProgressCount = enquiries.filter(e => e.status === 'In Progress').length;
    const resolvedCount = enquiries.filter(e => e.status === 'Resolved').length;

    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#090d16' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    if (!loading && !isEnquiriesAllowed) {
        return (
            <Box>
                <SaasHeader title="Web Enquiries & Leads" subtitle="Track customer inquiries, quotes, and package requests." />
                <SubscriptionRestrictedCard featureName="Enquiries & Auto Follow-up" reason={enquiryLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            <SaasHeader
                title="Web Enquiries & Leads"
                subtitle="Track customer inquiries, quotes, package requests, and follow-ups."
            />
            {/* Stat Cards */}
            <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={newCount}
                        label="New Enquiries"
                        icon={<NewReleasesIcon />}
                        colorScheme="error"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={inProgressCount}
                        label="In Progress Follow-ups"
                        icon={<PendingIcon />}
                        colorScheme="warning"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={resolvedCount}
                        label="Resolved Enquiries"
                        icon={<CheckCircleIcon />}
                        colorScheme="success"
                    />
                </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    backgroundColor: surfaceBgColor,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { sm: 'center' },
                    justify: 'space-between',
                    gap: 2
                }}
            >
                <TextField
                    placeholder="Search by name, email, phone, or message..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    sx={{
                        width: { xs: '100%', sm: 360 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            backgroundColor: cardBgColor,
                            color: textColor,
                            '& fieldset': { borderColor: borderLineColor }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: subTextColor }} />
                            </InputAdornment>
                        )
                    }}
                />

                <Box sx={{ ml: 'auto' }}>
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                            width: 180,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: cardBgColor,
                                color: textColor,
                                '& fieldset': { borderColor: borderLineColor }
                            }
                        }}
                    >
                        <MenuItem value="All">All Statuses</MenuItem>
                        <MenuItem value="New">New Only</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {/* Data Table */}
            <DataTable
                columns={[
                    {
                        headerName: 'Customer',
                        field: 'name',
                        render: (row) => (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, fontWeight: 700 }}>
                                    {row.name ? row.name.charAt(0).toUpperCase() : 'E'}
                                </Avatar>
                                <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>
                                    {row.name}
                                </Typography>
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Contact Info',
                        field: 'email',
                        render: (row) => (
                            <Box>
                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>
                                    {row.email}
                                </Typography>
                                <Typography variant="caption" sx={{ color: subTextColor }}>
                                    {row.phone || 'No phone'}
                                </Typography>
                            </Box>
                        )
                    },
                    {
                        headerName: 'Enquiry Message',
                        field: 'message',
                        render: (row) => (
                            <Typography variant="body2" sx={{ color: textColor, fontWeight: 500, lineClamp: 2, maxWidth: 300 }}>
                                {row.message || 'General Enquiry'}
                            </Typography>
                        )
                    },
                    {
                        headerName: 'Status',
                        field: 'status',
                        render: (row) => <StatusBadge status={row.status || 'New'} />
                    },
                    {
                        headerName: 'Actions',
                        align: 'center',
                        render: (row) => (
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="View & Follow Up">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenDrawer(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Enquiry">
                                    <IconButton size="small" color="error" onClick={() => { setItemToDelete(row._id); setDeleteModalOpen(true); }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )
                    }
                ]}
                rows={filteredEnquiries}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredEnquiries.length}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                emptyTitle="No Enquiries Found"
                emptySubtitle="No web enquiry or lead matches your search criteria."
            />

            {/* Detail & Follow-up Drawer */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480 },
                        p: 3,
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                {selectedEnquiry && (
                    <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h3" sx={{ color: textColor, fontWeight: 800 }}>
                                Enquiry Details & Log
                            </Typography>
                            <IconButton onClick={() => setOpenDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                        <Stack spacing={2}>
                            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: surfaceBgColor }}>
                                <Typography variant="subtitle2" sx={{ color: subTextColor }}>Customer Name</Typography>
                                <Typography variant="h4" sx={{ color: textColor, fontWeight: 700 }}>{selectedEnquiry.name}</Typography>
                                
                                <Typography variant="subtitle2" sx={{ color: subTextColor, mt: 1.5 }}>Email & Phone</Typography>
                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>{selectedEnquiry.email} • {selectedEnquiry.phone}</Typography>

                                <Typography variant="subtitle2" sx={{ color: subTextColor, mt: 1.5 }}>Original Message</Typography>
                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 500, mt: 0.5 }}>"{selectedEnquiry.message}"</Typography>
                            </Box>

                            <Typography variant="h4" sx={{ color: textColor, fontWeight: 800, mt: 2 }}>
                                Update Status & Follow-up
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                            >
                                <MenuItem value="New">New</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Resolved">Resolved</MenuItem>
                            </TextField>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Add Follow-up Note"
                                value={followUpNote}
                                onChange={(e) => setFollowUpNote(e.target.value)}
                                placeholder="Enter details about phone call or customer response..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                onClick={handleAddFollowUp}
                                disabled={submitting}
                                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                            >
                                {submitting ? 'Updating...' : 'Save Follow-up Note'}
                            </Button>

                            {selectedEnquiry.followUps && selectedEnquiry.followUps.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
                                        Follow-up History ({selectedEnquiry.followUps.length})
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {selectedEnquiry.followUps.map((f, i) => (
                                            <Paper key={i} sx={{ p: 1.5, borderRadius: '8px', backgroundColor: surfaceBgColor }}>
                                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>{f.note}</Typography>
                                                <Typography variant="caption" sx={{ color: subTextColor }}>{new Date(f.date).toLocaleString()}</Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    </>
                )}
            </Drawer>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>Remove Enquiry?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to delete this enquiry record?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: '8px', fontWeight: 700 }}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EnquiryManagement;
