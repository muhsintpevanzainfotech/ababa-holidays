import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import {
    Grid,
    Typography,
    Button,
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
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Tooltip,
    LinearProgress,
    Divider,
    TablePagination,
    FormControlLabel,
    Checkbox,
    Switch,
    Alert,
    Card,
    CardContent,
    Snackbar
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import SearchInput from 'ui-component/extended/SearchInput';
import StatusBadge from 'ui-component/extended/StatusBadge';
import SaasTablePagination from 'ui-component/extended/SaasTablePagination';
import FilterChip from 'ui-component/extended/FilterChip';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';
import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_packages', label: 'Packages & Listings', color: 'primary' },
    { id: 'manage_bookings', label: 'Customer Bookings', color: 'success' },
    { id: 'manage_enquiries', label: 'Web Enquiries & Leads', color: 'info' },
    { id: 'manage_services', label: 'Services Catalog', color: 'secondary' },
    { id: 'manage_banners', label: 'Offer Banners', color: 'warning' },
    { id: 'manage_content', label: 'Blogs & Testimonials', color: 'default' }
];

const VendorStaffManagement = () => {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

    const authUser = useSelector((state) => state.auth?.user) || (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    })();

    if (authUser && (authUser.role === 'Vendor-Staff' || authUser.role === 'vendor-staff')) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    backgroundColor: isDarkMode ? '#111936' : '#ffffff',
                    mt: 3
                }}
            >
                <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 800 }}>
                    Access Denied
                </Typography>
                <Typography variant="body1" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 3 }}>
                    Vendor Staff accounts do not have authorization to manage staff team members.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => window.location.href = '/dashboard'} sx={{ borderRadius: '10px', fontWeight: 700 }}>
                    Return to Dashboard
                </Button>
            </Paper>
        );
    }

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Toast state
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const stats = {
        total: staffList.length,
        active: staffList.filter(s => !s.isSuspended).length,
        suspended: staffList.filter(s => s.isSuspended).length
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                const subData = profileRes?.data?.profile?.subscription || profileRes?.data?.subscription || profileRes?.data?.vendor?.subscription;
                if (subData) {
                    setSubscription(subData);
                } else if (profileRes?.success) {
                    setSubscription({ staffEnabled: false, staffLimit: 0 });
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

            const response = await api.get('/vendors/staff');
            if (response.success) {
                setStaffList(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch vendor staff:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const staffLimit = subscription?.staffLimit !== undefined ? subscription.staffLimit : -1;
    const isStaffAllowed = subscription ? (subscription?.staffEnabled !== false && staffLimit !== 0) : true;

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            permissions: ['manage_packages', 'manage_bookings', 'manage_enquiries'],
            isSuspended: false
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Full Name is required'),
            email: Yup.string().trim().email('Must be a valid email address').required('Email address is required'),
            phone: Yup.string().trim().nullable(),
            password: Yup.string().test('password-validation', 'Password must be at least 6 characters', function (value) {
                if (!selectedStaff && !value) {
                    return this.createError({ message: 'Password is required for new staff accounts' });
                }
                if (value && value.length < 6) {
                    return this.createError({ message: 'Password must be at least 6 characters' });
                }
                return true;
            })
        }),
        onSubmit: async (values) => {
            setErrorMessage('');
            try {
                setSaving(true);
                const payload = {
                    name: values.name.trim(),
                    email: values.email.trim(),
                    phone: values.phone ? values.phone.trim() : '',
                    permissions: values.permissions,
                    isSuspended: values.isSuspended
                };

                if (values.password) {
                    payload.password = values.password;
                }

                if (selectedStaff) {
                    await api.put(`/vendors/staff/${selectedStaff._id}`, payload);
                    setToast({ open: true, message: 'Staff member details updated successfully!', severity: 'success' });
                } else {
                    await api.post('/vendors/staff', payload);
                    setToast({ open: true, message: 'New staff account created successfully!', severity: 'success' });
                }

                setOpenDialog(false);
                fetchStaff();
            } catch (error) {
                setErrorMessage(error.message || 'Failed to save staff member details.');
            } finally {
                setSaving(false);
            }
        }
    });

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = (status) => {
        if (status) {
            setStatusFilter(status);
            setPage(0);
        }
        setFilterAnchorEl(null);
    };

    const handleOpenDialog = (staff = null) => {
        setSelectedStaff(staff);
        setShowPassword(false);
        setErrorMessage('');
        formik.resetForm();

        if (staff) {
            formik.setValues({
                name: staff.name || '',
                email: staff.email || '',
                phone: staff.phone || '',
                password: '',
                permissions: Array.isArray(staff.permissions) ? staff.permissions : [],
                isSuspended: !!staff.isSuspended
            });
        } else {
            formik.setValues({
                name: '',
                email: '',
                phone: '',
                password: '',
                permissions: ['manage_packages', 'manage_bookings', 'manage_enquiries'],
                isSuspended: false
            });
        }
        setOpenDialog(true);
    };

    const handlePermissionToggle = (permId) => {
        const currentPerms = formik.values.permissions || [];
        const updated = currentPerms.includes(permId)
            ? currentPerms.filter(p => p !== permId)
            : [...currentPerms, permId];
        formik.setFieldValue('permissions', updated);
    };

    const allPermIds = AVAILABLE_PERMISSIONS.map(p => p.id);
    const isAllSelected = allPermIds.every(id => (formik.values.permissions || []).includes(id));

    const handleToggleSelectAllPermissions = () => {
        if (isAllSelected) {
            formik.setFieldValue('permissions', []);
        } else {
            formik.setFieldValue('permissions', allPermIds);
        }
    };

    const handleToggleSuspend = async (staff) => {
        try {
            const newStatus = !staff.isSuspended;
            await api.put(`/vendors/staff/${staff._id}`, {
                isSuspended: newStatus
            });
            setToast({
                open: true,
                message: `Staff member ${newStatus ? 'suspended' : 'activated'} successfully.`,
                severity: newStatus ? 'warning' : 'success'
            });
            fetchStaff();
        } catch (error) {
            setToast({ open: true, message: error.message || 'Failed to update staff status', severity: 'error' });
        }
    };

    const handleDeleteClick = (staff) => {
        setStaffToDelete(staff);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;
        try {
            await api.delete(`/vendors/staff/${staffToDelete._id}`);
            setToast({ open: true, message: 'Staff member account deleted successfully.', severity: 'success' });
            fetchStaff();
            setDeleteModalOpen(false);
            setStaffToDelete(null);
        } catch (error) {
            setToast({ open: true, message: error.message || 'Failed to delete staff member', severity: 'error' });
        }
    };

    const filteredStaff = staffList.filter(s => {
        const matchesSearch =
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone?.includes(searchTerm);

        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Active' && !s.isSuspended) ||
            (statusFilter === 'Suspended' && s.isSuspended);

        return matchesSearch && matchesStatus;
    });

    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const subTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
    const cardBgColor = isDarkMode ? '#111936' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#090d16' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    if (!loading && !isStaffAllowed) {
        return (
            <Box>
                <SaasHeader title="Vendor Staff & Team" subtitle="Manage your agency staff sub-accounts, access credentials, and module permissions." />
                <SubscriptionRestrictedCard featureName="Staff Sub-Accounts" reason={staffLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            <SaasHeader
                title="Vendor Staff & Team"
                subtitle="Manage your agency staff sub-accounts, access credentials, and module permissions."
                actionLabel="Add Staff Member"
                actionIcon={<AddIcon />}
                onActionClick={() => handleOpenDialog()}
                loading={loading}
            />

            {/* Stat Cards */}
            <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        label="Total Staff Members"
                        count={stats.total}
                        icon={<PersonIcon />}
                        colorScheme="primary"
                        change="+1.50%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        label="Active Staff"
                        count={stats.active}
                        icon={<CheckCircleIcon />}
                        colorScheme="success"
                        change="Active"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard
                        label="Suspended Staff"
                        count={stats.suspended}
                        icon={<BlockIcon />}
                        colorScheme="error"
                        change="0.00%"
                        changeType="down"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

            {/* Filter & Control Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    backgroundColor: surfaceBgColor
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 7 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by staff name, email, custom ID, or phone..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: subTextColor, fontSize: '1.2rem' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: cardBgColor,
                                    color: textColor,
                                    '& fieldset': { borderColor: borderLineColor }
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<FilterListIcon />}
                                onClick={handleFilterClick}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 2.5,
                                    borderColor: borderLineColor,
                                    color: textColor
                                }}
                            >
                                Filter Status: {statusFilter}
                            </Button>
                            <Menu
                                anchorEl={filterAnchorEl}
                                open={Boolean(filterAnchorEl)}
                                onClose={() => handleFilterClose(null)}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: cardBgColor,
                                        border: '1px solid',
                                        borderColor: borderLineColor,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                <MenuItem onClick={() => handleFilterClose('All')} sx={{ color: textColor, fontWeight: 600 }}>
                                    All Staff ({stats.total})
                                </MenuItem>
                                <MenuItem onClick={() => handleFilterClose('Active')} sx={{ color: textColor, fontWeight: 600 }}>
                                    Active Only ({stats.active})
                                </MenuItem>
                                <MenuItem onClick={() => handleFilterClose('Suspended')} sx={{ color: textColor, fontWeight: 600 }}>
                                    Suspended Only ({stats.suspended})
                                </MenuItem>
                            </Menu>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Staff Data Table */}
            <DataTable
                columns={[
                    {
                        headerName: 'Staff Member',
                        field: 'name',
                        render: (staff) => (
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                    src={staff.avatar}
                                    alt={staff.name}
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        bgcolor: theme.palette.primary.main,
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                                    }}
                                >
                                    {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700, fontSize: '0.95rem' }}>
                                        {staff.name}
                                    </Typography>
                                    <Chip
                                        label="Vendor Staff"
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, mt: 0.3, borderRadius: '4px' }}
                                    />
                                </Box>
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Contact Info',
                        field: 'email',
                        render: (staff) => (
                            <Stack spacing={0.3}>
                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <EmailIcon sx={{ fontSize: '0.85rem', color: subTextColor }} />
                                    <Typography variant="body2" sx={{ color: textColor, fontWeight: 600, fontSize: '0.875rem' }}>
                                        {staff.email}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <PhoneIcon sx={{ fontSize: '0.85rem', color: subTextColor }} />
                                    <Typography variant="caption" sx={{ color: subTextColor, fontWeight: 500 }}>
                                        {staff.phone || 'No Phone Provided'}
                                    </Typography>
                                </Stack>
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Custom ID',
                        field: 'customId',
                        render: (staff) => (
                            <Chip
                                icon={<BadgeIcon sx={{ fontSize: '0.85rem !important' }} />}
                                label={staff.customId || 'VNS-N/A'}
                                size="small"
                                sx={{
                                    backgroundColor: surfaceBgColor,
                                    color: textColor,
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    border: '1px solid',
                                    borderColor: borderLineColor
                                }}
                            />
                        )
                    },
                    {
                        headerName: 'Module Access Permissions',
                        field: 'permissions',
                        render: (staff) => (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: 0.5, maxWidth: 280 }}>
                                {staff.permissions && staff.permissions.length > 0 ? (
                                    staff.permissions.map(pId => {
                                        const pObj = AVAILABLE_PERMISSIONS.find(ap => ap.id === pId);
                                        return (
                                            <Chip
                                                key={pId}
                                                label={pObj ? pObj.label : pId}
                                                size="small"
                                                color={pObj ? pObj.color : 'default'}
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px' }}
                                            />
                                        );
                                    })
                                ) : (
                                    <Chip
                                        label="Default Access"
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, color: subTextColor }}
                                    />
                                )}
                            </Stack>
                        )
                    },
                    {
                        headerName: 'Account Status',
                        field: 'isSuspended',
                        render: (staff) => (
                            <StatusBadge status={staff.isSuspended ? 'Suspended' : 'Active'} />
                        )
                    },
                    {
                        headerName: 'Actions',
                        align: 'center',
                        render: (staff) => (
                            <Stack direction="row" spacing={0.8} justifyContent="center">
                                <Tooltip title="Edit Staff Details">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleOpenDialog(staff)}
                                        sx={{
                                            backgroundColor: isDarkMode ? 'rgba(37,99,235,0.1)' : '#eff6ff',
                                            '&:hover': { backgroundColor: isDarkMode ? 'rgba(37,99,235,0.2)' : '#dbeafe' }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={staff.isSuspended ? 'Activate Account' : 'Suspend Account'}>
                                    <IconButton
                                        size="small"
                                        color={staff.isSuspended ? 'success' : 'warning'}
                                        onClick={() => handleToggleSuspend(staff)}
                                        sx={{
                                            backgroundColor: staff.isSuspended
                                                ? (isDarkMode ? 'rgba(34,197,94,0.1)' : '#f0fdf4')
                                                : (isDarkMode ? 'rgba(234,179,8,0.1)' : '#fefce8'),
                                            '&:hover': {
                                                backgroundColor: staff.isSuspended
                                                    ? (isDarkMode ? 'rgba(34,197,94,0.2)' : '#dcfce7')
                                                    : (isDarkMode ? 'rgba(234,179,8,0.2)' : '#fef9c3')
                                            }
                                        }}
                                    >
                                        {staff.isSuspended ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Remove Staff Account">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteClick(staff)}
                                        sx={{
                                            backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                            '&:hover': { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.2)' : '#fee2e2' }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )
                    }
                ]}
                rows={filteredStaff}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredStaff.length}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                emptyTitle="No Staff Members Found"
                emptySubtitle={searchTerm ? 'Try adjusting your search query.' : 'Click "Add Staff Member" to create agency staff accounts.'}
            />

            {/* Add / Edit Staff Modal */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '18px',
                        backgroundColor: cardBgColor,
                        backgroundImage: 'none',
                        border: '1px solid',
                        borderColor: borderLineColor,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: borderLineColor }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    backgroundColor: isDarkMode ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <SecurityIcon />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ color: textColor, fontWeight: 800 }}>
                                    {selectedStaff ? 'Edit Vendor Staff Member' : 'Add New Staff Member'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: subTextColor, fontSize: '0.8rem' }}>
                                    Set up account credentials and module access permissions.
                                </Typography>
                            </Box>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                                {errorMessage}
                            </Alert>
                        )}

                        <Grid container spacing={2.5} sx={{ mt: 0.2 }}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.name && formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: surfaceBgColor,
                                            color: textColor
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.email && formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: surfaceBgColor,
                                            color: textColor
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.phone && formik.errors.phone)}
                                    helperText={formik.touched.phone && formik.errors.phone}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: surfaceBgColor,
                                            color: textColor
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label={selectedStaff ? 'New Password (Leave empty to keep unchanged)' : 'Password'}
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={Boolean(formik.touched.password && formik.errors.password)}
                                    helperText={
                                        (formik.touched.password && formik.errors.password) ||
                                        (selectedStaff ? 'Provide password only if resetting staff login credentials.' : 'Min. 6 characters.')
                                    }
                                    required={!selectedStaff}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: subTextColor }}
                                                >
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: surfaceBgColor,
                                            color: textColor
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1, borderColor: borderLineColor }} />
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                    <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 800, fontSize: '0.9rem' }}>
                                        Module Access Permissions ({formik.values.permissions?.length || 0} / {AVAILABLE_PERMISSIONS.length})
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={handleToggleSelectAllPermissions}
                                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                                    >
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </Stack>
                                <Card variant="outlined" sx={{ borderRadius: '12px', borderColor: borderLineColor, backgroundColor: surfaceBgColor, p: 1 }}>
                                    <Grid container spacing={1}>
                                        {AVAILABLE_PERMISSIONS.map(perm => (
                                            <Grid size={{ xs: 12, sm: 6 }} key={perm.id}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={(formik.values.permissions || []).includes(perm.id)}
                                                            onChange={() => handlePermissionToggle(perm.id)}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ color: textColor, fontWeight: 600, fontSize: '0.85rem' }}>
                                                            {perm.label}
                                                        </Typography>
                                                    }
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Card>
                            </Grid>

                            {selectedStaff && (
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.isSuspended}
                                                onChange={(e) => formik.setFieldValue('isSuspended', e.target.checked)}
                                                color="error"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: formik.values.isSuspended ? theme.palette.error.main : textColor, fontWeight: 700 }}>
                                                Suspend Staff Account Access
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: borderLineColor }}>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 700, color: subTextColor, textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                            sx={{
                                borderRadius: '10px',
                                px: 3.5,
                                py: 1,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                            }}
                        >
                            {saving ? 'Saving...' : selectedStaff ? 'Update Staff Member' : 'Create Staff Account'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Modal */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: cardBgColor,
                        border: '1px solid',
                        borderColor: borderLineColor,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: textColor }}>
                    Remove Staff Member?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: subTextColor }}>
                        Are you sure you want to remove <strong>{staffToDelete?.name}</strong> ({staffToDelete?.email})? They will lose access to your vendor dashboard immediately.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} color="inherit" sx={{ fontWeight: 700, color: subTextColor }}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: '10px', fontWeight: 800, px: 3 }}>
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default VendorStaffManagement;

