// src/hooks/usePromos.ts

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearSelectedPromo, selectPromo } from "../features/data/dataSlice";
import {
  createPromoAsync,
  getPromos,
  updatePromoAsync,
} from "../features/data/dataThunks";
import { selectPromos } from "../features/promoVisits/promoVisitsSelectors";
import { selectCurrentUser } from "../features/users/userSlice";
import { Promo } from "../models/dataModels";
import { showToast } from "../utils/toastMessage";

type PromoMode = "view" | "create" | "edit";

const usePromos = () => {
  const dispatch = useAppDispatch();
  const promos = useAppSelector(selectPromos);
  const allClients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = currentUser?.role;
  const userId = currentUser?._id;
  const selectedPromoId = useAppSelector((state) => state.data.selectedPromoId);

  const selectedPromo = useMemo(
    () => promos.find((promo: Promo) => promo._id === selectedPromoId),
    [promos, selectedPromoId]
  );

  const clients = useMemo(() => {
    return allClients;
    // Optionally, you can add conditions to filter or transform clients
  }, [allClients]); // Depend on `allClients` so it only recalculates when `allClients` changes

  // Get the eligible or excluded clients based on the promo type
  const filteredClients = useMemo(() => {
    if (!selectedPromo) return [];

    let clientIds: string[] = [];

    if (selectedPromo.global) {
      clientIds = selectedPromo.excludedClientsId || [];
      // If there are no excluded clients, return all clients
      if (clientIds.length === 0) {
        return Object.values(allClients);
      }
    } else {
      clientIds = selectedPromo.clientsId || [];
    }

    // Filter clients based on the IDs in the selected promo
    return Object.values(allClients).filter((client) =>
      clientIds.includes(client.id)
    );
  }, [selectedPromo, allClients]);

  const [mode, setMode] = useState<PromoMode>("view");

  // Handle promo selection and set mode to 'view'
  const handlePromoSelect = (promo: Promo) => {
    dispatch(selectPromo(promo._id!));
    setMode("view");
  };

  // Handle promo deselection
  const handlePromoDeselect = () => {
    dispatch(clearSelectedPromo());
    setMode("view");
  };

  // Handle promo creation
  const handleCreatePromo = async (promoData: Promo) => {
    try {
      await dispatch(createPromoAsync(promoData)).unwrap();
      showToast.success("Promo created successfully");

      dispatch(getPromos()); // Refresh the list of promos
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to create promo: " + error.message);
        console.error("Failed to create promo:", error);
      } else {
        showToast.error("Failed to create promo: An unknown error occurred");
        console.error(
          "Failed to create promo: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
    }
  };

  // Handle promo update
  const handleUpdatePromo = async (promoData: Promo) => {
    try {
      if (!promoData._id) {
        throw new Error("Promo ID is missing for update.");
      }
      await dispatch(
        updatePromoAsync({ _id: promoData._id, promoData })
      ).unwrap();
      showToast.success("Promo updated successfully");
      dispatch(getPromos()); // Refresh the list of promos
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to update promo: " + error.message);
        console.error("Failed to update promo:", error);
      } else {
        showToast.error("Failed to update promo: An unknown error occurred");
        console.error(
          "Failed to update promo: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
    }
  };

  // Handle promo sunset
  const handleSunsetPromo = async () => {
    // Check if selectedPromo is defined
    if (!selectedPromo) {
      console.error("No promo selected for sunset.");
      return; // Exit the function if no promo is selected
    }

    const promoData: Promo = selectedPromo;

    try {
      if (!promoData._id) {
        throw new Error("Promo ID is missing for sunset.");
      }

      // Set the end date to the current time
      const updatedPromoData: Promo = {
        ...promoData,
        endDate: new Date(),
        startDate: new Date(promoData.startDate),
        createdAt: new Date(promoData.createdAt), // Set endDate to current time
      };

      // Dispatch the update promo action with the modified endDate
      await dispatch(
        updatePromoAsync({ _id: promoData._id, promoData: updatedPromoData })
      ).unwrap();
      showToast.info("Promo sunset successfully");

      // Refresh the list of promos
      dispatch(getPromos());
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to sunset promo: " + error.message);
        console.error("Failed to sunset promo:", error);
      } else {
        showToast.error("Failed to sunset promo: An unknown error occurred");
        console.error(
          "Failed to sunset promo: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
    }
  };

  // Initiate creation mode
  const initiateCreatePromo = () => {
    dispatch(clearSelectedPromo());
    setMode("create");
  };

  // Initiate edit mode
  const initiateEditPromo = () => {
    if (selectedPromo) {
      setMode("edit");
    }
  };

  // Fetch promos on component mount
  useEffect(() => {
    dispatch(getPromos());
  }, [dispatch]);

  const handleRefreshPromos = () => {
    dispatch(getPromos());
    showToast.success("Promos refreshed successfully");
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
    selectedPromo,
    mode,
    initiateCreatePromo,
    initiateEditPromo,
    handleSunsetPromo,
    filteredClients,
  };
};

export default usePromos;
