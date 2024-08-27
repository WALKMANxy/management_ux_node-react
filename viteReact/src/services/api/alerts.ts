import { Alert } from "../../models/dataModels";
import { apiCall } from "./apiUtils";

// Type for entity role
type EntityRole = "admin" | "agent" | "client";

// Custom error types
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}


// Helper function to handle API errors
function handleApiError(error: unknown, context: string): never {
  if (error instanceof ApiError) {
    throw error;
  } else if (error instanceof Error) {
    console.error(`${context}:`, error.message);
    throw new ApiError(500, `An error occurred while ${context.toLowerCase()}`);
  } else {
    console.error(`${context}:`, error);
    throw new ApiError(500, `An unknown error occurred while ${context.toLowerCase()}`);
  }
}

// Fetch alerts by entity role and entity code
export const getAlertsByEntityRoleAndEntityCode = async ({
  entityRole,
  entityCode,
}: {
  entityRole: EntityRole;
  entityCode: string;
}): Promise<Alert[]> => {
  try {
    console.debug(`Fetching alerts for ${entityRole} with code ${entityCode}`);
    const alerts = await apiCall<Alert[]>(
      `alerts/${entityRole}/${entityCode}`,
      "GET"
    );
    console.debug(`Fetched ${alerts.length} alerts for ${entityRole} with code ${entityCode}`);
    return alerts;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      console.warn(`No alerts found for ${entityRole} with code ${entityCode}`);
      return []; // Return an empty array if no alerts are found
    }
    return handleApiError(error, `Error fetching alerts for ${entityRole} with code ${entityCode}`);
  }
};

// Fetch alerts by the user who issued them
export const getAlertsByIssuer = async (userId: string): Promise<Alert[]> => {
  try {
    console.debug(`Fetching alerts issued by user with ID: ${userId}`);
    const alerts = await apiCall<Alert[]>(`alerts/issuedby/${userId}`, "GET");
    console.debug(`Fetched ${alerts.length} alerts issued by user with ID: ${userId}`);
    return alerts;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      console.warn(`No alerts found issued by user with ID: ${userId}`);
      return []; // Return an empty array if no alerts are found
    }
    return handleApiError(error, `Error fetching alerts issued by user with ID: ${userId}`);
  }
};


// Update an alert by its ID
export const updateAlertById = async (
  _id: string,
  alertData: Partial<Alert>
): Promise<Alert> => {
  try {
    console.debug(`Updating alert with ID: ${_id}`);
    const updatedAlert = await apiCall<Alert>(`alerts/${_id}`, "PATCH", alertData);
    console.debug(`Alert with ID: ${_id} updated successfully`);
    return updatedAlert;
  } catch (error: unknown) {
    return handleApiError(error, `Error updating alert with ID: ${_id}`);
  }
};

// Create a new alert
export const createAlert = async (alertData: {
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  alertIssuedBy: string;
  entityRole: EntityRole;
  entityCode: string;
}): Promise<Alert> => {
  try {
    console.debug(`Creating new alert for ${alertData.entityRole} with code ${alertData.entityCode}`);
    const newAlert = await apiCall<Alert>("alerts", "POST", alertData);
    console.debug(`New alert created successfully with ID: ${newAlert._id}`);
    return newAlert;
  } catch (error: unknown) {
    return handleApiError(error, "Error creating new alert");
  }
};