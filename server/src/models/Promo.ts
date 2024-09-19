import { Document, Schema, model } from "mongoose";

export interface IPromo extends Document {
  clientsId: string[]; // Array of client IDs this promo applies to
  type: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  promoIssuedBy: string;
}

const promoSchema = new Schema<IPromo>({
  clientsId: { type: [String], required: true }, // Reference to client collection
  type: { type: String, required: true },
  name: { type: String, required: true },
  discount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  promoIssuedBy: { type: String, required: true },
});

promoSchema.index({ promoIssuedBy: 1 });

export const Promo = model<IPromo>("Promo", promoSchema);
