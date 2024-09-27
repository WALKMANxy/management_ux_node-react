import { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import {
  ColDef,
  ValueFormatterParams,
  ValueGetterParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Dayjs } from "dayjs";
import { ReactNode } from "react";
import { CalendarEvent, Movement, MovementDetail } from "./dataModels";
import { Agent, Client, UserRole } from "./entityModels";
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

export type MovementProp = {
  detail: {
    id: string;
    dateOfOrder: string;
    [key: string]: string | number;
  };
  isLoading: boolean;
};

export type ArticleProp = {
  detail: {
    articleId: string;
    name: string;
    brand: string;
    quantity: number;
    unitPrice: string;
    priceSold: string;
    priceBought: string;
    [key: string]: string | number;
  };
  isLoading: boolean;
};

export type ClientProp = {
  detail: {
    id: string;
    name: string;
    extendedName?: string; // New property
    province?: string;
    phone?: string;
    totalOrders: number;
    totalRevenue: string;
    unpaidRevenue: string;
    address?: string;
    email?: string;
    pec?: string; // New property
    taxCode?: string; // New property
    extendedTaxCode?: string; // New property
    paymentMethodID?: string; // New property
    paymentMethod?: string; // New property
    agent: string;
    agentName?: string;
    movements: Movement[];
    colour?: string;
    agentData?: Agent[];
  };
  isLoading: boolean;
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
  cellRenderer?: (params: {
    data: MovementDetail;
    value: string;
  }) => JSX.Element;
  valueFormatter?: (params: ValueFormatterParams) => string;
  valueGetter?: (params: ValueGetterParams) => number;
};

export interface EnrichedClient extends Client {
  agentName: string;
}

export type ClientColumnDefinition = {
  headerName: string;
  field?: string;
  filter: string;
  sortable: boolean;
  cellRenderer?: (params: {
    data: EnrichedClient;
    value: string;
  }) => JSX.Element;
  valueGetter?: (params: ValueGetterParams) => number | string;
  valueFormatter?: (params: ValueFormatterParams) => string;
  comparator?: (valueA: number, valueB: number) => number;
};

export type MovementColumnDefinition = {
  headerName: string;
  field?: keyof Movement | string; // Allow fields from Movement or string for additional calculated fields
  filter?: string; // Filter type for the column
  sortable: boolean;
  cellRenderer?: (params: { data: Movement; value: string }) => JSX.Element;
  valueFormatter?: (params: ValueFormatterParams) => string;
  valueGetter?: (params: ValueGetterParams) => number | string;
  comparator?: (valueA: number, valueB: number) => number; // Comparator function for sorting
};

export type ActivePromotionsProps = {
  isLoading: boolean;
};

export interface SpentThisMonthProps {
  amount: string;
  comparison?: {
    value: number;
  };
  isAgentSelected?: boolean;
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
  isAgentSelected?: boolean;
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
  filteredClients: EnrichedClient[]; // Update this to use EnrichedClient type
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
  filteredMovements: () => Movement[];
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
  isAgentSelected: boolean;
};

export type TotalEarningProps = {
  totalEarning: number;
  isLoading: boolean;
};

export type UpcomingVisitsProps = {
  isLoading: boolean;
};

export type AGGridTableProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnDefs: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowData: any;
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
  filteredArticles: MovementDetail[];
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

export type BrandData = {
  id: string;
  label: string;
  value: number;
};

export interface TopBrandsSoldProps {
  topBrandsData: BrandData[];
  brandColors: string[];
  isMobile: boolean;
  userRole: UserRole;
}

export interface CreateEventPayload {
  userId: string;
  startDate: Date;
  endDate: Date;
  eventType: "absence" | "event" | "holiday" | "visit" | "";
  reason:
    | "illness"
    | "day_off"
    | "unexpected_event"
    | "medical_visit"
    | "public_holiday"
    | "company_holiday"
    | "religious_holiday"
    | "company_meeting"
    | "company_party"
    | "conference"
    | "expo"
    | "generic"
    | "";
  note?: string;
}

export interface UpdateEventStatusPayload {
  eventId: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export type GetEventsByMonthResponse = CalendarEvent[];
