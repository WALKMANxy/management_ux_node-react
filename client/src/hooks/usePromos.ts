// src/hooks/usePromos.ts
import { useCallback, useMemo, useState } from "react";
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
import { showToast } from "../services/toastMessage";

type PromoMode = "view" | "create" | "edit";

const usePromos = () => {
  const dispatch = useAppDispatch();
  const promos = useAppSelector(selectPromos);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = currentUser?.role;
  const userId = currentUser?._id;
  const selectedPromoId = useAppSelector((state) => state.data.selectedPromoId);

  const selectedPromo = useMemo(
    () => promos.find((promo: Promo) => promo._id === selectedPromoId),
    [promos, selectedPromoId]
  );

  // Filtered Clients based on selectedPromo
  const filteredClients = useMemo(() => {
    if (!selectedPromo) return [];

    const clientIds: string[] = selectedPromo.global
      ? selectedPromo.excludedClientsId || []
      : selectedPromo.clientsId || [];

    if (selectedPromo.global && clientIds.length === 0) {
      return Object.values(clients);
    }

    return Object.values(clients).filter((client) =>
      clientIds.includes(client.id)
    );
  }, [selectedPromo, clients]);

  const [mode, setMode] = useState<PromoMode | null>(null);

  // Handle promo selection and set mode to 'view'
  const handlePromoSelect = useCallback(
    (promoId: string) => {
      // console.log("selecting promo");
      dispatch(selectPromo(promoId!));
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

        dispatch(getPromos());
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
        throw error;
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
        dispatch(getPromos());
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
        throw error;
      }
    },
    [dispatch, t]
  );

  // Handle promo sunset
  const handleSunsetPromo = useCallback(async () => {
    if (!selectedPromo) {
      showToast.error(t("usePromos.sunsetNoPromoSelected"));
      console.error("No promo selected for sunset.");
      return;
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
        startDate: new Date(promoData.startDate),
        createdAt: new Date(promoData.createdAt),
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
      throw error;
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

  // Handle promo refresh
  const handleRefreshPromos = useCallback(() => {
    dispatch(getPromos());
    showToast.success(t("usePromos.refreshSuccess"));
  }, [dispatch, t]);

  // Handle search input change
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

  // Filter promos based on search term
  const filteredPromos = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return promos.filter(
      (promo) =>
        promo.name.toLowerCase().includes(lowerSearch) ||
        promo.promoType.toLowerCase().includes(lowerSearch)
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
    setMode,
  };
};

export default usePromos;
