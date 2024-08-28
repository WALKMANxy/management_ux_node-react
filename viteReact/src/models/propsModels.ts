import { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Dayjs } from "dayjs";
import { ReactNode } from "react";
import { Movement, MovementDetail } from "./dataModels";
import { Agent, Client } from "./entityModels";
import { SearchResult } from "./searchModels";

export type AuthHandlersProps = {
  selectedRole: "admin" | "agent" | "client";
  selectedAgent: string;
  selectedClient: string;
  agents: Agent[];
};

export interface HighlightedDay {
  date: number;
  color: string;
}

export interface ServerDayProps extends PickersDayProps<Dayjs> {
  highlightedDays?: HighlightedDay[];
}

export type GlobalSearchProps = {
  filter: string;
  onSelect?: (item: SearchResult) => void; // Change the callback to accept SearchResult
  placeholder?: string;
  isHeaderSearch?: boolean;
};

export type DetailProps = {
  detail: { [key: string]: any };
  isLoading: boolean;
};

export type HistoryProps = {
  history: { [key: string]: any }[];
};

export type SearchResultsProps = {
  onSelect: (item: SearchResult) => void; // Change this to accept SearchResult
  selectedIndex: number;
  results: SearchResult[];
};

export type SidebarProps = {
  onToggle: (isOpen: boolean) => void;
};

export type SalesDistributionProps = {
  salesDistributionDataClients: { label: string; value: number }[];
  salesDistributionDataAgents?: { label: string; value: number }[];
};

export type ArticleColumnDefinition = {
  headerName: string;
  field?: string;
  filter: string;
  sortable: boolean;
  cellRenderer?: (params: any) => JSX.Element;
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => number;
};

export type ActivePromotionsProps = {
  isLoading: boolean;
};

export interface SpentThisMonthProps {
  amount: string;
  comparison?: {
    value: number;
  };
  isAgentSelected: boolean;
}

export interface ComparisonResult {
  color: string;
  icon: JSX.Element;
  text: string;
}

export interface ComparisonDetails {
  color: string;
  icon: JSX.Element;
  text: string;
}

export type SpentThisYearProps = {
  amount: string;
  comparison?: { value: number };
  isAgentSelected: boolean;
  backgroundColor?: string;
};

export type Props = {
  children: ReactNode;
};

export type ClientListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  filteredClients: () => any[];
  columnDefs: ColDef[];
  gridRef: React.RefObject<AgGridReact>;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isClientListCollapsed: boolean;
  setClientListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  clientDetailsRef: React.RefObject<HTMLDivElement>; // Added clientDetailsRef
};

export type MovementListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  filteredMovements: () => any[];
  columnDefs: ColDef[];
  gridRef: React.RefObject<AgGridReact>;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isMovementListCollapsed: boolean;
  setMovementListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  movementDetailsRef: React.RefObject<HTMLDivElement>;
};

export type MovementDetailsProps = {
  selectedMovement: Movement | null;
  isMovementDetailsCollapsed: boolean;
  setMovementDetailsCollapsed: (value: boolean) => void;
  isLoading: boolean;
  ref: React.Ref<HTMLDivElement>;
};

export type TopArticleTypeProps = {
  articles: { id: string; name: string; quantity: number }[];
};

export type TotalEarningProps = {
  totalEarning: number;
  isLoading: boolean;
};

export type UpcomingVisitsProps = {
  isLoading: boolean;
};

export type AGGridTableProps = {
  columnDefs: ColDef[];
  rowData: any[];
  paginationPageSize: number;
  quickFilterText: string; // Added quickFilterText prop
};

export type MovementsHistoryProps = {
  movements: Movement[];
};

export type ClientDetailsProps = {
  selectedClient: Client | null;
  isClientDetailsCollapsed: boolean;
  setClientDetailsCollapsed: (value: boolean) => void;
  isLoading: boolean;
  ref: React.Ref<HTMLDivElement>; // Add ref prop
};

export type ArticlesListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  filteredArticles: () => MovementDetail[];
  columnDefs: ColDef[];
  gridRef: React.RefObject<AgGridReact>;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isArticleListCollapsed: boolean;
  setArticleListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  articleDetailsRef: React.RefObject<HTMLDivElement>;
};

export type ArticleDetailsProps = {
  selectedArticle: MovementDetail | null;
  isArticleDetailsCollapsed: boolean;
  setArticleDetailsCollapsed: (value: boolean) => void;
  clientMovements?: Movement[]; // Optional prop for client movements
  isLoading: boolean;
};

export type MovementDetailsHistoryProps = {
  movementDetails: MovementDetail[];
};
