import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Stack, Box, Chip } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import BarChartIcon from '@mui/icons-material/BarChart';

const AnalyticsDashboard = () => {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Analytics Dashboard</Typography>
                    <Chip 
                        icon={<TrendingUpIcon />} 
                        label="Live Trends" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ borderRadius: '12px', fontWeight: 'bold' }} 
                    />
                </Stack>
            </Grid>

            {/* Top Stat Cards */}
            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: theme.vars.palette.primary.light }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'primary.800' }}>Engagement Rate</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">64.2%</Typography>
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon fontSize="small" /> +12%
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: theme.vars.palette.secondary.light }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'secondary.800' }}>Conversion Analytics</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">18.5%</Typography>
                            <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                <BarChartIcon fontSize="small" /> Healthy
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            <Grid size={{ lg: 4, md: 12, xs: 12 }}>
                <MainCard border={false} sx={{ bgcolor: 'orange.light' }}>
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'orange.dark' }}>Total Pending Requests</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h2">24</Typography>
                            <Box sx={{ color: 'orange.dark', display: 'flex', alignItems: 'center' }}>
                                <BookOnlineIcon fontSize="small" /> Requires Action
                            </Box>
                        </Stack>
                    </Stack>
                </MainCard>
            </Grid>

            {/* Main Content Area */}
            <Grid size={{ md: 8, xs: 12 }}>
                <MainCard title="Booking Volume Trends (Module-wise)">
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: '14px', border: '1px dashed', borderColor: 'grey.200' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Module Performance Chart Layer Placeholder</Typography>
                    </Box>
                </MainCard>
            </Grid>

            <Grid size={{ md: 4, xs: 12 }}>
                <MainCard title="Device Segmentation">
                    <Stack spacing={2}>
                        {[
                           { label: 'Mobile App', value: '55%', color: 'primary' },
                           { label: 'Desktop Web', value: '30%', color: 'secondary' },
                           { label: 'Direct Referral', value: '15%', color: 'success' }
                        ].map((dev, i) => (
                           <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px' }}>
                               <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                   <Typography variant="subtitle1">{dev.label}</Typography>
                                   <Chip size="small" label={dev.value} color={dev.color} />
                               </Stack>
                           </Box>
                        ))}
                    </Stack>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default AnalyticsDashboard;
