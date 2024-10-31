//src/components/Header/Header.tsx
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
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { handleLogout } from "../../features/auth/authThunks";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import { clearSelection } from "../../features/data/dataSlice";
import { UserRole } from "../../models/entityModels";
import GlobalSearch from "./GlobalSearch";
const NotificationBell = React.lazy(() => import("./NotificationBell"));
const UserAvatar = React.lazy(() => import("./UserAvatar"));

const preloadStatistics = () =>
  import("../../pages/statistics/StatisticsDashboard");
const preloadMovements = () => import("../../pages/common/MovementsPage");
const preloadClients = () => import("../../pages/common/ClientsPage");
const preloadArticles = () => import("../../pages/common/ArticlesPage");
const preloadVisits = () => import("../../pages/common/VisitsPage");
const preloadPromos = () => import("../../pages/common/PromosPage");
const preloadCalendar = () => import("../../pages/common/CalendarPage");


const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [iconChange, setIconChange] = useState(false);
  const [showAppBar, setShowAppBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const location = useLocation();
  const prevLocationRef = useRef<string>(location.pathname);

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // If scrolling down and past 100px
        setShowAppBar(false);
      } else if (currentScrollY < lastScrollY) {
        // If scrolling up
        setShowAppBar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (
      prevLocationRef.current === "/visits" &&
      location.pathname !== "/visits"
    ) {
      dispatch(clearSelection());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (
      prevLocationRef.current === "/messages" &&
      location.pathname !== "/messages"
    ) {
      dispatch(clearCurrentChatReducer());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (
      prevLocationRef.current === "/promos" &&
      location.pathname !== "/promos"
    ) {
      dispatch(clearSelection());
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, dispatch]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setTimeout(() => {
      setIconChange(!drawerOpen);
    }, 50);
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const renderLinks = () => {
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
          <ListItemIcon  sx={{ color: "white" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t("headerDashboard", "Dashboard")} />
        </ListItem>

        {allowedStatisticsRoles.includes(userRole) && (
          <ListItem
            button
            component={Link}
            to={statisticsLink}
            onClick={toggleDrawer}
            onMouseEnter={preloadStatistics}
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
              onMouseEnter={preloadMovements}
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
              onMouseEnter={preloadClients}
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
              onMouseEnter={preloadArticles}
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
              onMouseEnter={preloadVisits}
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
              onMouseEnter={preloadPromos}
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
            onMouseEnter={preloadCalendar}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary={t("calendar", "Calendar")} />
          </ListItem>
        )}
      </>
    );
  };

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
          transition: "top 0.3s ease-in-out",
          top: showAppBar ? "0" : "-64px", 
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
          <List sx={{ flexGrow: 1 }}>{renderLinks()}</List>
          <Box sx={{ mt: "auto" }}>{renderLogoutLink()}</Box>
        </Box>
      </Drawer>
    </>
  );
};

export default React.memo(Header);
