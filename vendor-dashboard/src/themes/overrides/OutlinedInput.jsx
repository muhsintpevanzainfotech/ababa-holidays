// ==============================|| OVERRIDES - OUTLINED INPUT ||============================== //

export default function OutlinedInput(theme, borderRadius, outlinedFilled) {
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: outlinedFilled ? theme.vars.palette.grey[50] : 'transparent',
          borderRadius: `${borderRadius}px`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.grey[200],
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.primary.main
          },

          '&.Mui-focused': {
            boxShadow: '0 0 0 3.5px rgba(54, 102, 156, 0.25)'
          },

          '&.MuiInputBase-multiline': {
            padding: 1
          }
        },
        input: {
          fontWeight: 500,
          background: outlinedFilled ? theme.vars.palette.grey[50] : 'transparent',
          padding: '15.5px 14px',
          borderRadius: `${borderRadius}px`,

          '&.MuiInputBase-inputSizeSmall': {
            padding: '10px 14px',

            '&.MuiInputBase-inputAdornedStart': {
              paddingLeft: 0
            }
          }
        },
        inputAdornedStart: {
          paddingLeft: 4
        },
        notchedOutline: {
          borderRadius: `${borderRadius}px`
        }
      }
    }
  };
}
