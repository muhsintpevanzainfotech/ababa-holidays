// ==============================|| OVERRIDES - BUTTON ||============================== //

export default function Button(theme) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '10px',
          padding: '8px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(53, 133, 142, 0.15)'
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.primary.dark} 100%)`,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.dark} 0%, ${theme.vars.palette.primary.main} 100%)`,
            boxShadow: '0 6px 20px rgba(53, 133, 142, 0.25)'
          }
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${theme.vars.palette.secondary.main} 0%, ${theme.vars.palette.secondary.dark} 100%)`,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.vars.palette.secondary.dark} 0%, ${theme.vars.palette.secondary.main} 100%)`,
            boxShadow: '0 6px 20px rgba(125, 167, 140, 0.25)'
          }
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: 'rgba(53, 133, 142, 0.25)',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: theme.vars.palette.primary.main,
            backgroundColor: 'rgba(53, 133, 142, 0.04)'
          }
        }
      }
    }
  };
}
