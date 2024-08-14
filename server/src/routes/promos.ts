import express from "express";
import { promoValidationRules } from "../constants/validationRules";
import { PromoController } from "../controllers/promoController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// GET method to retrieve all promos
router.get("/", checkAgentOrAdminOrClientRole, PromoController.getAllPromos);

// POST method to create a new promo
router.post(
  "/",
  promoValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  PromoController.createPromo
);

// PUT method to replace an entire promo
router.put(
  "/:id",
  promoValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  PromoController.replacePromo
);

// PATCH method to update part of a promo's information
router.patch(
  "/:id",
  promoValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  PromoController.updatePromo
);

export default router;
