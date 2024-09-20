// src/hooks/usePromos.ts

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectPromos } from "../features/data/dataSelectors";
import {
  clearSelectedPromo,
  selectPromo,
} from "../features/data/dataSlice";
import { getPromos, createPromoAsync, updatePromoAsync } from "../features/data/dataThunks";
import { Promo } from "../models/dataModels";
import { selectCurrentUser } from "../features/users/userSlice";

const usePromos = () => {
  const dispatch = useAppDispatch();
  const promos = useAppSelector(selectPromos);
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = currentUser?.role;
  const userId = currentUser?._id;
  const selectedPromoId = useAppSelector((state) => state.data.selectedPromoId);


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
    handleRefreshPromos
  };
};

export default usePromos;
