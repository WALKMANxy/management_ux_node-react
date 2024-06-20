import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { useSidebar } from "../hooks/useSidebar";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import "./Layout.css";
import useClearSearchOnNavigate from "../hooks/useClearSearchOnNavigate";

const Layout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  useClearSearchOnNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <div>Unauthorized access, please login to access this page</div>;
  }

  return (
    <div
      className={`layout-container ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Sidebar onToggle={toggleSidebar} />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
