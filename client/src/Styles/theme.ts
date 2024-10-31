import { createTheme } from "@mui/material";

export const theme = createTheme({
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  },
    typography: {
      fontFamily: [
        "SF Pro Display",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Public Sans"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
    },
    palette: {
      background: {
        default: "#f4f6f8",
        paper: "#ffffff",
      },
    },
  });