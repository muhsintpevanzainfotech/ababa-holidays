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
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MailIcon from '@mui/icons-material/Mail';
import SendIcon from '@mui/icons-material/Send';
import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const ContactUsManagement = () => {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ contactUsEnabled: false, contactUsLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

            const response = await api.get('/contact-us');
            if (response.success) {
                setMessages(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch contact messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const contactUsLimit = subscription?.contactUsLimit !== undefined ? subscription.contactUsLimit : -1;
    const isContactAllowed = subscription ? (subscription?.contactUsEnabled !== false && contactUsLimit !== 0) : true;

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/contact-us/${itemToDelete}`);
            fetchMessages();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleOpenDrawer = (item) => {
        setSelectedMessage(item);
        setReplyText('');
        setOpenDrawer(true);
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText) return;
        setSubmitting(true);
        try {
            const response = await api.put(`/contact-us/${selectedMessage._id}`, {
                replyText,
                status: 'Replied'
            });
            if (response.success) {
                setReplyText('');
                setSelectedMessage(response.data);
                fetchMessages();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMessages = messages
        .filter((m) => {
            const matchesSearch =
                m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.message?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const unreadCount = messages.filter(m => m.status === 'Unread' || !m.status).length;
    const readCount = messages.filter(m => m.status === 'Read').length;
    const repliedCount = messages.filter(m => m.status === 'Replied').length;

    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#090d16' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    if (!loading && !isContactAllowed) {
        return (
            <Box>
                <SaasHeader title="Contact Us Messages" subtitle="Manage customer support emails and inbox." />
                <SubscriptionRestrictedCard featureName="Contact Us Inbox" reason={contactUsLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            <SaasHeader
                title="Contact Us Messages"
                subtitle="Manage direct customer support emails and contact form submissions."
            />
            {/* Stat Cards */}
            <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={unreadCount}
                        label="Unread Messages"
                        icon={<MarkEmailUnreadIcon />}
                        colorScheme="error"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={readCount}
                        label="Read Messages"
                        icon={<MarkEmailReadIcon />}
                        colorScheme="warning"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        count={repliedCount}
                        label="Replied Messages"
                        icon={<MailIcon />}
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
                    placeholder="Search messages by sender, email, subject..."
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
                        <MenuItem value="All">All Messages</MenuItem>
                        <MenuItem value="Unread">Unread Only</MenuItem>
                        <MenuItem value="Read">Read</MenuItem>
                        <MenuItem value="Replied">Replied</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {/* Data Table */}
            <DataTable
                columns={[
                    {
                        headerName: 'Sender',
                        field: 'name',
                        render: (row) => (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, fontWeight: 700 }}>
                                    {row.name ? row.name.charAt(0).toUpperCase() : 'M'}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>
                                        {row.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: subTextColor }}>
                                        {row.email}
                                    </Typography>
                                </Box>
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Subject',
                        field: 'subject',
                        render: (row) => (
                            <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>
                                {row.subject || 'No Subject'}
                            </Typography>
                        )
                    },
                    {
                        headerName: 'Message Excerpt',
                        field: 'message',
                        render: (row) => (
                            <Typography variant="body2" sx={{ color: subTextColor, lineClamp: 2, maxWidth: 300 }}>
                                {row.message}
                            </Typography>
                        )
                    },
                    {
                        headerName: 'Status',
                        field: 'status',
                        render: (row) => <StatusBadge status={row.status || 'Unread'} />
                    },
                    {
                        headerName: 'Actions',
                        align: 'center',
                        render: (row) => (
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <IconButton size="small" color="primary" onClick={() => handleOpenDrawer(row)}>
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => { setItemToDelete(row._id); setDeleteModalOpen(true); }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        )
                    }
                ]}
                rows={filteredMessages}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredMessages.length}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                emptyTitle="No Messages Found"
                emptySubtitle="No contact message matches your search criteria."
            />

            {/* Message Detail & Reply Drawer */}
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
                {selectedMessage && (
                    <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h3" sx={{ color: textColor, fontWeight: 800 }}>
                                Message Details
                            </Typography>
                            <IconButton onClick={() => setOpenDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ mb: 3, borderColor: borderLineColor }} />

                        <Stack spacing={2.5}>
                            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: surfaceBgColor }}>
                                <Typography variant="subtitle2" sx={{ color: subTextColor }}>Sender</Typography>
                                <Typography variant="h4" sx={{ color: textColor, fontWeight: 700 }}>{selectedMessage.name}</Typography>
                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 600 }}>{selectedMessage.email}</Typography>

                                <Typography variant="subtitle2" sx={{ color: subTextColor, mt: 2 }}>Subject</Typography>
                                <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>{selectedMessage.subject || 'N/A'}</Typography>

                                <Typography variant="subtitle2" sx={{ color: subTextColor, mt: 2 }}>Message Body</Typography>
                                <Typography variant="body2" sx={{ color: textColor, fontWeight: 500, mt: 0.5 }}>"{selectedMessage.message}"</Typography>
                            </Box>

                            <Typography variant="h4" sx={{ color: textColor, fontWeight: 800, mt: 1 }}>
                                Send Response Email
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                label="Reply Message"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write response to be emailed back to the customer..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: surfaceBgColor } }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                onClick={handleSendReply}
                                disabled={submitting}
                                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 700 }}
                            >
                                {submitting ? 'Sending...' : 'Send Reply'}
                            </Button>
                        </Stack>
                    </>
                )}
            </Drawer>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>Delete Message?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to delete this message record?
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

export default ContactUsManagement;
