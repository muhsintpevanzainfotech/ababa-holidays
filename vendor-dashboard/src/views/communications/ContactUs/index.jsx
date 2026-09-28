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
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MailIcon from '@mui/icons-material/Mail';
import ClearIcon from '@mui/icons-material/Clear';

const ContactUsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Unread' | 'Read' | 'Replied'
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

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/contact-us/${itemToDelete}`);
            fetchMessages();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert(error.message || 'Failed to delete message');
        }
    };

    const handleOpenDrawer = async (item) => {
        setSelectedMessage(item);
        setReplyText(item.replyMessage || '');
        setOpenDrawer(true);

        // Mark as read if not already read
        if (!item.isRead) {
            try {
                await api.put(`/contact-us/${item._id}`, { isRead: true });
                setMessages(prev => prev.map(m => m._id === item._id ? { ...m, isRead: true } : m));
            } catch (e) {
                // silence error
            }
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        setSubmitting(true);
        try {
            await api.put(`/contact-us/${selectedMessage._id}`, {
                replyMessage: replyText,
                isReplied: true,
                isRead: true
            });
            alert(`Reply note recorded for ${selectedMessage.email}.`);
            setOpenDrawer(false);
            fetchMessages();
        } catch (error) {
            alert(error.message || 'Failed to record reply');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch = 
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.message?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'All' ? true :
            statusFilter === 'Unread' ? !m.isRead :
            statusFilter === 'Read' ? m.isRead : m.isReplied;

        return matchesSearch && matchesStatus;
    });

    const unreadCount = messages.filter(m => !m.isRead).length;
    const readCount = messages.filter(m => m.isRead).length;

    const paginatedMessages = filteredMessages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Grid container spacing={gridSpacing}>
            {/* Header */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Typography variant="h2" fontWeight="700">Contact Messages</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            General inquiries and feedback messages from website visitors
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            {/* Quick Stats Summary */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={messages.length} 
                            label="Total Messages" 
                            icon={<MailIcon />} 
                            variant="dark" 
                            colorScheme="primary"
                            onClick={() => { setStatusFilter('All'); setPage(0); }}
                            active={statusFilter === 'All'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={unreadCount} 
                            label="Unread Messages" 
                            icon={<MarkEmailUnreadIcon />} 
                            variant="light" 
                            colorScheme="error"
                            onClick={() => { setStatusFilter('Unread'); setPage(0); }}
                            active={statusFilter === 'Unread'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={readCount} 
                            label="Read / Processed" 
                            icon={<MarkEmailReadIcon />} 
                            variant="light" 
                            colorScheme="success"
                            onClick={() => { setStatusFilter('Read'); setPage(0); }}
                            active={statusFilter === 'Read'}
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
                        placeholder="Search contact messages by name, email, or subject..."
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
                        {['All', 'Unread', 'Read'].map((st) => (
                            <Chip
                                key={st}
                                label={st === 'All' ? `All (${messages.length})` : st === 'Unread' ? `Unread (${unreadCount})` : `Read (${readCount})`}
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

            {/* Messages Table */}
            {!loading && (
                <Grid size={12}>
                    <MainCard content={false}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Date & Time</TableCell>
                                        <TableCell>Sender</TableCell>
                                        <TableCell>Subject / Message Preview</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedMessages.map((row) => (
                                        <TableRow key={row._id} hover sx={{ bgcolor: row.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.03)' }}>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Typography variant="body2" fontWeight="600">{new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="subtitle1" sx={{ fontWeight: row.isRead ? 600 : 800 }}>{row.name}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EmailIcon sx={{ fontSize: 13 }} /> {row.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 300 }}>
                                                <Typography variant="body2" fontWeight={row.isRead ? 500 : 700} noWrap title={row.subject}>{row.subject}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                                    {row.message}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.isRead ? 'Read' : 'Unread'} 
                                                    size="small" 
                                                    color={row.isRead ? 'default' : 'error'} 
                                                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="View & Reply">
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
                                    {paginatedMessages.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <MailIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="h4" fontWeight="bold">No Contact Messages</Typography>
                                                <Typography variant="body2" color="text.secondary">No message matches your filter criteria.</Typography>
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
            {!loading && filteredMessages.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={filteredMessages.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </Paper>
                </Grid>
            )}

            {/* Right-Side Drawer Message Details & Response Form */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                sx={{ zIndex: 1400 }}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 540, md: 620 }, p: 0, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 36px rgba(0,0,0,0.25)' }
                }}
            >
                {selectedMessage && (
                    <>
                        <Box sx={{ p: 2.5, bgcolor: 'secondary.main', color: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h4" color="inherit" fontWeight="bold">
                                    Contact Message Details
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                                    Received on {new Date(selectedMessage.createdAt).toLocaleString()}
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
                                {/* Sender Info */}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: 'grey.50' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 'bold' }}>
                                            {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">{selectedMessage.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EmailIcon fontSize="small" color="action" /> {selectedMessage.email}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                {/* Message Subject & Content */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">Message Subject</Typography>
                                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>
                                        {selectedMessage.subject}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">Body Content</Typography>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px', bgcolor: 'background.paper', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                        {selectedMessage.message}
                                    </Paper>
                                </Box>

                                <Divider />

                                {/* Reply Section */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Record Reply Note / Response</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        placeholder="Type your response email note or internal reply log..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
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
                                onClick={handleSendReply} 
                                disabled={submitting} 
                                sx={{ borderRadius: '8px', px: 2.5, fontWeight: 700 }}
                            >
                                {submitting ? 'Saving...' : 'Save Reply Note'}
                            </Button>
                        </Box>
                    </>
                )}
            </Drawer>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Message</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this contact message? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Message
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default ContactUsManagement;
