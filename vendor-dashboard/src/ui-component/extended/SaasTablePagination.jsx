import PropTypes from 'prop-types';
import { Box, Stack, Typography, Select, MenuItem, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useThemeMode from 'hooks/useThemeMode';

export default function SaasTablePagination({
    count = 0,
    page = 0,
    rowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50]
}) {
    const { isDark: isDarkMode } = useThemeMode();

    const totalPages = Math.ceil(count / rowsPerPage) || 1;
    const currentPage = page + 1;

    // Accurate calculation for list count: e.g. "Showing 1 to 10 of 45 entries"
    const from = count === 0 ? 0 : page * rowsPerPage + 1;
    const to = Math.min((page + 1) * rowsPerPage, count);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage;
            pages.push(
                <Button
                    key={i}
                    size="small"
                    onClick={() => onPageChange(null, i - 1)}
                    sx={{
                        minWidth: 34,
                        height: 34,
                        px: 1.2,
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: isActive ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#334155'),
                        background: isActive 
                            ? (isDarkMode 
                                ? 'linear-gradient(135deg, #41a0ae 0%, #36669c 100%)' 
                                : 'linear-gradient(135deg, #36669c 0%, #41a0ae 100%)')
                            : (isDarkMode ? '#212040' : '#ffffff'),
                        border: isActive ? 'none' : '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        boxShadow: isActive ? '0 2px 8px rgba(54, 102, 156, 0.35)' : 'none',
                        transition: 'all 0.18s ease-in-out',
                        '&:hover': {
                            background: isActive 
                                ? (isDarkMode 
                                    ? 'linear-gradient(135deg, #358b97 0%, #2e5784 100%)' 
                                    : 'linear-gradient(135deg, #2e5784 0%, #358b97 100%)')
                                : (isDarkMode ? 'rgba(65, 160, 174, 0.18)' : '#f8fafc'),
                            borderColor: isActive ? 'none' : (isDarkMode ? 'rgba(65, 160, 174, 0.35)' : '#cbd5e1')
                        }
                    }}
                >
                    {i}
                </Button>
            );
        }

        return pages;
    };

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{
                py: 2,
                px: { xs: 2, sm: 2.5 },
                borderTop: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                bgcolor: isDarkMode ? '#16152b' : '#ffffff',
                borderBottomLeftRadius: 'inherit',
                borderBottomRightRadius: 'inherit'
            }}
        >
            {/* Left: Accurate List Count & Rows Per Page */}
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 1.5, sm: 3 }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                {/* List count summary */}
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>
                    Showing{' '}
                    <Box component="span" sx={{ color: isDarkMode ? '#f9fafb' : '#0f172a', fontWeight: 700 }}>
                        {from}
                    </Box>
                    {' '}to{' '}
                    <Box component="span" sx={{ color: isDarkMode ? '#f9fafb' : '#0f172a', fontWeight: 700 }}>
                        {to}
                    </Box>
                    {' '}of{' '}
                    <Box component="span" sx={{ color: isDarkMode ? '#41a0ae' : '#36669c', fontWeight: 800 }}>
                        {count}
                    </Box>
                    {' '}{count === 1 ? 'entry' : 'entries'}
                </Typography>

                {/* Rows per page selector */}
                <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>
                        Rows per page:
                    </Typography>
                    <Select
                        value={rowsPerPage}
                        onChange={onRowsPerPageChange}
                        size="small"
                        sx={{
                            height: 32,
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            bgcolor: isDarkMode ? '#212040' : '#ffffff',
                            color: isDarkMode ? '#f9fafb' : '#0f172a',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDarkMode ? 'rgba(65, 160, 174, 0.4)' : '#cbd5e1'
                            },
                            '& .MuiSvgIcon-root': {
                                color: isDarkMode ? '#9ca3af' : '#64748b'
                            }
                        }}
                    >
                        {rowsPerPageOptions.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
            </Stack>

            {/* Right: Pagination Navigation Controls */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ alignSelf: { xs: 'center', md: 'auto' }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                <Button
                    size="small"
                    disabled={page === 0}
                    onClick={() => onPageChange(null, page - 1)}
                    startIcon={<ArrowBackIcon sx={{ fontSize: '0.85rem !important' }} />}
                    sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: isDarkMode ? '#e5e7eb' : '#334155',
                        bgcolor: isDarkMode ? '#212040' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        height: 34,
                        px: 1.5,
                        textTransform: 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(65, 160, 174, 0.18)' : '#f8fafc',
                            borderColor: isDarkMode ? 'rgba(65, 160, 174, 0.35)' : '#cbd5e1'
                        },
                        '&.Mui-disabled': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                            opacity: 0.4
                        }
                    }}
                >
                    Previous
                </Button>

                <Stack direction="row" spacing={0.7} alignItems="center">
                    {renderPageNumbers()}
                </Stack>

                <Button
                    size="small"
                    disabled={page >= totalPages - 1}
                    onClick={() => onPageChange(null, page + 1)}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
                    sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: isDarkMode ? '#e5e7eb' : '#334155',
                        bgcolor: isDarkMode ? '#212040' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        height: 34,
                        px: 1.5,
                        textTransform: 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(65, 160, 174, 0.18)' : '#f8fafc',
                            borderColor: isDarkMode ? 'rgba(65, 160, 174, 0.35)' : '#cbd5e1'
                        },
                        '&.Mui-disabled': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                            opacity: 0.4
                        }
                    }}
                >
                    Next
                </Button>
            </Stack>
        </Stack>
    );
}

SaasTablePagination.propTypes = {
    count: PropTypes.number,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    rowsPerPageOptions: PropTypes.array
};
