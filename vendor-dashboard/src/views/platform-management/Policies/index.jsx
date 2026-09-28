import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { 
    Grid, Typography, Button, Stack, Box, TextField, CircularProgress, 
    Alert, IconButton, Divider, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip, LinearProgress,
    InputAdornment, TablePagination, Tabs, Tab, Avatar, Card, CardContent
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import { gridSpacing } from 'store/constant';
import PasskeyModal from 'ui-component/PasskeyModal';
import api from 'utils/api';

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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArticleIcon from '@mui/icons-material/Article';
import GavelIcon from '@mui/icons-material/Gavel';
import PolicyIcon from '@mui/icons-material/Policy';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import PreviewIcon from '@mui/icons-material/Preview';

const RichTextEditor = ({ editorRef, placeholder, initialValue }) => {
    useEffect(() => {
        if (editorRef.current && initialValue) {
            editorRef.current.innerHTML = initialValue;
        }
    }, [initialValue]);

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden', bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                    p: 1.2, 
                    bgcolor: 'grey.50', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}
            >
                <Tooltip title="Bold (Ctrl+B)">
                    <IconButton size="small" onClick={() => document.execCommand('bold', false)} sx={{ borderRadius: '8px' }}>
                        <FormatBoldIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Italic (Ctrl+I)">
                    <IconButton size="small" onClick={() => document.execCommand('italic', false)} sx={{ borderRadius: '8px' }}>
                        <FormatItalicIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Underline (Ctrl+U)">
                    <IconButton size="small" onClick={() => document.execCommand('underline', false)} sx={{ borderRadius: '8px' }}>
                        <FormatUnderlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                <Tooltip title="Bullet List">
                    <IconButton size="small" onClick={() => document.execCommand('insertUnorderedList', false)} sx={{ borderRadius: '8px' }}>
                        <FormatListBulletedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Align Left">
                    <IconButton size="small" onClick={() => document.execCommand('justifyLeft', false)} sx={{ borderRadius: '8px' }}>
                        <FormatAlignLeftIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Align Center">
                    <IconButton size="small" onClick={() => document.execCommand('justifyCenter', false)} sx={{ borderRadius: '8px' }}>
                        <FormatAlignCenterIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
            
            <Box 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                sx={{
                    p: 3,
                    minHeight: '420px',
                    fontSize: '15px',
                    lineHeight: 1.85,
                    outline: 'none',
                    bgcolor: 'background.paper',
                    fontFamily: 'inherit',
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
    const { isUnlocked, unlockedUntil, user } = useSelector((state) => state.auth);
    const editorRef = useRef(null);
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const targetParam = searchParams.get('target');
    
    // UI state
    const [view, setView] = useState('list'); // 'list' or 'edit'
    const [editorTab, setEditorTab] = useState(0); // 0 = Editor, 1 = Preview
    const [previewHtml, setPreviewHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [targetFilter, setTargetFilter] = useState('All'); // 'All' | 'User' | 'Vendor'

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Data state
    const [policies, setPolicies] = useState([]);
    const [currentPolicy, setCurrentPolicy] = useState({
        title: '',
        type: 'Terms & Conditions',
        target: 'User',
        content: ''
    });

    const displayPolicies = policies.filter(policy => {
        let matchesType = true;
        if (typeParam === 'terms-conditions') matchesType = policy.type === 'Terms & Conditions';
        else if (typeParam === 'refund-cancellation') matchesType = policy.type === 'Refund & Cancellation';
        else if (typeParam === 'privacy-policy') matchesType = policy.type === 'Privacy Policy';

        const matchesSearch = 
            policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.content?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTarget = 
            targetFilter === 'All' ? true : policy.target === targetFilter;

        return matchesType && matchesSearch && matchesTarget;
    });

    const policyTypes = ['Terms & Conditions', 'Refund & Cancellation', 'Privacy Policy'];
    const targetTypes = ['User', 'Vendor'];

    useEffect(() => {
        setView('list');
        setViewingPolicy(null);
        if (targetParam === 'Vendor') setTargetFilter('Vendor');
        else if (targetParam === 'User') setTargetFilter('User');
        else setTargetFilter('All');
    }, [typeParam, targetParam]);

    const fetchPolicies = async () => {
        if (!user) return;
        setFetching(true);
        try {
            const url = user.role === 'Admin' ? '/policies' : `/policies?vendorId=${user.id}`;
            const response = await api.get(url);
            if (response.success) {
                setPolicies(response.data || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Failed to load policies.' });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPolicies();
        }
    }, [user]);

    const handleBackToList = () => {
        setView('list');
        setCurrentPolicy({ title: '', type: 'Terms & Conditions', target: 'User', content: '' });
        setMessage({ type: '', text: '' });
        setEditorTab(0);
    };

    const handleAddNew = () => {
        let defaultType = 'Terms & Conditions';
        if (typeParam === 'refund-cancellation') defaultType = 'Refund & Cancellation';
        if (typeParam === 'privacy-policy') defaultType = 'Privacy Policy';
        setCurrentPolicy({ title: '', type: defaultType, target: 'User', content: '' });
        setView('edit');
        setEditorTab(0);
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
        setEditorTab(0);
    };

    const handleView = (policy) => {
        setViewingPolicy(policy);
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/policies/${itemToDelete}`);
            setMessage({ type: 'success', text: 'Policy deleted successfully.' });
            fetchPolicies();
            setDeleteModalOpen(false);
            setItemToDelete(null);
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
            const endpoint = currentPolicy._id ? `/policies/${currentPolicy._id}` : '/policies';
            const method = currentPolicy._id ? 'put' : 'post';
            
            const result = await api[method](endpoint, {
                ...currentPolicy,
                content: finalContent
            });
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Policy saved successfully!' });
                fetchPolicies();
                setTimeout(() => setView('list'), 1200);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save policy.' });
        } finally {
            setLoading(false);
        }
    };

    const termsCount = policies.filter(p => p.type === 'Terms & Conditions').length;
    const refundCount = policies.filter(p => p.type === 'Refund & Cancellation').length;
    const privacyCount = policies.filter(p => p.type === 'Privacy Policy').length;

    const paginatedPolicies = displayPolicies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Edit View Studio
    if (view === 'edit') {
        return (
            <Grid container spacing={gridSpacing}>
                {/* Editor Header Bar */}
                <Grid size={12}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton onClick={handleBackToList} color="secondary" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h2" fontWeight="700">{currentPolicy._id ? 'Edit Policy Document' : 'Create New Policy Document'}</Typography>
                                    <Chip label={currentPolicy._id ? 'Revision' : 'Draft'} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Draft legal terms, refund guidelines, and platform privacy rules
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" color="inherit" onClick={handleBackToList} disabled={loading}>
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{
                                    borderRadius: '10px',
                                    px: 3,
                                    boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                                    fontWeight: 700
                                }}
                            >
                                {loading ? 'Saving...' : 'Publish Policy'}
                            </Button>
                        </Stack>
                    </Stack>
                </Grid>

                {message.text && (
                    <Grid size={12}>
                        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                            {message.text}
                        </Alert>
                    </Grid>
                )}

                {/* Policy Metadata Card */}
                <Grid size={12}>
                    <MainCard title="1. Policy Metadata & Document Info">
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Policy Category *"
                                    value={currentPolicy.type}
                                    onChange={(e) => setCurrentPolicy({...currentPolicy, type: e.target.value})}
                                    SelectProps={{ native: true }}
                                >
                                    {policyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Target Audience *"
                                    value={currentPolicy.target}
                                    onChange={(e) => setCurrentPolicy({...currentPolicy, target: e.target.value})}
                                    SelectProps={{ native: true }}
                                >
                                    {targetTypes.map((t) => <option key={t} value={t}>{t} Audience</option>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Document Title *"
                                    value={currentPolicy.title}
                                    onChange={(e) => setCurrentPolicy({...currentPolicy, title: e.target.value})}
                                    placeholder="e.g. Platform Terms of Service 2026"
                                />
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>

                {/* Editor Content Studio */}
                <Grid size={12}>
                    <MainCard
                        title={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h4" fontWeight="bold">2. Document Content & Rules</Typography>
                                <Tabs
                                    value={editorTab}
                                    onChange={(e, val) => {
                                        if (val === 1 && editorRef.current) {
                                            setPreviewHtml(editorRef.current.innerHTML);
                                        }
                                        setEditorTab(val);
                                    }}
                                    textColor="secondary"
                                    indicatorColor="secondary"
                                    size="small"
                                >
                                    <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="WYSIWYG Editor" sx={{ fontWeight: 600 }} />
                                    <Tab icon={<PreviewIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Live Web Preview" sx={{ fontWeight: 600 }} />
                                </Tabs>
                            </Box>
                        }
                    >
                        {editorTab === 0 ? (
                            <RichTextEditor 
                                editorRef={editorRef} 
                                initialValue={currentPolicy.content}
                                placeholder="Write your legal policy guidelines, terms, or cancellation rules here..." 
                            />
                        ) : (
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: '16px', bgcolor: 'background.paper', minHeight: 420 }}>
                                <Typography variant="h2" fontWeight="bold" gutterBottom>{currentPolicy.title || 'Untitled Policy'}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                    <Chip label={currentPolicy.type} size="small" color="secondary" />
                                    <Chip label={`Target: ${currentPolicy.target}`} size="small" variant="outlined" />
                                </Stack>
                                <Divider sx={{ mb: 3 }} />
                                <Box 
                                    dangerouslySetInnerHTML={{ __html: previewHtml || editorRef.current?.innerHTML || '<i>No content entered yet.</i>' }}
                                    sx={{ lineHeight: 1.85, '& p': { mb: 2 } }}
                                />
                            </Paper>
                        )}
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

    let pageTitle = 'Platform Policies Studio';
    if (typeParam === 'terms-conditions') pageTitle = targetParam === 'Vendor' ? 'Vendor Terms of Service (Admin Policy)' : 'Terms & Conditions Policies';
    else if (typeParam === 'refund-cancellation') pageTitle = 'Refund & Cancellation Policies';
    else if (typeParam === 'privacy-policy') pageTitle = targetParam === 'Vendor' ? 'Vendor Privacy Policy (Admin Policy)' : 'Privacy Policy Documents';
    else if (targetParam === 'Vendor') pageTitle = 'Admin Created Vendor Partner Policies';

    return (
        <Grid container spacing={gridSpacing}>
            {/* Top Header */}
            <Grid size={12}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <HistoryEduIcon color="secondary" />
                            <Typography variant="h2" fontWeight="700">{pageTitle}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage legal documentation, refund rules, and terms of service across the agency network
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                        sx={{
                            borderRadius: '10px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Create New Policy
                    </Button>
                </Stack>
            </Grid>

            {/* Quick Summary Widgets */}
            <Grid size={12}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={termsCount} 
                            label="Terms & Conditions" 
                            icon={<GavelIcon />} 
                            variant="dark" 
                            colorScheme="primary" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={refundCount} 
                            label="Refund & Cancellation" 
                            icon={<PolicyIcon />} 
                            variant="light" 
                            colorScheme="warning" 
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard 
                            count={privacyCount} 
                            label="Privacy Policies" 
                            icon={<SecurityIcon />} 
                            variant="light" 
                            colorScheme="success" 
                        />
                    </Grid>
                </Grid>
            </Grid>

            {message.text && (
                <Grid size={12}>
                    <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                </Grid>
            )}

            {/* Filter Toolbar */}
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
                        placeholder="Search policy documents by title, type, or rules..."
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
                        {['All', 'User', 'Vendor'].map((tgt) => (
                            <Chip
                                key={tgt}
                                label={tgt === 'All' ? 'All Audiences' : `${tgt} Audience`}
                                onClick={() => { setTargetFilter(tgt); setPage(0); }}
                                color={targetFilter === tgt ? 'secondary' : 'default'}
                                variant={targetFilter === tgt ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Grid>

            {/* Table View */}
            <Grid size={12}>
                <MainCard content={false}>
                    {fetching && <LinearProgress sx={{ mb: 0 }} />}
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }}>Policy Title</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Audience</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                    <TableCell align="center" sx={{ pr: 3 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetching && displayPolicies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <Typography variant="body2" sx={{ mt: 1 }}>Fetching policy documents...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedPolicies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <ArticleIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                                            <Typography variant="h4" fontWeight="bold">No Policies Found</Typography>
                                            <Typography variant="body2" color="text.secondary">No policy document matches your search criteria. Click Create New Policy to start.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPolicies.map((row) => (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Typography variant="subtitle1" fontWeight="700">{row.title}</Typography>
                                                {row.isGlobal && (
                                                    <Chip label="Global Platform Policy" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', mt: 0.5, fontWeight: 700 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="600">{row.type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.target} 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color={row.target === 'User' ? 'info' : 'warning'}
                                                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
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
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Tooltip title="View Document">
                                                        <IconButton size="small" onClick={() => handleView(row)} color="info">
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Document">
                                                        <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Document">
                                                        <IconButton size="small" onClick={() => handleDeleteClick(row._id)} color="error">
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

            {/* Pagination */}
            {!fetching && displayPolicies.length > 0 && (
                <Grid size={12}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={displayPolicies.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        />
                    </Paper>
                </Grid>
            )}

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
                                    <Typography variant="h3" fontWeight="bold">{viewingPolicy.title}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={viewingPolicy.type} size="small" color="secondary" />
                                        <Chip label={`Target: ${viewingPolicy.target}`} size="small" variant="outlined" />
                                    </Stack>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Last Updated: {new Date(viewingPolicy.updatedAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <Divider />
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Box 
                                className="policy-content"
                                dangerouslySetInnerHTML={{ __html: viewingPolicy.content }} 
                                sx={{ 
                                    lineHeight: 1.85,
                                    fontSize: '15px',
                                    '& p': { mb: 2 },
                                    '& ul, & ol': { pl: 3, mb: 2 }
                                }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setViewingPolicy(null)}>Close</Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    handleEdit(viewingPolicy);
                                    setViewingPolicy(null);
                                }}
                                sx={{ borderRadius: '8px', px: 3, fontWeight: 700 }}
                            >
                                Edit Policy Document
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <DialogTitle variant="h4" fontWeight="bold">Delete Policy Document</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Are you sure you want to delete this policy document? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Policy
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default PoliciesManagement;
