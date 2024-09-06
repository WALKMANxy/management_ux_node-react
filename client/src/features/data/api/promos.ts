import { Promo } from "../../../models/dataModels";
import { apiCall } from "../../../utils/apiUtils";

export const createPromo = async (promoData: {
  clientsId: string[];
  type: string;
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
  promoIssuedBy: string;
}): Promise<Promo> => {
  return apiCall<Promo>("promos", "POST", promoData);
};

export const updatePromoById = async (
  id: string,
  promoData: Partial<Promo>
): Promise<Promo> => {
  return apiCall<Promo>(`promos/${id}`, "PATCH", promoData);
};
