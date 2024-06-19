import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faEnvelope,
  faChartBar,
  faTags,
  faExclamationTriangle,
  faSignOutAlt,
  faHome,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { useSidebar } from "../../hooks/useSidebar";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { SidebarProps } from "../../models/models"; // Adjust the path if necessary

const SidebarContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: 0,
  width: 200, // Adjusted to make sidebar thinner
  height: "100vh",
  backgroundColor: "#2E3B4E",
  color: "#fff",
  padding: 20,
  transition: "transform 0.3s ease-in-out",
  transform: "translateX(0)",
  zIndex: 2000,
  borderRadius: "0 20px 20px 0",
  "&.closed": {
    transform: "translateX(-100%)",
  },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  "& .MuiListItemIcon-root": {
    fontSize: "1.32rem", // Increased icon size by 10%
  },
  "& .MuiListItemText-primary": {
    fontSize: "1.1rem", // Increased text size by 10%
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  left: 20,
  top: 10,
  backgroundColor: "transparent",
  border: "none",
  color: "#000",
  fontSize: "1.5rem",
  cursor: "pointer",
  zIndex: 3000,
  padding: "5px 0",
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const dispatch = useDispatch();

  useEffect(() => {
    onToggle(isSidebarOpen);
  }, [isSidebarOpen, onToggle]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderLinks = () => {
    let dashboardLink = "/";
    switch (userRole) {
      case "admin":
        dashboardLink = "/admin-dashboard";
        break;
      case "agent":
        dashboardLink = "/agent-dashboard";
        break;
      case "client":
        dashboardLink = "/client-dashboard";
        break;
      default:
        dashboardLink = "/";
    }

    return (
      <>
        <ListItem button component={Link} to={dashboardLink}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faHome} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/clients">
          <ListItemIcon>
            <FontAwesomeIcon icon={faUser} />
          </ListItemIcon>
          <ListItemText primary="Clients" />
        </ListItem>
        <ListItem button component={Link} to="/visits">
          <ListItemIcon>
            <FontAwesomeIcon icon={faEnvelope} />
          </ListItemIcon>
          <ListItemText primary="Visits" />
        </ListItem>
        <ListItem button component={Link} to="/statistics">
          <ListItemIcon>
            <FontAwesomeIcon icon={faChartBar} />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItem>
        <ListItem button component={Link} to="/promos">
          <ListItemIcon>
            <FontAwesomeIcon icon={faTags} />
          </ListItemIcon>
          <ListItemText primary="Promos" />
        </ListItem>
        <ListItem button component={Link} to="/alerts">
          <ListItemIcon>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </ListItemIcon>
          <ListItemText primary="Alerts" />
        </ListItem>
      </>
    );
  };

  return (
    <>
      <SidebarContainer className={isSidebarOpen ? "" : "closed"}>
        <Box>
          <Typography variant="h6" component="div" className="logo">
            Logo
          </Typography>
          <nav>
            <List>{renderLinks()}</List>
          </nav>
        </Box>
        <Box>
          <List className="logout">
            <ListItem button component={Link} to="/" onClick={handleLogout}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faSignOutAlt} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </SidebarContainer>
      <ToggleButton onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </ToggleButton>
    </>
  );
};

export default React.memo(Sidebar);
