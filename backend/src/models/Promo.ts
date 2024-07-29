import { Schema, model, Document } from 'mongoose';

export interface IPromo extends Document {
  clientsId: string[];
  agentsId: string[];
  type: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
}

const promoSchema = new Schema<IPromo>({
  clientsId: { type: [String], required: true },
  agentsId: { type: [String], required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  discount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

export const Promo = model<IPromo>('Promo', promoSchema);
