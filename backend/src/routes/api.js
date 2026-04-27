const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const paymentController = require("../controllers/payment.controller");
const ussdController = require("../controllers/ussd.controller");

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

module.exports = router;
console.log("AI:", typeof aiController.generateValuation);
console.log("PAY:", typeof paymentController.distributeDividends);
