onmessage = function (event) {
  const { data, clientDetailsMap } = event.data;

  // Convert clientDetailsMap object back into a Map for faster lookup
  const clientDetailsLookup = new Map(Object.entries(clientDetailsMap));

  const clientsMap = new Map(); // Map from clientId to client object

  for (const item of data) {
    const clientId = item["Codice Cliente"].toString();
    let client = clientsMap.get(clientId);

    if (!client) {
      const clientDetail = clientDetailsLookup.get(clientId);
      client = {
        id: clientId,
        name: item["Ragione Sociale Cliente"],
        extendedName: clientDetail ? clientDetail["RAGIONE SOCIALE AGG"] : "",
        province: clientDetail ? clientDetail["CAP"] : "",
        phone: clientDetail ? clientDetail["TELEFONO"] : "",
        totalOrders: 0,
        totalRevenue: 0,
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
        agent: item["Codice Agente"].toString(),
        movementsMap: new Map(), // Map from movementId to movement object
        latestMovementTimestamp: 0, // Track the latest timestamp for sorting
      };
      clientsMap.set(clientId, client);
    }

    const movementId = item["Numero Lista"].toString();
    let movement = client.movementsMap.get(movementId);

    if (!movement) {
      movement = {
        id: movementId,
        discountCategory: "",
        details: [],
        unpaidAmount: "",
        paymentDueDate: "",
        dateOfOrder: "", // to be set later
        movementTimestamp: 0, // to be updated
      };
      client.movementsMap.set(movementId, movement);
      client.totalOrders += 1; // Increment total orders
    }

    // Build detail
    const detail = {
      articleId: item["Codice Articolo"].toString(),
      name: item["Descrizione Articolo"],
      brand: item["Marca Articolo"],
      quantity: parseFloat(item["Quantita"]) || 0,
      unitPrice: (parseFloat(item["Prezzo Articolo"]) || 0).toFixed(2),
      priceSold: (parseFloat(item["Valore"]) || 0).toFixed(2),
      priceBought: (parseFloat(item["Costo"]) || 0).toFixed(2),
    };
    movement.details.push(detail);

    // Update movementTimestamp
    const movementTimestamp = new Date(
      item["Data Documento Precedente"]
    ).getTime();
    if (!isNaN(movementTimestamp)) {
      if (movementTimestamp > movement.movementTimestamp) {
        movement.movementTimestamp = movementTimestamp;
        movement.dateOfOrder = new Date(movementTimestamp)
          .toISOString()
          .split("T")[0];
      }
      if (movementTimestamp > client.latestMovementTimestamp) {
        client.latestMovementTimestamp = movementTimestamp;
      }
    } else {
      console.error("Invalid date:", item["Data Documento Precedente"]);
    }

    // Update totalRevenue
    client.totalRevenue += parseFloat(detail.priceSold) || 0;
  }

  // Convert clientsMap to an array and process movements
  const clients = [];
  for (const client of clientsMap.values()) {
    const movements = [];
    for (const movement of client.movementsMap.values()) {
      // Remove movementTimestamp from movement if not needed
      delete movement.movementTimestamp;
      movements.push(movement);
    }
    // Assign movements array to client
    client.movements = movements;
    delete client.movementsMap;

    // Round totalRevenue to 2 decimal places
    client.totalRevenue = client.totalRevenue.toFixed(2);

    clients.push(client);
  }

  // Sort clients by the most recent movement timestamp
  clients.sort((a, b) => b.latestMovementTimestamp - a.latestMovementTimestamp);

  // Remove latestMovementTimestamp from clients if not needed
  for (const client of clients) {
    delete client.latestMovementTimestamp;
  }

  postMessage(clients);
};
