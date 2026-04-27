const atService = require("../services/at.service");
const prisma = require("../lib/prisma");

// 1. MONEY IN: Handle users buying fractions via M-Pesa (STK Push)
exports.handlePurchase = async (req, res) => {
  const { propertyId, amount, phoneNumber } = req.body;

  console.log("📥 Purchase Request:", { propertyId, amount, phoneNumber });

  try {
    // Trigger Africa's Talking STK Push (C2B)
    const result = await atService.payments.mobileCheckout({
      productName: process.env.AT_PRODUCT_NAME,
      phoneNumber: phoneNumber,
      currencyCode: "KES",
      amount: parseFloat(amount),
      metadata: { propertyId: propertyId.toString() },
    });

    console.log("💳 AT Response:", result);

    // Create the Transaction record
    const transaction = await prisma.transaction.create({
      data: {
        id: result.transactionId || `TX_${Date.now()}`,
        propertyId: parseInt(propertyId),
        amount: parseFloat(amount),
        type: "FRACTIONAL_PURCHASE",
        status: "PENDING",
      },
    });

    // Create share record (will be confirmed via callback)
    await prisma.share.create({
      data: {
        propertyId: parseInt(propertyId),
        ownerPhone: phoneNumber,
        percentage: 1.0,
      },
    });

    res.status(200).json({
      message: "Check your phone for M-Pesa prompt!",
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error("❌ Purchase Error:", error);
    res.status(500).json({ error: error.message });
  }
};
// 2. MONEY OUT: Handle automated payouts to shareholders (B2C)
exports.distributeDividends = async (req, res) => {
  const { propertyId, totalRentCollected } = req.body;

  try {
    const owners = await prisma.share.findMany({
      where: { propertyId: parseInt(propertyId) },
    });

    if (owners.length === 0) {
      return res
        .status(404)
        .json({ error: "No owners found for this property" });
    }

    const recipients = owners.map((owner) => ({
      phoneNumber: owner.ownerPhone,
      currencyCode: "KES",
      amount: (totalRentCollected * (owner.percentage / 100)).toFixed(2),
      reason: "Property Dividend",
      metadata: { propertyId: propertyId.toString() },
    }));

    const response = await atService.payments.mobileB2C({
      productName: process.env.AT_PRODUCT_NAME,
      recipients: recipients,
    });

    await prisma.transaction.create({
      data: {
        id: `DIV_${Date.now()}`,
        propertyId: parseInt(propertyId),
        amount: parseFloat(totalRentCollected),
        type: "DIVIDEND_PAYOUT",
        status: "SUCCESS",
      },
    });

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleCallback = async (req, res) => {
  const data = req.body;
  console.log("💰 Payment Notification Received:", data);

  try {
    // 1. Check if the transaction was successful
    if (data.status === "Success") {
      const transactionId = data.transactionId;
      const phoneNumber = data.source; // The user's phone

      // 2. Update the Transaction in your DB
      const updatedTx = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "SUCCESS" },
      });

      // 3. Since we know it's a success, we ensure the Share is recorded
      // We use upsert to avoid duplicates if we already created it in the 'Buy' step
      await prisma.share.upsert({
        where: {
          propertyId_ownerPhone: {
            // Note: This requires a unique constraint in your schema
            propertyId: updatedTx.propertyId,
            ownerPhone: phoneNumber,
          },
        },
        update: {
          percentage: { increment: 1 }, // Adding 1% share
        },
        create: {
          propertyId: updatedTx.propertyId,
          ownerPhone: phoneNumber,
          percentage: 1,
        },
      });

      console.log(`✅ Portfolio updated for ${phoneNumber}`);
    }

    // Africa's Talking expects a 200 OK response
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Callback Error:", error.message);
    res.sendStatus(500);
  }
};
