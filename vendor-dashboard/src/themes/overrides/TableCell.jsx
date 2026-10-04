// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableCell(theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: theme.vars.palette.grey[200],

          '&.MuiTableCell-head': {
            fontSize: '0.875rem',
            color: theme.vars.palette.grey[900],
            fontWeight: 600
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'rgba(54, 102, 156, 0.06) !important'
          }
        }
      }
    }
  };
}
