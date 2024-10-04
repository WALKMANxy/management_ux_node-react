import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // Import Info Icon
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
  SwitchProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Ensure react-i18next is imported
import { showToast } from "../../services/toastMessage";

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

// Styled Box for Theme Options
const ThemeOptionBox = styled(Box)<{
  selected: boolean;
  themetype: "light" | "dark" | "auto";
}>(({ theme, selected, themetype }) => {
  const baseStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "auto",
    borderRadius: theme.shape.borderRadius,
    cursor: "pointer",
    transition: "background-color 0.3s, color 0.3s",
    opacity: selected ? 1 : 0.6,
  };

  if (themetype === "light") {
    return {
      ...baseStyles,
      backgroundColor: selected ? "#FFFFFF" : "#F0F0F0",
      boxShadow: selected ? theme.shadows[3] : "none",
      color: selected ? "#000000" : "#A0A0A0",
    };
  } else if (themetype === "dark") {
    return {
      ...baseStyles,
      backgroundColor: selected ? "#000000" : "#2E2E2E",
      boxShadow: selected ? theme.shadows[3] : theme.shadows,
      color: selected ? "#FFFFFF" : "#A0A0A0",
    };
  } else if (themetype === "auto") {
    return {
      ...baseStyles,
      background: selected
        ? "linear-gradient(45deg, #FFFFFF 50%, #000000 50%)"
        : "linear-gradient(45deg, #F0F0F0 50%, #2E2E2E 50%)",
      boxShadow: selected ? theme.shadows[3] : "none",
      color: selected ? "#C7C7C7" : "#C7C7C7",
    };
  }
});

const AppSettings: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation

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
            showToast.success(t("appSettings.notificationGranted"));
          } else if (permission === "denied") {
            showToast.error(t("appSettings.notificationDenied"));
          }
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            showToast.error(
              t("common.errorUpdatingSettings") + ": " + error.message
            );
          } else {
            showToast.error(
              t("common.errorUpdatingSettings") +
                ": " +
                t("common.unknownError")
            );
          }
        });
    }
  }, [notificationStatus, t]);

  // Handle Notifications Toggle
  const handleNotificationsToggle = useCallback(() => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      localStorage.setItem("notificationsEnabled", JSON.stringify(newValue));

      showToast.success(
        t(`appSettings.notifications${newValue ? "Enabled" : "Disabled"}`)
      );

      // If notifications are being enabled, check permission again
      if (newValue && notificationStatus === "default") {
        Notification.requestPermission()
          .then((permission) => {
            setNotificationStatus(permission);
            if (permission === "granted") {
              showToast.success(t("appSettings.notificationGranted"));
            } else if (permission === "denied") {
              showToast.error(t("appSettings.notificationDenied"));
            }
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              showToast.error(
                t("common.errorUpdatingSettings") + ": " + error.message
              );
            } else {
              showToast.error(
                t("common.errorUpdatingSettings") +
                  ": " +
                  t("common.unknownError")
              );
            }
          });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          t("common.errorUpdatingSettings") + ": " + error.message
        );
      } else {
        showToast.error(
          t("common.errorUpdatingSettings") + ": " + t("common.unknownError")
        );
      }
    }
  }, [notificationsEnabled, notificationStatus, t]);

  // Handle Theme Change
  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const newTheme = event.target.value as "light" | "dark" | "auto";
        setThemeChoice(newTheme);
        showToast.success(t(`appSettings.themeChanged`, { theme: newTheme }));
        // Implement theme change logic here (e.g., update context or global state)
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast.error(
            t("common.errorUpdatingSettings") + ": " + error.message
          );
        } else {
          showToast.error(
            t("common.errorUpdatingSettings") + ": " + t("common.unknownError")
          );
        }
      }
    },
    [t]
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t("appSettings.title")}
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
          {t("appSettings.toggleNotifications")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={
            <IOSSwitch
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
              color="primary"
              sx={{ mr: 2, ml: 1 }}
              inputProps={{
                "aria-label": t("appSettings.enableNotificationsAria"),
              }}
            />
          }
          label={t("appSettings.receiveBrowserNotifications")}
        />

        {/* Display an alert if notifications are blocked */}
        {notificationStatus === "denied" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t("appSettings.notificationsInfo")}
          </Alert>
        )}
      </Section>

      {/* Choose Theme Section */}
      <Section elevation={3} sx={{ borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("appSettings.chooseTheme")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormLabel
          component="legend"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
            mb: 3,
          }}
        >
          <Tooltip title={t("appSettings.themePreferenceTooltip")} arrow>
            <InfoOutlinedIcon
              sx={{ mr: 1, fontSize: 20, color: "text.secondary" }}
            />
          </Tooltip>
          <Typography variant="body1">
            {t("appSettings.themePreference")}
          </Typography>
        </FormLabel>
        <RadioGroup
          aria-label={t("appSettings.themePreference")}
          name="theme"
          value={themeChoice}
          onChange={handleThemeChange}
          row
          sx={{ gap: 2, mt: 1, mb: 2, ml: 1 }}
        >
          {/* Light Theme Option */}
          <FormControlLabel
            value="light"
            control={<Radio sx={{ display: "none" }} />}
            label={
              <ThemeOptionBox
                selected={themeChoice === "light"}
                themetype="light"
              >
                <Typography>{t("appSettings.light")}</Typography>
              </ThemeOptionBox>
            }
            sx={{ "& .MuiFormControlLabel-label": { width: "100%" } }}
          />

          {/* Dark Theme Option */}
          <FormControlLabel
            value="dark"
            control={<Radio sx={{ display: "none" }} />}
            label={
              <ThemeOptionBox
                selected={themeChoice === "dark"}
                themetype="dark"
              >
                <Typography>{t("appSettings.dark")}</Typography>
              </ThemeOptionBox>
            }
            sx={{ "& .MuiFormControlLabel-label": { width: "100%" } }}
          />

          {/* Auto Theme Option */}
          <FormControlLabel
            value="auto"
            control={<Radio sx={{ display: "none" }} />}
            label={
              <ThemeOptionBox
                selected={themeChoice === "auto"}
                themetype="auto"
              >
                <Typography>{t("appSettings.auto")}</Typography>
              </ThemeOptionBox>
            }
            sx={{ "& .MuiFormControlLabel-label": { width: "100%" } }}
          />
        </RadioGroup>
      </Section>
    </Box>
  );
};

export default AppSettings;
