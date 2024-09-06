import { Visit } from "../../../models/dataModels";
import { apiCall } from "../../../utils/apiUtils";


export const createVisit = async (visitData: {
  clientId: string;
  type: string;
  visitReason: string;
  date: string;
  notePublic?: string;
  notePrivate?: string;
  visitIssuedBy: string;
}): Promise<Visit> => {
  return apiCall<Visit>("visits", "POST", visitData);
};

export const updateVisitById = async (
  id: string,
  visitData: Partial<Visit>
): Promise<Visit> => {
  return apiCall<Visit>(`visits/${id}`, "PATCH", visitData);
};
