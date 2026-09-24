// ==============================|| OVERRIDES - TABS ||============================== //

export default function Tabs(theme) {
  return {
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          borderBottom: '1px solid',
          borderColor: theme.vars.palette.grey[200]
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: theme.vars.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.vars.palette.secondary.dark
          },
          ...theme.applyStyles('dark', {
            color: theme.vars.palette.text.secondary,
            '&.Mui-selected': {
              color: '#c2d099'
            }
          })
        }
      }
    }
  };
}
