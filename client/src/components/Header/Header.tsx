import {
  BarChart as BarChartIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import GlobalSearch from "./GlobalSearch";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const memoizedUserRole = useMemo(() => userRole, [userRole]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
    setTimeout(() => {
      setIconChange(!drawerOpen);
    }, 500);
  }, [drawerOpen]);

  const getDashboardLink = useCallback(() => {
    switch (memoizedUserRole) {
      case "admin":
        return "/admin-dashboard";
      case "agent":
        return "/agent-dashboard";
      case "client":
        return "/client-dashboard";
      default:
        return "/";
    }
  }, [memoizedUserRole]);

  const handleLogoClick = useCallback(() => {
    navigate(getDashboardLink());
  }, [navigate, getDashboardLink]);

  const renderLinks = useCallback(() => {
    const dashboardLink = getDashboardLink();

    return (
      <>
        <ListItem
          button
          component={Link}
          to={dashboardLink}
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t("headerDashboard")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/movements"
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t("movements")} />
        </ListItem>
        <ListItem button component={Link} to="/clients" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary={t("clients")} />
        </ListItem>
        <ListItem button component={Link} to="/articles" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <CategoryIcon />
          </ListItemIcon>
          <ListItemText primary={t("articles")} />
        </ListItem>
        <ListItem button component={Link} to="/visits" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary={t("visits")} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/statistics"
          onClick={toggleDrawer}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary={t("statistics")} />
        </ListItem>
        <ListItem button component={Link} to="/promos" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <LocalOfferIcon />
          </ListItemIcon>
          <ListItemText primary={t("promos")} />
        </ListItem>
        <ListItem button component={Link} to="/alerts" onClick={toggleDrawer}>
          <ListItemIcon sx={{ color: "white" }}>
            <WarningIcon />
          </ListItemIcon>
          <ListItemText primary={t("alerts")} />
        </ListItem>
      </>
    );
  }, [getDashboardLink, toggleDrawer, t]);

  const renderLogoutLink = useCallback(
    () => (
      <ListItem
        button
        component={Link}
        to="/"
        onClick={() => {
          handleLogout();
          toggleDrawer();
        }}
        sx={{ color: "white", paddingBottom: "20px" }}
      >
        <ListItemIcon sx={{ color: "white" }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary={t("logout")} />
      </ListItem>
    ),
    [handleLogout, toggleDrawer, t]
  );

  const memoizedLinks = useMemo(() => renderLinks(), [renderLinks]);
  const memoizedLogoutLink = useMemo(
    () => renderLogoutLink(),
    [renderLogoutLink]
  );

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Fade in={!iconChange} timeout={500}>
            <StyledIconButton
              edge="start"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              {iconChange ? <CloseIcon /> : <MenuIcon />}
            </StyledIconButton>
          </Fade>
          <img
            src="/images/logo-appbar.png"
            alt="Logo"
            style={{ height: "40px", marginRight: "16px", cursor: "pointer" }}
            onClick={handleLogoClick}
          />
          <GlobalSearch
            filter="all"
            placeholder={t("search")}
            isHeaderSearch={true}
          />
          <StyledIconButton onClick={() => setModalOpen(true)}>
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </StyledIconButton>
          <StyledIconButton>
            <Avatar alt="Agent Name" src="/path-to-avatar.jpg" />
          </StyledIconButton>
        </Toolbar>
      </StyledAppBar>
      <Toolbar />
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
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", padding: "16px" }}>
            <StyledIconButton edge="start" onClick={toggleDrawer}>
              <CloseIcon />
            </StyledIconButton>
            <img
              src="/images/logo-appbar.png"
              alt="Logo"
              style={{ height: "40px", marginLeft: "8px", cursor: "pointer" }}
              onClick={handleLogoClick}
            />
          </Box>
          <List sx={{ flexGrow: 1 }}>{memoizedLinks}</List>
          <Box sx={{ mt: "auto" }}>{memoizedLogoutLink}</Box>
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
            position: "absolute",
            top: "7%",
            right: "2%",
            width: 250,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="notification-modal-title" variant="h6" component="h2">
            {t("notifications")}
          </Typography>
          <Typography id="notification-modal-description" sx={{ mt: 2 }}>
            {t("no_notifications")}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default Header;
React.memo(Header);
