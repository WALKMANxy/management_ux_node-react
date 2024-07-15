// src/hooks/useMovementsGrid.ts
import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Movement } from "../models/models";
import { useGetMovementsQuery } from "../services/api";

export const useMovementsGrid = () => {
  const { data: movements = [] } = useGetMovementsQuery();
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isMovementListCollapsed, setMovementListCollapsed] = useState(false);
  const [isMovementDetailsCollapsed, setMovementDetailsCollapsed] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const movementDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  const handleMovementSelect = useCallback(
    (movementId: string) => {
      const movement = movements.find((movement) => movement.id === movementId) || null;
      setSelectedMovement(movement);
      setTimeout(() => {
        if (movementDetailsRef.current) {
          movementDetailsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    },
    [movements]
  );

  const filteredMovements = useCallback(() => {
    let filtered = movements;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate >= start && movementDate <= end;
      });
    }

    return filtered;
  }, [movements, startDate, endDate]);

  return {
    movements,
    selectedMovement,
    setSelectedMovement,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleMovementSelect,
    filteredMovements,
    gridRef,
    movementDetailsRef,
    isMovementListCollapsed,
    setMovementListCollapsed,
    isMovementDetailsCollapsed,
    setMovementDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    exportDataAsCsv,
  };
};
