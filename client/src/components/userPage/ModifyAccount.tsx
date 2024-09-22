// src/components/UserPage/ModifyAccount.tsx

/* import ConstructionIcon from "@mui/icons-material/Construction";
 */ import Visibility from "@mui/icons-material/Visibility";
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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import useModifyAccount from "../../hooks/useModifyAccount";

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ModifyAccount: React.FC = () => {
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

  const [emailFields, setEmailFields] = useState({
    currentEmail: "",
    currentPassword: "",
    newEmail: "",
  });

  const [passwordFields, setPasswordFields] = useState({
    currentEmail: "",
    currentPassword: "",
    newPassword: "",
  });

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);

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
            Account Settings Managed by Google
          </Typography>
          <Typography variant="body1">
            The account settings are managed directly by Google when you sign in
            with Google.
          </Typography>
        </Alert>
      </Section>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Account Settings
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
          Modify Email
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
                    {error}
                  </Alert>
                ))}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Current Email"
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
                aria-label="Current Email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
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
                      <IconButton onClick={toggleShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                aria-label="Current Password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Email"
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
                aria-label="New Email"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{ mt: 1, borderRadius: "20px", bgcolor: "black" }}
              >
                Update Email
              </Button>
            </Grid>
          </Grid>
        </form>
      </Section>

      <Divider sx={{ my: 3 }} />

      {/* Modify Password Section */}
      <Section>
        <Typography variant="h6" gutterBottom>
          Modify Password
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
                    {error}
                  </Alert>
                ))}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Current Email"
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
                aria-label="Current Email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
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
                      <IconButton onClick={toggleShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                aria-label="Current Password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Password"
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
                      <IconButton onClick={toggleShowNewPassword}>
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                aria-label="New Password"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{ mt: 1, borderRadius: "20px", bgcolor: "black" }}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </form>
      </Section>

      <Divider sx={{ my: 3 }} />

      {/* Modify Avatar Section (Disabled for now) */}
      {/* <Section
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
            alt="Current Avatar"
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
            Upload New Avatar
            <input type="file" hidden accept="image/*" />
          </Button>
        </Box>
      </Section> */}

      {/* Success/Error Alert Notification */}
      {alertMessage && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          sx={{ mt: 2 }}
        >
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default ModifyAccount;
