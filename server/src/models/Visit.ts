import { Document, Schema, Types, model } from "mongoose";

export interface IVisit extends Document {
  clientId: Types.ObjectId; // Client associated with this visit
  type: string;
  visitReason: string;
  createdAt: Date;
  date: Date;
  notePublic?: string;
  notePrivate?: string;
  pending: boolean;
  completed: boolean;
  visitIssuedBy: string;
}

const visitSchema = new Schema<IVisit>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true }, // Reference to the Client collection
    type: { type: String, required: true },
    visitReason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    date: { type: Date, required: true },
    notePublic: { type: String },
    notePrivate: { type: String },
    pending: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    visitIssuedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Optional: Create a virtual to use `id` in place of `_id`
visitSchema.virtual("id").get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

visitSchema.set("toJSON", { virtuals: true });

export const Visit = model<IVisit>("Visit", visitSchema);
