import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Client } from "../models/models";
import {
  calculateSalesDistributionData,
  calculateTopBrandsData,
} from "../utils/dataUtils";
import { useGetClientsQuery } from "../services/api";

const useClientDetails = (clientName: string | null) => {
  const { data: clients = [] } = useGetClientsQuery();
  const userRole = useSelector((state: RootState) => state.auth.userRole); // Example of using useSelector for other state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (clientName && clients.length > 0) {
      const client = clients.find((client) => client.name === clientName);
      setSelectedClient(client || null);
    }
  }, [clientName, clients]);

  const topBrandsData = useMemo(() => {
    if (selectedClient) {
      const movements = selectedClient.movements;
      return calculateTopBrandsData(movements);
    }
    return [];
  }, [selectedClient]);
  

  const salesDistributionData = useMemo(
    () =>
      selectedClient
        ? calculateSalesDistributionData([selectedClient], false)
        : [],
    [selectedClient]
  );

  return {
    selectedClient,
    topBrandsData,
    salesDistributionData,
    userRole, // Return userRole if needed in the component
  };
};

export default useClientDetails;
