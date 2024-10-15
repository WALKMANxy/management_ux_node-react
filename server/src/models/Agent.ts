import mongoose, { Document, Schema } from 'mongoose';

export interface IAgent extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: {
    CODICE: string; // Reference to Client
    colour?: string; // Optional colour property
  }[];
  createdAt?: Date; // Optional timestamp fields
  updatedAt?: Date;
}

const ClientReferenceSchema: Schema = new Schema({
  CODICE: { type: String, ref: "Client", required: true },
  colour: { type: String },
});

const AgentSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, sparse: true },
    clients: { type: [ClientReferenceSchema], default: [] },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

AgentSchema.index({ id: 1 });
AgentSchema.index({ email: 1 });

export default mongoose.model<IAgent>("Agent", AgentSchema);
