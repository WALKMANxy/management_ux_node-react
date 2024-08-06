import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { FetchUserRoleError, LoginError, RegistrationError } from '../../utils/errorHandling';
import 'animate.css';

const AuthenticationModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('error');
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [toastAnimationClass, setToastAnimationClass] = useState('animate__backInUp');

  const { handleLogin, handleRegister } = useAuth();

  useEffect(() => {
    if (toastOpen) {
      // Trigger pulse animation after backInUp finishes
      setTimeout(() => {
        setToastAnimationClass('animate__pulse');
      }, 1000);

      // Automatically close with backOutDown animation after 10 seconds
      setTimeout(() => {
        setToastAnimationClass('animate__backOutDown');
        setTimeout(() => {
          setToastOpen(false);
        }, 1000); // Allow time for backOutDown to complete
      }, 10000);
    }
  }, [toastOpen]);

  const toggleMode = () => {
    setAnimationClass('animate__animated animate__fadeOut');
    setTimeout(() => {
      setIsLoginMode(!isLoginMode);
      setAnimationClass('animate__animated animate__fadeIn');
    }, 500);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShakeEmail(false);
    setShakePassword(false);
    try {
      if (isLoginMode) {
        await handleLogin(email, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
          setToastMessage('Passwords do not match');
          setToastOpen(true);
          setToastSeverity('error');
          setShakePassword(true);
          setLoading(false);
          return;
        }
        await handleRegister(email, password);
        setToastMessage('Registration successful! Please verify your email.');
        setToastSeverity('success');
        setToastOpen(true);
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        setToastMessage(errorMessage);

        if (errorMessage.includes('Invalid email') || errorMessage.includes('User already exists')) {
          setShakeEmail(true);
        }
        if (errorMessage.includes('Password')) {
          setShakePassword(true);
        }
      } else if (error instanceof LoginError || error instanceof RegistrationError || error instanceof FetchUserRoleError) {
        setToastMessage(error.message);
      } else {
        setToastMessage('An unexpected error occurred');
      }
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isLoginMode ? 'Sign-in' : 'Register'}</DialogTitle>
      <DialogContent className={animationClass}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginBottom: '10px' }}
          onClick={() => {/* Google OAuth logic here */}}
        >
          Continue with Google
        </Button>

        <TextField
          label="Your email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px' }}
          className={shakeEmail ? 'animate__animated animate__shakeX' : ''}
        />
        <TextField
          label="Your password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px' }}
          className={shakePassword ? 'animate__animated animate__shakeX' : ''}
        />
        {!isLoginMode && (
          <TextField
            label="Confirm password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
        )}
        <Typography variant="body2" style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={toggleMode}>
          {isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign-in"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isLoginMode ? 'Login' : 'Register'}
        </Button>
      </DialogActions>

      <Snackbar
        open={toastOpen}
        autoHideDuration={null} // We handle auto close manually
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        className={`animate__animated ${toastAnimationClass}`}
        ContentProps={{
          style: {
            backgroundColor: toastSeverity === 'success' ? 'green' : 'red',
            color: toastSeverity === 'success' ? 'white' : 'black',
          },
        }}
      />
    </Dialog>
  );
};

export default AuthenticationModal;
