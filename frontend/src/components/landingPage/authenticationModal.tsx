import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Collapse,
  Checkbox,
  FormControlLabel,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useHandleSignin } from '../../hooks/useHandleSignin';
import 'animate.css';

const AuthenticationModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate__fadeIn');
  const {
    isLoginMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    keepMeSignedIn, // Include this state
    setKeepMeSignedIn, // Include setter for the checkbox
    loading,
    alertOpen,
    setAlertOpen,
    alertMessage,
    alertSeverity,
    shakeEmail,
    shakePassword,
    shakeConfirmPassword, // Handle shake state for confirm password
    toggleMode: originalToggleMode,
    handleSubmit,
  } = useHandleSignin(onClose);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setAnimationClass('animate__animated animate__fadeOut');
    setTimeout(() => {
      originalToggleMode();
      setAnimationClass('animate__animated animate__fadeIn');
    }, 250); // Speed up the transition by 50%
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '30px' } }} // Increase modal window border radius by 25%
    >
      <DialogContent
        className={animationClass}
        sx={{ textAlign: 'center', padding: '32px', borderRadius: '24px' }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '12px' }}>
          {isLoginMode ? 'Sign in' : 'Register'}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '24px', color: 'text.secondary' }}>
          to continue to RCS Next
        </Typography>

        {/* Alert Component */}
        <Collapse in={alertOpen}>
          <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        </Collapse>

        {/* Email Field */}
        <Box>
          <Typography variant="subtitle2" sx={{ textAlign: 'left', marginBottom: '8px', fontWeight: 'bold' }}>
            Email
          </Typography>
          <TextField
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: '16px', borderRadius: '12px' }}
            className={shakeEmail ? 'animate__animated animate__shakeX' : ''}
          />

          {/* Password Field */}
          <Typography variant="subtitle2" sx={{ textAlign: 'left', marginBottom: '8px', fontWeight: 'bold' }}>
            Password
          </Typography>
          <TextField
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: '16px', borderRadius: '12px' }}
            className={shakePassword ? 'animate__animated animate__shakeX' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password Field (only in Register mode) */}
          {!isLoginMode && (
            <>
              <Typography variant="subtitle2" sx={{ textAlign: 'left', marginBottom: '8px', fontWeight: 'bold' }}>
                Confirm password
              </Typography>
              <TextField
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                sx={{ marginBottom: '16px', borderRadius: '12px' }}
                className={shakeConfirmPassword ? 'animate__animated animate__shakeX' : ''}
              />
            </>
          )}
        </Box>

        {/* Checkbox for "Keep me signed in" */}
        {isLoginMode && (
          <FormControlLabel
            control={<Checkbox
              checked={keepMeSignedIn} // Bind the checked state
              onChange={(e) => setKeepMeSignedIn(e.target.checked)} // Bind the setter
            />}
            label={
              <Box textAlign="left">
                <Typography variant="body2">Keep me signed in</Typography>
                <Typography variant="caption" color="textSecondary">
                  Recommended on trusted devices.
                </Typography>
              </Box>
            }
            sx={{ marginBottom: '16px', alignSelf: 'center' }}
          />
        )}

        {/* Main Action Button (Sign in / Register) */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#81c784', // Pastel green color
            fontSize: '16px',
            padding: '10px',
            marginBottom: '16px',
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: '#66bb6a',
            },
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : isLoginMode ? 'Sign in' : 'Register'}
        </Button>

        {/* Google OAuth button */}
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{
            fontSize: '16px',
            padding: '10px',
            marginBottom: '16px',
            borderRadius: '12px',
          }}
          onClick={() => {/* Google OAuth logic here */}}
        >
          Continue with Google
        </Button>

        {/* Toggle between Login and Register */}
        <Typography variant="body2" sx={{ marginBottom: '10px', cursor: 'pointer' }}>
          {isLoginMode ? (
            <>
              New to RCS Next?{' '}
              <Typography
                component="span"
                sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', color: '#6C63FF' }}
                onClick={toggleMode}
              >
                Create account
              </Typography>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Typography
                component="span"
                sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', color: '#6C63FF' }}
                onClick={toggleMode}
              >
                Sign in
              </Typography>
            </>
          )}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationModal;
