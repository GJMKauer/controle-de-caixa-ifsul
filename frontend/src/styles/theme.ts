import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
        },
      },
    },
  },
  palette: {
    background: {
      default: "rgba(245, 247, 252, 1)",
      paper: "rgba(255, 255, 255, 1)",
    },
    primary: {
      main: "rgba(47, 128, 237, 1)",
    },
    secondary: {
      main: "rgba(0, 184, 148, 1)",
    },
    text: {
      primary: "rgba(33, 37, 41, 1)",
      secondary: "rgba(108, 117, 125, 1)",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

export { theme };
