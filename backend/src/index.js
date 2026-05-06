const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 1. Import Routes and Controllers
const apiRoutes = require("./routes/api");
const ussdController = require("./controllers/ussd.controller"); // MUST IMPORT THIS

const app = express();

// 2. Middleware
// src/index.js (or your main server file)
app.use(
  cors({
    origin: [
      "https://nexus1-virid.vercel.app",
      "http://localhost:3000",
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Secure for your Next.js app
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3. Health Check
app.get("/", (req, res) => {
  res.send("AfriProp Nexus API is running... 🚀");
});

// 4. Routes
app.use("/api", apiRoutes);

// Africa's Talking USSD endpoint (usually separate from /api)
app.post("/ussd", ussdController.handleUSSD);

// 5. Start Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5100;
  app.listen(PORT, () => {
    console.log(`🚀 Nexus Backend running on port ${PORT}`);
  });
}

// FOR VERCEL
module.exports = app;
