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
    Chip,
    IconButton,
    Box,
    TextField,
    LinearProgress,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatusBadge from 'ui-component/extended/StatusBadge';
import SaasTablePagination from 'ui-component/extended/SaasTablePagination';
import FilterChip from 'ui-component/extended/FilterChip';
import DataTable from 'ui-component/extended/DataTable';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets / icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import SavingsIcon from '@mui/icons-material/Savings';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';

const WalletManagement = () => {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [walletData, setWalletData] = useState({
        walletBalance: 0,
        grossEarnings: 0,
        netEarnings: 0,
        completedEarnings: 0,
        pendingEarnings: 0,
        totalBookings: 0,
        platformFeePercentage: 10,
        bankDetails: {},
        payouts: [],
        recentTransactions: []
    });

    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutNotes, setPayoutNotes] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [logFilter, setLogFilter] = useState('All'); // 'All' | 'Earnings' | 'Payouts'

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vendors/wallet');
            if (response.success) {
                setWalletData(response.data || {});
            }
        } catch (error) {
            console.error('Failed to fetch wallet summary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleRequestPayout = async () => {
        const amt = Number(payoutAmount);
        if (!amt || amt <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid payout amount.' });
            return;
        }
        if (amt > walletData.walletBalance) {
            setMessage({ type: 'error', text: `Amount exceeds available wallet balance (₹${walletData.walletBalance.toLocaleString('en-IN')}).` });
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/vendors/wallet/payout', {
                amount: amt,
                notes: payoutNotes
            });
            if (response.success) {
                setMessage({ type: 'success', text: 'Payout request submitted successfully!' });
                setPayoutModalOpen(false);
                setPayoutAmount('');
                setPayoutNotes('');
                fetchWalletData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit payout request.' });
        } finally {
            setSubmitting(false);
        }
    };

    const transactionLogs = [
        ...(walletData.recentTransactions || []).map(t => ({
            id: t.id,
            type: 'Earning',
            title: `Tour Booking: ${t.packageTitle}`,
            reference: t.customId || t.id,
            grossAmount: t.amount,
            netAmount: t.netAmount,
            status: t.status,
            date: t.date
        })),
        ...(walletData.payouts || []).map(p => ({
            id: p.payoutId || p._id,
            type: 'Payout',
            title: `Bank Withdrawal (${p.bankAccount || 'Bank Account'})`,
            reference: p.payoutId || 'PO-WITHDRAW',
            grossAmount: p.amount,
            netAmount: p.amount,
            status: p.status,
            date: p.requestedAt || p.date
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredLogs = transactionLogs.filter(item => {
        if (logFilter === 'Earnings') return item.type === 'Earning';
        if (logFilter === 'Payouts') return item.type === 'Payout';
        return true;
    });

    return (
        <Box>
            {/* Top Page Header */}
            <SaasHeader
                title="Wallet & Financials"
                subtitle="Track net booking earnings, platform fee deductions, and request direct bank payouts."
                actionLabel="Request Bank Payout"
                actionIcon={<AddCardIcon />}
                onActionClick={() => { setMessage({ type: '', text: '' }); setPayoutModalOpen(true); }}
                loading={loading}
            />

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={`₹${(walletData.walletBalance || 0).toLocaleString('en-IN')}`}
                        label="Available Balance"
                        icon={<AccountBalanceWalletIcon />}
                        colorScheme="primary"
                        change="+4.80%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={`₹${(walletData.netEarnings || 0).toLocaleString('en-IN')}`}
                        label="Net Total Earnings (90%)"
                        icon={<SavingsIcon />}
                        colorScheme="success"
                        change="+3.90%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={`₹${(walletData.grossEarnings || 0).toLocaleString('en-IN')}`}
                        label="Gross Booking Revenue"
                        icon={<PaymentsIcon />}
                        colorScheme="secondary"
                        change="+4.20%"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        count={`10%`}
                        label="Platform Fee Deduction"
                        icon={<PriceCheckIcon />}
                        colorScheme="warning"
                        change="Fixed"
                        changeType="up"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3, borderRadius: '10px' }}>
                    {message.text}
                </Alert>
            )}

            {/* Registered Bank Account Info */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'background.paper'),
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}
            >
                <Stack spacing={2.5}>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 44, height: 44 }}>
                                <AccountBalanceIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="800">
                                    Registered Payout Bank Account
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Verified bank account details for direct payout settlement
                                </Typography>
                            </Box>
                        </Stack>
                        <StatusBadge label="Automated Payout Processing" icon={<InfoIcon sx={{ fontSize: '0.85rem !important' }} />} />
                    </Stack>

                    <Divider />

                    {/* Full Bank Details Grid */}
                    {walletData.bankDetails && (walletData.bankDetails.accountNumber || walletData.bankDetails.bankName) ? (
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" textTransform="uppercase">
                                    Bank Name
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                                    {walletData.bankDetails.bankName || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" textTransform="uppercase">
                                    Account Holder Name
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                                    {walletData.bankDetails.accountName || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" textTransform="uppercase">
                                    Full Account Number
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="900" color="primary.main" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                                    {walletData.bankDetails.accountNumber || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" textTransform="uppercase">
                                    IFSC Code
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                                    {walletData.bankDetails.ifscCode || 'N/A'}
                                </Typography>
                            </Grid>

                            {walletData.bankDetails.branch && (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" textTransform="uppercase">
                                        Branch Name
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                        {walletData.bankDetails.branch}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    ) : (
                        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                            No payout bank account details linked yet. Please update your bank account details in Agency Profile settings.
                        </Alert>
                    )}
                </Stack>
            </Paper>

            {/* Main Content Card */}
            <MainCard
                title={
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h3" fontWeight="800" fontSize="1.2rem">
                            Financial Activity & Payout History
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            {['All', 'Earnings', 'Payouts'].map(filter => (
                                <FilterChip
                                    key={filter}
                                    label={filter}
                                    active={logFilter === filter}
                                    onClick={() => { setLogFilter(filter); setPage(0); }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                }
            >
                {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                {/* Table */}
                <DataTable
                    columns={[
                        {
                            headerName: 'Transaction / Activity',
                            field: 'title',
                            render: (row) => (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar
                                        sx={{
                                            bgcolor: row.type === 'Earning' ? '#ecfdf5' : '#fffbeb',
                                            color: row.type === 'Earning' ? '#10b981' : '#f59e0b',
                                            width: 36,
                                            height: 36,
                                            border: `1px solid ${row.type === 'Earning' ? '#a7f3d0' : '#fde68a'}`
                                        }}
                                    >
                                        {row.type === 'Earning' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="700">
                                            {row.title}
                                        </Typography>
                                        <StatusBadge label={row.type} size="small" />
                                    </Box>
                                </Stack>
                            )
                        },
                        {
                            headerName: 'Reference ID',
                            field: 'reference',
                            render: (row) => (
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'text.primary' }}>
                                    {row.reference || 'N/A'}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'Date',
                            field: 'date',
                            render: (row) => (
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {row.date ? new Date(row.date).toLocaleString('en-IN') : 'N/A'}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'Amount',
                            field: 'amount',
                            render: (row) => (
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="800"
                                    sx={{
                                        color: row.type === 'Earning' ? '#10b981' : '#f59e0b'
                                    }}
                                >
                                    {row.type === 'Earning' ? `+₹${(row.netAmount || 0).toLocaleString('en-IN')}` : `-₹${(row.grossAmount || 0).toLocaleString('en-IN')}`}
                                </Typography>
                            )
                        },
                        {
                            headerName: 'Status',
                            field: 'status',
                            render: (row) => <StatusBadge label={row.status || 'Completed'} status={row.status || 'Completed'} />
                        }
                    ]}
                    rows={filteredLogs}
                    loading={loading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={filteredLogs.length}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    emptyTitle="No Financial Activity Found"
                    emptySubtitle="Booking earnings and payout requests will appear here."
                />
            </MainCard>

            {/* Request Payout Modal */}
            <Dialog
                open={payoutModalOpen}
                onClose={() => setPayoutModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        backgroundColor: 'background.paper',
                        color: 'text.primary'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Request Bank Payout Withdrawal
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        <Grid size={{ xs: 6 }}>
                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50'), border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>Available Balance</Typography>
                                <Typography variant="h4" fontWeight="900" color="#ff5252">
                                    ₹{(walletData.walletBalance || 0).toLocaleString('en-IN')}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50'), border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>Payout Bank</Typography>
                                <Typography variant="subtitle2" fontWeight="800" color="primary.main" noWrap>
                                    {walletData.bankDetails?.bankName || 'Linked Bank'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {walletData.bankDetails?.accountNumber && (
                        <Box sx={{ p: 1.5, mb: 2.5, borderRadius: '10px', bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.1)' : '#eff6ff'), border: '1px solid', borderColor: 'primary.light' }}>
                            <Typography variant="caption" fontWeight="800" color="primary.main" display="block">
                                TARGET BANK ACCOUNT:
                            </Typography>
                            <Typography variant="body2" fontWeight="700" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                                {walletData.bankDetails.bankName} • A/C: {walletData.bankDetails.accountNumber} • IFSC: {walletData.bankDetails.ifscCode}
                            </Typography>
                        </Box>
                    )}

                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            label="Withdrawal Amount (₹)"
                            type="number"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            placeholder="Enter amount to withdraw..."
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Payout Notes (Optional)"
                            value={payoutNotes}
                            onChange={(e) => setPayoutNotes(e.target.value)}
                            placeholder="Reference or bank note..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setPayoutModalOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleRequestPayout}
                        disabled={submitting}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            px: 3,
                            bgcolor: '#ff5252',
                            '&:hover': { bgcolor: '#e04848' }
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Confirm Payout Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WalletManagement;
