import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';

export default function FilterChip({
    label,
    active = false,
    onDelete,
    onClick,
    isMore = false
}) {
    const theme = useTheme();
    const { isDark } = useThemeMode();

    if (isMore) {
        return (
            <Button
                size="small"
                onClick={onClick}
                startIcon={<FilterListIcon fontSize="small" sx={{ color: isDark ? '#9ca3af' : 'text.secondary' }} />}
                sx={{
                    height: 32,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                    color: isDark ? '#e5e7eb' : 'text.primary',
                    bgcolor: isDark ? '#212040' : '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 1.5,
                    '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc'
                    }
                }}
            >
                {label || 'More filters'}
            </Button>
        );
    }

    const activeColor = isDark ? '#41a0ae' : '#36669c';

    return (
        <Chip
            label={label}
            onDelete={onDelete}
            onClick={onClick}
            sx={{
                height: 32,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: active ? activeColor : (isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'),
                bgcolor: active 
                    ? (isDark ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.1)')
                    : (isDark ? '#212040' : '#ffffff'),
                color: active ? activeColor : (isDark ? '#e5e7eb' : '#334155'),
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                    bgcolor: active 
                        ? (isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.15)')
                        : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc')
                },
                '& .MuiChip-deleteIcon': {
                    color: active ? activeColor : (isDark ? '#9ca3af' : 'text.disabled'),
                    fontSize: '0.9rem',
                    '&:hover': {
                        color: activeColor
                    }
                }
            }}
        />
    );
}

FilterChip.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool,
    onDelete: PropTypes.func,
    onClick: PropTypes.func,
    isMore: PropTypes.bool
};

