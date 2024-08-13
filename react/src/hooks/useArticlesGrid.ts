import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Movement, MovementDetail } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { useGetClientsQuery } from "../services/api";
import { calculateTotalQuantitySold } from "../utils/dataUtils";

export const useArticlesGrid = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const [selectedArticle, setSelectedArticle] = useState<MovementDetail | null>(
    null
  );
  const [isArticleListCollapsed, setArticleListCollapsed] = useState(false);
  const [isArticleDetailsCollapsed, setArticleDetailsCollapsed] =
    useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const articleDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);

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

  const handleArticleSelect = useCallback(
    (articleId: string) => {
      const allMovements: Movement[] = clients.flatMap(
        (client) => client.movements
      );
      const articleMovements = allMovements.filter((movement) =>
        movement.details.some((detail) => detail.articleId === articleId)
      );
      if (articleMovements.length > 0) {
        const selectedDetail =
          articleMovements[0].details.find(
            (detail) => detail.articleId === articleId
          ) || null;
        setSelectedArticle(selectedDetail);
        setTimeout(() => {
          if (articleDetailsRef.current) {
            articleDetailsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      } else {
        setSelectedArticle(null);
      }
    },
    [clients]
  );

  const filteredArticles = useCallback(() => {
    let allDetails: MovementDetail[] = clients.flatMap((client: Client) =>
      client.movements.flatMap((movement) => movement.details)
    );

    // Filter out articles with invalid oemID or brand
    allDetails = allDetails.filter(
      (detail) =>
        detail.articleId &&
        detail.articleId !== "." &&
        detail.brand &&
        detail.brand !== "."
    );

    if (quickFilterText) {
      allDetails = allDetails.filter((detail) =>
        detail.name?.toLowerCase().includes(quickFilterText.toLowerCase())
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      allDetails = allDetails.filter((detail) => {
        const detailMovements = clients.flatMap((client: Client) =>
          client.movements.filter((movement) =>
            movement.details.some(
              (movDetail) => movDetail.articleId === detail.articleId
            )
          )
        );
        return detailMovements.some((movement) => {
          const movementDate = new Date(movement.dateOfOrder);
          return movementDate >= start && movementDate <= end;
        });
      });
    }

    const uniqueArticlesMap = new Map<string, MovementDetail>();
    allDetails.forEach((detail) => {
      if (!uniqueArticlesMap.has(detail.articleId)) {
        uniqueArticlesMap.set(detail.articleId, detail);
      }
    });

    const uniqueArticles = Array.from(uniqueArticlesMap.values());

    return uniqueArticles;
  }, [clients, quickFilterText, startDate, endDate]);

  // Filter clients based on the user role
  const filteredClients = useMemo(() => {
    if (userRole === "admin") {
      return clients;
    } else if (userRole === "agent") {
      return clients.filter((client) => client.agent === userId);
    } else if (userRole === "client") {
      return clients.filter((client) => client.id === userId);
    }
    return [];
  }, [clients, userRole, userId]);

  // Get movements for the selected article based on the user role
  const clientMovements = useMemo(() => {
    if (!selectedArticle) return [];
    const movements = filteredClients.flatMap((client: Client) =>
      client.movements
        .filter((movement) =>
          movement.details.some(
            (detail) => detail.articleId === selectedArticle.articleId
          )
        )
        .map((movement) => ({
          ...movement,
          clientName: client.name,
        }))
    );
    console.log("clientMovements: ", movements);
    return movements;
  }, [filteredClients, selectedArticle]);

  // Calculate total quantity sold for each article
  const totalQuantitySold = useMemo(() => {
    const allMovements = clients.flatMap((client) => client.movements);
    return calculateTotalQuantitySold(allMovements);
  }, [clients]);

  return {
    clients,
    selectedArticle,
    setSelectedArticle,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleArticleSelect,
    filteredArticles,
    totalQuantitySold,
    gridRef,
    articleDetailsRef,
    isArticleListCollapsed,
    setArticleListCollapsed,
    isArticleDetailsCollapsed,
    setArticleDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    exportDataAsCsv,
    filteredClients,
    clientMovements,
  };
};
