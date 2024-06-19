// src/models/models.ts

export type UserRole = 'admin' | 'agent' | 'client' | 'guest';

export type AuthState = {
  isLoggedIn: boolean;
  userRole: UserRole;
};

export type SearchResult = {
  id: string;
  name: string;
  type: string;
};

export type SearchParams = {
  query: string;
  filter: string;
};

export type SearchState = {
  query: string;
  results: SearchResult[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

export type GlobalSearchProps = {
  filter?: string;
  onSelect?: (item: string) => void;
  placeholder?: string;
};

export type DetailProps = {
  detail: { [key: string]: any };
};

export type HistoryProps = {
  history: { [key: string]: any }[];
};

export type SearchResultsProps = {
  onSelect?: (item: string) => void;
  selectedIndex: number;
};
