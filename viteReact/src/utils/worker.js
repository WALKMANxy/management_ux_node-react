onmessage = function (event) {
  const {
    data,
    clientDetails,
    visits = [],
    promos = [],
    alerts = [],
  } = event.data;

  //console.log("Worker received data:", visits, promos, alerts)

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

  const clients = Array.from(clientsMap.values()).map((clientData) => {
    const clientInfo = clientData[0];
    const clientDetail = clientDetailsMap.get(
      clientInfo["Codice Cliente"].toString()
    );

    // Aggregate movements by "Numero Lista"
    const movementsMap = clientData.reduce((map, item) => {
      const movementId = item["Numero Lista"].toString();
      map.has(movementId)
        ? map.get(movementId).push(item)
        : map.set(movementId, [item]);
      return map;
    }, new Map());

    const movements = Array.from(movementsMap.values()).map((movementData) => {
      const movementInfo = movementData[0];
      const details = movementData.map((item) => ({
        articleId: item["Codice Articolo"].toString(),
        name: item["Descrizione Articolo"],
        brand: item["Marca Articolo"],
        quantity: parseFloat(item["Quantita"]),
        unitPrice: parseFloat(item["Prezzo Articolo"]).toFixed(2),
        priceSold: parseFloat(item["Valore"]).toFixed(2),
        priceBought: parseFloat(item["Costo"]).toFixed(2),
      }));
      return {
        id: movementInfo["Numero Lista"].toString(),
        discountCategory: movementInfo["Categoria Sconto Vendita"],
        details,
        unpaidAmount: "",
        paymentDueDate: "",
        dateOfOrder: movementInfo["Data Documento Precedente"].split("T")[0],
      };
    });

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
      extendedName: clientDetail ? clientDetail["EXTENDED_NAME"] : "",
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
      visits: visits.filter(
        (visit) => visit.clientId === clientInfo["Codice Cliente"]
      ), // Filter relevant visits
      agent: clientInfo["Codice Agente"].toString(),
      movements,
      promos: promos.filter((promo) =>
        promo.clientsId.includes(clientInfo["Codice Cliente"])
      ), // Filter relevant promos
      clientAlerts: alerts.filter(
        (alert) =>
          alert.targetType === "client" &&
          alert.targetId === clientInfo["Codice Cliente"]
      ), //Filter relevant alerts
    };
  });

  postMessage(clients);
};
