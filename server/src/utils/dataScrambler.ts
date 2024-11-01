//src/utils/dataScrambler.ts
import { faker } from "@faker-js/faker";
import Admin from "../models/Admin";
import Client from "../models/Client";
import { Employee } from "../models/Employee";
import Movement, { IMovement } from "../models/Movement";
import { logger } from "./logger";

export async function updateClientData() {
  // Sets to keep track of unique values
  const usedCompanyNames = new Set();
  const usedEmails = new Set();
  const usedVatNumbers = new Set();
  const usedFiscalCodes = new Set();

  try {
    logger.info("Data scrambling process started.");
    // Fetch all clients
    const clients = await Client.find();
    logger.info(`Total clients to update: ${clients.length}`);
    let processedCount = 0;

    for (const clientDoc of clients) {
      // Generate unique company name
      let companyName;
      do {
        companyName = faker.company.name();
      } while (usedCompanyNames.has(companyName));
      usedCompanyNames.add(companyName);

      // Generate unique email
      let email;
      do {
        email = faker.internet.email();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Generate unique VAT number
      let vatNumber;
      do {
        vatNumber = faker.finance.accountNumber(11);
      } while (usedVatNumbers.has(vatNumber));
      usedVatNumbers.add(vatNumber);

      // Generate unique fiscal code
      let fiscalCode;
      do {
        fiscalCode = faker.string.alphanumeric(16).toUpperCase();
      } while (usedFiscalCodes.has(fiscalCode));
      usedFiscalCodes.add(fiscalCode);

      // Generate address components
      const streetAddress = faker.location.streetAddress(true);
      const zipCode = faker.location.zipCode("#####"); // Force 5-digit format
      const city = faker.location.city().toUpperCase(); // Match existing format
      const provinceCode = faker.location
        .state({ abbreviated: true })
        .toUpperCase();

      // Create the address string in the correct format
      const formattedAddress = `${zipCode} - ${city} (${provinceCode})`;

      // Update the document using updateOne to ensure the field is updated
      await Client.updateOne(
        { _id: clientDoc._id },
        {
          $set: {
            "RAGIONE SOCIALE": companyName,
            "RAGIONE SOCIALE AGG": companyName,
            INDIRIZZO: streetAddress,
            CAP: formattedAddress,
            TELEFONO: faker.phone.number(),
            EMAIL: email,
            "EMAIL PEC": "",
            "PARTITA IVA": vatNumber,
            "CODICE FISCALE": fiscalCode,
          },
        }
      );

      processedCount++;
      if (processedCount % 100 === 0 || processedCount === clients.length) {
        logger.info(`Updated ${processedCount} clients...`);
      }
    }

    logger.info("Data scrambling process completed.");
  } catch (error) {
    logger.error("Error during data scrambling process:", error);
    throw error;
  }
}
export async function updateMovementsData() {
  try {
    logger.info("Starting the bulk update of movements data.");

    const batchSize = 1000; // Process 1,000 documents at a time
    const totalMovements = await Movement.countDocuments();
    const totalBatches = Math.ceil(totalMovements / batchSize);

    let skipCount = 0;
    let processedCount = 0;
    let batchCount = 0;

    const startTime = Date.now();

    while (true) {
      // Fetch a batch of movements
      const movements: IMovement[] = await Movement.find()
        .skip(skipCount)
        .limit(batchSize);
      if (movements.length === 0) break; // Exit loop if no more documents

      const bulkOps = [];
      for (const movementDoc of movements) {
        const client = await Client.findOne({
          CODICE: movementDoc["Codice Cliente"],
        });
        const updatedFields: Partial<IMovement> = {};

        if (client) {
          updatedFields["Ragione Sociale Cliente"] = client["RAGIONE SOCIALE"];
        }

        // Apply a random increase between 10% and 50% and round to two decimal places
        const randomPercentage = Math.random() * 0.4 + 0.1;
        (["Valore", "Costo", "Prezzo Articolo"] as const).forEach((field) => {
          if (typeof movementDoc[field] === "number") {
            updatedFields[field] = Number(
              (movementDoc[field] * (1 + randomPercentage)).toFixed(2)
            );
          }
        });

        // Prepare bulk update operation
        bulkOps.push({
          updateOne: {
            filter: { _id: movementDoc._id },
            update: { $set: updatedFields },
          },
        });
      }

      // Execute bulk write
      if (bulkOps.length > 0) {
        const result = await Movement.bulkWrite(bulkOps);
        processedCount += result.modifiedCount;
      }

      batchCount++;
      skipCount += batchSize;

      // Calculate elapsed time and ETA
      const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
      const avgTimePerBatch = elapsedTime / batchCount;
      const remainingBatches = totalBatches - batchCount;
      const eta = (remainingBatches * avgTimePerBatch).toFixed(2); // in seconds

      // Calculate progress percentage
      const progressPercentage = (
        (processedCount / totalMovements) *
        100
      ).toFixed(2);

      // Log progress, ETA, and current batch
      logger.info(
        `Batch ${batchCount}/${totalBatches} completed. ` +
          `Processed ${processedCount} movements. ` +
          `Progress: ${progressPercentage}%. ` +
          `ETA: ${eta} seconds remaining.`
      );
    }

    logger.info("Bulk update of movements data completed successfully.");
  } catch (error) {
    logger.error("Error during bulk updating movements data:", error);
    throw error;
  }
}

export async function updateEmployeesData() {
  const usedNames = new Set();
  const usedEmails = new Set();

  try {
    logger.info("Employee data scrambling process started.");

    const employees = await Employee.find();
    logger.info(`Total employees to update: ${employees.length}`);
    let processedCount = 0;

    for (const employeeDoc of employees) {
      // Generate unique name
      let name;
      do {
        name = faker.person.fullName();
      } while (usedNames.has(name));
      usedNames.add(name);

      // Generate unique email
      let email;
      do {
        email = faker.internet.email();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Update the document
      await Employee.updateOne(
        { _id: employeeDoc._id },
        {
          $set: {
            name: name,
            email: email,
          },
        }
      );

      processedCount++;
      if (processedCount % 100 === 0 || processedCount === employees.length) {
        logger.info(`Updated ${processedCount} employees...`);
      }
    }

    logger.info("Employee data scrambling process completed.");
  } catch (error) {
    logger.error("Error during employee data scrambling process:", error);
    throw error;
  }
}

export async function updateAdminsData() {
  const usedNames = new Set();
  const usedEmails = new Set();

  try {
    logger.info("Admin data scrambling process started.");

    const admins = await Admin.find();
    logger.info(`Total admins to update: ${admins.length}`);
    let processedCount = 0;

    for (const adminDoc of admins) {
      let name = adminDoc.name;
      if (name === "RCS Bot") {
        name = "NEXT_Bot";
      } else {
        // Generate unique name
        do {
          name = faker.person.fullName();
        } while (usedNames.has(name));
        usedNames.add(name);
      }

      // Generate unique email
      let email;
      do {
        email = faker.internet.email();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Update the document
      await Admin.updateOne(
        { _id: adminDoc._id },
        {
          $set: {
            name: name,
            email: email,
          },
        }
      );

      processedCount++;
      if (processedCount % 100 === 0 || processedCount === admins.length) {
        logger.info(`Updated ${processedCount} admins...`);
      }
    }

    logger.info("Admin data scrambling process completed.");
  } catch (error) {
    logger.error("Error during admin data scrambling process:", error);
    throw error;
  }
}
