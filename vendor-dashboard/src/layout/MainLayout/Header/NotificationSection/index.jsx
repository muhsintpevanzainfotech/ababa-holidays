import { Activity, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

// assets
import { IconBell } from '@tabler/icons-react';

// notification status options
const status = [
  {
    value: 'all',
    label: 'All Notification'
  },
  {
    value: 'new',
    label: 'New'
  },
  {
    value: 'unread',
    label: 'Unread'
  },
  {
    value: 'other',
    label: 'Other'
  }
];

// ==============================|| NOTIFICATION ||============================== //

export default function NotificationSection() {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    event?.target.value && setValue(event?.target.value);
  };

  const isDark = mode === 'dark' || theme.palette.mode === 'dark';

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Avatar
          variant="rounded"
          sx={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            transition: 'all .2s ease-in-out',
            color: isDark ? '#41a0ae' : '#36669c',
            background: isDark ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.1)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)',
            cursor: 'pointer',
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: '#ffffff',
              background: '#36669c'
            }
          }}
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <IconBell stroke={1.5} size="22px" />
        </Avatar>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper>
                <Activity mode={open ? 'visible' : 'hidden'}>
                  <MainCard
                    border={false}
                    elevation={16}
                    content={false}
                    boxShadow
                    shadow={theme.shadows[16]}
                    sx={{
                      maxWidth: 340,
                      bgcolor: isDark ? '#16152b' : '#ffffff',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 12px 32px rgba(15, 23, 42, 0.1)'
                    }}
                  >
                    <Stack sx={{ gap: 2 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                        <Stack direction="row" sx={{ gap: 2 }}>
                          <Typography variant="subtitle1">All Notification</Typography>
                          <Chip size="small" label="01" variant="filled" sx={{ color: 'background.default', bgcolor: 'warning.dark' }} />
                        </Stack>
                        <Typography component={Link} to="#" variant="subtitle2" sx={{ color: 'primary.main' }}>
                          Mark as all read
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 1, maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 5 } }}>
                        <Box sx={{ px: 2, pt: 0.25 }}>
                          <TextField
                            id="outlined-select-currency-native"
                            select
                            fullWidth
                            value={value}
                            onChange={handleChange}
                            slotProps={{ select: { native: true } }}
                          >
                            {status.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                        <Divider sx={{ mt: 2 }} />
                        <NotificationList />
                      </Box>
                    </Stack>
                    <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                      <Button size="small" disableElevation>
                        View All
                      </Button>
                    </CardActions>
                  </MainCard>
                </Activity>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
