import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { currencyFormatter } from "../../utils/dataUtils";
import { ArticleProp } from "../../models/propsModels";

const DetailComponent: React.FC<ArticleProp> = ({ detail, isLoading }) => {
  const { t } = useTranslation();

  const excludedKeys = ["articleId"];
  const keyMap: { [key: string]: string } = {
    name: t("details.name"),
    brand: t("details.brand"),
    priceSold: t("details.priceSold"),
    priceBought: t("details.priceBought"),
  };

  const icons: { [key: string]: JSX.Element } = {
    name: <PersonIcon />,
    brand: <HomeIcon />,
    priceSold: <AttachMoneyIcon />,
    priceBought: <AttachMoneyIcon />,
  };

  return (
    <Box sx={{ p: 3, borderRadius: "30px", background: "transparent" }}>
      <Grid container spacing={2}>
        {Object.keys(detail).map((key) => {
          if (excludedKeys.includes(key)) return null;

          const value = detail[key];
          const displayKey = keyMap[key] || key;
          let displayValue;

          if (isLoading) {
            displayValue = <Skeleton width="80%" />;
          } else {
            if (["priceSold", "priceBought"].includes(key)) {
              displayValue = currencyFormatter(Number(value));
            } else {
              displayValue = value;
            }
          }

          return (
            <Grid item xs={12} sm={6} key={key} p={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {icons[key] && <Box sx={{ mr: 1 }}>{icons[key]}</Box>}
                <Typography variant="body1">
                  <strong>{displayKey}:</strong> {displayValue}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DetailComponent;
