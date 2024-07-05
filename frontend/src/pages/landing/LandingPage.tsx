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
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Loader from "../../components/common/Loader";
import useAuthHandlers from "../../hooks/useAuthHandlers";
import {
  useGetAgentsQuery,
  useGetMinimalClientsQuery,
} from "../../services/api";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "agent" | "client"
  >("client");
  const [selectedAgent, setSelectedAgent] = useState<string>(""); // State for selected agent
  const [selectedClient, setSelectedClient] = useState<string>(""); // State for selected client
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const { data: agents = [] } = useGetAgentsQuery();
  const { data: minimalClients = [], refetch: refetchMinimalClients } =
    useGetMinimalClientsQuery();

  const { handleLogin, handleEnter } = useAuthHandlers({
    selectedRole,
    selectedAgent,
    selectedClient,
    agents,
  });

  const VATIcon = () => <span>{t("landingPage.vat")}</span>;

  const agentOptions = useMemo(
    () =>
      agents.map((agent, index) => (
        <MenuItem key={`${agent.id}-${index}`} value={agent.id}>
          {agent.name}
        </MenuItem>
      )),
    [agents]
  );

  const clientOptions = useMemo(
    () =>
      minimalClients.map((client, index) => (
        <MenuItem key={`${client.id}-${index}`} value={client.id}>
          {client.name}
        </MenuItem>
      )),
    [minimalClients]
  );

  useEffect(() => {
    if (!showLogin) {
      setSelectedAgent("");
      setSelectedClient("");
    }

    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, [showLogin]);

  if (showLoader) {
    return <Loader />;
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <img src="/logo-appbar.png" alt="Logo" style={{ height: "40px" }} />
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
          <MenuItem>
            <FormControl
              fullWidth
              sx={{ marginBottom: 2, paddingTop: "8px", margintop: "10px" }}
            >
              <InputLabel sx={{ fontSize: "110%", top: "-8px" }}>
                {t("landingPage.userRole")}
              </InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(
                    e.target.value as "admin" | "agent" | "client"
                  );
                  if (e.target.value === "client") {
                    refetchMinimalClients();
                  }
                }}
              >
                <MenuItem value="admin">{t("landingPage.admin")}</MenuItem>
                <MenuItem value="agent">{t("landingPage.agent")}</MenuItem>
                <MenuItem value="client">{t("landingPage.client")}</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          {selectedRole === "agent" && (
            <MenuItem>
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel sx={{ fontSize: "110%", top: "-8px" }}>
                  {t("landingPage.selectAgent")}
                </InputLabel>
                <Select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {agentOptions}
                </Select>
              </FormControl>
            </MenuItem>
          )}
          {selectedRole === "client" && (
            <MenuItem>
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel sx={{ fontSize: "110%", top: "-8px" }}>
                  {t("landingPage.selectClient")}
                </InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  {clientOptions}
                </Select>
              </FormControl>
            </MenuItem>
          )}
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
              src="/logobig.png"
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
          padding: "0.64rem", // Reduced by 20% from 0.8rem
          textAlign: "center",
          position: "relative",
          mt: "auto",
          "&:before": {
            content: '""',
            display: "block",
            height: "6.4px", // Reduced by 20% from 8px
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0), #f0f0f0)",
          },
          "@media (max-width: 600px)": {
            padding: "0.4rem", // 50% smaller for mobile
            "&:before": {
              height: "4px", // 50% smaller for mobile
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
                <VATIcon /> 03176280877
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
  );
};

export default LandingPage;
