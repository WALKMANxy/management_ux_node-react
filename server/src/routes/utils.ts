import express from "express";
import { updateAdminsData, updateClientData, updateEmployeesData, updateMovementsData } from "../utils/dataScrambler";

const router = express.Router();

// Route to trigger data scrambling
router.get("/scramble-clients",  async (req, res) => {
  try {
    await updateClientData();
    res.status(200).send("Data scrambling process completed successfully.");
  } catch (error) {
    res.status(500).send("An error occurred during data scrambling.");
  }
});

// **New route to trigger movements data update**
router.get("/scramble-movements", async (req, res) => {
    try {
      await updateMovementsData();
      res.status(200).send("Movements data update process completed successfully.");
    } catch (error) {
      res.status(500).send("An error occurred during movements data update.");
    }
  });

  // **New Route to trigger employees data scrambling**
router.get("/scramble-employees", async (req, res) => {
  try {
    await updateEmployeesData();
    res.status(200).send("Employees data scrambling process completed successfully.");
  } catch (error) {
    res.status(500).send("An error occurred during employees data scrambling.");
  }
});

// **New Route to trigger admins data scrambling**
router.get("/scramble-admins", async (req, res) => {
  try {
    await updateAdminsData();
    res.status(200).send("Admins data scrambling process completed successfully.");
  } catch (error) {
    res.status(500).send("An error occurred during admins data scrambling.");
  }
});

export default router;
