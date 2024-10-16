// Header.tsx

import {
  Category as CategoryIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  AppBar,
  Box,
  Drawer,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { handleLogout } from "../../features/auth/authThunks";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import { clearSelection } from "../../features/data/dataSlice";
import { selectCurrentUser } from "../../features/users/userSlice";
import { UserRole } from "../../models/entityModels";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";
import UserAvatar from "./UserAvatar";

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const [showAppBar, setShowAppBar] = useState(true); // New state for showing/hiding AppBar
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = useSelector(selectCurrentUser)?.role;

  const location = useLocation();
  const prevLocationRef = useRef<string>(location.pathname);

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  const lastScrollYRef = useRef<number>(0);
  const showAppBarRef = useRef<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        if (showAppBarRef.current) {
          setShowAppBar(false);
          showAppBarRef.current = false;
        }
      } else if (currentScrollY < lastScrollYRef.current) {
        if (!showAppBarRef.current) {
          setShowAppBar(true);
          showAppBarRef.current = true;
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const prevPath = prevLocationRef.current;
    const currentPath = location.pathname;

    if (prevPath === "/visits" && currentPath !== "/visits") {
      dispatch(clearSelection());
    }

    if (prevPath === "/messages" && currentPath !== "/messages") {
      dispatch(clearCurrentChatReducer());
    }

    if (prevPath === "/promos" && currentPath !== "/promos") {
      dispatch(clearSelection());
    }

    prevLocationRef.current = currentPath;
  }, [location.pathname, dispatch]);

  // Inside Header component
  const toggleDrawerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);

    // Clear any existing timeout
    if (toggleDrawerTimeoutRef.current) {
      clearTimeout(toggleDrawerTimeoutRef.current);
    }

    toggleDrawerTimeoutRef.current = setTimeout(() => {
      setIconChange((prev) => !prev);
      toggleDrawerTimeoutRef.current = null;
    }, 500);
  }, []);

  const handleLogoClick = () => {
    navigate("/dashboard"); // Navigate to the consolidated dashboard
  };

  useEffect(() => {
    return () => {
      if (toggleDrawerTimeoutRef.current) {
        clearTimeout(toggleDrawerTimeoutRef.current);
      }
    };
  }, []);

  const renderLinks = useMemo(() => {
    const dashboardLink = "/dashboard";
    const statisticsLink = "/statistics";
    const allowedStatisticsRoles: UserRole[] = ["admin", "client", "agent"];

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
          <ListItemText primary={t("headerDashboard", "Dashboard")} />
        </ListItem>

        {allowedStatisticsRoles.includes(userRole!) && (
          <ListItem
            button
            component={Link}
            to={statisticsLink}
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary={t("statistics", "Statistics")} />
          </ListItem>
        )}

        {userRole !== "employee" && (
          <>
            <ListItem
              button
              component={Link}
              to="/movements"
              onClick={toggleDrawer}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={t("movements", "Movements")} />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/clients"
              onClick={toggleDrawer}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary={t("clients", "Clients")} />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/articles"
              onClick={toggleDrawer}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary={t("articles", "Articles")} />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/visits"
              onClick={toggleDrawer}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText primary={t("visits", "Visits")} />
            </ListItem>

            <ListItem
              button
              component={Link}
              to="/promos"
              onClick={toggleDrawer}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText primary={t("promos", "Promos")} />
            </ListItem>
          </>
        )}

        {userRole !== "client" && (
          <ListItem
            button
            component={Link}
            to="/calendar"
            onClick={toggleDrawer}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary={t("calendar", "Calendar")} />
          </ListItem>
        )}
      </>
    );
  }, [userRole, toggleDrawer, t]);

  const renderLogoutLink = () => (
    <ListItem
      button
      component={Link}
      to="/"
      onClick={() => {
        initiateLogout();
        toggleDrawer();
      }}
      sx={{ color: "white", paddingBottom: "20px" }}
    >
      <ListItemIcon sx={{ color: "white" }}>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary={t("logout")} />
    </ListItem>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 1)",
          boxShadow: `0px 4px 12px rgba(0, 0, 0, 0.1)`,
          width: "100%",
          right: "auto",
          left: "auto",
          maxWidth: "100vw",
          transition: "top 0.3s ease-in-out", // Smooth transition
          top: showAppBar ? "0" : "-64px", // Hide/show the AppBar based on scroll
        }}
        className="animate__animated animate__fadeInDown"
      >
        <Toolbar sx={{ display: "flex" }}>
          <Fade in={!iconChange} timeout={500}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ color: "white" }}
            >
              {iconChange ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
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
          <NotificationBell />
          <UserAvatar />
        </Toolbar>
      </AppBar>
      <Toolbar />
      {drawerOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            transition: "backdrop-filter 0.3s ease",
          }}
          onClick={toggleDrawer}
        />
      )}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            backgroundColor: "black",
            color: "white",
            width: isMobile ? "auto" : "250px",
            height: "100vh",
            borderBottomRightRadius: "32px",
            borderTopRightRadius: "32px",
          },
        }}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", padding: "16px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src="/images/logo-appbar.png"
              alt="Logo"
              style={{ height: "40px", marginLeft: "8px", cursor: "pointer" }}
              onClick={handleLogoClick}
            />
          </Box>
          <List sx={{ flexGrow: 1 }}>{renderLinks}</List>
          <Box sx={{ mt: "auto" }}>{renderLogoutLink()}</Box>
        </Box>
      </Drawer>
    </>
  );
};

export default React.memo(Header);
