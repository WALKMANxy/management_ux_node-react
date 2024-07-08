// src/hooks/useClientDetails.ts
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Client } from "../models/models";
import {
  calculateSalesDistributionData,
  calculateTopBrandsData,
} from "../utils/dataUtils";

const useClientDetails = (clientName: string | null) => {
  const clients = useSelector((state: RootState) => state.clients.clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (clientName && clients.length > 0) {
      const client = clients.find((client) => client.name === clientName);
      setSelectedClient(client || null);
    }
  }, [clientName, clients]);

  const topBrandsData = useMemo(
    () => (selectedClient ? calculateTopBrandsData([selectedClient]) : []),
    [selectedClient]
  );

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
  };
};

export default useClientDetails;