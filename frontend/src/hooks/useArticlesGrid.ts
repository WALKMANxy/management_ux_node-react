import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Movement, MovementDetail } from "../models/models";
import { useGetClientsQuery, useGetAgentDetailsQuery } from "../services/api";

export const useArticlesGrid = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const { data: agentDetails = [] } = useGetAgentDetailsQuery();
  const [selectedArticle, setSelectedArticle] = useState<MovementDetail | null>(null);
  const [isArticleListCollapsed, setArticleListCollapsed] = useState(false);
  const [isArticleDetailsCollapsed, setArticleDetailsCollapsed] = useState(false);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const articleDetailsRef = useRef<HTMLDivElement>(null);
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

  const handleArticleSelect = useCallback(
    (articleId: string) => {
      const allMovements: Movement[] = clients.flatMap(client => client.movements);
      const articleMovements = allMovements.filter(movement =>
        movement.details.some(detail => detail.articleId === articleId)
      );
      if (articleMovements.length > 0) {
        const selectedDetail = articleMovements[0].details.find(detail => detail.articleId === articleId) || null;
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
    let allDetails: MovementDetail[] = clients.flatMap(client =>
      client.movements.flatMap(movement => movement.details)
    );

    if (quickFilterText) {
      allDetails = allDetails.filter(detail =>
        detail.name.toLowerCase().includes(quickFilterText.toLowerCase())
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      allDetails = allDetails.filter(detail => {
        const detailMovements = clients.flatMap(client =>
          client.movements.filter(movement =>
            movement.details.some(movDetail => movDetail.articleId === detail.articleId)
          )
        );
        return detailMovements.some(movement => {
          const movementDate = new Date(movement.dateOfOrder);
          return movementDate >= start && movementDate <= end;
        });
      });
    }

    return allDetails;
  }, [clients, quickFilterText, startDate, endDate]);

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
  };
};
