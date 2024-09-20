// src/hooks/usePromos.ts

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectPromos } from "../features/data/dataSelectors";
import { clearSelectedPromo, selectPromo } from "../features/data/dataSlice";
import {
  createPromoAsync,
  getPromos,
  updatePromoAsync,
} from "../features/data/dataThunks";
import { selectCurrentUser } from "../features/users/userSlice";
import { Promo } from "../models/dataModels";
import { Client } from "../models/entityModels";

const usePromos = () => {
  const dispatch = useAppDispatch();
  const promos = useAppSelector(selectPromos);
  const allClients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = currentUser?.role;
  const userId = currentUser?._id;
  const selectedPromoId = useAppSelector((state) => state.data.selectedPromoId);

  // Memoized filtered client data
  const clients = useMemo(() => {
    const filteredClients: Record<string, Partial<Client>> = {};
    for (const [id, client] of Object.entries(allClients)) {
      filteredClients[id] = {
        id: client.id,
        name: client.name,
        address: client.address,
        province: client.province,
        paymentMethod: client.paymentMethod,
      };
    }
    return filteredClients;
  }, [allClients]);

  // Handle promo selection
  const handlePromoSelect = (promo: Promo) => {
    dispatch(selectPromo(promo._id!));
  };

  // Handle promo deselection
  const handlePromoDeselect = () => {
    dispatch(clearSelectedPromo());
  };

  // Handle promo creation
  const handleCreatePromo = async (promoData: Promo) => {
    try {
      await dispatch(createPromoAsync(promoData)).unwrap();
      dispatch(getPromos()); // Optionally refresh the list of promos
    } catch (error) {
      console.error("Failed to create promo:", error);
    }
  };

  // Handle promo update
  const handleUpdatePromo = async (_id: string, promoData: Promo) => {
    try {
      await dispatch(updatePromoAsync({ _id, promoData })).unwrap();
      dispatch(getPromos()); // Optionally refresh the list of promos
    } catch (error) {
      console.error("Failed to update promo:", error);
    }
  };

  // Fetch promos on component mount
  useEffect(() => {
    dispatch(getPromos());
  }, [dispatch]);

  const handleRefreshPromos = () => {
    dispatch(getPromos());
  };

  return {
    clients,
    agents,
    userId,
    userRole,
    promos,
    handlePromoSelect,
    handlePromoDeselect,
    handleCreatePromo,
    handleUpdatePromo,
    selectedPromoId,
    handleRefreshPromos,
  };
};

export default usePromos;
