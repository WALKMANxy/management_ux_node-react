//src/routes/visits.ts
import express from "express";
import { visitValidationRules } from "../constants/validationRules";
import { VisitController } from "../controllers/visitsController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

router.use(authenticateUser);

// GET method to retrieve all visits
router.get("/", checkAgentOrAdminOrClientRole, VisitController.getAllVisits);

// POST method to create a new visit
router.post(
  "/",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  VisitController.createVisit
);

// PUT method to replace an entire visit
router.put(
  "/:id",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  VisitController.replaceVisit
);

// PATCH method to update part of a visit's information
router.patch(
  "/:id",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  VisitController.updateVisit
);

export default router;
