const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const aiController = require("../controllers/ai.controller");
const paymentController = require("../controllers/payment.controller");
const ussdController = require("../controllers/ussd.controller");
console.log("🔍 Controller Check:", {
  purchase: typeof paymentController.handlePurchase,
  callback: typeof paymentController.handleCallback,
  dividends: typeof paymentController.distributeDividends, // Check this one!
});
// This matches the '/api/ussd' we put in the Ngrok URL
router.post("/ussd", ussdController.handleUSSD);
// AI Routes
router.post("/valuate", aiController.generateValuation);
router.post("/buy-fraction", paymentController.handlePurchase);
// Payment Routes (Africa's Talking)
router.post("/pay-rent", paymentController.distributeDividends);
router.get("/stats", aiController.getMarketStats);

router.post("/payment-callback", paymentController.handleCallback);
// In your api.js routes file
router.get("/test-at", async (req, res) => {
  try {
    console.log("AT Service:", atService);
    console.log("Payments:", atService.payments);
    res.json({
      hasPayments: !!atService.payments,
      paymentsMethods: Object.keys(atService.payments || {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// In src/routes/api.js
router.get("/properties", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shares: true, // Include shares to show ownership
        _count: {
          select: { shares: true },
        },
      },
    });

    res.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
console.log("AI:", typeof aiController.generateValuation);
console.log("PAY:", typeof paymentController.distributeDividends);
