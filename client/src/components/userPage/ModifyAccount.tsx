// src/components/UserPage/ModifyAccount.tsx
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import useModifyAccount from "../../hooks/useModifyAccount";

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ModifyAccount: React.FC = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const currentUser = useAppSelector(selectCurrentUser);
  const {
    handleUpdateEmail,
    handleUpdatePassword,
    alertMessage,
    alertSeverity,
    setAlertMessage,
    loading,
    emailErrors,
    passwordErrors,
  } = useModifyAccount();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [emailFields, setEmailFields] = useState<{
    currentEmail: string;
    currentPassword: string;
    newEmail: string;
  }>({
    currentEmail: "",
    currentPassword: "",
    newEmail: "",
  });

  const [passwordFields, setPasswordFields] = useState<{
    currentEmail: string;
    currentPassword: string;
    newPassword: string;
  }>({
    currentEmail: "",
    currentPassword: "",
    newPassword: "",
  });

  const toggleShowPassword = useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );
  const toggleShowNewPassword = useCallback(
    () => setShowNewPassword((prev) => !prev),
    []
  );

  // If the account is managed by Google, show a message instead of account modification options
  if (currentUser?.authType === "google") {
    return (
      <Section>
        <Alert
          icon={<WarningAmberIcon />}
          severity="info"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            p: 2,
            backgroundColor: "#f0f4ff",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t("modifyAccount.googleManagedTitle")}
          </Typography>
          <Typography variant="body1">
            {t("modifyAccount.googleManagedDescription")}
          </Typography>
        </Alert>
      </Section>
    );
  }

  return (
    <Box sx={{ overflowY: "hidden" }}>
      <Typography variant="h4" gutterBottom>
        {t("modifyAccount.title")}
      </Typography>
      <Divider
        sx={{
          height: 6,
          borderRadius: 3,
        }}
      />

      {/* Modify Email Section */}
      <Section>
        <Typography variant="h6" gutterBottom>
          {t("modifyAccount.modifyEmail")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateEmail(
              emailFields.currentEmail,
              emailFields.currentPassword,
              emailFields.newEmail
            );
          }}
        >
          <Grid container spacing={2}>
            {emailErrors.length > 0 && (
              <Grid item xs={12}>
                {emailErrors.map((error, index) => (
                  <Alert key={index} severity="error">
                    {t(`modifyAccount.emailErrors.${error}`)}
                  </Alert>
                ))}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.currentEmail")}
                type="email"
                variant="outlined"
                fullWidth
                value={emailFields.currentEmail}
                onChange={(e) =>
                  setEmailFields((prev) => ({
                    ...prev,
                    currentEmail: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                aria-label={t("modifyAccount.currentEmailAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.currentPassword")}
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={emailFields.currentPassword}
                onChange={(e) =>
                  setEmailFields((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          showPassword
                            ? t("modifyAccount.hidePassword")
                            : t("modifyAccount.showPassword")
                        }
                        arrow
                      >
                        <IconButton
                          onClick={toggleShowPassword}
                          aria-label={
                            showPassword
                              ? t("modifyAccount.hidePassword")
                              : t("modifyAccount.showPassword")
                          }
                          edge="end"
                          sx={{
                            transition: "border 0.3s",
                            "&:hover": {
                              boxShadow: theme.shadows[3],
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                aria-label={t("modifyAccount.currentPasswordAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.newEmail")}
                type="email"
                variant="outlined"
                fullWidth
                value={emailFields.newEmail}
                onChange={(e) =>
                  setEmailFields((prev) => ({
                    ...prev,
                    newEmail: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                aria-label={t("modifyAccount.newEmailAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                title={t("modifyAccount.updateEmailButtonTooltip")}
                arrow
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 1,
                    borderRadius: "20px",
                    bgcolor: "black",
                    color: "white",
                    "&:hover": {
                      boxShadow: theme.shadows[3],
                      bgcolor: "black",
                    },
                  }}
                  aria-label={t("modifyAccount.updateEmailButtonAria")}
                >
                  {t("modifyAccount.updateEmailButton")}
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </form>
      </Section>

      <Divider sx={{ my: 3 }} />

      {/* Modify Password Section */}
      <Section>
        <Typography variant="h6" gutterBottom>
          {t("modifyAccount.modifyPassword")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdatePassword(
              passwordFields.currentEmail,
              passwordFields.currentPassword,
              passwordFields.newPassword
            );
          }}
        >
          <Grid container spacing={2}>
            {passwordErrors.length > 0 && (
              <Grid item xs={12}>
                {passwordErrors.map((error, index) => (
                  <Alert key={index} severity="error">
                    {t(`modifyAccount.passwordErrors.${error}`)}
                  </Alert>
                ))}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.currentEmail")}
                type="email"
                variant="outlined"
                fullWidth
                value={passwordFields.currentEmail}
                onChange={(e) =>
                  setPasswordFields((prev) => ({
                    ...prev,
                    currentEmail: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                aria-label={t("modifyAccount.currentEmailAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.currentPassword")}
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={passwordFields.currentPassword}
                onChange={(e) =>
                  setPasswordFields((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          showPassword
                            ? t("modifyAccount.hidePassword")
                            : t("modifyAccount.showPassword")
                        }
                        arrow
                      >
                        <IconButton
                          onClick={toggleShowPassword}
                          aria-label={
                            showPassword
                              ? t("modifyAccount.hidePassword")
                              : t("modifyAccount.showPassword")
                          }
                          edge="end"
                          sx={{
                            transition: "border 0.3s",
                            "&:hover": {
                              boxShadow: theme.shadows[3],
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                aria-label={t("modifyAccount.currentPasswordAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("modifyAccount.newPassword")}
                type={showNewPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={passwordFields.newPassword}
                onChange={(e) =>
                  setPasswordFields((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          showNewPassword
                            ? t("modifyAccount.hideNewPassword")
                            : t("modifyAccount.showNewPassword")
                        }
                        arrow
                      >
                        <IconButton
                          onClick={toggleShowNewPassword}
                          aria-label={
                            showNewPassword
                              ? t("modifyAccount.hideNewPassword")
                              : t("modifyAccount.showNewPassword")
                          }
                          edge="end"
                          sx={{
                            transition: "border 0.3s",
                            "&:hover": {
                              border: `1px solid ${theme.palette.primary.main}`,
                            },
                          }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                aria-label={t("modifyAccount.newPasswordAria")}
              />
            </Grid>
            <Grid item xs={12}>
              <Tooltip
                title={t("modifyAccount.updatePasswordButtonTooltip")}
                arrow
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 1,
                    borderRadius: "20px",
                    bgcolor: "black",
                    color: "white",
                    transition: "border 0.3s",
                    "&:hover": {
                      boxShadow: theme.shadows[3],
                      bgcolor: "black",
                    },
                  }}
                  aria-label={t("modifyAccount.updatePasswordButtonAria")}
                >
                  {t("modifyAccount.updatePasswordButton")}
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </form>
      </Section>

      <Divider sx={{ my: 3 }} />

      {/* Modify Avatar Section (Disabled until we implement it. S3 is already in use, so it shouldn't be too much of a problem) */}
      {/*
      <Section
        sx={{
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <Typography variant="h6" gutterBottom>
          <ConstructionIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Modify Avatar
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" alignItems="center" flexDirection="column">
          <Box
            component="img"
            src={currentUser?.avatar || "/default-avatar.png"}
            alt={t("modifyAccount.currentAvatarAlt")}
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              mb: 2,
              objectFit: "cover",
            }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 1, borderRadius: "20px", bgcolor: "black" }}
          >
            {t("modifyAccount.uploadAvatarButton")}
            <input type="file" hidden accept="image/*" />
          </Button>
        </Box>
      </Section>
      */}

      {/* Success/Error Alert Notification */}
      {alertMessage && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          sx={{ mt: 2 }}
        >
          {t(`modifyAccount.alerts.${alertSeverity}`, {
            message: alertMessage,
          })}
        </Alert>
      )}
    </Box>
  );
};

export default React.memo(ModifyAccount);
