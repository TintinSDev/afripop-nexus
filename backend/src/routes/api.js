const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const paymentController = require("../controllers/payment.controller");

// AI Routes
router.post("/valuate", aiController.generateValuation);

// Payment Routes (Africa's Talking)
router.post("/pay-rent", paymentController.distributeDividends);
router.get('/stats', aiController.getMarketStats)
module.exports = router;
console.log("AI:", typeof aiController.generateValuation);
console.log("PAY:", typeof paymentController.distributeDividends);