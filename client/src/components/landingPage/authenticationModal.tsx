import { ArrowBackIos, Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import "animate.css";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHandleSignin } from "../../hooks/useHandleSignin";
import PasswordReset from "./PasswordReset";

interface AuthenticationModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate__fadeIn");
  const [isPasswordReset, setIsPasswordReset] = useState(false); // State to track if user is in password reset flow
  const {
    isLoginMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    keepMeSignedIn,
    setKeepMeSignedIn,
    loading,
    alertOpen,
    setAlertOpen,
    alertMessage,
    alertSeverity,
    shakeEmail,
    shakePassword,
    shakeConfirmPassword,
    toggleMode: originalToggleMode,
    handleSubmit,
  } = useHandleSignin(onClose);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = useCallback(() => {
    setAnimationClass("animate__animated animate__fadeOut");
    setTimeout(() => {
      originalToggleMode();
      setAnimationClass("animate__animated animate__fadeIn");
    }, 250);
  }, [originalToggleMode]);

  const handleForgotPassword = () => {
    setIsPasswordReset(true); // Trigger the password reset flow
  };

  const handleBackToSignIn = () => {
    setIsPasswordReset(false); // Return to the sign-in flow
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "30px" } }}
    >
      <DialogContent
        className={animationClass}
        sx={{ textAlign: "center", padding: "32px", borderRadius: "24px" }}
      >
        {isPasswordReset ? (
          <>
            <Box sx={{ textAlign: "left", mb: 2 }}>
              <IconButton onClick={handleBackToSignIn}>
                <ArrowBackIos />
              </IconButton>
            </Box>
            <PasswordReset onClose={() => setIsPasswordReset(false)} />
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", marginBottom: "12px" }}
            >
              {isLoginMode ? t("auth.signIn") : t("auth.register")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ marginBottom: "24px", color: "text.secondary" }}
            >
              {t("auth.continueToApp", { appName: "RCS Next" })}
            </Typography>

            <Collapse in={alertOpen}>
              <Alert
                severity={alertSeverity}
                onClose={() => setAlertOpen(false)}
                sx={{ mb: 2 }}
              >
                {alertMessage}
              </Alert>
            </Collapse>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textAlign: "left",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {t("auth.email")}
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  sx={{ marginBottom: "16px", borderRadius: "12px" }}
                  className={
                    shakeEmail ? "animate__animated animate__shakeX" : ""
                  }
                />

                <Typography
                  variant="subtitle2"
                  sx={{
                    textAlign: "left",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  {t("auth.password")}
                </Typography>
                <TextField
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  sx={{ marginBottom: "16px", borderRadius: "12px" }}
                  className={
                    shakePassword ? "animate__animated animate__shakeX" : ""
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          aria-label={
                            showPassword
                              ? t("auth.hidePassword")
                              : t("auth.showPassword")
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {!isLoginMode && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textAlign: "left",
                        marginBottom: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      {t("auth.confirmPassword")}
                    </Typography>
                    <TextField
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      variant="outlined"
                      sx={{ marginBottom: "16px", borderRadius: "12px" }}
                      className={
                        shakeConfirmPassword
                          ? "animate__animated animate__shakeX"
                          : ""
                      }
                    />
                  </>
                )}
              </Box>

              {isLoginMode && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={keepMeSignedIn}
                      onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                    />
                  }
                  label={
                    <Box textAlign="left">
                      <Typography variant="body2">
                        {t("auth.keepMeSignedIn")}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t("auth.recommendedOnTrustedDevices")}
                      </Typography>
                    </Box>
                  }
                  sx={{ marginBottom: "16px", alignSelf: "center" }}
                />
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#81c784",
                  fontSize: "16px",
                  padding: "10px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#66bb6a",
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : isLoginMode ? (
                  t("auth.signIn")
                ) : (
                  t("auth.register")
                )}
              </Button>
            </form>

            <Button
              variant="contained"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{
                fontSize: "16px",
                padding: "10px",
                marginBottom: "16px",
                borderRadius: "12px",
                textTransform: "none",
                color: "#ffffff",
                backgroundColor: "#000000",
                border: "none",
                boxShadow: "0 2px 4px 0 rgba(0,0,0,.25)",
                "&:hover": {
                  backgroundColor: "#333333",
                  boxShadow: "0 2px 8px 0 rgba(0,0,0,.25)",
                },
                "& .MuiButton-startIcon": {
                  marginRight: "24px", // Increase space between icon and text
                },
                "& .MuiSvgIcon-root": {
                  color: "#ffffff", // Ensure the Google icon is white
                },
              }}
              onClick={() => {
                /* Google OAuth logic here */
              }}
            >
              {t("auth.continueWithGoogle")}
            </Button>

            <Typography
              variant="body2"
              sx={{ marginBottom: "10px", cursor: "pointer" }}
              onClick={handleForgotPassword}
            >
              {t("auth.forgotPassword")}
            </Typography>

            <Typography variant="body2" sx={{ marginBottom: "10px" }}>
              {isLoginMode ? (
                <>
                  {t("auth.newToApp", { appName: "RCS Next" })}{" "}
                  <Typography
                    component="span"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#6C63FF",
                    }}
                    onClick={toggleMode}
                  >
                    {t("auth.createAccount")}
                  </Typography>
                </>
              ) : (
                <>
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Typography
                    component="span"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#6C63FF",
                    }}
                    onClick={toggleMode}
                  >
                    {t("auth.signIn")}
                  </Typography>
                </>
              )}
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationModal;
