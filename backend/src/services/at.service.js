const AfricasTalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

module.exports = {
  sms: AfricasTalking.SMS,
  // The SDK uses plural PAYMENTS. Let's map both to be safe.
  payments: AfricasTalking.PAYMENTS,
  airtime: AfricasTalking.AIRTIME,
  ussd: AfricasTalking.USSD,
  // Keep these for existing code compatibility
  SMS: AfricasTalking.SMS,
  PAYMENTS: AfricasTalking.PAYMENTS,
};

// const AfricasTalking = require("africastalking")({
//   apiKey: process.env.AT_API_KEY,
//   username: process.env.AT_USERNAME, // Ensure this is your LIVE username, NOT 'sandbox'
// });

// // Log this once during startup to verify
// const payments =
//   AfricasTalking.PAYMENTS || AfricasTalking.PAYMENT || AfricasTalking.payments;

// console.log("💳 Payment Service Status:", payments ? "READY" : "NOT FOUND");

// module.exports = {
//   sms: AfricasTalking.SMS,
//   ussd: AfricasTalking.USSD,
//   payments: payments, // This must be defined for your controller to work
// };
