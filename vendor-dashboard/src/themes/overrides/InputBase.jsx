// ==============================|| OVERRIDES - INPUT BASE ||============================== //

export default function InputBase(theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: theme.vars.palette.text.dark,
          '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
            WebkitBackgroundClip: 'text !important',
            backgroundClip: 'text !important',
            WebkitTextFillColor: 'inherit !important',
            transition: 'background-color 9999999s ease-in-out 0s, color 9999999s ease-in-out 0s !important',
            caretColor: 'inherit !important'
          },
          '&::placeholder': {
            color: theme.vars.palette.text.secondary,
            fontSize: '0.875rem'
          }
        }
      }
    }
  };
}
