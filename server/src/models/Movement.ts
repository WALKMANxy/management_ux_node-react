// src/models/MovementModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMovement extends Document {
  dataDocumentoPrecedente: string;
  numeroLista: number;
  mese: number;
  anno: number;
  ragioneSocialeCliente: string;
  codiceCliente: string;
  codiceAgente: string;
  codiceArticolo: string;
  marcaArticolo: string;
  descrizioneArticolo: string;
  quantita: number;
  valore: number;
  costo: number;
  prezzoArticolo: number;
}

const MovementSchema: Schema = new Schema({
  dataDocumentoPrecedente: { type: String, required: true },
  numeroLista: { type: Number, required: true },
  mese: { type: Number, required: true },
  anno: { type: Number, required: true },
  ragioneSocialeCliente: { type: String, required: true },
  codiceCliente: { type: String, required: true, index: true },
  codiceAgente: { type: String, required: true, index: true },
  codiceArticolo: { type: String, required: true },
  marcaArticolo: { type: String, required: true },
  descrizioneArticolo: { type: String, required: true },
  quantita: { type: Number, required: true },
  valore: { type: Number, required: true },
  costo: { type: Number, required: true },
  prezzoArticolo: { type: Number, required: true },
});

// Indexes for optimized queries
MovementSchema.index({ numeroLista: 1 });
MovementSchema.index({ codiceCliente: 1 });
MovementSchema.index({ codiceAgente: 1 });

export default mongoose.model<IMovement>("Movement", MovementSchema);
