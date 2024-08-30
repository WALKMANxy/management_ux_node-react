// Worker script adjustments to use specific types

import { Movement, MovementDetail } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";

onmessage = function (
  event: MessageEvent<{
    data: serverMovement[];
    clientDetails: serverClient[];
  }>
) {
  const { data, clientDetails } = event.data;
  // Create a map for clientDetails for faster lookup
  const clientDetailsMap = new Map(
    clientDetails.map((detail) => [detail["CODICE"], detail])
  );

  // Aggregate data by client
  const clientsMap = data.reduce((map, item) => {
    const clientId = item["Codice Cliente"].toString();
    const clientData = map.get(clientId) || [];
    clientData.push(item);
    map.set(clientId, clientData);
    return map;
  }, new Map());

  // Create a map to track the latest movement timestamp for each client
  const latestMovementTimestampMap = new Map<string, number>();

  const clients = Array.from(clientsMap.values()).map((clientData) => {
    const clientInfo = clientData[0];
    const clientDetail = clientDetailsMap.get(
      clientInfo["Codice Cliente"].toString()
    );

    // Aggregate movements by "Numero Lista"
    const movementsMap = clientData.reduce(
      (map: Map<string, serverMovement[]>, item: serverMovement) => {
        const movementId = item["Numero Lista"].toString();
        if (map.has(movementId)) {
          map.get(movementId)!.push(item);
        } else {
          map.set(movementId, [item]);
        }
        return map;
      },
      new Map<string, serverMovement[]>()
    );

    // Convert movementsMap to array of Movement objects and sort by dateOfOrder
    let latestMovementTimestamp = 0; // Track the latest timestamp for sorting

    const movements: Movement[] = Array.from(movementsMap.values()).map(
      (movementData) => {
        const typedMovementData = movementData as serverMovement[];
        const movementInfo = typedMovementData[0];
        const details: MovementDetail[] = typedMovementData.map((item) => ({
          articleId: item["Codice Articolo"].toString(),
          name: item["Descrizione Articolo"],
          brand: item["Marca Articolo"],
          quantity: parseFloat(item["Quantita"].toString()),
          unitPrice: parseFloat(item["Prezzo Articolo"].toString()).toFixed(2),
          priceSold: parseFloat(item["Valore"].toString()).toFixed(2),
          priceBought: parseFloat(item["Costo"].toString()).toFixed(2),
        }));

        const movementTimestamp = new Date(
          movementInfo["Data Documento Precedente"]
        ).getTime();

        // Update the latest movement timestamp if this movement is newer
        if (movementTimestamp > latestMovementTimestamp) {
          latestMovementTimestamp = movementTimestamp;
        }

        return {
          id: movementInfo["Numero Lista"].toString(),
          discountCategory: "",
          details,
          unpaidAmount: "",
          paymentDueDate: "",
          dateOfOrder: new Date(movementTimestamp).toISOString().split("T")[0], // Convert back to YYYY-MM-DD format
        };
      }
    );

    // Store the latest movement timestamp for sorting later
    latestMovementTimestampMap.set(
      clientInfo["Codice Cliente"].toString(),
      latestMovementTimestamp
    );

    const totalRevenue = movements
      .reduce(
        (acc, movement) =>
          acc +
          movement.details.reduce(
            (sum, detail) => sum + parseFloat(detail.priceSold),
            0
          ),
        0
      )
      .toFixed(2);

    return {
      id: clientInfo["Codice Cliente"].toString(),
      name: clientInfo["Ragione Sociale Cliente"],
      extendedName: clientDetail ? clientDetail["RAGIONE SOCIALE AGG."] : "",
      province: clientDetail ? clientDetail["C.A.P. - COMUNE (PROV.)"] : "",
      phone: clientDetail ? clientDetail["TELEFONO"] : "",
      totalOrders: movementsMap.size,
      totalRevenue,
      unpaidRevenue: "",
      address: clientDetail ? clientDetail["INDIRIZZO"] : "",
      email: clientDetail ? clientDetail["EMAIL"] : "",
      pec: clientDetail ? clientDetail["EMAIL PEC"] : "",
      taxCode: clientDetail ? clientDetail["PARTITA IVA"] : "",
      extendedTaxCode: clientDetail ? clientDetail["CODICE FISCALE"] : "",
      paymentMethodID: clientDetail ? clientDetail["MP"] : "",
      paymentMethod: clientDetail
        ? clientDetail["Descizione metodo pagamento"]
        : "",
      agent: clientInfo["Codice Agente"].toString(),
      movements,
    };
  });

  // Sort clients by the most recent movement timestamp
  clients.sort((a, b) => {
    const timestampA = latestMovementTimestampMap.get(a.id) || 0;
    const timestampB = latestMovementTimestampMap.get(b.id) || 0;
    return timestampB - timestampA;
  });

  postMessage(clients);
};
