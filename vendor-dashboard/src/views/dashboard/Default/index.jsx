import { useEffect, useState } from 'react';

// material-ui
import {
  Grid,
  Typography,
  Stack,
  Box,
  Paper,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';

// project imports
import SaasHeader from 'ui-component/extended/SaasHeader';
import StatCard from 'ui-component/cards/StatCard';
import MainCard from 'ui-component/cards/MainCard';
import StatusBadge from 'ui-component/extended/StatusBadge';
import DataTable from 'ui-component/extended/DataTable';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import PopularCard from './PopularCard';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets / icons
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark: isDarkMode } = useThemeMode();

  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    packages: 0,
    bookings: 0,
    revenue: 0,
    users: 0,
    recentBookings: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/bookings')
        ]);

        let combinedStats = {
          packages: 0,
          bookings: 0,
          revenue: 0,
          users: 0,
          recentBookings: []
        };

        if (statsRes.success && statsRes.data) {
          combinedStats = { ...combinedStats, ...statsRes.data };
        }

        if (bookingsRes.success && bookingsRes.data) {
          combinedStats.recentBookings = bookingsRes.data.slice(0, 5);
          combinedStats.bookings = bookingsRes.data.length;
          combinedStats.revenue = bookingsRes.data.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        }

        setStats(combinedStats);
      } catch (err) {
        console.error('Failed to fetch vendor dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardBgColor = isDarkMode ? '#16152b' : '#ffffff';
  const surfaceBgColor = isDarkMode ? '#212040' : '#f8fafc';
  const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

  const recentBookingColumns = [
    {
      id: 'customer',
      label: 'Customer',
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: theme.palette.primary.main, fontWeight: 700, fontSize: '0.9rem' }}>
            {(row.contactDetails?.name || row.user?.name || 'C').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="700">
              {row.contactDetails?.name || row.user?.name || 'Customer'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.contactDetails?.email || row.user?.email || ''}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      id: 'package',
      label: 'Package',
      render: (row) => (
        <Typography variant="body2" fontWeight="700">
          {row.package?.title || 'Tour Reservation'}
        </Typography>
      )
    },
    {
      id: 'travelDate',
      label: 'Travel Date',
      render: (row) => (
        <Typography variant="body2" fontWeight="600" color="text.secondary">
          {row.travelDate ? new Date(row.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </Typography>
      )
    },
    {
      id: 'amount',
      label: 'Amount',
      render: (row) => (
        <Typography variant="subtitle1" fontWeight="800">
          ₹{(row.totalPrice || 0).toLocaleString('en-IN')}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.bookingStatus || 'Pending'} />
    },
    {
      id: 'actions',
      label: 'Action',
      align: 'center',
      render: (row) => (
        <IconButton size="small" onClick={() => navigate('/platform/bookings')} color="primary">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      {/* 1. Header Bar */}
      <SaasHeader
        title="Dashboard Overview"
        subtitle="Real-time performance analytics, financial accounts, bookings summary, and revenue metrics."
        actionLabel="Manage Packages"
        onActionClick={() => navigate('/platform/packages')}
        loading={isLoading}
      />

      {/* 2. Top KPI Cards Single Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Customers"
            count={stats.users || stats.bookings || 0}
            icon={<PeopleIcon />}
            colorScheme="primary"
            change="+2.40%"
            changeType="up"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Packages"
            count={stats.packages || 0}
            icon={<InventoryIcon />}
            colorScheme="secondary"
            change="+1.50%"
            changeType="up"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Bookings"
            count={stats.bookings || 0}
            icon={<ConfirmationNumberIcon />}
            colorScheme="warning"
            change="+4.10%"
            changeType="up"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Gross Revenue"
            count={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`}
            icon={<AccountBalanceWalletIcon />}
            colorScheme="success"
            change="+3.80%"
            changeType="up"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* 4. Main Growth Chart & Popular Packages */}
      <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TotalGrowthBarChart isLoading={isLoading} stats={stats} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PopularCard isLoading={isLoading} stats={stats} />
        </Grid>
      </Grid>

      {/* 5. Device Segmentation & Financial Reports Section */}
      <Grid container spacing={gridSpacing} sx={{ mb: 3 }}>
        {/* Tour Calendar & Schedule Widget */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard
            title="Tour Schedule & Calendar"
            secondary={
              <Button
                size="small"
                startIcon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => navigate('/calendar')}
                sx={{ fontWeight: 800, fontSize: '11px', textTransform: 'none' }}
              >
                Open Calendar
              </Button>
            }
          >
            <Stack spacing={1.5}>
              {[
                { title: 'Wayanad Monsoon Trek Departure', date: 'Oct 05, 2026', type: 'Departure', color: 'primary' },
                { title: 'Alleppey Houseboat Special Cruise', date: 'Oct 12, 2026', type: 'Booking', color: 'success' },
                { title: 'Munnar Tea Garden Expedition', date: 'Oct 18, 2026', type: 'Departure', color: 'secondary' }
              ].map((sch, idx) => (
                <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: borderLineColor, borderRadius: '12px', backgroundColor: surfaceBgColor }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ minWidth: 0, flexGrow: 1, mr: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" noWrap>{sch.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{sch.date}</Typography>
                    </Box>
                    <Chip size="small" label={sch.type} color={sch.color} sx={{ fontWeight: 800, borderRadius: '6px' }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </MainCard>
        </Grid>

        {/* Recent Financial Transactions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Recent Financial Transactions">
            <List sx={{ p: 0 }}>
              {[
                { title: 'Payout Processed - #AB9234', date: '05 Apr 2026', amount: '+ ₹ 12,000', positive: true },
                { title: 'Commission Deduction - #BC1145', date: '04 Apr 2026', amount: '- ₹ 840', positive: false },
                { title: 'Monthly TDL Subscriptions', date: '01 Apr 2026', amount: '- ₹ 1,299', positive: false },
                { title: 'Refund Initiated - #RE9234', date: '30 Mar 2026', amount: '- ₹ 4,500', positive: false }
              ].map((item, index) => (
                <Box key={index}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight="700">{item.title}</Typography>}
                      secondary={item.date}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                    <ListItemSecondaryAction sx={{ pr: 0 }}>
                      <Typography variant="subtitle2" sx={{ color: item.positive ? 'success.main' : 'error.main', fontWeight: '800' }}>
                        {item.amount}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < 3 && <Divider sx={{ borderColor: borderLineColor }} />}
                </Box>
              ))}
            </List>
          </MainCard>
        </Grid>

        {/* Downloadable Reports & Statements */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard
            title="Account Statements & Reports"
            secondary={
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                <FileDownloadIcon fontSize="inherit" sx={{ mr: 0.5 }} /> ALL FORMATS
              </Box>
            }
          >
            <Stack spacing={1.5}>
              {[
                { label: 'Monthly GST Statement', format: 'PDF', icon: <ReceiptLongIcon /> },
                { label: 'Booking Payout Summary', format: 'CSV', icon: <ReceiptLongIcon /> },
                { label: 'TDS Deduction Certificate', format: 'PDF', icon: <ReceiptLongIcon /> }
              ].map((rep, i) => (
                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: borderLineColor, borderRadius: '12px', '&:hover': { bgcolor: surfaceBgColor, cursor: 'pointer' } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ color: 'primary.main', display: 'flex' }}>{rep.icon}</Box>
                      <Typography variant="subtitle2" fontWeight="700">{rep.label}</Typography>
                    </Stack>
                    <Chip size="small" label={rep.format} variant="outlined" color="primary" sx={{ fontWeight: 800, borderRadius: '6px' }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* 6. Recent Bookings Table Section */}
      <MainCard
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" fontWeight="800" fontSize="1.25rem">
              Recent Tour Bookings
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/platform/bookings')}
              sx={{ fontWeight: 700, textTransform: 'none', color: 'primary.main' }}
            >
              View All Bookings
            </Button>
          </Stack>
        }
      >
        <DataTable
          columns={recentBookingColumns}
          data={stats.recentBookings || []}
          loading={isLoading}
          emptyTitle="No recent bookings found"
          emptySubtitle="When customers place bookings, they will appear here."
        />
      </MainCard>
    </Box>
  );
}

