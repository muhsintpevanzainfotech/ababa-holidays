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
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1.5px)',
            boxShadow: '0 6px 16px rgba(54, 102, 156, 0.25)'
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
            boxShadow: '0 8px 22px rgba(54, 102, 156, 0.35)'
          }
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${theme.vars.palette.secondary.main} 0%, ${theme.vars.palette.secondary.dark} 100%)`,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.vars.palette.secondary.dark} 0%, ${theme.vars.palette.secondary.main} 100%)`,
            boxShadow: '0 8px 22px rgba(65, 160, 174, 0.35)'
          }
        },
        containedSuccess: {
          background: `linear-gradient(135deg, ${theme.vars.palette.success.main} 0%, ${theme.vars.palette.success.dark} 100%)`,
          color: '#ffffff',
          '&:hover': {
            boxShadow: '0 8px 22px rgba(62, 201, 149, 0.35)'
          }
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: theme.vars.palette.grey[300],
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: theme.vars.palette.primary.main,
            backgroundColor: 'rgba(54, 102, 156, 0.08)'
          }
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem'
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem'
        }
      }
    }
  };
}

