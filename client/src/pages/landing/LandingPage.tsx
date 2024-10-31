import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { memo, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import Loader from "../../components/common/Loader";
import Spinner from "../../components/common/Spinner";
const AuthenticationModal = React.lazy(
  () => import("../../components/landingPage/AuthenticationModal")
);
const Footer = React.lazy(() => import("../../components/landingPage/Footer"));

const preloadDashboard = () => import("../../pages/employee/EmployeeDashboard");

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [showLogin, setShowLogin] = useState(false); // Control modal visibility
  const [isRedirected, setIsRedirected] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.role);
  const navigate = useNavigate();

  const isSuperMobile = useMediaQuery("(min-width:0px) and (max-width:420px)");
  const isMobile = useMediaQuery("(min-width:0px) and (max-width:600px)");
  const isLandscape = useMediaQuery("(orientation: landscape)");

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Preload the AuthenticationModal and Footer components after the page mounts
  useEffect(() => {
    const preloadComponents = async () => {
      await import("../../components/landingPage/AuthenticationModal");
      await import("../../components/landingPage/Footer");
    };
    preloadComponents(); // Preload the components after the page mounts
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn && userRole !== "guest") {
        setIsRedirected(true); // Set the flag as redirected
        navigate("/dashboard");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate, isRedirected, userRole]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showLoader && <Loader fadeout={!showLoader} />}

      <Box
        sx={{
          opacity: showLoader ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          position: "relative",
          zIndex: 0,
          flexGrow: 1,
        }}
      >
        {/* Main Content */}
        <Container
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: isSuperMobile ? "0rem" : "2rem",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                padding: "1rem",
                flex: {
                  xs: "0 1 50%",
                  sm: isLandscape ? "0 1 30%" : "0 1 50%",
                  md: isLandscape ? "0 1 30%" : "0 1 60%",
                },
              }}
            >
              <img
                src="/images/logobig.png"
                alt="Welcome Logo"
                style={{
                  maxWidth: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />

              <Divider sx={{ my: isSuperMobile ? 0.5 : 2 }} />
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  mt: isSuperMobile ? 0.5 : 2,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 100,
                }}
              >
                NEXT_
              </Typography>

              {/* Login Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowLogin(true)}
                onMouseEnter={preloadDashboard} // Preload dashboard on hover
                sx={{
                  mt: isSuperMobile || isMobile ? 0.5 : 4,
                  paddingX: 4,
                  paddingY: 1.5,
                  fontSize: "1.2rem",
                  borderRadius: "50px",
                  background:
                    "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  color: "white",
                  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                  transition:
                    "transform 0.3s, box-shadow 0.3s, background 0.3s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)",
                    background:
                      "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
                  },
                }}
              >
                {isLoggedIn ? t("landingPage.enter") : t("landingPage.login")}
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Lazy Loaded Footer */}
        <Suspense fallback={<Spinner />}>
          <Box
            component="footer"
            sx={{
              paddingBottom: "env(safe-area-inset-bottom)", // Ensure padding for safe area
            }}
          >
            <Footer />
          </Box>
        </Suspense>
      </Box>

      {/* Lazy Loaded Authentication Modal */}
      <Suspense fallback={<Spinner />}>
        {showLogin && (
          <AuthenticationModal
            open={showLogin}
            onClose={() => setShowLogin(false)}
          />
        )}
      </Suspense>
    </Box>
  );
};

export default memo(LandingPage);