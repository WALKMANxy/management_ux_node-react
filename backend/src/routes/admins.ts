//src/routes/admins.ts
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filePath = path.resolve(process.env.ADMIN_DETAILS_FILE_PATH || "");
    const admins = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(admins);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export default router;
