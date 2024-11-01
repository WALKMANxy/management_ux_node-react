// src/features/promoVisits/api/promoVisitApi.ts

import { Promo, Visit } from "../../../models/dataModels";
import { apiCall } from "../../../utils/apiUtils";

// Visits API
export const getVisitsApi = async (params: {
  role: string;
  clientId?: string;
}): Promise<Visit[]> => {
  const queryParams = new URLSearchParams({ role: params.role });

  if (params.role === "client" && params.clientId) {
    queryParams.append("clientId", params.clientId);
  }

  return apiCall<Visit[]>(`/visits?${queryParams.toString()}`, "GET");
};

export const createVisitApi = async (visitData: Visit): Promise<Visit> => {
  return apiCall<Visit>("/visits", "POST", {
    ...visitData,
    date: new Date(visitData.date).toISOString(),
    createdAt: new Date(visitData.createdAt).toISOString(),
  });
};

export const updateVisitApi = async (
  _id: string,
  visitData: Partial<Visit>
): Promise<Visit> => {
  const data = {
    ...visitData,
    ...(visitData.date && { date: new Date(visitData.date).toISOString() }),
    ...(visitData.createdAt && {
      createdAt: new Date(visitData.createdAt).toISOString(),
    }),
  };
  return apiCall<Visit>(`/visits/${_id}`, "PATCH", data);
};

// Promos API
export const getPromosApi = async (): Promise<Promo[]> => {
  return apiCall<Promo[]>("/promos", "GET");
};

export const createPromoApi = async (promoData: {
  clientsId: string[];
  promoType: string;
  name: string;
  discount: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  promoIssuedBy: string;
}): Promise<Promo> => {
  return apiCall<Promo>("/promos", "POST", {
    ...promoData,
    startDate: new Date(promoData.startDate).toISOString(),
    endDate: new Date(promoData.endDate).toISOString(),
    createdAt: new Date(promoData.createdAt).toISOString(),
  });
};

export const updatePromoApi = async (
  _id: string,
  promoData: Partial<Promo>
): Promise<Promo> => {
  const data = {
    ...promoData,
    ...(promoData.startDate && {
      startDate: new Date(promoData.startDate).toISOString(),
    }),
    ...(promoData.endDate && {
      endDate: new Date(promoData.endDate).toISOString(),
    }),
    ...(promoData.createdAt && {
      createdAt: new Date(promoData.createdAt).toISOString(),
    }),
  };
  return apiCall<Promo>(`/promos/${_id}`, "PATCH", data);
};
