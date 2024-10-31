// src/models/MovementModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMovement extends Document {
  "Data Documento Precedente"?: string;
  "Numero Lista"?: number;
  "Mese"?: number;
  "Anno"?: number;
  "Ragione Sociale Cliente"?: string;
  "Codice Cliente"?: string;
  "Codice Agente"?: string;
  "Codice Articolo"?: string;
  "Marca Articolo"?: string;
  "Descrizione Articolo"?: string;
  "Quantita"?: number;
  "Valore"?: number;
  "Costo"?: number;
  "Prezzo Articolo"?: number;
}

const MovementSchema: Schema = new Schema({
  "Data Documento Precedente": { type: String },
  "Numero Lista": { type: Number },
  "Mese": { type: Number },
  "Anno": { type: Number },
  "Ragione Sociale Cliente": { type: String },
  "Codice Cliente": { type: String, index: true },
  "Codice Agente": { type: String, index: true },
  "Codice Articolo": { type: String },
  "Marca Articolo": { type: String },
  "Descrizione Articolo": { type: String },
  "Quantita": { type: Number },
  "Valore": { type: Number },
  "Costo": { type: Number },
  "Prezzo Articolo": { type: Number },
});

// Indexes for optimized queries
MovementSchema.index({ "Numero Lista": 1 });
MovementSchema.index({ "Codice Cliente": 1 });
MovementSchema.index({ "Codice Agente": 1 });

export default mongoose.model<IMovement>("Movement", MovementSchema);
