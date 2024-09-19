import PieChartIcon from "@mui/icons-material/PieChart";
import {
  Avatar,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import React from "react";
import { useTranslation } from "react-i18next";
import { BrandData } from "../../../models/propsModels";

const TopBrandsSold: React.FC<{
  topBrandsData: BrandData[];
  brandColors: string[];
  isMobile: boolean;
  isAgentSelected: boolean;
}> = ({ topBrandsData, brandColors, isMobile,  isAgentSelected }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const loading = topBrandsData.length === 0;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #E6F1F4 30%, #AEC6CF 100%)",
        "&::after": {
          content: '""',
          position: "absolute",
          width: 790,
          height: 210,
          background: theme.palette.primary.main,
          borderRadius: "50%",
          bottom: -85,
          right: -95,
          opacity: 0.5,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          width: 180,
          height: 180,
          background: theme.palette.primary.light,
          borderRadius: "50%",
          bottom: -125,
          right: -15,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Distributes items to the start and end of the box
          width: "100%",
          mb: 1,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            mt: 1,
            left: 18,
          }}
        >
          <PieChartIcon fontSize="inherit" />
        </Avatar>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 26,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t(
            isAgentSelected
              ? "topBrandsSold.titleAgent"
              : "topBrandsSold.titleClient"
          )}
        </Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 1.5, zIndex: 1 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          width: "100%",
          zIndex: 1,
          overflow: "visible",
          gap: 1,
          paddingBottom: "20px",
        }}
      >
        {loading ? (
          <Skeleton variant="circular" width={200} height={200} />
        ) : (
          <PieChart
            colors={brandColors}
            series={[
              {
                data: topBrandsData,
                outerRadius: 100,
                highlightScope: {
                  faded: "global",
                  highlighted: "item",
                },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
              },
            ]}
            height={200}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            sx={{
              flex: 1,
              position: "relative",
              overflow: "visible",
              left: isMobile ? "50px" : "auto",
              right: isMobile ? "auto" : "-20px",
            }}
          />
        )}

        {loading ? (
          <Skeleton
            variant="rectangular"
            width="60%"
            height={30}
            sx={{ borderRadius: "12px", mt: 2 }}
          />
        ) : (
          !isMobile && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                mt: 0,
                ml: 1,
              }}
            >
              {topBrandsData.map((brand, index) => (
                <Box
                  key={`${brand.label}-${index}`}
                  display="flex"
                  alignItems="center"
                  mb={0.5}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      backgroundColor: brandColors[index],
                      marginRight: 0.5,
                      borderRadius: "50%",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ textShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)" }}
                  >
                    {brand.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )
        )}
      </Box>
    </Paper>
  );
};

export default TopBrandsSold;
