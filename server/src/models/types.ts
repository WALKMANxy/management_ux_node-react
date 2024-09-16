import { Request } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "./User";

export interface CustomUser {
  id: IUser["_id"];
  email: IUser["email"];
  role: IUser["role"];
  entityCode: IUser["entityCode"];
  entityRole: IUser["role"];
}

export interface AuthenticatedRequest extends Request {
  user?: Partial<IUser>; // Use Partial if you might not always have all properties
  ipInfo?: IpInfo;

}



export interface UserRequest extends Request {
  user: IUser;
}

// models/Admin.ts (Optional, just for structure)
export interface Admin {
  id: string;
  name: string;
  email: string;
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

export type IpInfo = {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export interface DecodedToken extends jwt.JwtPayload {
  id: string;
  authType: "email" | "google";
}
