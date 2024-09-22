import {
  Alert,
  Box,
  Divider,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { showToast } from "../../utils/toastMessage";

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
  const [notificationStatus, setNotificationStatus] = useState(
    Notification.permission
  );

  useEffect(() => {
    // Check the notification permission status when the component mounts
    if (notificationStatus === "default") {
      Notification.requestPermission()
        .then((permission) => {
          setNotificationStatus(permission);
          if (permission === "granted") {
            showToast.success("Notification permission granted.");
          } else if (permission === "denied") {
            showToast.error("Notification permission denied.");
          }
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            showToast.error(
              "Failed to request notification permission: " + error.message
            );
          } else {
            showToast.error(
              "Failed to request notification permission: An unknown error occurred"
            );
          }
        });
    }
  }, [notificationStatus]);

  const handleNotificationsToggle = () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      localStorage.setItem("notificationsEnabled", JSON.stringify(newValue));

      showToast.success(
        `Notifications have been ${newValue ? "enabled" : "disabled"}.`
      );

      // If notifications are being enabled, check permission again
      if (newValue && notificationStatus === "default") {
        Notification.requestPermission()
          .then((permission) => {
            setNotificationStatus(permission);
            if (permission === "granted") {
              showToast.success("Notification permission granted.");
            } else if (permission === "denied") {
              showToast.error("Notification permission denied.");
            }
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              showToast.error(
                "Failed to request notification permission: " + error.message
              );
            } else {
              showToast.error(
                "Failed to request notification permission: An unknown error occurred"
              );
            }
          });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          "Failed to update notification settings: " + error.message
        );
      } else {
        showToast.error(
          "Failed to update notification settings: An unknown error occurred"
        );
      }
    }
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newTheme = event.target.value;
      setThemeChoice(newTheme);
      showToast.success(`Theme changed to ${newTheme}.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to change theme: " + error.message);
      } else {
        showToast.error("Failed to change theme: An unknown error occurred");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        App Settings
      </Typography>
      <Divider
        sx={{
          height: 6,
          borderRadius: 3,
        }}
      />
      {/* Enable Notifications Section */}
      <Section elevation={3} sx={{ borderRadius: 3 }}>
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
      <Section elevation={3} sx={{ borderRadius: 3 }}>
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
