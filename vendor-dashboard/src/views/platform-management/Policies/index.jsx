import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
    Grid, Typography, Button, Stack, Box, TextField, CircularProgress, 
    Alert, IconButton, Divider, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import PasskeyModal from 'ui-component/PasskeyModal';

// assets
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';

const RichTextEditor = ({ editorRef, placeholder, initialValue }) => {
    useEffect(() => {
        if (editorRef.current && initialValue) {
            editorRef.current.innerHTML = initialValue;
        }
    }, [initialValue]);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
            <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                    p: 1, 
                    bgcolor: 'grey.50', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    flexWrap: 'wrap' 
                }}
            >
                <IconButton size="small" onClick={() => document.execCommand('bold', false)}><FormatBoldIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('italic', false)}><FormatItalicIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('underline', false)}><FormatUnderlinedIcon fontSize="small" /></IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton size="small" onClick={() => document.execCommand('insertUnorderedList', false)}><FormatListBulletedIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('justifyLeft', false)}><FormatAlignLeftIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('justifyCenter', false)}><FormatAlignCenterIcon fontSize="small" /></IconButton>
            </Stack>
            
            <Box 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                sx={{
                    p: 3,
                    minHeight: '400px',
                    fontSize: '15px',
                    lineHeight: 1.8,
                    outline: 'none',
                    bgcolor: 'background.paper',
                    '&:empty:before': {
                        content: `"${placeholder}"`,
                        color: 'text.disabled',
                    }
                }}
            />
        </Box>
    );
};

const PoliciesManagement = () => {
    const { token, isUnlocked, unlockedUntil, user } = useSelector((state) => state.auth);
    const editorRef = useRef(null);
    
    // UI state
    const [view, setView] = useState('list'); // 'list' or 'edit'
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data state
    const [policies, setPolicies] = useState([]);
    const [currentPolicy, setCurrentPolicy] = useState({
        title: '',
        type: 'Terms & Conditions',
        target: 'User',
        content: ''
    });

    const policyTypes = ['Terms & Conditions', 'Refund & Cancellation', 'Privacy Policy'];
    const targetTypes = ['User', 'Vendor'];

    const fetchPolicies = async () => {
        setFetching(true);
        try {
            // Vendors see only their policies, Admin sees all
            const url = user.role === 'Admin' 
                ? `${import.meta.env.VITE_APP_API_URL}/policies` 
                : `${import.meta.env.VITE_APP_API_URL}/policies?vendorId=${user.id}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setPolicies(result.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Failed to load policies.' });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (token) fetchPolicies();
    }, [token]);

    const handleBackToList = () => {
        setView('list');
        setCurrentPolicy({ title: '', type: 'Terms & Conditions', target: 'User', content: '' });
        setMessage({ type: '', text: '' });
    };

    const handleAddNew = () => {
        setCurrentPolicy({ title: '', type: 'Terms & Conditions', target: 'User', content: '' });
        setView('edit');
    };

    const handleEdit = (policy) => {
        setCurrentPolicy({
            _id: policy._id,
            title: policy.title,
            type: policy.type,
            target: policy.target,
            content: policy.content
        });
        setView('edit');
    };

    const handleView = (policy) => {
        setViewingPolicy(policy);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;
        
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/policies/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Policy deleted successfully.' });
                fetchPolicies();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete policy.' });
        }
    };

    const handleSave = async () => {
        const isSessionValid = isUnlocked && unlockedUntil && new Date() < new Date(unlockedUntil);
        if (!isSessionValid) {
            setShowPasskeyModal(true);
            return;
        }

        const finalContent = editorRef.current ? editorRef.current.innerHTML : currentPolicy.content;
        if (!currentPolicy.title || !finalContent || finalContent === '<br>') {
            setMessage({ type: 'error', text: 'Title and content are required.' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...currentPolicy,
                    content: finalContent
                })
            });
            const result = await response.json();
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Policy saved successfully!' });
                fetchPolicies();
                setTimeout(() => setView('list'), 1500);
            } else {
                throw new Error(result.message || 'Save failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save policy.' });
        } finally {
            setLoading(false);
        }
    };

    if (view === 'edit') {
        return (
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton onClick={handleBackToList} color="secondary">
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h3">{currentPolicy._id ? 'Edit Policy' : 'Add New Policy'}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Define terms for your travelers and agents.
                                </Typography>
                            </Box>
                        </Stack>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Policy'}
                        </Button>
                    </Stack>
                </Grid>

                {message.text && (
                    <Grid item xs={12}>
                        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                            {message.text}
                        </Alert>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <MainCard>
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Policy Type"
                                        value={currentPolicy.type}
                                        onChange={(e) => setCurrentPolicy({...currentPolicy, type: e.target.value})}
                                        SelectProps={{ native: true }}
                                    >
                                        {policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Target Audience"
                                        value={currentPolicy.target}
                                        onChange={(e) => setCurrentPolicy({...currentPolicy, target: e.target.value})}
                                        SelectProps={{ native: true }}
                                    >
                                        {targetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Document Title"
                                        value={currentPolicy.title}
                                        onChange={(e) => setCurrentPolicy({...currentPolicy, title: e.target.value})}
                                        placeholder="e.g. Booking Terms & Conditions"
                                    />
                                </Grid>
                            </Grid>

                            <RichTextEditor 
                                editorRef={editorRef} 
                                initialValue={currentPolicy.content}
                                placeholder="Enter your detailed policy content here..." 
                            />
                        </Stack>
                    </MainCard>
                </Grid>
                <PasskeyModal 
                    isOpen={showPasskeyModal}
                    onClose={() => setShowPasskeyModal(false)}
                    onVerified={() => {
                        setShowPasskeyModal(false);
                        handleSave();
                    }}
                    title="Authenticate Policy Revision"
                />
            </Grid>
        );
    }

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <HistoryEduIcon color="secondary" />
                            <Typography variant="h3">Platform Policies</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Manage all legal documents and user agreements.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                    >
                        Create New Policy
                    </Button>
                </Stack>
            </Grid>

            {message.text && (
                <Grid item xs={12}>
                    <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Policy Title</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Audience</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetching ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <CircularProgress size={30} color="secondary" />
                                            <Typography variant="body2" sx={{ mt: 1 }}>Fetching policies...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : policies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <Typography variant="body1" color="text.secondary">No policies found. Click Create New Policy to start.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    policies.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle1" fontWeight="600">{row.title}</Typography>
                                                {row.isGlobal && (
                                                    <Chip label="Global" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.target} 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color={row.target === 'User' ? 'info' : 'warning'}
                                                    sx={{ borderRadius: '4px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {new Date(row.updatedAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(row.updatedAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="View Content">
                                                        <IconButton size="small" onClick={() => handleView(row)} color="info">
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Policy">
                                                        <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDelete(row._id)} color="error">
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>

            {/* View Policy Modal */}
            <Dialog 
                open={Boolean(viewingPolicy)} 
                onClose={() => setViewingPolicy(null)}
                maxWidth="md"
                fullWidth
            >
                {viewingPolicy && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h3">{viewingPolicy.title}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={viewingPolicy.type} size="small" variant="outlined" />
                                        <Chip label={`Target: ${viewingPolicy.target}`} size="small" variant="outlined" />
                                    </Stack>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated: {new Date(viewingPolicy.updatedAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <Box 
                                className="policy-content"
                                dangerouslySetInnerHTML={{ __html: viewingPolicy.content }} 
                                sx={{ 
                                    lineHeight: 1.8,
                                    '& p': { mb: 2 },
                                    '& ul, & ol': { pl: 3, mb: 2 }
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewingPolicy(null)}>Close</Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    handleEdit(viewingPolicy);
                                    setViewingPolicy(null);
                                }}
                            >
                                Edit This Policy
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Grid>
    );
};

export default PoliciesManagement;
