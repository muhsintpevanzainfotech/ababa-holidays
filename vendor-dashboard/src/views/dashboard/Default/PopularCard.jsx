import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// assets
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function PopularCard({ isLoading, stats }) {
  const theme = useTheme();
  const { isDark: isDarkMode } = useThemeMode();

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [now, setNow] = useState(new Date());

  // Real-time 1-second live clock update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedFullDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }); // e.g. Sunday, October 04, 2026

  const formattedTimeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }); // e.g. 07:58:37 PM

  // Calendar month computation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleResetToday = () => {
    const t = new Date();
    setViewDate(t);
    setSelectedDay(t.getDate());
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Formatted selected date
  const selectedFullDateObj = new Date(currentYear, currentMonth, selectedDay);
  const selectedFullDateStr = selectedFullDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard
          content={false}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardContent
            sx={{
              p: '20px !important',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Stack spacing={2} sx={{ height: '100%', justifyContent: 'space-between' }}>
              {/* LIVE CLOCK & DATE BANNER */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: '14px',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #16152b 0%, #212040 100%)'
                    : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1.5px solid',
                  borderColor: isDarkMode ? 'rgba(65, 160, 174, 0.4)' : '#bfdbfe',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <CalendarTodayIcon sx={{ color: isDarkMode ? '#a78bfa' : '#2563eb', fontSize: 16 }} />
                      <Typography variant="subtitle2" fontWeight="800" sx={{ fontSize: '0.825rem', color: isDarkMode ? '#a78bfa' : '#1d4ed8' }}>
                        {formattedFullDate}
                      </Typography>
                    </Stack>
                    <Chip
                      icon={<EventAvailableIcon style={{ fontSize: 12 }} />}
                      label="LIVE"
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 900, borderRadius: '6px', height: 20, fontSize: '0.65rem' }}
                    />
                  </Stack>

                  <Divider sx={{ opacity: isDarkMode ? 0.2 : 0.4 }} />

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" fontWeight={800} letterSpacing={0.5} sx={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#475569' }}>
                      TIME CLOCK
                    </Typography>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <AccessTimeIcon sx={{ color: isDarkMode ? '#38bdf8' : '#0284c7', fontSize: 16 }} />
                      <Typography variant="h3" fontWeight="900" letterSpacing={0.5} sx={{ fontSize: '1.25rem', color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                        {formattedTimeStr}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              {/* MONTHLY CALENDAR GRID BOX */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: isDarkMode ? '#16152b' : '#ffffff',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Month Selector Bar with Navigation Controls */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="h5" fontWeight="800" sx={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
                    {monthNames[currentMonth]} {currentYear}
                  </Typography>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleResetToday}
                      sx={{
                        fontSize: '0.7rem',
                        py: 0.3,
                        px: 1.2,
                        minWidth: 'auto',
                        borderRadius: '6px',
                        fontWeight: 800,
                        mr: 0.5,
                        color: isDarkMode ? '#a78bfa' : '#2563eb',
                        borderColor: isDarkMode ? 'rgba(167,139,250,0.4)' : '#bfdbfe',
                        bgcolor: isDarkMode ? 'rgba(124,58,237,0.1)' : '#eff6ff',
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(124,58,237,0.2)' : '#dbeafe',
                          borderColor: isDarkMode ? '#a78bfa' : '#2563eb'
                        }
                      }}
                    >
                      Today
                    </Button>
                    <IconButton
                      size="small"
                      onClick={handlePrevMonth}
                      sx={{
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        color: isDarkMode ? '#ffffff' : '#334155',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                          color: isDarkMode ? '#ffffff' : '#0f172a'
                        }
                      }}
                    >
                      <ChevronLeftIcon style={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleNextMonth}
                      sx={{
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        color: isDarkMode ? '#ffffff' : '#334155',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                          color: isDarkMode ? '#ffffff' : '#0f172a'
                        }
                      }}
                    >
                      <ChevronRightIcon style={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Day Names Header (7 Equal Columns) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 0.5,
                    textAlign: 'center',
                    mb: 1
                  }}
                >
                  {daysOfWeek.map((day) => (
                    <Typography key={day} variant="caption" fontWeight="800" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', color: isDarkMode ? '#94a3b8' : '#475569' }}>
                      {day}
                    </Typography>
                  ))}
                </Box>

                {/* Days Grid (7 Equal Columns) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 0.6,
                    alignItems: 'center',
                    justifyItems: 'center',
                    flexGrow: 1
                  }}
                >
                  {/* Empty slots before day 1 */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <Box key={`empty-${idx}`} sx={{ width: '100%', height: 34 }} />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isTodayNum = isCurrentMonth && today.getDate() === dayNum;
                    const isSelected = selectedDay === dayNum;

                    return (
                      <Box
                        key={`day-${dayNum}`}
                        onClick={() => setSelectedDay(dayNum)}
                        sx={{
                          width: '100%',
                          maxWidth: 36,
                          height: 36,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: isTodayNum || isSelected ? 900 : 700,
                          transition: 'all 0.18s ease',
                          bgcolor: isSelected
                            ? (isDarkMode ? '#7c3aed' : '#2563eb')
                            : isTodayNum
                            ? (isDarkMode ? 'rgba(124, 58, 237, 0.25)' : '#eff6ff')
                            : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'),
                          color: isSelected
                            ? '#ffffff'
                            : isTodayNum
                            ? (isDarkMode ? '#a78bfa' : '#2563eb')
                            : (isDarkMode ? '#ffffff' : '#0f172a'),
                          border: '1.5px solid',
                          borderColor: isSelected
                            ? (isDarkMode ? '#7c3aed' : '#2563eb')
                            : isTodayNum
                            ? (isDarkMode ? '#a78bfa' : '#3b82f6')
                            : (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'),
                          boxShadow: isSelected ? (isDarkMode ? '0 4px 12px rgba(124, 58, 237, 0.4)' : '0 4px 12px rgba(37, 99, 235, 0.35)') : 'none',
                          '&:hover': {
                            bgcolor: isSelected
                              ? (isDarkMode ? '#6d28d9' : '#1d4ed8')
                              : (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'),
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {dayNum}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              {/* SELECTED DATE SUMMARY FOOTER */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  px: 1.8,
                  borderRadius: '10px',
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#22c55e',
                        boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                      }}
                    />
                    <Typography variant="caption" fontWeight="800" sx={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      SELECTED DATE:
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" fontWeight="900" sx={{ fontSize: '0.825rem', color: isDarkMode ? '#38bdf8' : '#2563eb' }}>
                    {selectedFullDateStr}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </CardContent>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  stats: PropTypes.object
};
