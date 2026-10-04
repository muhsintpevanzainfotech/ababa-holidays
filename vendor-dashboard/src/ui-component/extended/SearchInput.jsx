import PropTypes from 'prop-types';
import { TextField, InputAdornment, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    width = 280,
    showShortcut = true
}) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <TextField
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            size="small"
            sx={{
                width: { xs: '100%', sm: width },
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: isDark ? '#1f2937' : '#ffffff',
                    fontSize: '0.875rem',
                    height: 38,
                    color: isDark ? '#f9fafb' : '#0f172a',
                    '& fieldset': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
                    },
                    '&:hover fieldset': {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#cbd5e1'
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#ff5252'
                    }
                }
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: isDark ? '#9ca3af' : 'text.secondary' }} />
                    </InputAdornment>
                ),
                endAdornment: showShortcut ? (
                    <InputAdornment position="end">
                        <Box
                            sx={{
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',
                                borderRadius: '6px',
                                px: 0.8,
                                py: 0.2,
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                gap: 0.3
                            }}
                        >
                            <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 700, color: isDark ? '#9ca3af' : 'text.secondary' }}>
                                ⌘ K
                            </Typography>
                        </Box>
                    </InputAdornment>
                ) : null
            }}
        />
    );
}

SearchInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showShortcut: PropTypes.bool
};

