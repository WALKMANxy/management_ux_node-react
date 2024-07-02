import React from "react";
import { Typography, Grid, Link, Box, Skeleton, useTheme } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { currencyFormatter } from "../../utils/dataUtils"; // Import the currency formatter

interface DetailProps {
  detail: { [key: string]: any };
  isLoading: boolean;
}

const DetailComponent: React.FC<DetailProps> = ({ detail, isLoading }) => {
  const theme = useTheme();
  const excludedKeys = ["id", "agent", "movements", "promos", "visits"];
  const keyMap: { [key: string]: string } = {
    name: "Name",
    phone: "Phone Number",
    totalRevenue: "Total Revenue",
    pec: "E-mail PEC",
    extendedTaxCode: "Additional Tax Code",
    paymentMethod: "Payment Method",
    province: "Location",
    totalOrders: "Total Orders",
    unpaidRevenue: "Unpaid Revenue",
    email: "E-mail",
    taxCode: "Tax Code",
    paymentMethodID: "PMID",
    address: "Address"
  };

  const icons: { [key: string]: JSX.Element } = {
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
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/[\s./-]/g, "");
  };

  const getGoogleMapsLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const formatAddress = (address: string, province: string) => {
    const provinceCode = province.split(" ")[0];
    return `${address}, ${provinceCode}`;
  };

  return (
    <Box sx={{ p: 3, borderRadius: '30px', background: theme.palette.background.paper }}>
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
                <Link href={`mailto:${value}`} color="secondary" underline="none">
                  {value}
                </Link>
              );
            } else if (key === "address") {
              const formattedAddress = formatAddress(value, detail.province);
              displayValue = (
                <Link href={getGoogleMapsLink(formattedAddress)} target="_blank" color="secondary" underline="none">
                  {formattedAddress}
                </Link>
              );
            } else if (["totalRevenue", "unpaidRevenue"].includes(key)) {
              displayValue = currencyFormatter(value); // Apply currency formatter
            } else {
              displayValue = value;
            }
          }

          return (
            <Grid item xs={12} sm={6} key={key} p={1}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
