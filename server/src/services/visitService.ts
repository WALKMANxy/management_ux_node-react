import { IVisit, Visit } from "../models/Visit";

export class VisitService {
  static async getAllVisits(): Promise<IVisit[]> {
    try {
      return await Visit.find().sort({ date: -1 }).exec();
    } catch (err) {
      throw new Error(
        `Error retrieving visits: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async createVisit(visitData: Partial<IVisit>): Promise<IVisit> {
    try {
      // Ensure date is a Date object before saving
      if (typeof visitData.date === "string") {
        visitData.date = new Date(visitData.date);
      }

      const visit = new Visit(visitData);
      return await visit.save();
    } catch (err) {
      throw new Error(
        `Error creating visit: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async replaceVisit(
    id: string,
    visitData: Partial<IVisit>
  ): Promise<IVisit | null> {
    try {
      return await Visit.findByIdAndUpdate(id, visitData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (err) {
      throw new Error(
        `Error replacing visit: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async updateVisit(
    id: string,
    visitData: Partial<IVisit>
  ): Promise<IVisit | null> {
    try {
      return await Visit.findByIdAndUpdate(id, visitData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (err) {
      throw new Error(
        `Error updating visit: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
}
