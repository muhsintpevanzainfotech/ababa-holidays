// ==============================|| OVERRIDES - LIST ITEM BUTTON ||============================== //

export default function ListItemButton(theme) {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: theme.vars.palette.text.primary,
          paddingTop: '10px',
          paddingBottom: '10px',

          '&.Mui-selected': {
            color: theme.vars.palette.secondary.dark,
            backgroundColor: theme.vars.palette.secondary.light,
            '&:hover': {
              backgroundColor: theme.vars.palette.secondary.light
            },
            '& .MuiListItemIcon-root': {
              color: theme.vars.palette.secondary.dark
            }
          },

          '&:hover': {
            backgroundColor: theme.vars.palette.secondary.light,
            color: theme.vars.palette.secondary.dark,
            '& .MuiListItemIcon-root': {
              color: theme.vars.palette.secondary.dark
            }
          },

          ...theme.applyStyles('dark', {
            '&.Mui-selected': {
              color: '#c2d099',
              backgroundColor: 'rgba(125, 167, 140, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(125, 167, 140, 0.25)'
              },
              '& .MuiListItemIcon-root': {
                color: '#c2d099'
              }
            },
            '&:hover': {
              backgroundColor: 'rgba(125, 167, 140, 0.15)',
              color: '#c2d099',
              '& .MuiListItemIcon-root': {
                color: '#c2d099'
              }
            }
          })
        }
      }
    }
  };
}
