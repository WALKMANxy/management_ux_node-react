// src/pages/landing/LandingPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";
import { RootState } from "../../app/store";
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
import mockData from "../../mockData/mockData";

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "agent" | "client"
  >("client");
  const [selectedAgent, setSelectedAgent] = useState<string>(""); // State for selected agent
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (selectedRole === "agent" && selectedAgent) {
      dispatch(login({ role: selectedRole, id: selectedAgent }));
    } else {
      dispatch(login({ role: selectedRole, id: "" }));
    }
    setShowLogin(false);
  };

  const handleEnterDashboard = () => {
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
        navigate("/");
    }
  };

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
                onChange={(e) =>
                  setSelectedRole(
                    e.target.value as "admin" | "agent" | "client"
                  )
                }
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
                  {mockData.agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </MenuItem>
                  ))}
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
            <Typography>&copy; 2024 Developed By ****</Typography>
            <Typography>Business Contact: example@example.com</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
