import { useState, useEffect } from 'react';
import { Grid, Typography, Stack, Box, Chip, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const AccountReportDashboard = () => {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Financial Accounts & Reports</Typography>
                    <Chip 
                        icon={<AccountBalanceWalletIcon />} 
                        label="Live Balance" 
                        color="success" 
                        variant="outlined" 
                        sx={{ borderRadius: '12px', fontWeight: 'bold' }} 
                    />
                </Stack>
            </Grid>

            {/* Quick Summary Cards */}
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: 'success.light' }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'success.dark' }}>Total Disbursed Balance</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">₹ 48,250</Typography>
                            <Box sx={{ color: 'success.dark', display: 'flex', alignItems: 'center' }}>
                                <FileDownloadIcon fontSize="small" /> Statement
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: 'primary.light' }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'primary.800' }}>Uncleared / Pending Payouts</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">₹ 15,400</Typography>
                            <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                In Process
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            <Grid size={{ lg: 4, md: 12, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: 'secondary.light' }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'secondary.800' }}>Platform Service Fees</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">₹ 2,140</Typography>
                            <Box sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}>
                                Monthly Total
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            {/* Transaction List */}
            <Grid size={{ md: 7, xs: 12 }}>
                <MainCard title="Recent Financial Transactions">
                    <List sx={{ p: 0 }}>
                        {[
                            { title: 'Payout Processed - Booking #AB9234', date: '05 Apr 2026', amount: '+ ₹ 12,000', status: 'Success' },
                            { title: 'Commission Deduction - Booking #BC1145', date: '04 Apr 2026', amount: '- ₹ 840', status: 'Debited' },
                            { title: 'Monthly TDL Subscriptions', date: '01 Apr 2026', amount: '- ₹ 1,299', status: 'Success' },
                            { title: 'Refund Initiated - Booking #RE9234', date: '30 Mar 2026', amount: '- ₹ 4,500', status: 'Pending' }
                        ].map((item, index) => (
                           <Box key={index}>
                               <ListItem>
                                   <ListItemText 
                                       primary={item.title} 
                                       secondary={item.date} 
                                       secondaryTypographyProps={{ variant: 'caption' }} 
                                   />
                                   <ListItemSecondaryAction>
                                       <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                                           <Typography variant="subtitle1" sx={{ 
                                                color: item.amount.startsWith('+') ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                           }}>
                                               {item.amount}
                                           </Typography>
                                           <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                                       </Stack>
                                   </ListItemSecondaryAction>
                               </ListItem>
                               {index < 3 && <Divider sx={{ my: 0.5 }} />}
                           </Box>
                        ))}
                    </List>
                </MainCard>
            </Grid>

            <Grid size={{ md: 5, xs: 12 }}>
                <MainCard 
                    title="Export Account Reports" 
                    secondary={
                        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                            <FileDownloadIcon fontSize="inherit" sx={{ mr: 0.5 }} /> ALL FORMATS
                        </Box>
                    }
                >
                    <Stack spacing={2}>
                        {[
                           { label: 'Monthly GST Statement', format: 'PDF', icon: <ReceiptLongIcon /> },
                           { label: 'Booking Payout Summary', format: 'CSV', icon: <ReceiptLongIcon /> },
                           { label: 'TDS Deduction Certificate', format: 'PDF', icon: <ReceiptLongIcon /> }
                        ].map((rep, i) => (
                           <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' } }}>
                               <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                   <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                                       <Box sx={{ color: 'primary.main' }}>{rep.icon}</Box>
                                       <Typography variant="subtitle1">{rep.label}</Typography>
                                   </Stack>
                                   <Chip size="small" label={rep.format} variant="outlined" />
                               </Stack>
                           </Box>
                        ))}
                    </Stack>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default AccountReportDashboard;
