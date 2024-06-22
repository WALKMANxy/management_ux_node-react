import React, { useState, useMemo, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
  Box,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GoogleMapsIcon from "@mui/icons-material/Map";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  useGetAgentsQuery,
  useGetMinimalClientsQuery,
} from "../../services/api";
import useAuthHandlers from "../../features/hooks/useAuthHandlers";

const LandingPage: React.FC = () => {
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

  const VATIcon = () => <span>Partita IVA</span>; 

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
  }, [showLogin]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <img src="/logo-appbar.png" alt="Logo" style={{ height: "40px" }} />
          <Button color="inherit" onClick={() => setShowLogin(!showLogin)}>
            {isLoggedIn ? "Enter" : "Login"}
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
                User Role
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
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="client">Client</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          {selectedRole === "agent" && (
            <MenuItem>
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel sx={{ fontSize: "110%", top: "-8px" }}>
                  Select Agent
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
                  Select Client
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
              {isLoggedIn ? "Enter" : "Login"}
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
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Roboto, sans-serif",
              background: "linear-gradient(90deg, #77dd77, #ffffff, #ff6961)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              padding: "1rem",
              fontSize: "9rem",
            }}
          >
            Welcome
          </Typography>
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
            }}
          >
            <Button
              href="https://www.facebook.com/RicambiCentroSud/"
              startIcon={<FacebookIcon />}
              sx={{ color: "#3b5998" }}
            >
              Facebook
            </Button>
            <Button
              href="https://www.instagram.com/ricambicentrosud/"
              startIcon={<InstagramIcon />}
              sx={{ color: "#E1306C" }}
            >
              Instagram
            </Button>
            <Button
              href="https://goo.gl/maps/MFy1cqdn3BbQNmtW6"
              startIcon={<GoogleMapsIcon />}
              sx={{ color: "#4285F4" }}
            >
              Google Maps
            </Button>
            <Button
              href="https://www.linkedin.com/company/7007068/"
              startIcon={<LinkedInIcon />}
              sx={{ color: "#0077B5" }}
            >
              LinkedIn
            </Button>
          </Box>
        </Box>
      </Container>

      <Box
  component="footer"
  sx={{
    backgroundColor: "#f0f0f0",
    color: "#333",
    padding: "1rem",
    textAlign: "center",
    position: "relative",
    mt: 'auto',
    "&:before": {
      content: '""',
      display: 'block',
      height: '8px',
      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), #f0f0f0)'
    }
  }}
>
  <Container>
    <Box display="flex" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }}>
      <Box sx={{ textAlign: 'left', padding: '0.5rem 1rem', flex: 1, fontSize: '90%' }}>
        <Typography sx={{ marginBottom: '0.5rem' }}>
          <AccessTimeIcon /> Lun - Ven, 8:30 - 13:00 e 14:30 - 18:30
        </Typography>
        <Typography>
          <LocationOnIcon /> Via Alessandro Volta 17, Catania
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', padding: '0.5rem 1rem', flex: 1, fontSize: '90%' }}>
        <Typography sx={{ marginBottom: '0.5rem' }}>
          <PhoneIcon /> (+39) 095 419 0006
        </Typography>
        <Typography sx={{ marginBottom: '0.5rem' }}>
          <EmailIcon /> info@ricambicentrosud.com
        </Typography>
        <Typography>
          <VATIcon /> 03176280877  {/* Replace VATIcon with appropriate icon component */}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ textAlign: 'center', padding: '0.5rem 1rem', fontSize: '90%' }}>
      <Typography>credits: @2024</Typography>
    </Box>
  </Container>
</Box>

    </Box>
  );
};

export default LandingPage;
