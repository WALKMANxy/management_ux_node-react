import { Alert } from "../../models/models";
import { apiCall } from "./apiUtils";

export const getAlertsByTargetTypeAndTargetId = async ({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: string;
}): Promise<Alert[]> => {
  return apiCall<Alert[]>(`alerts/target/${targetType}/${targetId}`, "GET");
};

export const updateAlertById = async (
  id: string,
  alertData: Partial<Alert>
): Promise<Alert> => {
  return apiCall<Alert>(`alerts/${id}`, "PATCH", alertData);
};

export const createAlert = async (alertData: {
    alertReason: string;
    message: string;
    severity: "low" | "medium" | "high";
    alertIssuedBy: string;
    targetType: "admin" | "agent" | "client";
    targetId: string;
  }): Promise<Alert> => {
    return apiCall<Alert>("alerts", "POST", alertData);
  };
