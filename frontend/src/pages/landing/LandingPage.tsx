import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Loader from "../../components/common/Loader";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // Temporary functions to handle login/logout
  const handleLogin = () => {
    console.log("Login button clicked");
  };

  const handleEnter = () => {
    console.log("Enter button clicked");
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
            <Button color="inherit" onClick={() => setShowLogin(!showLogin)}>
              {isLoggedIn ? t("landingPage.enter") : t("landingPage.login")}
            </Button>
          </Toolbar>
        </AppBar>

        {showLogin && (
          <Menu
            anchorEl={document.body}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={showLogin}
            onClose={() => setShowLogin(false)}
            sx={{ marginTop: "48px" }}
          >
            {/* Placeholder for future login/registration form */}
            <MenuItem>
              <Button
                variant="contained"
                color="primary"
                onClick={isLoggedIn ? handleEnter : handleLogin}
                fullWidth
              >
                {isLoggedIn ? t("landingPage.enter") : t("landingPage.login")}
              </Button>
            </MenuItem>
          </Menu>
        )}

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
                sx={{ color: "#3b5998" }}
              >
                {t("landingPage.facebook")}
              </Button>
              <Button
                href="https://www.instagram.com/ricambicentrosud/"
                sx={{ color: "#E1306C" }}
              >
                {t("landingPage.instagram")}
              </Button>
              <Button
                href="https://goo.gl/maps/MFy1cqdn3BbQNmtW6"
                sx={{ color: "#4285F4" }}
              >
                {t("landingPage.googleMaps")}
              </Button>
              <Button
                href="https://www.linkedin.com/company/7007068/"
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
                  flexDirection: "column",
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
                    padding: "0.16rem 0.32rem",
                    fontSize: "32%",
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
                  {t("landingPage.workingHours")}
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
                  {t("landingPage.address")}
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: { xs: "center", sm: "right" },
                  padding: "0.32rem 0.64rem",
                  flex: 1,
                  fontSize: "64%",
                  "@media (max-width: 600px)": {
                    padding: "0.16rem 0.32rem",
                    fontSize: "32%",
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
                  {t("landingPage.vat")}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                padding: "0.32rem 0.64rem",
                fontSize: "64%",
                "@media (max-width: 600px)": {
                  padding: "0.16rem 0.32rem",
                  fontSize: "32%",
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
    </Box>
  );
};

export default LandingPage;
