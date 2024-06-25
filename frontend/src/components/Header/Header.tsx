import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Modal,
  Typography,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  BarChart as BarChartIcon,
  LocalOffer as LocalOfferIcon,
  Warning as WarningIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import GlobalSearch from "../common/GlobalSearch";

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const dispatch = useDispatch();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setTimeout(() => {
      setIconChange(!drawerOpen);
    }, 500); // 500ms delay for icon change
  };

  const handleSearchSelect = (result: string) => {
    console.log(`Selected result: ${result}`);
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
          <ListItemIcon sx={{ color: "white" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/clients">
          <ListItemIcon sx={{ color: "white" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Clients" />
        </ListItem>
        <ListItem button component={Link} to="/visits">
          <ListItemIcon sx={{ color: "white" }}>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary="Visits" />
        </ListItem>
        <ListItem button component={Link} to="/statistics">
          <ListItemIcon sx={{ color: "white" }}>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItem>
        <ListItem button component={Link} to="/promos">
          <ListItemIcon sx={{ color: "white" }}>
            <LocalOfferIcon />
          </ListItemIcon>
          <ListItemText primary="Promos" />
        </ListItem>
        <ListItem button component={Link} to="/alerts">
          <ListItemIcon sx={{ color: "white" }}>
            <WarningIcon />
          </ListItemIcon>
          <ListItemText primary="Alerts" />
        </ListItem>
      </>
    );
  };

  const renderLogoutLink = () => (
    <ListItem
      button
      component={Link}
      to="/"
      onClick={() => {
        handleLogout();
        dispatch(logout());
      }}
      sx={{ color: "white", paddingBottom: "20px" }}
    >
      <ListItemIcon sx={{ color: "white" }}>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "black", color: "black" }}>
        <Toolbar>
          <Fade in={!iconChange} timeout={500}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ color: "white" }} // Scoped color style
            >
              {iconChange ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Fade>
          <img
            src="/logo-appbar.png"
            alt="Logo"
            style={{ height: "40px", marginRight: "16px" }}
          />
          <GlobalSearch
            filter="all"
            placeholder="Search..."
            onSelect={handleSearchSelect}
          />
          <IconButton color="inherit" onClick={() => setModalOpen(true)} sx={{ color: "white" }}>
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ color: "white" }}>
            <Avatar alt="Agent Name" src="/path-to-avatar.jpg" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            backgroundColor: "black",
            color: "white",
            width: 250,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
            <img src="/logo-appbar.png" alt="Logo" style={{ height: "40px", marginLeft: '8px' }} />
          </Box>
          <List sx={{ flexGrow: 1 }}>{renderLinks()}</List>
          <Box sx={{ mt: 'auto' }}>
            {renderLogoutLink()}
          </Box>
        </Box>
      </Drawer>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '7%',
            right: '2%',
            width: 250,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="notification-modal-title" variant="h6" component="h2">
            Notifications
          </Typography>
          <Typography id="notification-modal-description" sx={{ mt: 2 }}>
            No new notifications
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default React.memo(Header);
