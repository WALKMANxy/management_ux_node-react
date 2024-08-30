import { Box, Divider, Paper, Skeleton, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TopBrandsSoldProps } from "../../../models/propsModels";

// Define more specific types
const paperStyles = {
  p: 3,
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #E6F1F4 30%, #AEC6CF 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: `url('/checkerboard-cross.png')`,
    backgroundSize: "cover",
    opacity: 0.1,
    zIndex: 0,
  },
};

const titleStyles = {
  display: "inline-block",
  backgroundColor: "rgba(0, 0, 0, 0.04)",
  borderRadius: "24px",
  px: 2,
  py: 0.5,
  mb: 2,
  zIndex: 1,
};

const TopBrandsSold: React.FC<TopBrandsSoldProps> = React.memo(
  ({ topBrandsData, brandColors, isMobile, userRole }) => {
    const { t } = useTranslation();
    const loading = topBrandsData.length === 0;

    const chartData = useMemo(
      () =>
        topBrandsData.map((brand) => ({
          id: brand.id,
          value: brand.value,
          label: brand.label,
        })),
      [topBrandsData]
    );

    const titleKey =
      userRole === "agent"
        ? "topBrandsSold.titleAgent"
        : "topBrandsSold.titleClient";

    return (
      <Paper elevation={4} sx={paperStyles}>
        <Box sx={titleStyles}>
          <Typography variant="h6" gutterBottom>
            {t(titleKey)}
          </Typography>
        </Box>

        <Divider sx={{ width: "100%", mb: 2, zIndex: 1 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            width: "100%",
            zIndex: 1,
          }}
        >
          {loading ? (
            <Skeleton variant="circular" width={200} height={200} />
          ) : (
            <PieChart
              colors={brandColors}
              series={[
                {
                  data: chartData,
                  outerRadius: 100,
                  highlightScope: { faded: "global", highlighted: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                  arcLabel: (item) => `${item.label}: ${item.value}`,
                },
              ]}
              height={200}
              width={200}
              slotProps={{
                legend: { hidden: true },
              }}
              sx={{
                flex: 1,
                position: "relative",
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMobile ? "center" : "flex-start",
                mt: isMobile ? 2 : 0,
                ml: isMobile ? 0 : 2,
              }}
            >
              {topBrandsData.map((brand, index) => (
                <Box key={brand.id} display="flex" alignItems="center" mb={1}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: brandColors[index],
                      marginRight: 1,
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
          )}
        </Box>
      </Paper>
    );
  }
);

TopBrandsSold.displayName = "TopBrandsSold";

export default TopBrandsSold;
