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
import { ClientProp } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

type DetailValue = string | number | undefined;

const DetailComponent: React.FC<ClientProp> = ({ detail, isLoading }) => {
  const { t } = useTranslation();

  const excludedKeys: (keyof ClientProp["detail"])[] = [
    "id",
    "movements",
    "agent",
  ];
  const keyMap: { [K in keyof ClientProp["detail"]]?: string } = {
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

  const renderValue = (
    key: keyof ClientProp["detail"],
    value: DetailValue
  ): React.ReactNode => {
    if (isLoading) {
      return <Skeleton width="80%" />;
    }

    if (value === undefined) {
      return "-";
    }

    switch (key) {
      case "phone": {
        const formattedPhone = formatPhoneNumber(value as string);
        return (
          <Link
            href={`tel:${formattedPhone}`}
            color="secondary"
            underline="none"
          >
            {formattedPhone}
          </Link>
        );
      }
      case "email":
      case "pec":
        return (
          <Link href={`mailto:${value}`} color="secondary" underline="none">
            {value}
          </Link>
        );
      case "address":
        if (typeof detail.province === "string") {
          const formattedAddress = formatAddress(
            value as string,
            detail.province
          );
          return (
            <Link
              href={getGoogleMapsLink(formattedAddress)}
              target="_blank"
              color="secondary"
              underline="none"
            >
              {formattedAddress}
            </Link>
          );
        }
        return value;
      case "totalRevenue":
      case "unpaidRevenue":
        return currencyFormatter(Number(value));
      default:
        return value;
    }
  };

  return (
    <Box sx={{ p: 3, borderRadius: "30px", background: "transparent" }}>
      <Grid container spacing={2}>
        {(Object.keys(detail) as Array<keyof ClientProp["detail"]>).map(
          (key) => {
            if (excludedKeys.includes(key)) return null;

            const value = detail[key] as DetailValue;
            const displayKey = keyMap[key] || key;
            const displayValue = renderValue(key, value);

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
          }
        )}
      </Grid>
    </Box>
  );
};

export default DetailComponent;
