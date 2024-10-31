// src/components/articlepage/ArticleDetailComponent.tsx
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import HomeIcon from "@mui/icons-material/Home";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import { Box, Grid, Skeleton, Tooltip, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArticleProp } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

/**
 * DetailValue Type
 * Represents the possible types of detail values.
 */
type DetailValue = string | number | undefined;

/**
 * ArticleDetailComponent Props Interface
 */
interface ArticleDetailComponentProps {
  detail: ArticleProp["detail"];
  isLoading: boolean;
}


const ArticleDetailComponent: React.FC<ArticleDetailComponentProps> = ({
  detail,
  isLoading,
}) => {
  const { t } = useTranslation();

  // Keys to exclude from rendering (if any)
  const excludedKeys: (keyof ArticleProp["detail"])[] = [
    // Add keys to exclude if necessary
  ];

  // Mapping of detail keys to their display labels with translations
  const keyMap: { [K in keyof ArticleProp["detail"]]?: string } = {
    articleId: t("articleDetails.id", "Article ID"),
    name: t("articleDetails.name", "Name"),
    brand: t("articleDetails.brand", "Brand"),
    quantity: t("articleDetails.quantity", "Quantity"),
    unitPrice: t("articleDetails.unitPrice", "Unit Price"),
    priceSold: t("articleDetails.priceSold", "Price Sold"),
    priceBought: t("articleDetails.priceBought", "Price Bought"),
  };

  // Mapping of detail keys to corresponding icons
  const icons: { [key: string]: JSX.Element } = {
    articleId: <FingerprintIcon />,
    name: <PersonIcon />,
    brand: <HomeIcon />,
    quantity: <ProductionQuantityLimitsIcon />,
    unitPrice: <LocalOfferIcon />,
    priceSold: <AttachMoneyIcon />,
    priceBought: <AttachMoneyIcon />,
  };


  const formatPrice = (value: number): string => {
    return currencyFormatter(value);
  };


  const renderValue = (
    key: keyof ArticleProp["detail"],
    value: DetailValue
  ): React.ReactNode => {
    if (isLoading) {
      return <Skeleton width="80%" />;
    }

    if (value === undefined || value === null || value === "") {
      return (
        <Typography variant="body2" color="textSecondary" component="span">
          -
        </Typography>
      );
    }

    switch (key) {
      case "unitPrice":
      case "priceSold":
      case "priceBought":
        return formatPrice(Number(value));
      default:
        return value;
    }
  };

  /**
   * Memoized list of detail keys to render, excluding certain keys.
   */
  const detailKeys = useMemo(() => {
    return Object.keys(detail) as Array<keyof ArticleProp["detail"]>;
  }, [detail]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "30px",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Grid container spacing={2}>
        {detailKeys.map((key) => {
          if (excludedKeys.includes(key)) return null;

          const value = detail[key] as DetailValue;
          const displayKey = keyMap[key] || key; 

          const displayValue = renderValue(key, value);

          return (
            <Grid item xs={12} sm={6} key={key} p={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {icons[key] && (
                  <Tooltip title={displayKey} arrow>
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      {icons[key]}
                    </Box>
                  </Tooltip>
                )}
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

export default React.memo(ArticleDetailComponent);
