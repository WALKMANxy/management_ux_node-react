// src/hooks/useVisitsPage.ts
import { useEffect, useRef, useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false); // Centralize isEditing

  // Get currentUser from Redux state
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

  // Get selectedClientId from Redux state
  const selectedClientId = useAppSelector(
    (state: RootState) => state.data.selectedClientId
  );

  const selectedVisitId = useAppSelector(
    (state: RootState) => state.data.selectedVisitId
  );

  // State variables for collapsible containers
  const [isClientDetailsCollapsed, setIsClientDetailsCollapsed] =
    useState(false);
  const [isVisitsTableCollapsed, setIsVisitsTableCollapsed] = useState(false); // Open by default

  // Refs for scrolling
  const createVisitFormRef = useRef<HTMLDivElement>(null);
  const editVisitFormRef = useRef<HTMLDivElement>(null);

  // Automatically select the client and hide sidebar for client users
  useEffect(() => {
    if (userRole === "client" && currentUser?.id) {
      dispatch(selectClient(currentUser.id));
    }
  }, [userRole, currentUser, dispatch]);

  // Handle creating a visit
  useEffect(() => {
    if (isCreatingVisit) {
      setIsVisitsTableCollapsed(true);
      // Scroll to create visit form
      createVisitFormRef.current?.scrollIntoView({ behavior: "smooth" });

      // If a visit was selected, clear it
      if (selectedVisitId) {
        dispatch(clearSelectedVisit());
        setIsEditing(false); // Ensure we're not in editing mode
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

  const handleOpenCreateVisit = () => {
    setIsCreatingVisit(true);
  };

  const handleCloseCreateVisit = () => {
    setIsCreatingVisit(false);
  };

  const handleDeselectClient = () => {
    dispatch(clearSelection());
  };

  const handleDeselectVisit = () => {
    dispatch(clearSelectedVisit());
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleStopEditing = () => {
    setIsEditing(false);
  };

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
