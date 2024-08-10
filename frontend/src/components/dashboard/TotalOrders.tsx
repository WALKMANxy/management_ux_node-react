import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { ChartData } from "../../utils/constants";

interface TotalOrderProps {
  totalOrder: number;
  isLoading: boolean;
  monthlyOrders: number[];
  yearlyOrders: number[];
  monthlyCategories: string[];
  yearlyCategories: string[];
}

const TotalOrder: React.FC<TotalOrderProps> = ({
  totalOrder,
  isLoading,
  monthlyOrders,
  yearlyOrders,
  monthlyCategories,
  yearlyCategories,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeValue, setTimeValue] = React.useState(true); // Initialize with "month" chart

  const handleChangeTime = (
    event: React.MouseEvent<HTMLElement>,
    newValue: boolean
  ) => {
    setTimeValue(newValue);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ffe0b2 30%, #ffcc80 100%)",
        color: "#000",
        position: "relative",
        overflow: "hidden",
        height: isMobile ? "auto" : "250px", // Allow to grow in height for mobile view
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
      <Box sx={{ p: 1.5 }}>
        <Grid container direction="column" sx={{ height: "100%" }}>
          <Grid item>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <LocalMallOutlinedIcon fontSize="inherit" />
                </Avatar>
              </Grid>
              <Grid item>
                <Button
                  disableElevation
                  variant={timeValue ? "contained" : "text"}
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: timeValue ? "#000" : "transparent",
                    zIndex: 1,
                    "&:hover": {
                      bgcolor: "#000",
                      color: "#fff",
                    },
                    mr: 1,
                  }}
                  onClick={(e) => handleChangeTime(e, true)}
                >
                  {t("totalOrder.month")}
                </Button>
                <Button
                  disableElevation
                  variant={!timeValue ? "contained" : "text"}
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: !timeValue ? "#000" : "transparent",
                    zIndex: 1,
                    "&:hover": {
                      bgcolor: "#000",
                      color: "#fff",
                    },
                  }}
                  onClick={(e) => handleChangeTime(e, false)}
                >
                  {t("totalOrder.year")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 0.5 }}>
            <Grid
              container
              alignItems="center"
              direction={isMobile ? "column" : "row"}
            >
              <Grid
                item
                xs={12}
                md={6}
                textAlign={isMobile ? "center" : "left"}
              >
                <Grid
                  container
                  alignItems="center"
                  justifyContent={isMobile ? "center" : "flex-start"}
                >
                  <Grid item>
                    <Typography
                      sx={{
                        fontSize: "2.5rem",
                        fontWeight: 500,
                        mr: 1,
                        mt: 1.5,
                        mb: 0.5,
                      }}
                    >
                      {totalOrder}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Avatar
                      sx={{
                        cursor: "pointer",
                        bgcolor: theme.palette.primary.light,
                        color: "#000",
                      }}
                    >
                      <ArrowDownwardIcon
                        fontSize="inherit"
                        sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                      />
                    </Avatar>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        color: "#000",
                      }}
                    >
                      {t("totalOrder.totalOrders")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                {timeValue ? (
                  <Chart
                    {...ChartData(monthlyCategories, monthlyOrders)}
                    height="150"
                  />
                ) : (
                  <Chart
                    {...ChartData(yearlyCategories, yearlyOrders)}
                    height="150"
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TotalOrder;
