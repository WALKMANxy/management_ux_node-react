import { IPromo, Promo } from "../models/Promo";

export class PromoService {
  static async getAllPromos(): Promise<IPromo[]> {
    try {
      return await Promo.find().exec();
    } catch (err) {
      throw new Error(
        `Error retrieving promos: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async createPromo(promoData: Partial<IPromo>): Promise<IPromo> {
    try {
      const promo = new Promo(promoData);
      return await promo.save();
    } catch (err) {
      throw new Error(
        `Error creating promo: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async replacePromo(
    id: string,
    promoData: Partial<IPromo>
  ): Promise<IPromo | null> {
    try {
      return await Promo.findByIdAndUpdate(id, promoData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (err) {
      throw new Error(
        `Error replacing promo: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async updatePromo(
    id: string,
    promoData: Partial<IPromo>
  ): Promise<IPromo | null> {
    try {
      return await Promo.findByIdAndUpdate(id, promoData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (err) {
      throw new Error(
        `Error updating promo: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
}
