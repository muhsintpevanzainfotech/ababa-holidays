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
    Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';

const ContactUsManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contact-us');
            if (response.success) {
                setMessages(response.data);
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

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            try {
                await api.delete(`/contact-us/${id}`);
                fetchMessages();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredMessages = messages.filter(m => 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Contact Messages</Typography>
                        <Typography variant="caption" color="text.secondary">General inquiries and messages from the website</Typography>
                    </Box>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard 
                    title={
                        <TextField
                            placeholder="Search messages..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: { xs: '100%', sm: 300 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    }
                >
                    {loading && <LinearProgress sx={{ mb: 2 }} />}
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
                                {filteredMessages.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>
                                            <Typography variant="body2">{new Date(row.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
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
                                                label={row.isRead ? 'Read' : 'Unread'} 
                                                size="small" 
                                                color={row.isRead ? 'default' : 'error'} 
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <Tooltip title="View Message">
                                                    <IconButton size="small" color="secondary"><VisibilityIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                                 <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}><DeleteIcon fontSize="small" /></IconButton>
                                                 </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredMessages.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            No messages found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default ContactUsManagement;
