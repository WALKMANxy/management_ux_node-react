import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import HomeIcon from "@mui/icons-material/Home";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ArticleProp } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const DetailComponent: React.FC<ArticleProp> = ({ detail, isLoading }) => {
  const { t } = useTranslation();

  // Keys to exclude from rendering

  // Map of detail keys to their translation keys
  const keyMap: { [key: string]: string } = {
    articleId: t("articleDetail.id"),
    name: t("articleDetail.name"),
    brand: t("articleDetail.brand"),
    quantity: t("articleDetail.quantity"),
    unitPrice: t("articleDetail.unitPrice"),
    priceSold: t("articleDetail.priceSold"),
    priceBought: t("articleDetail.priceBought"),
  };

  // Icons associated with specific keys
  const icons: { [key: string]: JSX.Element } = {
    articleId: <FingerprintIcon />,
    name: <PersonIcon />,
    brand: <HomeIcon />,
    quantity: <ProductionQuantityLimitsIcon />,
    unitPrice: <LocalOfferIcon />,
    priceSold: <AttachMoneyIcon />,
    priceBought: <AttachMoneyIcon />,
  };

  return (
    <Box sx={{ p: 3, borderRadius: "30px", background: "transparent" }}>
      <Grid container spacing={2}>
        {Object.keys(detail).map((key) => {
          const value = detail[key];
          const displayKey = keyMap[key] || key; // Use translated key or fallback to the original
          let displayValue;

          if (isLoading) {
            displayValue = <Skeleton width="80%" />;
          } else {
            // Format prices or display the raw value
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
