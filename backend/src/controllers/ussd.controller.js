const prisma = require("../lib/prisma");
const atService = require("../services/at.service");

exports.handleUSSD = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";
  const input = text.split("*"); // Split USSD input by *

  try {
    if (text === "") {
      // Main Menu
      response = `CON Welcome to AfriProp Nexus
1. View Top Property
2. Buy 1% Share`;
    } else if (text === "1") {
      // Pull latest property from Postgres
      const topProp = await prisma.property.findFirst({
        orderBy: { id: "desc" },
      });

      if (topProp) {
        response = `END Top Property: ${topProp.title}
Valuation: KES ${(topProp.totalValuation / 1000000).toFixed(1)}M
ID: ${topProp.id} (Use this to buy)`;
      } else {
        response = `END No properties listed yet. Use the web app first!`;
      }
    } else if (text === "2") {
      response = `CON Enter Property ID to buy 1%:`;
    } else if (input[0] === "2" && input.length === 2) {
      const propId = parseInt(input[1]);

      const property = await prisma.property.findUnique({
        where: { id: propId },
      });

      if (property) {
        // Trigger the STK Push via AT
        await atService.payments.mobileCheckout({
          productName: process.env.AT_PRODUCT_NAME,
          phoneNumber: phoneNumber,
          currencyCode: "KES",
          amount: parseFloat(property.pricePerFraction),
          metadata: { propertyId: propId.toString() },
        });

        response = `END Request sent for ${property.title}.
Check your phone for the M-Pesa prompt!`;
      } else {
        response = `END Invalid Property ID: ${input[1]}`;
      }
    }
  } catch (error) {
    console.error("USSD Error:", error);
    response = `END Technical error. Try again later.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
};
