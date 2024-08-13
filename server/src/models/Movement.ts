//src/models/Movement.ts

import { Document, Schema, model } from "mongoose";

interface IMovement extends Document {
  Data_Documento_Precedente: Date;
  Numero_Lista: number;
  Mese: number;
  Anno: number;
  Ragione_Sociale_Cliente: string;
  Codice_Cliente: number;
  Codice_Agente: number;
  Codice_Articolo: string;
  Marca_Articolo: string;
  Descrizione_Articolo: string;
  Quantita: number;
  Valore: number;
  Costo: number;
  Prezzo_Articolo: number;
}

const movementSchema = new Schema<IMovement>({
  Data_Documento_Precedente: { type: Date, required: true },
  Numero_Lista: { type: Number, required: true },
  Mese: { type: Number, required: true },
  Anno: { type: Number, required: true },
  Ragione_Sociale_Cliente: { type: String, required: true },
  Codice_Cliente: { type: Number, required: true },
  Codice_Agente: { type: Number, required: true },
  Codice_Articolo: { type: String, required: true },
  Marca_Articolo: { type: String, required: true },
  Descrizione_Articolo: { type: String, required: true },
  Quantita: { type: Number, required: true },
  Valore: { type: Number, required: true },
  Costo: { type: Number, required: true },
  Prezzo_Articolo: { type: Number, required: true },
});

export const Movement = model<IMovement>("Movement", movementSchema);
