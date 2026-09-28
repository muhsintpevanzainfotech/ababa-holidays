import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Stack, Box, Chip } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/StatCard';
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
                <StatCard 
                    count="64.2%" 
                    label="Engagement Rate (+12%)" 
                    icon={<TrendingUpIcon />} 
                    variant="dark" 
                    colorScheme="primary"
                />
            </Grid>

            <Grid size={{ lg: 4, md: 6, xs: 12 }}>
                <StatCard 
                    count="18.5%" 
                    label="Conversion Rate" 
                    icon={<BarChartIcon />} 
                    variant="light" 
                    colorScheme="secondary"
                />
            </Grid>

            <Grid size={{ lg: 4, md: 12, xs: 12 }}>
                <StatCard 
                    count="24" 
                    label="Pending Action Items" 
                    icon={<BookOnlineIcon />} 
                    variant="light" 
                    colorScheme="warning"
                />
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
