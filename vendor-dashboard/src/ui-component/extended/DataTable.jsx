import PropTypes from 'prop-types';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, LinearProgress, Box, Typography, Skeleton 
} from '@mui/material';
import SaasTablePagination from './SaasTablePagination';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import useThemeMode from 'hooks/useThemeMode';

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
    const { isDark: isDarkMode } = useThemeMode();

    const cardBgColor = isDarkMode ? '#16152b' : '#ffffff';
    const surfaceBgColor = isDarkMode ? '#212040' : '#f8fafc';
    const borderLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const subTextColor = isDarkMode ? '#9ca3af' : '#64748b';
    const textColor = isDarkMode ? '#f9fafb' : '#0f172a';

    const tableRows = Array.isArray(rows) ? rows : (Array.isArray(data) ? data : []);
    const count = totalCount !== undefined ? totalCount : tableRows.length;
    
    // Automatically slice client-side rows when pagination is enabled
    const shouldSlice = 
        onPageChange && 
        page !== undefined && 
        rowsPerPage !== undefined && 
        (totalCount === undefined || totalCount === tableRows.length || tableRows.length > rowsPerPage);

    const paginatedRows = shouldSlice
        ? tableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : tableRows;

    const cols = Array.isArray(columns) ? columns : [];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: borderLineColor,
                backgroundColor: cardBgColor,
                overflow: 'hidden',
                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 2px 12px rgba(15, 23, 42, 0.03)',
                ...sx
            }}
        >
            {loading && (
                <LinearProgress 
                    sx={{ 
                        height: 3, 
                        bgcolor: isDarkMode ? 'rgba(65, 160, 174, 0.15)' : 'rgba(54, 102, 156, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: isDarkMode ? '#41a0ae' : '#36669c'
                        }
                    }} 
                />
            )}

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
                                        fontSize: '0.74rem',
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
                                            <Skeleton 
                                                variant="text" 
                                                height={24} 
                                                width={cIdx === 0 ? '70%' : '50%'} 
                                                sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : undefined }}
                                            />
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
                                        '&:last-child td, &:last-child th': { borderBottom: 0 },
                                        borderColor: borderLineColor,
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': {
                                            backgroundColor: isDarkMode ? 'rgba(65, 160, 174, 0.08) !important' : 'rgba(54, 102, 156, 0.04) !important'
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
