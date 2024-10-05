import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import Loader from "../../components/common/Loader";
import AuthenticationModal from "../../components/landingPage/AuthenticationModal";
import Footer from "../../components/landingPage/Footer";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [showLogin, setShowLogin] = useState(false); // Control modal visibility
  const [isRedirected, setIsRedirected] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.role);
  const navigate = useNavigate();

  const isSuperMobile = useMediaQuery("(min-width:0px) and (max-width:420px)");

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn && userRole !== "guest") {
        setIsRedirected(true); // Set the flag as redirected
        // Redirect based on user role
        switch (userRole) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "agent":
            navigate("/agent-dashboard");
            break;
          case "client":
            navigate("/client-dashboard");
            break;
          case "employee":
            navigate("/employee-dashboard");
            break;
          default:
            break;
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoggedIn, userRole, isRedirected, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
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
          minHeight: "100vh",
          position: "relative",
          zIndex: 0,
        }}
      >
        {/* Top Shadow */}

        <Container
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: isSuperMobile ? "1rem" : "2rem",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                padding: "1rem",
                flex: { xs: "0 1 auto", md: "0 1 50%" },
              }}
            >
              <img
                src="/images/logobig.png"
                alt="Welcome Logo"
                style={{ width: "100%", height: "auto" }}
              />
              <Divider sx={{ my: isSuperMobile ? 0.5 : 2 }} />
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  mt: isSuperMobile ? 0.5 : 2,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 100, // Now using the lighter custom font weight
                }}
              >
                NEXT_
              </Typography>

              {/* Login Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowLogin(true)}
                sx={{
                  mt: isSuperMobile ? 0.5 : 4,
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

        <Box component="footer">
          <Footer />
        </Box>
      </Box>

      {/* Authentication Modal */}
      <AuthenticationModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </Box>
  );
};

export default LandingPage;
