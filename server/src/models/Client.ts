import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  CODICE: string;
  "RAGIONE SOCIALE": string;
  "RAGIONE SOCIALE AGG": string;
  INDIRIZZO: string;
  "CAP": string;
  TELEFONO: string;
  EMAIL: string;
  "EMAIL PEC": string;
  "PARTITA IVA": string;
  "CODICE FISCALE": string;
  MP: string;
  "Descizione metodo pagamento": string;
  CS: string;
  AG: string;
  createdAt?: Date; // Optional timestamp fields
  updatedAt?: Date;
}

const ClientSchema: Schema = new Schema(
  {
    CODICE: { type: String, required: true },
    "RAGIONE SOCIALE": { type: String, required: true },
    "RAGIONE SOCIALE AGG": { type: String, alias: 'ragioneSocialeAgg' },
    INDIRIZZO: { type: String },
    "CAP": { type: String, alias: 'capComuneProv' },
    TELEFONO: { type: String },
    EMAIL: { type: String },
    "EMAIL PEC": { type: String },
    "PARTITA IVA": { type: String },
    "CODICE FISCALE": { type: String },
    MP: { type: String },
    "Descizione metodo pagamento": { type: String },
    CS: { type: String },
    AG: { type: String },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

ClientSchema.index({ CODICE: 1 });
ClientSchema.index({ AG: 1 });

export default mongoose.model<IClient>('Client', ClientSchema);
