import { useState, useEffect } from 'react';

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
    IconButton,
    Box,
    LinearProgress,
    Drawer,
    MenuItem,
    Divider,
    Avatar,
    Tooltip,
    TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

// assets / icons
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PaidIcon from '@mui/icons-material/Paid';
import SaveIcon from '@mui/icons-material/Save';

import SubscriptionRestrictedCard from 'ui-component/cards/SubscriptionRestrictedCard';

const BookingsManagement = () => {
    const theme = useTheme();
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDark = !isLightExplicit;

    const cardBgColor = isDark ? '#111827' : '#ffffff';
    const borderLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Drawer state
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatedStatus, setUpdatedStatus] = useState('Pending');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            try {
                const profileRes = await api.get('/vendors/profile');
                if (profileRes?.success && profileRes?.data?.profile?.subscription) {
                    setSubscription(profileRes.data.profile.subscription);
                }
            } catch (err) {
                console.error('Failed to load profile subscription', err);
            }

            const response = await api.get('/bookings');
            if (response.success) {
                setBookings(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const bookingLimit = subscription?.bookingLimit !== undefined ? subscription.bookingLimit : -1;
    const isBookingAllowed = subscription?.bookingEnabled !== false && bookingLimit !== 0;

    const handleOpenDrawer = (booking) => {
        setSelectedBooking(booking);
        setUpdatedStatus(booking.bookingStatus || 'Pending');
        setOpenDrawer(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedBooking) return;
        setSubmitting(true);
        try {
            const response = await api.put(`/bookings/${selectedBooking._id}/status`, {
                status: updatedStatus
            });
            if (response.success) {
                setSelectedBooking({ ...selectedBooking, bookingStatus: updatedStatus });
                fetchBookings();
            }
        } catch (error) {
            alert(error.message || 'Failed to update booking status');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.contactDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.contactDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.package?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b._id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalCount = bookings.length;
    const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed').length;
    const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const totalVolume = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    if (!loading && !isBookingAllowed) {
        return (
            <Box>
                <SaasHeader title="Customer Bookings" subtitle="Manage customer reservations and bookings." />
                <SubscriptionRestrictedCard featureName="Booking Management" reason={bookingLimit === 0 ? 'limit' : 'permission'} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Top Page Header */}
            <SaasHeader
                title="Customer Bookings"
                subtitle="Manage customer reservations, travel dates, price amounts, and status updates."
                loading={loading}
            />

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="stretch">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={totalCount}
                        label="Total Bookings"
                        icon={<ConfirmationNumberIcon />}
                        colorScheme="primary"
                        change="+3.10%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={confirmedCount}
                        label="Confirmed / Completed"
                        icon={<CheckCircleIcon />}
                        colorScheme="success"
                        change="+2.40%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={pendingCount}
                        label="Pending Reservations"
                        icon={<PendingIcon />}
                        colorScheme="warning"
                        change="-1.10%"
                        changeType="down"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={`₹${totalVolume.toLocaleString('en-IN')}`}
                        label="Total Booking Volume"
                        icon={<PaidIcon />}
                        colorScheme="secondary"
                        change="+5.20%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Content Card with Filters & Table */}
            <MainCard
                content={false}
                sx={{
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: borderLineColor,
                    bgcolor: cardBgColor,
                    p: { xs: 2, sm: 2.5 },
                    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                        transform: 'none',
                        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : borderLineColor
                    }
                }}
            >
                {/* Bookings List Title & Toolbar */}
                <Box sx={{ mb: 2.5 }}>
                    <Typography variant="h3" fontWeight="800" fontSize="1.15rem" sx={{ mb: 2, color: 'text.primary' }}>
                        Bookings List
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        spacing={{ xs: 2, md: 2 }}
                    >
                        {/* LEFT: Search Box */}
                        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
                            <SearchInput
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                placeholder="Search bookings..."
                                width="100%"
                            />
                        </Box>

                        {/* RIGHT: Status Filters */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                overflowX: 'auto',
                                py: 0.5,
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': { display: 'none' },
                                flexWrap: { xs: 'nowrap', sm: 'wrap', md: 'nowrap' }
                            }}
                        >
                            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                                <FilterChip
                                    key={st}
                                    label={st}
                                    active={statusFilter === st}
                                    onClick={() => { setStatusFilter(st); setPage(0); }}
                                />
                            ))}
                        </Box>
                    </Stack>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2, borderRadius: '4px' }} />}

                {/* Table */}
                <DataTable
                    columns={[
                        {
                            headerName: 'CUSTOMER',
                            field: 'customer',
                            render: (row) => (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: '#ff5252', fontWeight: 700, width: 34, height: 34, fontSize: '0.85rem' }}>
                                        {(row.contactDetails?.name || row.user?.name || 'C').charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                            {row.contactDetails?.name || row.user?.name || 'Customer'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {row.contactDetails?.email || row.user?.email || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            )
                        },
                        {
                            headerName: 'PACKAGE TITLE',
                            field: 'package',
                            render: (row) => (
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                        {row.package?.title || 'Tour Package'}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                                        {row.customId || row._id?.slice(-8)}
                                    </Typography>
                                </Box>
                            )
                        },
                        {
                            headerName: 'TRAVEL DATE',
                            field: 'travelDate',
                            render: (row) => (
                                <Typography variant="body2" fontWeight="600" color="text.secondary">
                                    {row.travelDate ? new Date(row.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible'}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'AMOUNT',
                            field: 'totalPrice',
                            render: (row) => (
                                <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                                    ₹{(row.totalPrice || 0).toLocaleString('en-IN')}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'STATUS',
                            field: 'bookingStatus',
                            render: (row) => <StatusBadge label={row.bookingStatus || 'Pending'} status={row.bookingStatus} />
                        },
                        {
                            headerName: 'ACTIONS',
                            align: 'center',
                            render: (row) => (
                                <Tooltip title="View & Manage Booking">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenDrawer(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    ]}
                    rows={filteredBookings}
                    loading={loading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={filteredBookings.length}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    emptyTitle="No Bookings Found"
                    emptySubtitle={searchTerm ? 'Try adjusting your search query.' : 'No customer reservations recorded yet.'}
                    sx={{
                        borderRadius: '6px',
                        boxShadow: 'none'
                    }}
                />
            </MainCard>

            {/* Booking Detail & Status Drawer */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal + 200
                }}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480 },
                        p: 3,
                        backgroundColor: cardBgColor,
                        color: 'text.primary',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }
                }}
            >
                {selectedBooking && (
                    <>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h3" fontWeight="800">
                                Booking Details
                            </Typography>
                            <IconButton onClick={() => setOpenDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2.5}>
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800 }}>Booking ID</Typography>
                                <Typography variant="h4" fontWeight="800" sx={{ fontFamily: 'monospace', mt: 0.3 }}>
                                    {selectedBooking.customId || selectedBooking._id}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mt: 2 }}>Package Name</Typography>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ mt: 0.3 }}>
                                    {selectedBooking.package?.title || 'Tour Package'}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mt: 2 }}>Customer Contact</Typography>
                                <Typography variant="body2" fontWeight="600" sx={{ mt: 0.3 }}>
                                    {selectedBooking.contactDetails?.name || selectedBooking.user?.name || 'Customer'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {selectedBooking.contactDetails?.email || selectedBooking.user?.email} • {selectedBooking.contactDetails?.phone || 'No phone'}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, display: 'block', mt: 2 }}>Travel Date & Amount</Typography>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" fontWeight="600">
                                        {selectedBooking.travelDate ? new Date(selectedBooking.travelDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </Typography>
                                    <Typography variant="h4" fontWeight="800" color="#ff5252">
                                        ₹{(selectedBooking.totalPrice || 0).toLocaleString('en-IN')}
                                    </Typography>
                                </Stack>
                            </Box>

                            <Typography variant="h4" fontWeight="800">
                                Update Booking Status
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                label="Reservation Status"
                                value={updatedStatus}
                                onChange={(e) => setUpdatedStatus(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="Pending">Pending Approval</MenuItem>
                                <MenuItem value="Confirmed">Confirmed</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </TextField>

                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleUpdateStatus}
                                disabled={submitting}
                                sx={{
                                    borderRadius: '10px',
                                    py: 1.2,
                                    fontWeight: 700,
                                    bgcolor: '#ff5252',
                                    '&:hover': { bgcolor: '#e04848' }
                                }}
                            >
                                {submitting ? 'Updating...' : 'Save Booking Status'}
                            </Button>
                        </Stack>
                    </>
                )}
            </Drawer>
        </Box>
    );
};

export default BookingsManagement;
