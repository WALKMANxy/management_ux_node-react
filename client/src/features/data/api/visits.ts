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
  pending: true;
  completed: false;
}): Promise<Visit> => {
  // No change required here; ensure apiCall is correctly set up.
  return apiCall<Visit>("visits", "POST", visitData);
};

export const updateVisitById = async (
  _id: string,
  visitData: Partial<Visit>
): Promise<Visit> => {
  return apiCall<Visit>(`visits/${_id}`, "PATCH", visitData);
};
