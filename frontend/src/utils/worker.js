onmessage = function (event) {
  const { data, clientDetails, agentDetails } = event.data;

  const clientsMap = new Map();
  data.forEach((item) => {
    const clientId = item["Codice Cliente"].toString();
    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, []);
    }
    clientsMap.get(clientId).push(item);
  });

  const clients = Array.from(clientsMap.values()).map((clientData) => {
    const clientInfo = clientData[0];

    const clientDetail = clientDetails.find(
      (detail) => detail["CODICE"] === clientInfo["Codice Cliente"].toString()
    );

    const movementsMap = clientData.reduce((acc, item) => {
      const movementId = item["Numero Lista"].toString();
      if (!acc.has(movementId)) {
        acc.set(movementId, []);
      }
      acc.get(movementId).push(item);
      return acc;
    }, new Map());

    const movements = Array.from(movementsMap.values()).map((movementData) => {
      const movementInfo = movementData[0];
      return {
        id: movementInfo["Numero Lista"].toString(),
        discountCategory: movementInfo["Categoria Sconto Vendita"],
        details: movementData.map((item) => ({
          articleId: item["Codice Articolo"].toString(),
          name: item["Descrizione Articolo"],
          brand: item["Marca Articolo"],
          priceSold: parseFloat(item["Valore"]).toFixed(2),
          priceBought: parseFloat(item["Costo"]).toFixed(2),
        })),
        unpaidAmount: "",
        paymentDueDate: "",
        dateOfOrder: movementInfo["Data Documento Precedente"].split("T")[0],
      };
    });

    const totalRevenue = movements
      .reduce((acc, movement) => {
        return (
          acc +
          movement.details.reduce(
            (sum, detail) => sum + parseFloat(detail.priceSold),
            0
          )
        );
      }, 0)
      .toFixed(2);

    return {
      id: clientInfo["Codice Cliente"].toString(),
      name: clientInfo["Ragione Sociale Cliente"],
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
      visits: [],
      agent: clientInfo["Codice Agente"].toString(),
      movements,
      promos: [],
    };
  });

  postMessage(clients);
};
