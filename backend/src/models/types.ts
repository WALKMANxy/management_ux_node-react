import { Request } from 'express';
import { IUser } from './User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  clients: Client[];
}

export interface Client {
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

export interface Movement {
  "Data Documento Precedente": string;
  "Numero Lista": number;
  "Mese": number;
  "Anno": number;
  "Ragione Sociale Cliente": string;
  "Codice Cliente": number;
  "Codice Agente": string;
  "Codice Articolo": string;
  "Marca Articolo": string;
  "Descrizione Articolo": string;
  Quantita: number;
  Valore: number;
  Costo: number;
  "Prezzo Articolo": number;
}
