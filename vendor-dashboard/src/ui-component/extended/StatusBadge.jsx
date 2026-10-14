import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import useThemeMode from 'hooks/useThemeMode';

const formatStatusLabel = (val) => {
    if (val === undefined || val === null || String(val).trim() === '') {
        return 'Active';
    }
    if (typeof val === 'boolean') {
        return val ? 'Active' : 'Inactive';
    }
    const str = String(val).trim().replace(/_/g, ' ');
    // Handle booleans passed as string
    if (str.toLowerCase() === 'true') return 'Active';
    if (str.toLowerCase() === 'false') return 'Inactive';
    
    // Capitalize each word
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const getBadgeStyle = (status = '', isDark = false) => {
    const s = String(status).toLowerCase().trim().replace(/_/g, ' ');
    switch (s) {
        case 'active':
        case 'approved':
        case 'confirmed':
        case 'published':
        case 'completed':
        case 'verified':
        case 'success':
        case 'paid':
        case 'available':
        case 'true':
        case 'open':
            return {
                bg: isDark ? 'rgba(62, 201, 149, 0.18)' : '#e6f9f2',
                color: isDark ? '#77f07f' : '#10b981',
                border: isDark ? 'rgba(119, 240, 127, 0.4)' : '#a7f3d0'
            };
        case 'pending':
        case 'in progress':
        case 'draft':
        case 'processing':
        case 'review':
        case 'scheduled':
        case 'unpaid':
        case 'unread':
        case 'new':
            return {
                bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#fffbe6',
                color: isDark ? '#fbbf24' : '#d97706',
                border: isDark ? 'rgba(251, 191, 36, 0.4)' : '#fde68a'
            };
        case 'correction':
        case 'needs correction':
            return {
                bg: isDark ? 'rgba(249, 115, 22, 0.18)' : '#fff7ed',
                color: isDark ? '#fb923c' : '#ea580c',
                border: isDark ? 'rgba(251, 146, 60, 0.4)' : '#ffedd5'
            };
        case 'inactive':
        case 'suspended':
        case 'rejected':
        case 'cancelled':
        case 'canceled':
        case 'error':
        case 'failed':
        case 'false':
        case 'closed':
            return {
                bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#fef2f2',
                color: isDark ? '#f87171' : '#ef4444',
                border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'
            };
        case 'read':
        case 'replied':
        case 'user':
        case 'team':
        case 'basic':
        case 'admin':
        case 'vendor':
            return {
                bg: isDark ? 'rgba(59, 130, 246, 0.22)' : '#eff6ff',
                color: isDark ? '#60a5fa' : '#2563eb',
                border: isDark ? 'rgba(96, 165, 250, 0.4)' : '#bfdbfe'
            };
        default:
            return {
                bg: isDark ? 'rgba(100, 116, 139, 0.18)' : '#f1f5f9',
                color: isDark ? '#cbd5e1' : '#475569',
                border: isDark ? 'rgba(100, 116, 139, 0.4)' : '#cbd5e1'
            };
    }
};

export default function StatusBadge({ label, status, size = 'small', icon }) {
    const { isDark } = useThemeMode();
    
    // Accept either label or status prop
    const rawVal = label !== undefined && label !== null && label !== '' ? label : status;
    const formattedLabel = formatStatusLabel(rawVal);
    const style = getBadgeStyle(formattedLabel, isDark);

    return (
        <Chip
            icon={icon}
            label={formattedLabel}
            size={size}
            sx={{
                bgcolor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                fontWeight: 700,
                fontSize: size === 'small' ? '0.73rem' : '0.82rem',
                borderRadius: '20px',
                height: size === 'small' ? 24 : 28,
                px: 0.75,
                '& .MuiChip-label': {
                    px: 1
                },
                '& .MuiChip-icon': {
                    color: style.color
                }
            }}
        />
    );
}

StatusBadge.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    size: PropTypes.oneOf(['small', 'medium']),
    icon: PropTypes.node
};

