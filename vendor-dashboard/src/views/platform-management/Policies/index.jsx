import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { 
    Grid, Typography, Button, Stack, Box, TextField, CircularProgress, 
    Alert, IconButton, Divider, Paper, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip,
    InputAdornment, Tabs, Tab, Avatar, MenuItem, Snackbar, FormHelperText
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import DataTable from 'ui-component/extended/DataTable';
import StatusBadge from 'ui-component/extended/StatusBadge';
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
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import TitleIcon from '@mui/icons-material/Title';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GavelIcon from '@mui/icons-material/Gavel';
import PolicyIcon from '@mui/icons-material/Policy';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import PreviewIcon from '@mui/icons-material/Preview';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command, val = null) => {
        document.execCommand(command, false, val);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

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
                    <IconButton size="small" onClick={() => execCmd('bold')} sx={{ borderRadius: '8px' }}>
                        <FormatBoldIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Italic (Ctrl+I)">
                    <IconButton size="small" onClick={() => execCmd('italic')} sx={{ borderRadius: '8px' }}>
                        <FormatItalicIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Underline (Ctrl+U)">
                    <IconButton size="small" onClick={() => execCmd('underline')} sx={{ borderRadius: '8px' }}>
                        <FormatUnderlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                <Tooltip title="Bullet List">
                    <IconButton size="small" onClick={() => execCmd('insertUnorderedList')} sx={{ borderRadius: '8px' }}>
                        <FormatListBulletedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Numbered List">
                    <IconButton size="small" onClick={() => execCmd('insertOrderedList')} sx={{ borderRadius: '8px' }}>
                        <FormatListNumberedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
                <Tooltip title="Heading 2">
                    <IconButton size="small" onClick={() => execCmd('formatBlock', '<h2>')} sx={{ borderRadius: '8px' }}>
                        <TitleIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Align Left">
                    <IconButton size="small" onClick={() => execCmd('justifyLeft')} sx={{ borderRadius: '8px' }}>
                        <FormatAlignLeftIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Align Center">
                    <IconButton size="small" onClick={() => execCmd('justifyCenter')} sx={{ borderRadius: '8px' }}>
                        <FormatAlignCenterIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Align Right">
                    <IconButton size="small" onClick={() => execCmd('justifyRight')} sx={{ borderRadius: '8px' }}>
                        <FormatAlignRightIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Clear Formatting">
                    <IconButton size="small" onClick={() => execCmd('removeFormat')} sx={{ borderRadius: '8px' }}>
                        <FormatClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
            
            <Box 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleInput}
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

// Formik & Yup Validation Schema
const policyValidationSchema = Yup.object().shape({
    title: Yup.string()
        .trim()
        .required('Document Title is required')
        .min(3, 'Title must be at least 3 characters'),
    type: Yup.string()
        .required('Policy Category is required')
        .oneOf(['Terms & Conditions', 'Refund & Cancellation', 'Privacy Policy'], 'Select a valid policy category'),
    target: Yup.string()
        .required('Target Audience is required')
        .oneOf(['User', 'Vendor'], 'Select a valid audience'),
    content: Yup.string()
        .trim()
        .required('Document Content is required')
        .test('not-empty-html', 'Document content cannot be empty', (val) => {
            if (!val) return false;
            const stripped = val.replace(/<[^>]*>/g, '').trim();
            return stripped.length > 0;
        })
});

const PoliciesManagement = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';
    const { isUnlocked, unlockedUntil, user } = useSelector((state) => state.auth);
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const targetParam = searchParams.get('target');

    const textColor = isDarkMode ? '#f9fafb' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    // UI state
    const [view, setView] = useState('list'); // 'list' or 'edit'
    const [editorTab, setEditorTab] = useState(0); // 0 = Editor, 1 = Preview
    const [fetching, setFetching] = useState(true);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [viewingPolicy, setViewingPolicy] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [targetFilter, setTargetFilter] = useState('All'); // 'All' | 'User' | 'Vendor'

    // Toast Alert State
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    // Subscription Plan Modal State
    const [subPlanModalOpen, setSubPlanModalOpen] = useState(false);

    // Editing ID
    const [editingPolicyId, setEditingPolicyId] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Data state
    const [policies, setPolicies] = useState([]);

    const isAdmin = user?.role === 'Admin';
    const isVendorStaff = user && (user.role === 'Vendor-Staff' || user.role === 'vendor-staff');
    const policyTypes = ['Terms & Conditions', 'Refund & Cancellation', 'Privacy Policy'];
    const targetTypes = isAdmin ? ['User', 'Vendor'] : ['User'];

    const handleErrorMessage = (errorMsg) => {
        const message = typeof errorMsg === 'string' ? errorMsg : errorMsg?.message || 'Something went wrong';
        if (
            message.toLowerCase().includes('subcription plan') ||
            message.toLowerCase().includes('subscription plan') ||
            message.toLowerCase().includes('does not support policies') ||
            message.toLowerCase().includes('limit reached')
        ) {
            setSubPlanModalOpen(true);
        } else {
            setToast({
                open: true,
                message: message,
                severity: 'error'
            });
        }
    };

    // Formik Form Setup
    const formik = useFormik({
        initialValues: {
            title: '',
            type: 'Terms & Conditions',
            target: 'User',
            content: ''
        },
        validationSchema: policyValidationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            const isSessionValid = isUnlocked && unlockedUntil && new Date() < new Date(unlockedUntil);
            if (!isSessionValid) {
                setShowPasskeyModal(true);
                setSubmitting(false);
                return;
            }
            await executeSave(values);
            setSubmitting(false);
        }
    });

    const executeSave = async (values) => {
        try {
            const endpoint = editingPolicyId ? `/policies/${editingPolicyId}` : '/policies';
            const method = editingPolicyId ? 'put' : 'post';

            const payload = {
                ...values,
                target: isAdmin ? values.target : 'User'
            };

            const result = await api[method](endpoint, payload);

            if (result && (result.success || result._id || result.data)) {
                setToast({
                    open: true,
                    message: editingPolicyId ? 'Policy document updated successfully!' : 'New policy document published!',
                    severity: 'success'
                });
                fetchPolicies();
                setTimeout(() => setView('list'), 1000);
            }
        } catch (error) {
            handleErrorMessage(error);
        }
    };

    // Filter policies for logged-in user role
    const userPolicies = policies.filter(policy => {
        // Hide Platform Admin / Global policies for vendor accounts
        if (!isAdmin) {
            if (policy.isGlobal || !policy.vendor) return false;
        }
        return true;
    });

    const displayPolicies = userPolicies.filter(policy => {
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
            if (response && response.success) {
                setPolicies(response.data || []);
            } else if (Array.isArray(response)) {
                setPolicies(response);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            handleErrorMessage('Failed to load platform policies.');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPolicies();
        }
    }, [user]);

    const canUserEditPolicy = (policy) => {
        if (!policy) return false;
        if (isVendorStaff) return false;
        if (isAdmin) return true;
        if (policy.isGlobal) return false;
        const policyVendorId = typeof policy.vendor === 'object' ? policy.vendor?._id : policy.vendor;
        const currentUserId = user?.id || user?._id;
        return Boolean(policyVendorId && currentUserId && String(policyVendorId) === String(currentUserId));
    };

    const getPolicyCreatorName = (policy) => {
        if (!policy) return 'Platform Admin';
        if (policy.isGlobal || !policy.vendor) {
            return 'Platform Admin';
        }
        
        if (typeof policy.vendor === 'object' && policy.vendor) {
            return policy.vendor.name || policy.vendor.agencyName || policy.vendor.companyName || policy.vendor.contactPerson || user?.name || 'Vendor Agency';
        }
        
        const vendorIdStr = String(policy.vendor);
        const userIdStr = String(user?.id || user?._id || '');
        
        if (vendorIdStr && userIdStr && vendorIdStr === userIdStr && user) {
            return user.name || user.agencyName || user.companyName || 'My Agency';
        }
        
        if (policy.vendorName) return policy.vendorName;
        if (policy.createdBy?.name) return policy.createdBy.name;
        
        return user?.name || user?.agencyName || 'Vendor Agency';
    };

    const handleBackToList = () => {
        setView('list');
        setEditingPolicyId(null);
        formik.resetForm();
        setEditorTab(0);
    };

    const handleAddNew = () => {
        if (isVendorStaff) {
            setToast({
                open: true,
                message: 'Vendor staff accounts have read-only access to Platform Policies.',
                severity: 'error'
            });
            return;
        }

        let defaultType = 'Terms & Conditions';
        if (typeParam === 'refund-cancellation') defaultType = 'Refund & Cancellation';
        if (typeParam === 'privacy-policy') defaultType = 'Privacy Policy';

        setEditingPolicyId(null);
        formik.resetForm({
            values: {
                title: '',
                type: defaultType,
                target: 'User',
                content: ''
            }
        });
        setView('edit');
        setEditorTab(0);
    };

    const handleEdit = (policy) => {
        if (!canUserEditPolicy(policy)) {
            setToast({
                open: true,
                message: 'Admin created global policies are read-only for vendors.',
                severity: 'error'
            });
            return;
        }
        setEditingPolicyId(policy._id);
        formik.resetForm({
            values: {
                title: policy.title || '',
                type: policy.type || 'Terms & Conditions',
                target: isAdmin ? (policy.target || 'User') : 'User',
                content: policy.content || ''
            }
        });
        setView('edit');
        setEditorTab(0);
    };

    const handleView = (policy) => {
        setViewingPolicy(policy);
    };

    const handleDeleteClick = (id) => {
        const targetPolicy = policies.find(p => p._id === id);
        if (targetPolicy && !canUserEditPolicy(targetPolicy)) {
            setToast({
                open: true,
                message: 'Admin created global policies cannot be deleted by vendors.',
                severity: 'error'
            });
            return;
        }
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const targetPolicy = policies.find(p => p._id === itemToDelete);
        if (targetPolicy && !canUserEditPolicy(targetPolicy)) {
            setToast({
                open: true,
                message: 'Admin created global policies cannot be deleted by vendors.',
                severity: 'error'
            });
            setDeleteModalOpen(false);
            setItemToDelete(null);
            return;
        }
        try {
            await api.delete(`/policies/${itemToDelete}`);
            setToast({
                open: true,
                message: 'Policy document deleted successfully.',
                severity: 'success'
            });
            fetchPolicies();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            handleErrorMessage(error);
        }
    };

    const termsCount = userPolicies.filter(p => p.type === 'Terms & Conditions').length;
    const refundCount = userPolicies.filter(p => p.type === 'Refund & Cancellation').length;
    const privacyCount = userPolicies.filter(p => p.type === 'Privacy Policy').length;

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
                                    <Typography variant="h2" fontWeight="700">{editingPolicyId ? 'Edit Policy Document' : 'Create New Policy Document'}</Typography>
                                    <Chip label={editingPolicyId ? 'Revision' : 'Draft'} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Draft legal terms, refund guidelines, and platform privacy rules
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" color="inherit" onClick={handleBackToList} disabled={formik.isSubmitting}>
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={formik.handleSubmit}
                                disabled={formik.isSubmitting}
                                sx={{
                                    borderRadius: '10px',
                                    px: 3,
                                    boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)',
                                    fontWeight: 700
                                }}
                            >
                                {formik.isSubmitting ? 'Saving...' : 'Publish Policy'}
                            </Button>
                        </Stack>
                    </Stack>
                </Grid>

                {/* Policy Metadata Card */}
                <Grid size={12}>
                    <MainCard title="1. Policy Metadata & Document Info">
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Policy Category *"
                                    name="type"
                                    value={formik.values.type}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.type && Boolean(formik.errors.type)}
                                    helperText={formik.touched.type && formik.errors.type}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                sx: {
                                                    borderRadius: '12px',
                                                    mt: 0.5,
                                                    boxShadow: isDarkMode 
                                                        ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                                                        : '0 10px 25px rgba(15, 23, 42, 0.12)'
                                                }
                                            }
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px'
                                        }
                                    }}
                                >
                                    {policyTypes.map((t) => (
                                        <MenuItem key={t} value={t} sx={{ borderRadius: '6px', my: 0.2, mx: 0.5, fontWeight: 600 }}>
                                            {t}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                {isAdmin ? (
                                    <TextField
                                        fullWidth
                                        select
                                        label="Target Audience *"
                                        name="target"
                                        value={formik.values.target}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.target && Boolean(formik.errors.target)}
                                        helperText={formik.touched.target && formik.errors.target}
                                        SelectProps={{
                                            MenuProps: {
                                                PaperProps: {
                                                    sx: {
                                                        borderRadius: '12px',
                                                        mt: 0.5,
                                                        boxShadow: isDarkMode 
                                                            ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                                                            : '0 10px 25px rgba(15, 23, 42, 0.12)'
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px'
                                            }
                                        }}
                                    >
                                        {targetTypes.map((t) => (
                                            <MenuItem key={t} value={t} sx={{ borderRadius: '6px', my: 0.2, mx: 0.5, fontWeight: 600 }}>
                                                {t === 'User' ? 'User / Traveler Audience' : 'Vendor Partner Audience'}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label="Target Audience"
                                        value="User / Traveler Audience"
                                        disabled
                                        helperText="Vendor created policies target User / Traveler audience"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'grey.100'
                                            }
                                        }}
                                    />
                                )}
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Document Title *"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="h4" fontWeight="bold">2. Document Content & Rules</Typography>
                                <Tabs
                                    value={editorTab}
                                    onChange={(e, val) => setEditorTab(val)}
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
                            <Box>
                                <RichTextEditor 
                                    value={formik.values.content}
                                    onChange={(htmlVal) => formik.setFieldValue('content', htmlVal)}
                                    placeholder="Write your legal policy guidelines, terms, or cancellation rules here..." 
                                />
                                {formik.touched.content && formik.errors.content && (
                                    <FormHelperText error sx={{ mt: 1, ml: 1 }}>
                                        {formik.errors.content}
                                    </FormHelperText>
                                )}
                            </Box>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 4, borderRadius: '16px', bgcolor: 'background.paper', minHeight: 420 }}>
                                <Typography variant="h2" fontWeight="bold" gutterBottom>{formik.values.title || 'Untitled Policy'}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                    <Chip label={formik.values.type} size="small" color="secondary" />
                                    <Chip label={`Target: ${formik.values.target}`} size="small" variant="outlined" />
                                </Stack>
                                <Divider sx={{ mb: 3 }} />
                                <Box 
                                    dangerouslySetInnerHTML={{ __html: formik.values.content || '<i>No content entered yet.</i>' }}
                                    sx={{ lineHeight: 1.85, '& p': { mb: 2 }, '& ul, & ol': { pl: 3, mb: 2 } }}
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
                        executeSave(formik.values);
                    }}
                    title="Authenticate Policy Revision"
                />

                {/* Toast Notification */}
                <Snackbar
                    open={toast.open}
                    autoHideDuration={4000}
                    onClose={() => setToast({ ...toast, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setToast({ ...toast, open: false })}
                        severity={toast.severity}
                        variant="filled"
                        sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>

                {/* Subscription Upgrade Modal */}
                <Dialog
                    open={subPlanModalOpen}
                    onClose={() => setSubPlanModalOpen(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            p: 1,
                            backgroundColor: isDarkMode ? '#111936' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#1e293b'
                        }
                    }}
                >
                    <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                margin: '0 auto',
                                mb: 1.5,
                                bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                                color: '#ef4444'
                            }}
                        >
                            <WorkspacePremiumIcon sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Typography variant="h3" fontWeight="800" gutterBottom>
                            Subscription Limit Reached
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mb: 2, fontSize: '0.95rem' }}>
                            This vendor subscription plan does not support creating custom Platform Policies or limit has been reached. Please upgrade your subscription plan to unlock full policy editing.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setSubPlanModalOpen(false)}
                            sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                setSubPlanModalOpen(false);
                                navigate('/settings/subscription');
                            }}
                            sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
                        >
                            Upgrade Subscription Plan
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        );
    }

    let pageTitle = 'Platform Policies Studio';
    if (typeParam === 'terms-conditions') pageTitle = targetParam === 'Vendor' ? 'Vendor Terms of Service (Admin Policy)' : 'Terms & Conditions Policies';
    else if (typeParam === 'refund-cancellation') pageTitle = 'Refund & Cancellation Policies';
    else if (typeParam === 'privacy-policy') pageTitle = targetParam === 'Vendor' ? 'Vendor Privacy Policy (Admin Policy)' : 'Privacy Policy Documents';
    else if (targetParam === 'Vendor') pageTitle = 'Admin Created Vendor Partner Policies';

    return (
        <Box>
            <SaasHeader
                title={pageTitle}
                subtitle="Manage legal documentation, refund rules, and terms of service across the agency network."
                actionLabel={isVendorStaff ? undefined : "Create New Policy"}
                actionIcon={isVendorStaff ? undefined : <AddIcon />}
                onActionClick={isVendorStaff ? undefined : handleAddNew}
                loading={fetching}
            />

            {/* Quick Summary Widgets */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
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

            {/* Filter Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    bgcolor: cardBgColor,
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
                                <SearchIcon fontSize="small" sx={{ color: subTextColor }} />
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

                {isAdmin && (
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
                )}
            </Paper>

            {/* Table View */}
            <DataTable
                columns={[
                    {
                        headerName: 'Policy Title',
                        field: 'title',
                        render: (row) => (
                            <Box>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ color: textColor }}>{row.title}</Typography>
                                {row.isGlobal && (
                                    <Chip label="Global Platform Policy" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', mt: 0.5, fontWeight: 700 }} />
                                )}
                            </Box>
                        )
                    },
                    {
                        headerName: 'Type',
                        field: 'type',
                        render: (row) => (
                            <Typography variant="body2" fontWeight="600" sx={{ color: textColor }}>{row.type}</Typography>
                        )
                    },
                    {
                        headerName: 'Audience',
                        field: 'target',
                        render: (row) => (
                            <Chip 
                                label={row.target} 
                                size="small" 
                                variant="outlined" 
                                color={row.target === 'User' ? 'info' : 'warning'}
                                sx={{ borderRadius: '6px', fontWeight: 600 }}
                            />
                        )
                    },
                    {
                        headerName: 'Created By',
                        field: 'vendor',
                        render: (row) => {
                            const creatorName = getPolicyCreatorName(row);
                            const isVendorCreated = !row.isGlobal && Boolean(row.vendor);

                            return (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar 
                                        sx={{ 
                                            width: 24, 
                                            height: 24, 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            bgcolor: isVendorCreated ? theme.palette.secondary.main : theme.palette.primary.main 
                                        }}
                                    >
                                        {creatorName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="600" sx={{ color: textColor }}>
                                        {creatorName}
                                    </Typography>
                                </Stack>
                            );
                        }
                    },
                    {
                        headerName: 'Status',
                        field: 'status',
                        render: (row) => (
                            <StatusBadge status={row.status || (row.isActive !== false ? 'Published' : 'Draft')} />
                        )
                    },
                    {
                        headerName: 'Last Updated',
                        field: 'updatedAt',
                        render: (row) => (
                            <Box>
                                <Typography variant="caption" sx={{ color: subTextColor, display: 'block', fontWeight: 600 }}>
                                    {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    }) : 'N/A'}
                                </Typography>
                                {row.updatedAt && (
                                    <Typography variant="caption" sx={{ color: subTextColor, opacity: 0.8 }}>
                                        {new Date(row.updatedAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </Typography>
                                )}
                            </Box>
                        )
                    },
                    {
                        headerName: 'Actions',
                        align: 'center',
                        render: (row) => {
                            const canEdit = canUserEditPolicy(row);

                            return (
                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                    <Tooltip title="View Document">
                                        <IconButton size="small" onClick={() => handleView(row)} color="info">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {canEdit && (
                                        <Tooltip title="Edit Document">
                                            <IconButton size="small" onClick={() => handleEdit(row)} color="primary">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {canEdit && (
                                        <Tooltip title="Delete Document">
                                            <IconButton size="small" onClick={() => handleDeleteClick(row._id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            );
                        }
                    }
                ]}
                rows={displayPolicies}
                loading={fetching}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={displayPolicies.length}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                emptyTitle="No Policies Found"
                emptySubtitle="No policy document matches your search criteria. Click Create New Policy to start."
            />

            {/* View Policy Modal */}
            <Dialog 
                open={Boolean(viewingPolicy)} 
                onClose={() => setViewingPolicy(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                {viewingPolicy && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: textColor }}>{viewingPolicy.title}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                        <Chip label={viewingPolicy.type} size="small" color="secondary" />
                                        <Chip label={`Target: ${viewingPolicy.target}`} size="small" variant="outlined" />
                                        <Chip 
                                            label={`Created By: ${getPolicyCreatorName(viewingPolicy)}`} 
                                            size="small" 
                                            color={viewingPolicy.isGlobal || !viewingPolicy.vendor ? 'primary' : 'default'}
                                            variant="outlined" 
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Stack>
                                </Box>
                                <Typography variant="caption" sx={{ color: subTextColor }}>
                                    Last Updated: {new Date(viewingPolicy.updatedAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </DialogTitle>
                        <Divider sx={{ borderColor: borderLineColor }} />
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Box 
                                className="policy-content"
                                dangerouslySetInnerHTML={{ __html: viewingPolicy.content }} 
                                sx={{ 
                                    lineHeight: 1.85,
                                    fontSize: '15px',
                                    color: textColor,
                                    '& p': { mb: 2 },
                                    '& ul, & ol': { pl: 3, mb: 2 }
                                }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setViewingPolicy(null)}>Close</Button>
                            {canUserEditPolicy(viewingPolicy) && (
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
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Modal */}
            <Dialog 
                open={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <DialogTitle variant="h4" fontWeight="bold">Delete Policy Document</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to delete this policy document? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: '8px', px: 3 }}>
                        Delete Policy
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Notification */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToast({ ...toast, open: false })}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>

            {/* Subscription Upgrade Modal */}
            <Dialog
                open={subPlanModalOpen}
                onClose={() => setSubPlanModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 1,
                        backgroundColor: cardBgColor,
                        color: textColor
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            margin: '0 auto',
                            mb: 1.5,
                            bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                            color: '#ef4444'
                        }}
                    >
                        <WorkspacePremiumIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight="800" gutterBottom>
                        Subscription Limit Reached
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                    <Typography variant="body1" sx={{ color: subTextColor, mb: 2, fontSize: '0.95rem' }}>
                        This vendor subscription plan does not support creating custom Platform Policies or limit has been reached. Please upgrade your subscription plan to unlock full policy editing.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setSubPlanModalOpen(false)}
                        sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            setSubPlanModalOpen(false);
                            navigate('/settings/subscription');
                        }}
                        sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
                    >
                        Upgrade Subscription Plan
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PoliciesManagement;
