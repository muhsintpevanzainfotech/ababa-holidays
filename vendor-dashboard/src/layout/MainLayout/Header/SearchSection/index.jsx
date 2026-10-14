import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconSearch, IconX } from '@tabler/icons-react';

// ==============================|| SEARCH INPUT - MOBILE ||============================== //

function MobileSearch({ value, setValue, onSearch, popupState }) {
  return (
    <OutlinedInput
      id="input-search-header-mobile"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSearch();
          popupState.close();
        }
      }}
      placeholder="Search packages, bookings, staff..."
      autoFocus
      size="small"
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.5} size="18px" />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <IconButton size="small" {...bindToggle(popupState)} sx={{ p: 0.5 }}>
            <IconX stroke={1.5} size="18px" />
          </IconButton>
        </InputAdornment>
      }
      sx={{
        width: '100%',
        borderRadius: '10px',
        bgcolor: 'background.paper',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'divider'
        }
      }}
    />
  );
}

// ==============================|| SEARCH INPUT - DESKTOP ||============================== //

export default function SearchSection() {
  const { isDark } = useThemeMode();
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!value.trim()) return;
    navigate(`/packages?search=${encodeURIComponent(value.trim())}`);
  };

  return (
    <>
      {/* Mobile search trigger */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PopupState variant="popper" popupId="search-popup-popper">
          {(popupState) => (
            <>
              <IconButton
                {...bindToggle(popupState)}
                size="small"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <IconSearch stroke={1.5} size="19px" />
              </IconButton>
              <Popper
                {...bindPopper(popupState)}
                transition
                sx={{ zIndex: 1300, width: '92%', maxWidth: 400, top: '10px !important' }}
              >
                {({ TransitionProps }) => (
                  <Transitions type="zoom" {...TransitionProps}>
                    <Card sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                      <MobileSearch value={value} setValue={setValue} onSearch={handleSearch} popupState={popupState} />
                    </Card>
                  </Transitions>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>

      {/* Desktop search bar */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Search packages, bookings, services..."
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <IconSearch stroke={1.5} size="18px" style={{ color: 'var(--text-muted, #94a3b8)' }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <Box 
                sx={{ 
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.200', 
                  px: 0.8, 
                  py: 0.2, 
                  borderRadius: '5px', 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  color: 'text.secondary',
                  letterSpacing: '0.5px'
                }}
              >
                ⌘K
              </Box>
            </InputAdornment>
          }
          sx={{
            width: { md: 240, lg: 320 },
            borderRadius: '10px',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
            fontSize: '0.825rem',
            transition: 'all 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main'
            },
            '&.Mui-focused': {
              width: { md: 280, lg: 380 }
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 1.5
            }
          }}
        />
      </Box>
    </>
  );
}

MobileSearch.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  onSearch: PropTypes.func,
  popupState: PropTypes.any
};
