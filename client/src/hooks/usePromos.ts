// src/hooks/usePromos.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(); // Initialize translation
  const [searchTerm, setSearchTerm] = useState("");

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

  const [mode, setMode] = useState<PromoMode | null>(null);

  // Handle promo selection and set mode to 'view'
  const handlePromoSelect = useCallback(
    (promo: Promo) => {
      dispatch(selectPromo(promo._id!));
      setMode("view");
    },
    [dispatch]
  );

  // Handle promo deselection
  const handlePromoDeselect = useCallback(() => {
    dispatch(clearSelectedPromo());
    setMode("view");
  }, [dispatch]);

  // Handle promo creation
  const handleCreatePromo = useCallback(
    async (promoData: Promo) => {
      try {
        await dispatch(createPromoAsync(promoData)).unwrap();
        showToast.success(t("usePromos.createSuccess"));

        dispatch(getPromos()); // Refresh the list of promos
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast.error(
            t("usePromos.createFailed", { message: error.message })
          );
          console.error("Failed to create promo:", error);
        } else {
          showToast.error(t("usePromos.createUnknownError"));
          console.error(
            "Failed to create promo: An unknown error occurred",
            error
          );
        }
        throw error; // Re-throw to handle in the component
      }
    },
    [dispatch, t]
  );

  // Handle promo update
  const handleUpdatePromo = useCallback(
    async (promoData: Promo) => {
      try {
        if (!promoData._id) {
          throw new Error(t("usePromos.updateMissingId"));
        }
        await dispatch(
          updatePromoAsync({ _id: promoData._id, promoData })
        ).unwrap();
        showToast.success(t("usePromos.updateSuccess"));
        dispatch(getPromos()); // Refresh the list of promos
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast.error(
            t("usePromos.updateFailed", { message: error.message })
          );
          console.error("Failed to update promo:", error);
        } else {
          showToast.error(t("usePromos.updateUnknownError"));
          console.error(
            "Failed to update promo: An unknown error occurred",
            error
          );
        }
        throw error; // Re-throw to handle in the component
      }
    },
    [dispatch, t]
  );

  // Handle promo sunset
  // Handle promo sunset
  const handleSunsetPromo = useCallback(async () => {
    // Check if selectedPromo is defined
    if (!selectedPromo) {
      showToast.error(t("usePromos.sunsetNoPromoSelected"));
      console.error("No promo selected for sunset.");
      return; // Exit the function if no promo is selected
    }

    const promoData: Promo = selectedPromo;

    try {
      if (!promoData._id) {
        throw new Error(t("usePromos.sunsetMissingId"));
      }

      // Set the end date to the current time
      const updatedPromoData: Promo = {
        ...promoData,
        endDate: new Date(),
        startDate: new Date(promoData.startDate), // Ensure startDate is a Date object
        createdAt: new Date(promoData.createdAt), // Ensure createdAt is a Date object
      };

      // Dispatch the update promo action with the modified endDate
      await dispatch(
        updatePromoAsync({ _id: promoData._id, promoData: updatedPromoData })
      ).unwrap();
      showToast.info(t("usePromos.sunsetSuccess"));

      // Refresh the list of promos
      dispatch(getPromos());
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          t("usePromos.sunsetFailed", { message: error.message })
        );
        console.error("Failed to sunset promo:", error);
      } else {
        showToast.error(t("usePromos.sunsetUnknownError"));
        console.error(
          "Failed to sunset promo: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
    }
  }, [dispatch, selectedPromo, t]);

  // Initiate creation mode
  const initiateCreatePromo = useCallback(() => {
    dispatch(clearSelectedPromo());
    setMode("create");
  }, [dispatch]);

  // Initiate edit mode
  const initiateEditPromo = useCallback(() => {
    if (selectedPromo) {
      setMode("edit");
    } else {
      showToast.error(t("usePromos.editNoPromoSelected"));
    }
  }, [selectedPromo, t]);

  // Fetch promos on component mount
  useEffect(() => {
    dispatch(getPromos());
  }, [dispatch]);

  // Handle promo refresh
  const handleRefreshPromos = useCallback(() => {
    dispatch(getPromos());
    showToast.success(t("usePromos.refreshSuccess"));
  }, [dispatch, t]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );
  // Determine if a promo is active based on its end date
  const isPromoActive = useCallback((promo: Promo) => {
    return new Date(promo.endDate) > new Date();
  }, []);

  const filteredPromos = useMemo(() => {
    return promos.filter((promo) =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promos, searchTerm]);

  return {
    isPromoActive,
    searchTerm,
    handleSearchChange,
    filteredPromos,
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
