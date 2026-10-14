import PropTypes from 'prop-types';
import { Box, Stack, Typography, Button, IconButton, Tooltip, Skeleton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function SaasHeader({
    title,
    subtitle,
    dateText = null,
    onDateClick,
    onExportClick,
    actionLabel,
    actionIcon,
    onActionClick,
    extraActions,
    loading = false
}) {
    return (
        <Box sx={{ mb: 3 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Box>
                    {loading ? (
                        <>
                            <Skeleton variant="text" width={260} height={42} />
                            <Skeleton variant="text" width={380} height={22} />
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '2rem' },
                                    fontWeight: 800,
                                    letterSpacing: '-0.02em',
                                    color: 'text.primary',
                                    fontFamily: 'Outfit, Inter, sans-serif'
                                }}
                            >
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    {onExportClick && (
                        <Tooltip title="Export Report">
                            <IconButton
                                onClick={onExportClick}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '10px',
                                    bgcolor: 'background.paper',
                                    width: 40,
                                    height: 40
                                }}
                            >
                                <FileDownloadIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {dateText && (
                        <Button
                            variant="outlined"
                            onClick={onDateClick}
                            startIcon={<CalendarTodayIcon sx={{ fontSize: '0.9rem !important', color: 'text.secondary' }} />}
                            sx={{
                                color: 'text.primary',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                px: 2,
                                height: 40,
                                '&:hover': {
                                    bgcolor: 'grey.50',
                                    borderColor: 'divider'
                                }
                            }}
                        >
                            {dateText}
                        </Button>
                    )}

                    {extraActions}

                    {actionLabel && (
                        <Button
                            variant="contained"
                            onClick={onActionClick}
                            startIcon={actionIcon}
                            sx={{
                                background: 'linear-gradient(135deg, #36669c 0%, #41a0ae 100%)',
                                color: '#ffffff',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                textTransform: 'none',
                                px: 2.5,
                                height: 40,
                                boxShadow: '0 4px 14px rgba(54, 102, 156, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2e5784 0%, #358b97 100%)',
                                    boxShadow: '0 6px 18px rgba(54, 102, 156, 0.45)'
                                }
                            }}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

SaasHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    dateText: PropTypes.string,
    onDateClick: PropTypes.func,
    onExportClick: PropTypes.func,
    actionLabel: PropTypes.string,
    actionIcon: PropTypes.node,
    onActionClick: PropTypes.func,
    extraActions: PropTypes.node,
    loading: PropTypes.bool
};
