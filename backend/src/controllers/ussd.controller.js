exports.handleUSSD = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  let response = "";

  if (text === "") {
    // Main Menu
    response = `CON Welcome to AfriProp Nexus
        1. View Top Property
        2. Check My Portfolio
        3. Buy 1% Share`;
  } else if (text === "1") {
    // Mock data for hackathon (In production, pull from Prisma)
    response = `END Top Property: Kilimani Heights
        Valuation: KES 45M
        Growth Score: 9.2/10`;
  } else if (text === "3") {
    response = `CON Enter Property ID to buy 1% share:`;
  } else if (text.startsWith("3*")) {
    response = `END Purchase initiated! You will receive a Mobile Money prompt shortly.`;
    // Trigger AT Payment logic here
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
};
