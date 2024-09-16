import { useState } from "react";
import { createVisit } from "../features/data/api/visits";
import { Visit } from "../models/dataModels";

export const useCreateVisit = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCreateVisit = async (visitData: Visit) => {
    try {
      await createVisit(visitData);
      // Dispatch any action if needed to update the store
      setIsFormVisible(false); // Hide the form after successful creation
    } catch (error) {
      console.error("Error creating visit:", error);
      alert("Failed to create visit. Please try again.");
    }
  };

  return { handleCreateVisit, isFormVisible, setIsFormVisible };
};
