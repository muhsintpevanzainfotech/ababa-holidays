import { useState, useEffect } from 'react';
import { useColorScheme, useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Paper,
  Avatar,
  TextField,
  MenuItem
} from '@mui/material';

// project imports
import SaasHeader from 'ui-component/extended/SaasHeader';
import MainCard from 'ui-component/cards/MainCard';
import StatusBadge from 'ui-component/extended/StatusBadge';
import { gridSpacing } from 'store/constant';
import api from 'utils/api';

// assets / icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import TourIcon from '@mui/icons-material/Tour';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BlockIcon from '@mui/icons-material/Block';
import CloseIcon from '@mui/icons-material/Close';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New Event Form State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('departure');
  const [newEventDate, setNewEventDate] = useState('');

  // Fetch bookings & schedule events from API
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, packagesRes] = await Promise.all([
          api.get('/bookings').catch(() => ({ success: false, data: [] })),
          api.get('/packages').catch(() => ({ success: false, data: [] }))
        ]);

        const sampleEvents = [];

        // Add Bookings as events
        if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
          bookingsRes.data.forEach((b) => {
            const dateStr = b.travelDate ? b.travelDate.split('T')[0] : new Date().toISOString().split('T')[0];
            sampleEvents.push({
              id: b._id || b.customId,
              title: `${b.contactDetails?.name || 'Customer'} - ${b.package?.title || 'Tour'}`,
              category: 'booking',
              status: b.bookingStatus || 'Confirmed',
              date: dateStr,
              amount: b.totalPrice,
              customer: b.contactDetails?.name || b.user?.name || 'Customer',
              email: b.contactDetails?.email || b.user?.email || '',
              packageTitle: b.package?.title || 'Tour Package'
            });
          });
        }

        // Add Tour Departures
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        // Standard Schedule Departures
        sampleEvents.push(
          {
            id: 'evt-1',
            title: 'Wayanad Monsoon Trek Departure',
            category: 'departure',
            status: 'Scheduled',
            date: new Date(year, month, 5).toISOString().split('T')[0],
            packageTitle: 'Wayanad Monsoon Trek'
          },
          {
            id: 'evt-2',
            title: 'Alleppey Houseboat Special Cruise',
            category: 'departure',
            status: 'Scheduled',
            date: new Date(year, month, 12).toISOString().split('T')[0],
            packageTitle: 'Alleppey Luxury Cruise'
          },
          {
            id: 'evt-3',
            title: 'Munnar Tea Garden Expedition',
            category: 'departure',
            status: 'Scheduled',
            date: new Date(year, month, 18).toISOString().split('T')[0],
            packageTitle: 'Munnar Hills Retreat'
          },
          {
            id: 'evt-4',
            title: 'Kovalam Beach Resort Departure',
            category: 'departure',
            status: 'Scheduled',
            date: new Date(year, month, 24).toISOString().split('T')[0],
            packageTitle: 'Kovalam Beach Stay'
          }
        );

        setEvents(sampleEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  // Calendar Date Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Filter events by type
  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.category === filterType;
  });

  const getEventsForDay = (day) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return filteredEvents.filter((e) => e.date === targetDateStr);
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventDate) return;
    const newEvt = {
      id: `evt-custom-${Date.now()}`,
      title: newEventTitle,
      category: newEventCategory,
      status: 'Scheduled',
      date: newEventDate,
      packageTitle: newEventTitle
    };
    setEvents((prev) => [...prev, newEvt]);
    setNewEventTitle('');
    setNewEventDate('');
    setAddModalOpen(false);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'booking':
        return '#3ec995'; // Emerald Mint
      case 'departure':
        return '#41a0ae'; // Teal
      case 'blocked':
        return '#ef4444'; // Red
      default:
        return '#36669c'; // Blue
    }
  };

  return (
    <Box>
      {/* HEADER SECTION */}
      <SaasHeader
        title="Calendar & Tour Schedule"
        subtitle="Manage tour package departures, customer reservations, and availability schedules in interactive monthly view."
        actionLabel="Add Tour Event"
        onActionClick={() => setAddModalOpen(true)}
        loading={loading}
      />

      {/* CONTROLS & FILTER BAR */}
      <MainCard sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          {/* Month Navigation */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton onClick={prevMonth} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h3" fontWeight="900" sx={{ minWidth: 180, textAlign: 'center' }}>
              {monthName} {year}
            </Typography>
            <IconButton onClick={nextMonth} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <ChevronRightIcon />
            </IconButton>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={resetToday}
              sx={{ fontWeight: 800, borderRadius: '8px', textTransform: 'none', ml: 1 }}
            >
              Today
            </Button>
          </Stack>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1}>
            <Chip
              label="All Schedules"
              clickable
              color={filterType === 'all' ? 'secondary' : 'default'}
              onClick={() => setFilterType('all')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="Bookings"
              clickable
              color={filterType === 'booking' ? 'success' : 'default'}
              onClick={() => setFilterType('booking')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="Departures"
              clickable
              color={filterType === 'departure' ? 'primary' : 'default'}
              onClick={() => setFilterType('departure')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Stack>
      </MainCard>

      {/* CALENDAR GRID */}
      <MainCard content={false} sx={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        {/* Days of Week Header */}
        <Grid container sx={{ bgcolor: isDarkMode ? '#16152b' : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
          {DAYS_OF_WEEK.map((day, i) => (
            <Grid key={i} size={12 / 7} sx={{ py: 1.5, textAlign: 'center', borderRight: i < 6 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="900" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Month Grid Cells */}
        <Grid container sx={{ minHeight: 600 }}>
          {/* Empty cells for previous month offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <Grid
              key={`empty-${index}`}
              size={12 / 7}
              sx={{
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                borderRight: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
                minHeight: 110
              }}
            />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
            const dayNum = dayIdx + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <Grid
                key={dayNum}
                size={12 / 7}
                sx={{
                  p: 1,
                  bgcolor: isToday ? (isDarkMode ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.05)') : 'transparent',
                  borderRight: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  minHeight: 110,
                  transition: 'background-color 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      width: 26,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: isToday ? '#36669c' : 'transparent',
                      color: isToday ? '#ffffff' : 'text.primary'
                    }}
                  >
                    {dayNum}
                  </Typography>
                  {dayEvents.length > 0 && (
                    <Chip label={`${dayEvents.length}`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                  )}
                </Stack>

                {/* Day Events Chips */}
                <Stack spacing={0.6}>
                  {dayEvents.slice(0, 3).map((evt) => (
                    <Box
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setModalOpen(true);
                      }}
                      sx={{
                        px: 1,
                        py: 0.4,
                        borderRadius: '6px',
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                        borderLeft: `4px solid ${getCategoryColor(evt.category)}`,
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
                        }
                      }}
                    >
                      <Typography variant="caption" noWrap fontWeight="700" sx={{ display: 'block', fontSize: '0.72rem' }}>
                        {evt.title}
                      </Typography>
                    </Box>
                  ))}

                  {dayEvents.length > 3 && (
                    <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ pl: 0.5 }}>
                      +{dayEvents.length - 3} more
                    </Typography>
                  )}
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </MainCard>

      {/* EVENT DETAILS DIALOG */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, maxWidth: 440, width: '100%' } }}
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: getCategoryColor(selectedEvent.category), width: 36, height: 36 }}>
                  {selectedEvent.category === 'booking' ? <ConfirmationNumberIcon /> : <TourIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="800">
                    Schedule Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEvent.category.toUpperCase()}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
                  <Typography variant="subtitle1" fontWeight="800">
                    {selectedEvent.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Date: {new Date(selectedEvent.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>

                {selectedEvent.customer && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                      Customer Contact
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ mt: 0.3 }}>
                      {selectedEvent.customer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedEvent.email}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.amount && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" fontWeight="900" color="success.main" sx={{ mt: 0.3 }}>
                      ₹{selectedEvent.amount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={selectedEvent.status || 'Confirmed'} />
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setModalOpen(false)} variant="contained" color="secondary" sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ADD EVENT DIALOG */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight="800">
            Add Tour Event / Departure
          </Typography>
          <IconButton onClick={() => setAddModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Event / Departure Title *"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g. Munnar Group Departure"
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={newEventCategory}
              onChange={(e) => setNewEventCategory(e.target.value)}
            >
              <MenuItem value="departure">Tour Departure</MenuItem>
              <MenuItem value="booking">Customer Booking</MenuItem>
              <MenuItem value="blocked">Blocked Date / Maintenance</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Event Date *"
              slotProps={{ inputLabel: { shrink: true } }}
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleAddEvent} variant="contained" color="secondary" disabled={!newEventTitle || !newEventDate} sx={{ borderRadius: '10px', px: 3, fontWeight: 800 }}>
            Save Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
