import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ErrorDetails = styled(Typography)(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  marginBottom: theme.spacing(2),
  fontSize: '0.8rem',
}));

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);

  const resetErrorBoundary = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
  };

  useEffect(() => {
    const errorHandler = (error: Error, errorInfo: React.ErrorInfo) => {
      setError(error);
      setErrorInfo(errorInfo);
      setHasError(true);
      console.error("Uncaught error:", error, errorInfo);
    };

    const originalErrorBoundaryHandler = window.onerror;

    window.onerror = (message, source, lineno, colno, err) => {
      if (err) {
        console.error(`Error: ${message} at ${source}:${lineno}:${colno}`);

        errorHandler(err, { componentStack: '' });
      }
      return true;
    };

    return () => {
      window.onerror = originalErrorBoundaryHandler;
    };
  }, []);

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorContainer>
        <ErrorMessage variant="h5">
          {t('errorBoundary.title', 'Oops! Something went wrong.')}
        </ErrorMessage>
        <ErrorMessage>
          {t('errorBoundary.message', 'We\'re sorry for the inconvenience. Please try again or contact support if the problem persists.')}
        </ErrorMessage>
        {import.meta.env.NODE_ENV === 'development' && error && (
          <Box>
            <ErrorDetails>
              {error.toString()}
            </ErrorDetails>
            {errorInfo && (
              <ErrorDetails>
                {errorInfo.componentStack}
              </ErrorDetails>
            )}
          </Box>
        )}
        <Button variant="contained" color="primary" onClick={resetErrorBoundary}>
          {t('errorBoundary.tryAgain', 'Try again')}
        </Button>
      </ErrorContainer>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
