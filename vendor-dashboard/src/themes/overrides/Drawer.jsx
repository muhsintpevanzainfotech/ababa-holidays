// ==============================|| OVERRIDES - DRAWER ||============================== //

export default function Drawer(theme) {
  return {
    MuiDrawer: {
      styleOverrides: {
        root: {
          zIndex: 1400
        },
        paper: {
          zIndex: 1400
        }
      }
    }
  };
}
