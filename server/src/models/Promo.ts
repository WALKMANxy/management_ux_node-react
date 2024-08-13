import { Document, Schema, Types, model } from "mongoose";

export interface IPromo extends Document {
  clientsId: Types.ObjectId[]; // Array of client IDs this promo applies to
  type: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  promoIssuedBy: string;
}

const promoSchema = new Schema<IPromo>({
  clientsId: { type: [Schema.Types.ObjectId], ref: "Client", required: true }, // Reference to client collection
  type: { type: String, required: true },
  name: { type: String, required: true },
  discount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  promoIssuedBy: { type: String, required: true },
});

// Optional: Create a virtual to use `id` in place of `_id`
promoSchema.virtual("id").get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

promoSchema.set("toJSON", { virtuals: true });

export const Promo = model<IPromo>("Promo", promoSchema);
