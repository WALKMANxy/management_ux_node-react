import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import GlobalSearch from "../common/GlobalSearch";
import useNotifications from "../../features/hooks/useNotifications";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const { showNotifications, handleBellClick, notificationRef } =
    useNotifications();

  const handleSearchSelect = (result: string) => {
    console.log(`Selected result: ${result}`);
  };

  return (
    <header
      className={`${styles.header} d-flex justify-content-between align-items-center p-3`}
      style={{ zIndex: 1100 }}
    >
      <div className={styles["search-container"]}>
        <GlobalSearch
          filter="all"
          placeholder="Global search..."
          onSelect={handleSearchSelect}
        />
      </div>
      <div
        className={`${styles["user-info-container"]} d-flex align-items-center`}
      >
        <FontAwesomeIcon
          icon={faBell}
          className={styles["bell-icon"]}
          onClick={handleBellClick}
        />
        {showNotifications && (
          <div ref={notificationRef} className={styles["notification-panel"]}>
            <p>No new notifications</p>
          </div>
        )}
        <img
          src="/path-to-agent-profile-pic.jpg"
          alt="Agent"
          className={`${styles["profile-pic"]} rounded-circle`}
        />
        <span className="user-name ml-2">John Doe</span>
      </div>
    </header>
  );
};

export default React.memo(Header);
