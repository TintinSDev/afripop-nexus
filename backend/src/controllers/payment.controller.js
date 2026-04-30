// const prisma = require("../lib/prisma");
// const atService = require("../services/at.service");

// // 1. MONEY IN: Trigger Real M-Pesa STK Push
// exports.handlePurchase = async (req, res) => {
//   const { propertyId, amount, phoneNumber } = req.body;

//   console.log("💳 Initiating Real M-Pesa Payment:", {
//     propertyId,
//     amount,
//     phoneNumber,
//   });

//   try {
//     // A. Trigger Africa's Talking Mobile Checkout (STK Push)
//     // Ensure AT_PRODUCT_NAME in .env matches your LIVE Payment Product name
//     const result = await atService.payments.mobileCheckout({
//       productName: process.env.AT_PRODUCT_NAME,
//       phoneNumber: phoneNumber,
//       currencyCode: "KES",
//       amount: parseFloat(amount),
//       metadata: {
//         propertyId: propertyId.toString(),
//         phoneNumber: phoneNumber,
//       },
//     });

//     console.log("✅ STK Push Sent:", result);

//     // B. Create Transaction record as PENDING
//     // We do NOT create the Share yet. We wait for the callback!
//     const transaction = await prisma.transaction.create({
//       data: {
//         id: result.transactionId, // Use the real AT Transaction ID
//         propertyId: parseInt(propertyId),
//         amount: parseFloat(amount),
//         type: "FRACTIONAL_PURCHASE",
//         status: "PENDING",
//       },
//     });

//     res.status(200).json({
//       message: "M-Pesa prompt sent! Enter your PIN to complete investment.",
//       transactionId: transaction.id,
//     });
//   } catch (error) {
//     console.error("❌ M-Pesa Trigger Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // 2. THE CALLBACK: This is where the share is actually granted
// exports.handleCallback = async (req, res) => {
//   const data = req.body;
//   console.log("💰 M-Pesa Callback Received:", data);

//   try {
//     // 'Success' is the status string from Africa's Talking
//     if (data.status === "Success") {
//       const transactionId = data.transactionId;
//       const propertyId = parseInt(data.metadata.propertyId);
//       const phoneNumber = data.metadata.phoneNumber;

//       // A. Update Transaction to SUCCESS
//       const updatedTx = await prisma.transaction.update({
//         where: { id: transactionId },
//         data: { status: "SUCCESS" },
//       });

//       // B. Grant the Share now that money is confirmed
//       await prisma.share.create({
//         data: {
//           propertyId: propertyId,
//           ownerPhone: phoneNumber,
//           percentage: 1.0,
//         },
//       });

//       // C. Send real Confirmation SMS
//       try {
//         await atService.sms.send({
//           to: [phoneNumber],
//           message: `✅ Payment Confirmed! You now own 1% of Property ID: ${propertyId}. Welcome to the future of real estate!`,
//           // Note: Leave 'from' out if you don't have a registered Alphanumeric ID
//         });
//       } catch (smsErr) {
//         console.error("SMS Notification failed, but payment was successful.");
//       }

//       console.log(`🚀 Investment Finalized for ${phoneNumber}`);
//     } else {
//       console.log(`❌ Payment Failed/Cancelled: ${data.errorMessage}`);
//       // Optional: Update transaction status to FAILED in DB
//     }

//     res.sendStatus(200); // Tell AT we got the message
//   } catch (error) {
//     console.error("❌ Callback Processing Error:", error.message);
//     res.sendStatus(500);
//   }
// };
// exports.distributeDividends = async (req, res) => {
//   const { propertyId, totalRentCollected } = req.body;
//   try {
//     const owners = await prisma.share.findMany({
//       where: { propertyId: parseInt(propertyId) },
//     });

//     if (owners.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No owners found for this property" });
//     }

//     const dividends = owners.map((owner) => ({
//       phoneNumber: owner.ownerPhone,
//       amount: (totalRentCollected * (owner.percentage / 100)).toFixed(2),
//     }));

//     // In a real scenario, you'd loop through dividends and call atService.payments.mobileB2C
//     console.log("💰 Dividends to be distributed:", dividends);

//     res.status(200).json({
//       success: true,
//       message: "Dividends calculated successfully",
//       dividends,
//     });
//   } catch (error) {
//     console.error("❌ Dividend Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
const prisma = require("../lib/prisma");
const atService = require("../services/at.service");

console.log("💡 Running in DEMO MODE - No real payments processed");

// 1. MONEY IN: Handle users buying fractions
exports.handlePurchase = async (req, res) => {
  const { propertyId, amount, phoneNumber } = req.body;

  console.log("📥 Purchase Request:", { propertyId, amount, phoneNumber });

  try {
    const transactionId = `DEMO_${Date.now()}`;

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: parseInt(propertyId) },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        id: transactionId,
        propertyId: parseInt(propertyId),
        amount: parseFloat(amount),
        type: "FRACTIONAL_PURCHASE",
        status: "SUCCESS",
      },
    });

    // Create share record
    await prisma.share.create({
      data: {
        propertyId: parseInt(propertyId),
        ownerPhone: phoneNumber,
        percentage: 1.0,
      },
    });

    console.log("Demo investment recorded successfully");

    // Send SMS confirmation (THIS WORKS even in sandbox!)
    try {
      await atService.sms.send({
        to: [phoneNumber],
        message: `Investment Confirmed!\n\nProperty: ${property.title}\nAmount: KES ${amount}\nOwnership: 1%\nTransaction: ${transactionId}\n\nThank you for using AfriProp Nexus! (Demo Mode)`,
        from: process.env.AT_SMS_SENDER_ID, // Your sender ID
      });
      console.log(`📨 SMS sent to ${phoneNumber}`);
    } catch (smsError) {
      console.error("❌ SMS Error:", smsError.message);
      // Don't fail the whole request if SMS fails
    }

    res.status(200).json({
      message:
        "🎉 Investment Successful! Check your phone for SMS confirmation.",
      transactionId: transaction.id,
      details: {
        property: property.title,
        ownership: "1%",
        amount: `KES ${amount}`,
      },
      note: "Demo Mode: No real money charged. In production, M-Pesa prompt would appear.",
    });
  } catch (error) {
    console.error("❌ Purchase Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Rest of your code...
exports.distributeDividends = async (req, res) => {
  const { propertyId, totalRentCollected } = req.body;

  try {
    const owners = await prisma.share.findMany({
      where: { propertyId: parseInt(propertyId) },
    });

    if (owners.length === 0) {
      return res.status(404).json({ error: "No owners found" });
    }

    const dividends = owners.map((owner) => ({
      phoneNumber: owner.ownerPhone,
      amount: (totalRentCollected * (owner.percentage / 100)).toFixed(2),
    }));

    console.log("💰 Dividends calculated:", dividends);

    await prisma.transaction.create({
      data: {
        id: `DIV_${Date.now()}`,
        propertyId: parseInt(propertyId),
        amount: parseFloat(totalRentCollected),
        type: "DIVIDEND_PAYOUT",
        status: "SUCCESS",
      },
    });

    res.status(200).json({
      success: true,
      message: "Dividends calculated (Demo Mode)",
      dividends,
      note: "In production, this would trigger M-Pesa payouts",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleCallback = async (req, res) => {
  console.log("💰 Callback received:", req.body);
  res.sendStatus(200);
};
