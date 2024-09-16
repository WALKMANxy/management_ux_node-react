// src/components/UserPage/AppSettings.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Paper,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const AppSettings: React.FC = () => {
  // Load initial state from localStorage or default to true
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    JSON.parse(localStorage.getItem("notificationsEnabled") || "true")
  );
  const [themeChoice, setThemeChoice] = useState("auto");
  const [notificationStatus, setNotificationStatus] = useState(Notification.permission);

  useEffect(() => {
    // Check the notification permission status when the component mounts
    if (notificationStatus === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationStatus(permission);
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else if (permission === "denied") {
          console.log("Notification permission denied.");
        }
      });
    }
  }, [notificationStatus]);

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("notificationsEnabled", JSON.stringify(newValue));

    // If notifications are being enabled, check permission again
    if (newValue && notificationStatus === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationStatus(permission);
      });
    }
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeChoice(event.target.value);
  };

  return (
    <Box>
      {/* Enable Notifications Section */}
      <Section elevation={3}>
        <Typography variant="h6" gutterBottom>
          Enable Notifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
              color="primary"
            />
          }
          label="Receive browser notifications"
        />

        {/* Display an alert if notifications are blocked */}
        {notificationStatus === "denied" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            In order to receive notifications for the chats, please allow the
            notification permission in your browser settings.
          </Alert>
        )}
      </Section>

      {/* Choose Theme Section */}
      <Section elevation={3}>
        <Typography variant="h6" gutterBottom>
          Choose Theme
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormLabel component="legend">Theme Preference</FormLabel>
        <RadioGroup
          aria-label="theme"
          name="theme"
          value={themeChoice}
          onChange={handleThemeChange}
        >
          <FormControlLabel value="auto" control={<Radio />} label="Auto" />
          <FormControlLabel value="light" control={<Radio />} label="Light" />
          <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        </RadioGroup>
      </Section>
    </Box>
  );
};

export default AppSettings;
