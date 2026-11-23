// PAYMENT DETAILS — UPDATE BEFORE GOING LIVE
// The payment page (public/app.js, `accounts` object) shows these placeholders:
//   JazzCash:    account title + number — replace with the real JazzCash details
//   Easypaisa:   account title + number — replace with the real Easypaisa details
//   Bank:        bank name, account title, account number / IBAN — replace with real details
// Until you replace them, the payment page clearly labels them
// "UPDATE IN config.js / .env — replace with real account details before going live".
// Admin token: set ADMIN_TOKEN in .env (default: agenticmyze-admin).
module.exports = {
  jazzcash: { title: 'UPDATE — Replace with real JazzCash account title', number: 'UPDATE — Replace with real JazzCash number' },
  easypaisa: { title: 'UPDATE — Replace with real Easypaisa account title', number: 'UPDATE — Replace with real Easypaisa number' },
  bank: { bank: 'UPDATE — Replace with real bank name', title: 'UPDATE — Replace with real account title', account: 'UPDATE — Replace with real account number / IBAN' },
};
