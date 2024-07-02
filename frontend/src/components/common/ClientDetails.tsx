//src/components/common/ClientDetails.tsx
import React from "react";
import {
  Paper,
  Box,
  Collapse,
  Grid,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DetailComponent from "../../components/common/DetailComponent";
import { Client } from "../../models/models";

interface ClientDetailsProps {
  selectedClient: Client | null;
  isClientDetailsCollapsed: boolean;
  setClientDetailsCollapsed: (value: boolean) => void;
  isLoading: boolean;
}

const ClientDetails = React.forwardRef<HTMLDivElement, ClientDetailsProps>(
  (
    {
      selectedClient,
      isClientDetailsCollapsed,
      setClientDetailsCollapsed,
      isLoading,
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <Paper
        elevation={3}
        ref={ref}
        sx={{
          p: 3,
          borderRadius: "12px",
          background: "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
          color: "#000",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          "&:after": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            background: theme.palette.primary.main,
            borderRadius: "50%",
            top: -85,
            right: -95,
          },
          "&:before": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            background: theme.palette.primary.main,
            borderRadius: "50%",
            top: -125,
            right: -15,
            opacity: 0.5,
          },
        }}
      >
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography variant="h2">Client Details</Typography>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() =>
                      setClientDetailsCollapsed(!isClientDetailsCollapsed)
                    }
                  >
                    {isClientDetailsCollapsed ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Collapse in={!isClientDetailsCollapsed}>
          {selectedClient ? (
            <Box sx={{ p: 2 }}>
              <DetailComponent detail={selectedClient} isLoading={isLoading} />
            </Box>
          ) : (
            <Box sx={{ p: 2 }}></Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default ClientDetails;
