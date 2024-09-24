// src/components/chatPage/DetailComponent.tsx

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Grid, Link, Skeleton, Tooltip, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClientProp } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

type DetailValue = string | number | undefined;

/**
 * DetailComponent Props Interface
 */
interface DetailComponentProps {
  detail: ClientProp["detail"];
  isLoading: boolean;
}

/**
 * DetailComponent
 * Displays various client details with corresponding icons and formatted values.
 *
 * @param {DetailComponentProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const DetailComponent: React.FC<DetailComponentProps> = ({
  detail,
  isLoading,
}) => {
  const { t } = useTranslation();

  // Keys to exclude from rendering
  const excludedKeys: (keyof ClientProp["detail"])[] = [
    "id",
    "movements",
    "agent",
    "agentData",
  ];

  // Mapping of detail keys to their display labels with translations
  const keyMap: { [K in keyof ClientProp["detail"]]?: string } = {
    name: t("details.name", "Name"),
    phone: t("details.phone", "Phone"),
    totalRevenue: t("details.totalRevenue", "Total Revenue"),
    pec: t("details.pec", "PEC"),
    extendedTaxCode: t("details.extendedTaxCode", "Extended Tax Code"),
    paymentMethod: t("details.paymentMethod", "Payment Method"),
    province: t("details.province", "Province"),
    totalOrders: t("details.totalOrders", "Total Orders"),
    unpaidRevenue: t("details.unpaidRevenue", "Unpaid Revenue"),
    email: t("details.email", "Email"),
    taxCode: t("details.taxCode", "Tax Code"),
    paymentMethodID: t("details.paymentMethodID", "Payment Method ID"),
    address: t("details.address", "Address"),
    agentName: t("details.agentName", "Agent Name"),
  };

  // Mapping of detail keys to corresponding icons
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

  /**
   * Formats the phone number by removing spaces, dots, slashes, and hyphens.
   *
   * @param {string} phone - The raw phone number.
   * @returns {string} The formatted phone number.
   */
  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/[\s./-]/g, "");
  };

  /**
   * Generates a Google Maps search link for a given address.
   *
   * @param {string} address - The address to search.
   * @returns {string} The Google Maps search URL.
   */
  const getGoogleMapsLink = (address: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  };

  /**
   * Formats the address by appending the province code.
   *
   * @param {string} address - The street address.
   * @param {string} province - The full province name.
   * @returns {string} The formatted address.
   */
  const formatAddress = (address: string, province: string): string => {
    const provinceCode = province.split(" ")[0];
    return `${address}, ${provinceCode}`;
  };

  /**
   * Renders the value for a given detail key with appropriate formatting and links.
   *
   * @param {keyof ClientProp["detail"]} key - The detail key.
   * @param {DetailValue} value - The detail value.
   * @returns {React.ReactNode} The rendered value.
   */
  const renderValue = (
    key: keyof ClientProp["detail"],
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
      case "phone": {
        const formattedPhone = formatPhoneNumber(value as string);
        return (
          <Link
            href={`tel:${formattedPhone}`}
            color="secondary"
            underline="none"
            aria-label={t("details.labels.call", "Call")}
          >
            {formattedPhone}
          </Link>
        );
      }
      case "email":
      case "pec":
        return (
          <Link
            href={`mailto:${value}`}
            color="secondary"
            underline="none"
            aria-label={t("details.labels.email", "Send Email")}
          >
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
              rel="noopener noreferrer"
              color="secondary"
              underline="none"
              aria-label={t("details.labels.viewOnMap", "View on Map")}
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

  /**
   * Memoized list of detail keys to render, excluding certain keys.
   */
  const detailKeys = useMemo(() => {
    return Object.keys(detail) as Array<keyof ClientProp["detail"]>;
  }, [detail]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "30px",
        background: "rgba(255, 255, 255, 0.7)", // Frosted glass effect
        backdropFilter: "blur(10px)", // Frosted glass effect
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Grid container spacing={2}>
        {detailKeys.map((key) => {
          if (excludedKeys.includes(key)) return null;

          const value = detail[key] as DetailValue;
          const displayKey = keyMap[key] || t(`details.labels.${key}`, key);

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

export default React.memo(DetailComponent);
