import { Box, Button, Paper, Typography } from "@mui/material";
import { styled } from "@mui/system";
import React, { ErrorInfo, ReactNode } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps extends WithTranslation, React.PropsWithChildren {
  children: ReactNode;
  fallback?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  textAlign: "center",
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ErrorDetails = styled(Typography)(({ theme }) => ({
  whiteSpace: "pre-wrap",
  marginBottom: theme.spacing(2),
  fontSize: "0.8rem",
}));

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleBackToHome = () => {
    return (
      <Link to="/">
        {this.props.t("errorBoundary.backToHome", "Back to Home")}
      </Link>
    );
  };

  render() {
    const { t, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      return (
        <ErrorContainer>
          <ErrorMessage variant="h4">
            {t("errorBoundary.title", "Oops! Something went wrong.")}
          </ErrorMessage>
          <ErrorMessage variant="body1">
            {t(
              "errorBoundary.message",
              "We're sorry for the inconvenience. Please try again or contact support if the problem persists."
            )}
          </ErrorMessage>
          {process.env.NODE_ENV === "development" && error && (
            <Box>
              <ErrorDetails>{error.toString()}</ErrorDetails>
              {errorInfo && (
                <ErrorDetails>{errorInfo.componentStack}</ErrorDetails>
              )}
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleBackToHome}
            sx={{ mt: 2 }}
          >
            {t("errorBoundary.backToHome", "Back to Home")}
          </Button>
        </ErrorContainer>
      );
    }

    return children;
  }
}

const TranslatedErrorBoundary = withTranslation()(ErrorBoundary);

export default TranslatedErrorBoundary;
