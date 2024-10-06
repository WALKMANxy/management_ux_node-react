import { apiCall } from "../../../utils/apiUtils";

interface FindCityResponse {
  city: string;
}

interface StoreCityRequest {
  name: string;
  lat: number;
  lon: number;
}

interface StoreCityResponse {
  message: string;
}

export const storeCity = async (
  cityData: StoreCityRequest
): Promise<StoreCityResponse> => {
  const endpoint = `/cities/store`;
  return apiCall<StoreCityResponse>(endpoint, "POST", cityData);
};

export const findCityByCoordinates = async (
  lat: number,
  lon: number
): Promise<FindCityResponse> => {
  const endpoint = `/cities/find?lat=${lat}&lon=${lon}`;
  return apiCall<FindCityResponse>(endpoint, "GET");
};
