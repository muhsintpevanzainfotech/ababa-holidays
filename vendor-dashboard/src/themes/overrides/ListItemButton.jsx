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
              color: '#77f07f',
              backgroundColor: 'rgba(65, 160, 174, 0.22)',
              '&:hover': {
                backgroundColor: 'rgba(65, 160, 174, 0.3)'
              },
              '& .MuiListItemIcon-root': {
                color: '#77f07f'
              }
            },
            '&:hover': {
              backgroundColor: 'rgba(65, 160, 174, 0.16)',
              color: '#77f07f',
              '& .MuiListItemIcon-root': {
                color: '#77f07f'
              }
            }
          })
        }
      }
    }
  };
}
