//src/models/Promo.ts
import { Document, Schema, model } from "mongoose";

export interface IPromo extends Document {
  clientsId?: string[]; // Optional array of client IDs this promo applies to
  global?: boolean; // Indicates if the promo applies to all clients
  excludedClientsId?: string[]; // Optional array of client IDs excluded from a global promo
  promoType: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  promoIssuedBy: string;
}

const promoSchema = new Schema<IPromo>({
  clientsId: { type: [String], required: false }, // Optional reference to client collection
  global: { type: Boolean, default: false },
  excludedClientsId: { type: [String], required: false }, // Optional array for excluded clients
  promoType: { type: String, required: true },
  name: { type: String, required: true },
  discount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  promoIssuedBy: { type: String, required: true },
});

promoSchema.index({ global: 1 });

export const Promo = model<IPromo>("Promo", promoSchema);
