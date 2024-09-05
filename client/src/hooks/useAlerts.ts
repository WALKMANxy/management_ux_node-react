// src/hooks/useAlerts.ts
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "../models/dataModels";
import { createAlert, selectAlerts } from "../store/slices/alertSlice"; // Assuming you have alertSlice
import { fetchUsersByIds, selectUserById } from "../store/slices/userSlice";

export const useAlerts = () => {
  const dispatch = useDispatch();
  const alerts: Alert[] = useSelector(selectAlerts);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);

  // Fetch users when userIds are updated
  useEffect(() => {
    if (userIds.length > 0) {
      dispatch(fetchUsersByIds(userIds));
    }
  }, [userIds, dispatch]);

  // Function to map alerts to their issuers
  const mapAlertsToUsers = () => {
    const mappedAlerts = alerts.map((alert) => {
      const user = selectUserById(alert.alertIssuedBy);
      return { ...alert, issuerName: user?.name || "Unknown User" };
    });
    setAlertData(mappedAlerts);
  };

  // Function to create an alert
  const sendAlert = async (alertDetails: Partial<Alert>) => {
    await dispatch(createAlert(alertDetails));
    mapAlertsToUsers();
  };

  return { alertData, sendAlert };
};
