import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

const TopBrandsSold: React.FC<{
  topBrandsData: any[];
  brandColors: string[];
  isMobile: boolean;
}> = ({ topBrandsData, brandColors, isMobile }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        background: "linear-gradient(135deg, #E6F1F4 30%, #AEC6CF 100%)",
      }}
    >
      <Box
        sx={{
          display: "inline-block",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          px: 1,
          py: 0.5,
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Top Brands Sold
        </Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          width: "100%",
        }}
      >
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
            position: "absolute",
          left: isMobile ? "50px" : "auto",
          right: isMobile ? "auto" : "-20px",
          }}
        />

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
            <Box key={brand.label} display="flex" alignItems="center" mb={1}>
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
      </Box>
    </Paper>
  );
};

export default TopBrandsSold;
