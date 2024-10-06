import { Router } from "express";
import { authenticateUser } from "../middlewares/authentication";
import { CityController } from "../controllers/cityQueryController";

const cityController = new CityController();
const router = Router();

router.use(authenticateUser);


// Route to find a nearby city
router.get("/find", (req, res) => cityController.findCity(req, res));

// Route to store a new city
router.post("/store", (req, res) => cityController.storeCity(req, res));

export default router;
