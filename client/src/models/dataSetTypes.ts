import { Agent, Client } from "./entityModels";
import { SearchResult } from "./searchModels";

export interface serverClient {
  CODICE: string;
  "RAGIONE SOCIALE": string;
  "RAGIONE SOCIALE AGG.": string;
  INDIRIZZO: string;
  "C.A.P. - COMUNE (PROV.)": string;
  TELEFONO: string;
  EMAIL: string;
  "EMAIL PEC": string;
  "PARTITA IVA": string;
  "CODICE FISCALE": string;
  MP: string;
  "Descizione metodo pagamento": string;
  CS: string;
  AG: string;
}

export interface serverMovement {
  "Data Documento Precedente": string;
  "Numero Lista": number;
  Mese: number;
  Anno: number;
  "Ragione Sociale Cliente": string;
  "Codice Cliente": string;
  "Codice Agente": string;
  "Codice Articolo": string;
  "Marca Articolo": string;
  "Descrizione Articolo": string;
  Quantita: number;
  Valore: number;
  Costo: number;
  "Prezzo Articolo": number;
}

export interface serverAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  clients: serverClient[];
}

export type MonthlyRevenue = {
  totalRevenue: string;
  totalNetRevenue: string;
};

export type TopArticleType = {
  id: string;
  name: string;
  quantity: number;
};

export interface UseSelectionStateReturn {
  selectedClient: Client | null;
  selectedAgent: Agent | null;
  handleSelect: (item: SearchResult) => void;
  clearSelection: () => void;
  clientComparativeStatistics: {
    revenuePercentage: string;
    ordersPercentage: string;
  };
  clientComparativeStatisticsMonthly: {
    revenuePercentage: string;
    ordersPercentage: string;
  };
  agentComparativeStatistics: {
    revenuePercentage: string;
    ordersPercentage: string;
  };
  agentComparativeStatisticsMonthly: {
    revenuePercentage: string;
    ordersPercentage: string;
  };
}