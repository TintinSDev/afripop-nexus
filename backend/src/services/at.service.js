const AfricasTalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

// Export the actual SDK clients
module.exports = {
  sms: AfricasTalking.SMS,
  payments: AfricasTalking.PAYMENTS, // Uppercase
  airtime: AfricasTalking.AIRTIME,
  ussd: AfricasTalking.USSD,
};
