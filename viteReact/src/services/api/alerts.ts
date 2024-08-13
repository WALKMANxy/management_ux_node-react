import { Alert } from "../../models/dataModels";
import { apiCall } from "./apiUtils";

export const getAlertsByEntityRoleAndEntityCode = async ({
  entityRole,
  entityCode,
}: {
  entityRole: string;
  entityCode: string;
}): Promise<Alert[]> => {
  try {
    return await apiCall<Alert[]>(`alerts/${entityRole}/${entityCode}`, "GET");
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.log(`No alerts found for ${entityRole} with code ${entityCode}`);
      return []; // Return an empty array if no alerts are found
    }
    throw error; // Re-throw other errors
  }
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
    entityRole: "admin" | "agent" | "client";
    entityCode: string;
  }): Promise<Alert> => {
    return apiCall<Alert>("alerts", "POST", alertData);
  };
