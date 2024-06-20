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
  Grid,
  Paper,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useGetAgentsQuery, useGetMinimalClientsQuery } from "../../services/api";
import useAuthHandlers from "../../features/hooks/useAuthHandlers";

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "agent" | "client">("client");
  const [selectedAgent, setSelectedAgent] = useState<string>(""); // State for selected agent
  const [selectedClient, setSelectedClient] = useState<string>(""); // State for selected client
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const { data: agents = [] } = useGetAgentsQuery();
  const { data: minimalClients = [], refetch: refetchMinimalClients } = useGetMinimalClientsQuery();

  const { handleLogin, handleEnterDashboard } = useAuthHandlers({
    selectedRole,
    selectedAgent,
    selectedClient,
    agents
  });

  const agentOptions = useMemo(() => (
    agents.map((agent, index) => (
      <MenuItem key={`${agent.id}-${index}`} value={agent.id}>
        {agent.name}
      </MenuItem>
    ))
  ), [agents]);

  const clientOptions = useMemo(() => (
    minimalClients.map((client, index) => (
      <MenuItem key={`${client.id}-${index}`} value={client.id}>
        {client.name}
      </MenuItem>
    ))
  ), [minimalClients]);

  useEffect(() => {
    if (!showLogin) {
      setSelectedAgent("");
      setSelectedClient("");
    }
  }, [showLogin]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Logo</Typography>
          <Button color="inherit" onClick={() => setShowLogin(!showLogin)}>
            Login
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
            <FormControl fullWidth>
              <InputLabel>User Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as "admin" | "agent" | "client");
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
              <FormControl fullWidth>
                <InputLabel>Select Agent</InputLabel>
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
              <FormControl fullWidth>
                <InputLabel>Select Client</InputLabel>
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
              onClick={handleLogin}
              fullWidth
            >
              Login
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
        <Typography variant="h1" align="center" gutterBottom>
          Welcome
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2rem",
          }}
        >
          <Paper elevation={3} sx={{ padding: "2rem" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth>
                  Link 1
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth>
                  Link 2
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth>
                  Link 3
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth>
                  Link 4
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {isLoggedIn && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ marginTop: "2rem" }}
            onClick={handleEnterDashboard}
          >
            Enter Dashboard
          </Button>
        )}
      </Container>
      <Box
        component="footer"
        sx={{
          backgroundColor: "#d5f5d3",
          color: "#000",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <Container>
          <Box display="flex" justifyContent="space-between">
            <Typography>© 2024 Developed By ****</Typography>
            <Typography>Business Contact: example@example.com</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
