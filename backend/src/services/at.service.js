const AfricasTalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME, // Usually 'sandbox' for testing
});

const atService = {
  sms: AfricasTalking.SMS,
  payments: AfricasTalking.PAYMENTS,
  airtime: AfricasTalking.AIRTIME,
  ussd: AfricasTalking.USSD,
};

module.exports = atService;
