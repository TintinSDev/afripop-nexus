const atService = require("../services/at.service");
const prisma = require("../lib/prisma"); // Much cleaner!

exports.distributeDividends = async (req, res) => {
  const { propertyId, totalRentCollected } = req.body;

  try {
    // 1. Fetch fractional owners using PRISMA (matching your new schema)
    const owners = await prisma.share.findMany({
      where: { propertyId: parseInt(propertyId) },
    });

    if (owners.length === 0) {
      return res
        .status(404)
        .json({ error: "No owners found for this property" });
    }

    // 2. Prepare B2C recipients for Africa's Talking
    const recipients = owners.map((owner) => ({
      phoneNumber: owner.ownerPhone, // Matches 'ownerPhone' in your prisma schema
      currencyCode: "KES",
      amount: (totalRentCollected * (owner.percentage / 100)).toFixed(2),
      reason: "Property Dividend",
      metadata: { propertyId: propertyId.toString() },
    }));

    // 3. Execute Mobile Money Payout (B2C)
    const response = await atService.payments.mobileB2C({
      productName: process.env.AT_PRODUCT_NAME,
      recipients: recipients,
    });

    // 4. Log the payout in your Transaction table
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
