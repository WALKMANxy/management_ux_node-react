import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GoogleMapsIcon from "@mui/icons-material/Map";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import Loader from "../../components/common/Loader";
import AuthenticationModal from "../../components/landingPage/authenticationModal";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [showLogin, setShowLogin] = useState(false); // Control modal visibility
  const [isRedirected, setIsRedirected] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.role);
  const navigate = useNavigate();

  // console.log("Logged in?: ", isLoggedIn);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
        default:
          break;
      }
    }
  }, [isLoggedIn, userRole, isRedirected, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
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
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: "black" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <img
              src="/images/logo-appbar.png"
              alt="Logo"
              style={{ height: "40px" }}
            />
            <Button color="inherit" onClick={() => setShowLogin(true)}>
              {isLoggedIn ? t("landingPage.enter") : t("landingPage.login")}
            </Button>
          </Toolbar>
        </AppBar>

        <Container
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
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
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                bgcolor: "lightgray",
                height: { xs: "0", md: "200px" },
                width: { xs: "100%", md: "0" },
                margin: "1rem",
              }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2,
                flex: { xs: "0 1 auto", md: "0 1 50%" },
              }}
            >
              <Button
                href="https://www.facebook.com/RicambiCentroSud/"
                startIcon={<FacebookIcon />}
                sx={{ color: "#3b5998" }}
              >
                {t("landingPage.facebook")}
              </Button>
              <Button
                href="https://www.instagram.com/ricambicentrosud/"
                startIcon={<InstagramIcon />}
                sx={{ color: "#E1306C" }}
              >
                {t("landingPage.instagram")}
              </Button>
              <Button
                href="https://goo.gl/maps/MFy1cqdn3BbQNmtW6"
                startIcon={<GoogleMapsIcon />}
                sx={{ color: "#4285F4" }}
              >
                {t("landingPage.googleMaps")}
              </Button>
              <Button
                href="https://www.linkedin.com/company/7007068/"
                startIcon={<LinkedInIcon />}
                sx={{ color: "#0077B5" }}
              >
                {t("landingPage.linkedIn")}
              </Button>
            </Box>
          </Box>
        </Container>

        <Box
          component="footer"
          sx={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            padding: "0.64rem",
            textAlign: "center",
            position: "relative",
            mt: "auto",
            "&:before": {
              content: '""',
              display: "block",
              height: "6.4px",
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0), #f0f0f0)",
            },
            "@media (max-width: 600px)": {
              padding: "0.4rem",
              "&:before": {
                height: "4px",
              },
            },
          }}
        >
          <Container>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "center", sm: "flex-start" }}
              sx={{
                "@media (max-width: 600px)": {
                  flexDirection: "column", // Stack items for mobile
                  alignItems: "center",
                },
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: "center", sm: "left" },
                  padding: "0.32rem 0.64rem",
                  flex: 1,
                  fontSize: "64%",
                  "@media (max-width: 600px)": {
                    padding: "0.16rem 0.32rem", // 50% smaller for mobile
                    fontSize: "32%", // 50% smaller for mobile
                  },
                }}
              >
                <Typography
                  sx={{
                    marginBottom: "0.32rem",
                    "@media (max-width: 600px)": {
                      marginBottom: "0.16rem",
                      fontSize: "250%",
                    },
                  }}
                >
                  <AccessTimeIcon /> {t("landingPage.workingHours")}
                </Typography>
                <Typography
                  sx={{
                    marginBottom: "0.32rem",
                    "@media (max-width: 600px)": {
                      marginBottom: "0.16rem",
                      fontSize: "250%",
                    },
                  }}
                >
                  <LocationOnIcon /> {t("landingPage.address")}
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: { xs: "center", sm: "right" },
                  padding: "0.32rem 0.64rem",
                  flex: 1,
                  fontSize: "64%",
                  "@media (max-width: 600px)": {
                    padding: "0.16rem 0.32rem", // 50% smaller for mobile
                    fontSize: "32%", // 50% smaller for mobile
                  },
                }}
              >
                <Typography
                  sx={{
                    marginBottom: "0.32rem",
                    "@media (max-width: 600px)": {
                      marginBottom: "0.16rem",
                      fontSize: "250%",
                    },
                  }}
                >
                  <PhoneIcon />{" "}
                  <a
                    href="tel:+390954190006"
                    style={{ color: "blue", textDecoration: "none" }}
                  >
                    (+39) 095 419 0006
                  </a>
                </Typography>
                <Typography
                  sx={{
                    marginBottom: "0.32rem",
                    "@media (max-width: 600px)": {
                      marginBottom: "0.16rem",
                      fontSize: "250%",
                    },
                  }}
                >
                  <EmailIcon />{" "}
                  <a
                    href="mailto:info@ricambicentrosud.com"
                    style={{ color: "blue", textDecoration: "none" }}
                  >
                    info@ricambicentrosud.com
                  </a>
                </Typography>
                <Typography
                  sx={{
                    marginBottom: "0.32rem",
                    "@media (max-width: 600px)": {
                      marginBottom: "0.16rem",
                      fontSize: "250%",
                    },
                  }}
                >
                  VAT 03176280877
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                padding: "0.32rem 0.64rem",
                fontSize: "64%",
                "@media (max-width: 600px)": {
                  padding: "0.16rem 0.32rem", // 50% smaller for mobile
                  fontSize: "32%", // 50% smaller for mobile
                },
              }}
            >
              <Typography
                sx={{
                  marginBottom: "0.32rem",
                  "@media (max-width: 600px)": {
                    marginBottom: "0.16rem",
                    fontSize: "250%",
                  },
                }}
              >
                {t("landingPage.credits")}
              </Typography>
            </Box>
          </Container>
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
