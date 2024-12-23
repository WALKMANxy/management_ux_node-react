//src/controllers/promoController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { PromoService } from "../services/promosService";

export class PromoController {
  static async getAllPromos(req: Request, res: Response): Promise<void> {
    try {
      const promos = await PromoService.getAllPromos();
      res.json(promos);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async createPromo(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const promoData = req.body;

      if (promoData.global) {
        promoData.clientsId = [];
      }

      const promo = await PromoService.createPromo(promoData);
      res.status(201).json(promo);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async replacePromo(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const promoData = req.body;

      if (promoData.global) {
        promoData.clientsId = [];
      }

      const promo = await PromoService.replacePromo(req.params.id, promoData);
      if (!promo) {
        res.status(200).json({ message: "Promo not found" });
        return;
      }
      res.status(200).json(promo);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }


  static async updatePromo(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const promoData = req.body;

      if (promoData.global) {
        promoData.clientsId = [];
      }

      const promo = await PromoService.updatePromo(req.params.id, promoData);
      if (!promo) {
        res.status(200).json({ message: "Promo not found" });
        return;
      }
      res.status(200).json(promo);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
