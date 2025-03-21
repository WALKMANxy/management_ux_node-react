//src/routes/promos.ts
import express from "express";
import { promoValidationRules } from "../constants/validationRules";
import { PromoController } from "../controllers/promoController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

router.use(authenticateUser);

// GET method to retrieve all promos
router.get("/", checkAgentOrAdminOrClientRole, PromoController.getAllPromos);

// POST method to create a new promo
router.post(
  "/",
  promoValidationRules,
  checkValidation,
  checkAdminRole,
  PromoController.createPromo
);

// PUT method to replace an entire promo
router.put(
  "/:id",
  promoValidationRules,
  checkValidation,
  checkAdminRole,
  PromoController.replacePromo
);

// PATCH method to update part of a promo's information
router.patch(
  "/:id",
  promoValidationRules,
  checkValidation,
  checkAdminRole,
  PromoController.updatePromo
);

export default router;
