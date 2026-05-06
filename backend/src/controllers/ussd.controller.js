// const prisma = require("../lib/prisma");
// const atService = require("../services/at.service");

// exports.handleUSSD = async (req, res) => {
//   const { sessionId, serviceCode, phoneNumber, text } = req.body;
//   let response = "";
//   const input = text.split("*"); // Split USSD input by *

//   try {
//     if (text === "") {
//       // Main Menu
//       response = `CON Welcome to AfriProp Nexus
// 1. View Top Property
// 2. Buy 1% Share`;
//     } else if (text === "1") {
//       // Pull latest property from Postgres
//       const topProp = await prisma.property.findFirst({
//         orderBy: { id: "desc" },
//       });

//       if (topProp) {
//         response = `END Top Property: ${topProp.title}
// Valuation: KES ${(topProp.totalValuation / 1000000).toFixed(1)}M
// ID: ${topProp.id} (Use this to buy)`;
//       } else {
//         response = `END No properties listed yet. Use the web app first!`;
//       }
//     } else if (text === "2") {
//       response = `CON Enter Property ID to buy 1%:`;
//     } else if (input[0] === "2" && input.length === 2) {
//       const propId = parseInt(input[1]);
//       if (isNaN(propId)) {
//         return res.send("END Please enter a valid numeric Property ID.");
//       }

//       const property = await prisma.property.findUnique({
//         where: { id: propId },
//       });

//       if (property) {
//         // Trigger the STK Push via AT
//         await atService.payments.mobileCheckout({
//           productName: process.env.AT_PRODUCT_NAME,
//           phoneNumber: phoneNumber,
//           currencyCode: "KES",
//           amount: parseFloat(property.pricePerFraction),
//           metadata: { propertyId: propId.toString() },
//         });

//         response = `END Request sent for ${property.title}.
// Check your phone for the M-Pesa prompt!`;
//       } else {
//         response = `END Invalid Property ID: ${input[1]}`;
//       }
//     }
//   } catch (error) {
//     console.error("USSD Error:", error);
//     response = `END Technical error. Try again later.`;
//   }

//   res.set("Content-Type", "text/plain");
//   res.send(response);
// };

const prisma = require("../lib/prisma");
const atService = require("../services/at.service"); // Import the AT service

exports.handleUSSD = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";
  const input = text.split("*");

  try {
    // 1. MAIN MENU
    if (text === "") {
      response = `CON Welcome to AfriProp Nexus
1. Browse Properties
2. View My Portfolio
3. Exit`;
    }

    // 2. EXIT OPTION
    else if (text === "3") {
      response = `END Thank you for using AfriProp Nexus.
Invest in African Real Estate today!`;
    }

    // 3. LIST PROPERTIES
    else if (text === "1") {
      const properties = await prisma.property.findMany({
        take: 5,
        orderBy: { id: "desc" },
      });

      if (properties.length > 0) {
        response = `CON Select a property to invest:\n`;
        properties.forEach((prop, index) => {
          response += `${index + 1}. ${prop.title}\n`;
        });
      } else {
        response = `END No properties available for investment yet.`;
      }
    }

    // 4. PROPERTY DETAILS & PURCHASE
    else if (text.startsWith("1*")) {
      const properties = await prisma.property.findMany({
        take: 5,
        orderBy: { id: "desc" },
      });

      const selectionIndex = parseInt(input[1]) - 1;
      const selectedProp = properties[selectionIndex];

      if (!selectedProp) {
        response = `END Invalid selection.`;
      } else if (input.length === 2) {
        response = `CON ${selectedProp.title}
Valuation: KES ${(selectedProp.totalValuation / 1000000).toFixed(1)}M
Share Price: KES ${selectedProp.pricePerFraction}
1. Confirm 1% Purchase
0. Back`;
      } else if (input.length === 3 && input[2] === "1") {
        const txId = `USSD_${Date.now()}`;

        // A. Create DB Records
        await prisma.transaction.create({
          data: {
            id: txId,
            propertyId: selectedProp.id,
            amount: parseFloat(selectedProp.pricePerFraction),
            type: "FRACTIONAL_PURCHASE",
            status: "SUCCESS",
          },
        });

        await prisma.share.create({
          data: {
            propertyId: selectedProp.id,
            ownerPhone: phoneNumber,
            percentage: 1.0,
          },
        });

        // B. SEND CONFIRMATION SMS (The "Real" Touch)
        try {
          await atService.sms.send({
            to: [phoneNumber],
            message: `✅ Investment Successful!\n\nYou have purchased 1% of ${selectedProp.title}.\nTransaction ID: ${txId}\n\nView your certificate on the AfriProp dashboard.`,
            // from: process.env.AT_SMS_SENDER_ID // Uncomment if you have a registered Shortcode
          });
          console.log(`📨 Confirmation SMS sent to ${phoneNumber}`);
        } catch (smsErr) {
          console.error(
            "❌ SMS failed to send, but DB was updated:",
            smsErr.message,
          );
        }

        response = `END Success! You bought 1% of ${selectedProp.title}.
Check your phone for a confirmation SMS!`;
      }
    }

    // 5. VIEW PORTFOLIO
    else if (text === "2") {
      const shares = await prisma.share.findMany({
        where: { ownerPhone: phoneNumber },
        include: { property: true },
      });

      if (shares.length > 0) {
        response = `END Your Portfolio:\n`;
        shares.forEach((s) => {
          response += `- ${s.property.title}: ${s.percentage}%\n`;
        });
      } else {
        response = `END You haven't invested in any properties yet.`;
      }
    }
  } catch (error) {
    console.error("USSD Error:", error);
    response = `END Technical error. Please try again.`;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
};
