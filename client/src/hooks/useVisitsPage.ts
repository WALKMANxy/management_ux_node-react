// src/hooks/useVisitsPage.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  clearSelectedVisit,
  clearSelection,
  selectClient,
} from "../features/data/dataSlice";

export const useVisitsPage = () => {
  const dispatch = useAppDispatch();

  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;
  const currentUserId = currentUser?.id;
  const selectedClientId = useAppSelector(
    (state: RootState) => state.data.selectedClientId
  );

  const selectedVisitId = useAppSelector(
    (state: RootState) => state.data.selectedVisitId
  );
  const [isClientDetailsCollapsed, setIsClientDetailsCollapsed] =
    useState(false);
  const [isVisitsTableCollapsed, setIsVisitsTableCollapsed] = useState(false); // Open by default
  const createVisitFormRef = useRef<HTMLDivElement>(null);
  const editVisitFormRef = useRef<HTMLDivElement>(null);

  // Automatically select the client and hide sidebar for client users
  useEffect(() => {
    if (userRole === "client" && currentUserId) {
      dispatch(selectClient(currentUserId));
    }
  }, [userRole, currentUserId, dispatch]);

  // Handle creating a visit
  useEffect(() => {
    if (isCreatingVisit) {
      setIsVisitsTableCollapsed(true);
      // Scroll to create visit form
      createVisitFormRef.current?.scrollIntoView({ behavior: "smooth" });

      // If a visit was selected, clear it
      if (selectedVisitId) {
        dispatch(clearSelectedVisit());
        setIsEditing(false);
      }
    }
  }, [isCreatingVisit, dispatch, selectedVisitId]);

  // Handle selecting a visit
  useEffect(() => {
    if (selectedVisitId) {
      if (isCreatingVisit) {
        setIsCreatingVisit(false);
      }
      setIsEditing(true);
      // Scroll to edit visit form
      editVisitFormRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsEditing(false);
    }
  }, [selectedVisitId, isCreatingVisit]);

  const handleOpenCreateVisit = useCallback(() => {
    setIsCreatingVisit(true);
  }, []);

  const handleCloseCreateVisit = useCallback(() => {
    setIsCreatingVisit(false);
  }, []);

  const handleDeselectClient = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const handleDeselectVisit = useCallback(() => {
    dispatch(clearSelectedVisit());
    setIsEditing(false);
  }, [dispatch]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleStopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    userRole,
    selectedClientId,
    isClientDetailsCollapsed,
    setIsClientDetailsCollapsed,
    isVisitsTableCollapsed,
    setIsVisitsTableCollapsed,
    isCreatingVisit,
    handleOpenCreateVisit,
    handleCloseCreateVisit,
    createVisitFormRef,
    editVisitFormRef,
    selectedVisitId,
    handleDeselectClient,
    handleDeselectVisit,
    isEditing,
    handleStartEditing,
    handleStopEditing,
  };
};
