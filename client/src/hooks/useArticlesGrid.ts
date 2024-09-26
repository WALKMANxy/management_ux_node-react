import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Movement, MovementDetail } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { calculateTotalQuantitySold } from "../utils/dataUtils";

export const useArticlesGrid = () => {
  const clients = useSelector((state: RootState) => state.data.clients);
  const [selectedArticle, setSelectedArticle] = useState<MovementDetail | null>(
    null
  );
  const [isArticleListCollapsed, setArticleListCollapsed] = useState(false);
  const [isArticleDetailsCollapsed, setArticleDetailsCollapsed] =
    useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<AgGridReact>(null);
  const articleDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userRole = useSelector((state: RootState) => state.auth.role);
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

  // Precompute article details and movements maps
  const { articleDetailsMap, articleMovementsMap } = useMemo(() => {
    const detailsMap = new Map<string, MovementDetail>();
    const movementsMap = new Map<
      string,
      { movement: Movement; client: Client }[]
    >();

    Object.values(clients).forEach((client) => {
      client.movements.forEach((movement) => {
        movement.details.forEach((detail) => {
          const articleId = detail.articleId;
          if (
            articleId &&
            articleId !== "." &&
            detail.brand &&
            detail.brand !== "."
          ) {
            if (!detailsMap.has(articleId)) {
              detailsMap.set(articleId, detail);
            }
            if (!movementsMap.has(articleId)) {
              movementsMap.set(articleId, []);
            }
            movementsMap.get(articleId)!.push({ movement, client });
          }
        });
      });
    });

    return { articleDetailsMap: detailsMap, articleMovementsMap: movementsMap };
  }, [clients]);

  const handleArticleSelect = useCallback(
    (articleId: string) => {
      const selectedDetail = articleDetailsMap.get(articleId) || null;
      setSelectedArticle(selectedDetail);
      setTimeout(() => {
        articleDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    },
    [articleDetailsMap]
  );

  const filteredArticles = useMemo(() => {
    let articles = Array.from(articleDetailsMap.values());

    if (quickFilterText) {
      const lowerQuickFilterText = quickFilterText.toLowerCase();
      articles = articles.filter((detail) =>
        detail.name?.toLowerCase().includes(lowerQuickFilterText)
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      articles = articles.filter((detail) => {
        const movementEntries = articleMovementsMap.get(detail.articleId) || [];
        return movementEntries.some(({ movement }) => {
          const movementDate = new Date(movement.dateOfOrder);
          return movementDate >= start && movementDate <= end;
        });
      });
    }

    return articles;
  }, [
    articleDetailsMap,
    articleMovementsMap,
    quickFilterText,
    startDate,
    endDate,
  ]);

  // Filter clients based on the user role
  const filteredClients = useMemo(() => {
    if (userRole === "admin") {
      return clients;
    } else if (userRole === "agent") {
      return Object.values(clients).filter((client) => client.agent === userId);
    } else if (userRole === "client") {
      return Object.values(clients).filter((client) => client.id === userId);
    }
    return [];
  }, [clients, userRole, userId]);

  // Get movements for the selected article based on the user role
  const clientMovements = useMemo(() => {
    if (!selectedArticle) return [];
    const movementEntries =
      articleMovementsMap.get(selectedArticle.articleId) || [];
    return movementEntries.map(({ movement, client }) => ({
      ...movement,
      clientName: client.name,
    }));
  }, [selectedArticle, articleMovementsMap]);

  // Calculate total quantity sold for each article
  const totalQuantitySold = useMemo(() => {
    const allMovements = Object.values(clients).flatMap(
      (client) => client.movements
    );
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
