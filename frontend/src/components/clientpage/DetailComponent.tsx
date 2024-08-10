// src/components/clientpage/DetailComponent.tsx
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Grid, Link, Skeleton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { DetailProps } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const DetailComponent: React.FC<DetailProps> = ({ detail, isLoading }) => {
  const { t } = useTranslation();

  const excludedKeys = ["id", "movements", "promos", "visits", "agent"];
  const keyMap: { [key: string]: string } = {
    name: t("details.name"),
    phone: t("details.phone"),
    totalRevenue: t("details.totalRevenue"),
    pec: t("details.pec"),
    extendedTaxCode: t("details.extendedTaxCode"),
    paymentMethod: t("details.paymentMethod"),
    province: t("details.province"),
    totalOrders: t("details.totalOrders"),
    unpaidRevenue: t("details.unpaidRevenue"),
    email: t("details.email"),
    taxCode: t("details.taxCode"),
    paymentMethodID: t("details.paymentMethodID"),
    address: t("details.address"),
    agent: t("details.agent"),
    agentName: t("details.agentName"),
  };

  const icons: { [key: string]: JSX.Element } = {
    name: <PersonIcon />,
    phone: <PhoneIcon />,
    email: <EmailIcon />,
    pec: <EmailIcon />,
    address: <HomeIcon />,
    totalRevenue: <AttachMoneyIcon />,
    totalOrders: <AssessmentIcon />,
    unpaidRevenue: <AccountBalanceIcon />,
    paymentMethod: <PaymentIcon />,
    province: <HomeIcon />,
    extendedTaxCode: <AccountBalanceIcon />,
    taxCode: <AccountBalanceIcon />,
    paymentMethodID: <PaymentIcon />,
    agentName: <PersonIcon />,
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/[\s./-]/g, "");
  };

  const getGoogleMapsLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  };

  const formatAddress = (address: string, province: string) => {
    const provinceCode = province.split(" ")[0];
    return `${address}, ${provinceCode}`;
  };

  return (
    <Box sx={{ p: 3, borderRadius: "30px", background: "transparent" }}>
      <Grid container spacing={2}>
        {Object.keys(detail).map((key) => {
          if (excludedKeys.includes(key)) return null;

          let value = detail[key];
          let displayKey = keyMap[key] || key;
          let displayValue;

          if (isLoading) {
            displayValue = <Skeleton width="80%" />;
          } else {
            if (key === "phone") {
              value = formatPhoneNumber(value);
              displayValue = (
                <Link href={`tel:${value}`} color="secondary" underline="none">
                  {value}
                </Link>
              );
            } else if (key === "email" || key === "pec") {
              displayValue = (
                <Link
                  href={`mailto:${value}`}
                  color="secondary"
                  underline="none"
                >
                  {value}
                </Link>
              );
            } else if (key === "address") {
              const formattedAddress = formatAddress(value, detail.province);
              displayValue = (
                <Link
                  href={getGoogleMapsLink(formattedAddress)}
                  target="_blank"
                  color="secondary"
                  underline="none"
                >
                  {formattedAddress}
                </Link>
              );
            } else if (["totalRevenue", "unpaidRevenue"].includes(key)) {
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
