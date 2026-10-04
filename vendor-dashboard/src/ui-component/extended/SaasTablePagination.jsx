import PropTypes from 'prop-types';
import { Box, Stack, Typography, Select, MenuItem, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function SaasTablePagination({
    count = 0,
    page = 0,
    rowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50]
}) {
    const theme = useTheme();
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDarkMode = !isLightExplicit;

    const totalPages = Math.ceil(count / rowsPerPage) || 1;
    const currentPage = page + 1;

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
                        minWidth: 32,
                        height: 32,
                        px: 1,
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: isActive ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#334155'),
                        bgcolor: isActive ? '#ff5252' : (isDarkMode ? '#1f2937' : 'transparent'),
                        border: isActive ? 'none' : '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        '&:hover': {
                            bgcolor: isActive ? '#e04848' : (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc')
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
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ pt: 2.5, pb: 1, px: 2 }}
        >
            {/* Left: Result per page */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
                    Result per page:
                </Typography>
                <Select
                    value={rowsPerPage}
                    onChange={onRowsPerPageChange}
                    size="small"
                    sx={{
                        height: 34,
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        bgcolor: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#f9fafb' : '#0f172a',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : '#cbd5e1'
                        },
                        '& .MuiSvgIcon-root': {
                            color: isDarkMode ? '#9ca3af' : 'text.secondary'
                        }
                    }}
                >
                    {rowsPerPageOptions.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {opt}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>

            {/* Right: Pagination controls */}
            <Stack direction="row" alignItems="center" spacing={1}>
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
                        bgcolor: isDarkMode ? '#1f2937' : 'transparent',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        height: 32,
                        px: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc'
                        },
                        '&.Mui-disabled': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
                            opacity: 0.4
                        }
                    }}
                >
                    Previous
                </Button>

                <Stack direction="row" spacing={0.8} alignItems="center">
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
                        bgcolor: isDarkMode ? '#1f2937' : 'transparent',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                        height: 32,
                        px: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc'
                        },
                        '&.Mui-disabled': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
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
