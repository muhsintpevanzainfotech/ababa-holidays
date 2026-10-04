import PropTypes from 'prop-types';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, LinearProgress, Box, Typography, Stack, Skeleton 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaasTablePagination from './SaasTablePagination';
import FolderOffIcon from '@mui/icons-material/FolderOff';

const DataTable = ({
    columns = [],
    rows,
    data,
    loading = false,
    page = 0,
    rowsPerPage = 10,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    emptyTitle = 'No Records Found',
    emptySubtitle = 'There are no items matching your criteria.',
    emptyIcon = <FolderOffIcon sx={{ fontSize: 44, color: 'text.disabled' }} />,
    minWidth = 700,
    sx = {}
}) => {
    const theme = useTheme();
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDarkMode = !isLightExplicit;

    const cardBgColor = isDarkMode ? '#111827' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#1f2937' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const subTextColor = isDarkMode ? '#9ca3af' : '#64748b';
    const textColor = isDarkMode ? '#f9fafb' : '#0f172a';

    const tableRows = Array.isArray(rows) ? rows : (Array.isArray(data) ? data : []);
    const count = totalCount !== undefined ? totalCount : tableRows.length;
    
    const paginatedRows = (page !== undefined && rowsPerPage !== undefined && totalCount === undefined)
        ? tableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : tableRows;

    const cols = Array.isArray(columns) ? columns : [];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '6px',
                border: '1px solid',
                borderColor: borderLineColor,
                backgroundColor: cardBgColor,
                overflow: 'hidden',
                boxShadow: 'none',
                ...sx
            }}
        >
            {loading && <LinearProgress sx={{ height: 3, backgroundColor: 'transparent' }} />}

            <TableContainer>
                <Table sx={{ minWidth }}>
                    <TableHead sx={{ backgroundColor: surfaceBgColor }}>
                        <TableRow>
                            {cols.map((col, idx) => (
                                <TableCell
                                    key={col.field || col.id || idx}
                                    align={col.align || 'left'}
                                    sx={{
                                        color: subTextColor,
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        py: 1.75,
                                        minWidth: col.minWidth,
                                        width: col.width,
                                        borderBottom: '1px solid',
                                        borderColor: borderLineColor,
                                        backgroundColor: surfaceBgColor,
                                        pl: idx === 0 ? 3 : 2,
                                        pr: idx === cols.length - 1 ? 3 : 2
                                    }}
                                >
                                    {col.headerName || col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, rIdx) => (
                                <TableRow key={rIdx} sx={{ borderColor: borderLineColor }}>
                                    {cols.map((col, cIdx) => (
                                        <TableCell
                                            key={col.field || col.id || cIdx}
                                            align={col.align || 'left'}
                                            sx={{
                                                borderColor: borderLineColor,
                                                py: 2,
                                                pl: cIdx === 0 ? 3 : 2,
                                                pr: cIdx === cols.length - 1 ? 3 : 2
                                            }}
                                        >
                                            <Skeleton variant="text" height={24} width={cIdx === 0 ? '70%' : '50%'} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={cols.length || 1} align="center" sx={{ py: 6, borderBottom: 0 }}>
                                    <Box textAlign="center">
                                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center', opacity: 0.6 }}>
                                            {emptyIcon}
                                        </Box>
                                        <Typography variant="h4" sx={{ color: textColor, fontWeight: 700, mb: 0.5, fontSize: '1.05rem' }}>
                                            {emptyTitle}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: subTextColor, fontSize: '0.85rem' }}>
                                            {emptySubtitle}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((row, rIdx) => (
                                <TableRow
                                    key={row._id || row.id || rIdx}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        borderColor: borderLineColor,
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': {
                                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.035) !important' : '#f8fafc !important'
                                        }
                                    }}
                                >
                                    {cols.map((col, cIdx) => (
                                        <TableCell
                                            key={col.field || col.id || cIdx}
                                            align={col.align || 'left'}
                                            sx={{
                                                borderColor: borderLineColor,
                                                py: 1.8,
                                                pl: cIdx === 0 ? 3 : 2,
                                                pr: cIdx === cols.length - 1 ? 3 : 2
                                            }}
                                        >
                                            {col.render ? col.render(row) : row[col.field || col.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {onPageChange && (
                <SaasTablePagination
                    count={count}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                />
            )}
        </Paper>
    );
};

DataTable.propTypes = {
    columns: PropTypes.array,
    rows: PropTypes.array,
    data: PropTypes.array,
    loading: PropTypes.bool,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number,
    totalCount: PropTypes.number,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    emptyTitle: PropTypes.string,
    emptySubtitle: PropTypes.string,
    emptyIcon: PropTypes.node,
    minWidth: PropTypes.number,
    sx: PropTypes.object
};

export default DataTable;
