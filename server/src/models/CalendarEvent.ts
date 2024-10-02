import { Schema, model, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  userId: Schema.Types.ObjectId; // Optional for company-wide events or holidays
  startDate: Date;
  endDate: Date;
  eventType: "holiday" | "event" | "absence";
  reason:
    | "illness"
    | "day_off"
    | "unexpected_event"
    | "medical_visit"
    | "public_holiday"
    | "company_holiday"
    | "religious_holiday"
    | "company_meeting"
    | "company_party"
    | "conference"
    | "expo"
    | "generic";
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    eventType: {
      type: String,
      enum: ["holiday", "event", "absence"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "illness",
        "day_off",
        "unexpected_event",
        "medical_visit",
        "public_holiday",
        "company_holiday",
        "religious_holiday",
        "company_meeting",
        "company_party",
        "conference",
        "expo",
        "generic",
      ],
      required: true,
    },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for improved query performance
calendarEventSchema.index({ userId: 1 });
calendarEventSchema.index({ startDate: 1 });
calendarEventSchema.index({ endDate: 1 });
calendarEventSchema.index({ status: 1 });
calendarEventSchema.index({ eventType: 1 });
calendarEventSchema.index({ userId: 1, startDate: 1 }); // Compound index for userId and startDate
calendarEventSchema.index({ userId: 1, status: 1 }); // Compound index for userId and status
calendarEventSchema.index({ eventType: 1, startDate: 1 }); // Compound index for eventType and startDate

export const CalendarEvent = model<ICalendarEvent>(
  "CalendarEvent",
  calendarEventSchema
);
