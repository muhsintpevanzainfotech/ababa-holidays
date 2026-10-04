import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import barChartOptions from './chart-data/total-growth-bar-chart';

const status = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

const series = [
  { name: 'Investment', data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75] },
  { name: 'Loss', data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75] },
  { name: 'Profit', data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10] },
  { name: 'Maintenance', data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0] }
];

export default function TotalGrowthBarChart({ isLoading, stats }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [value, setValue] = useState('today');
  const [chartOptions, setChartOptions] = useState(barChartOptions);

  const textPrimary = theme.vars.palette.text.primary;
  const divider = theme.vars.palette.divider;
  const grey500 = theme.vars.palette.grey[500];

  const primary200 = theme.vars.palette.primary[200];
  const primaryDark = theme.vars.palette.primary.dark;
  const secondaryMain = theme.vars.palette.secondary.main;
  const secondaryLight = theme.vars.palette.secondary.light;

  const formattedRevenue = stats?.revenue !== undefined ? `₹${stats.revenue.toLocaleString('en-IN')}` : '₹0';

  useEffect(() => {
    setChartOptions({
      ...barChartOptions,
      chart: { ...barChartOptions.chart, fontFamily: fontFamily },
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: { ...barChartOptions.xaxis, labels: { style: { colors: textPrimary } } },
      yaxis: { ...barChartOptions.yaxis, labels: { style: { colors: textPrimary } } },
      grid: { borderColor: divider },
      tooltip: { theme: 'light' },
      legend: { ...(barChartOptions.legend ?? {}), labels: { ...(barChartOptions.legend?.labels ?? {}), colors: grey500 } }
    });
  }, [fontFamily, primary200, primaryDark, secondaryMain, secondaryLight, textPrimary, grey500, divider]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack sx={{ gap: gridSpacing }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total Growth & Revenue</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{formattedRevenue}</Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                ...theme.applyStyles('light', {
                  '& .apexcharts-series:nth-of-type(4) path:hover': {
                    filter: `brightness(0.95)`,
                    transition: 'all 0.3s ease'
                  }
                })
              }}
            >
              <Chart options={chartOptions} series={series} type="bar" height={480} />
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = { isLoading: PropTypes.bool, stats: PropTypes.object };
