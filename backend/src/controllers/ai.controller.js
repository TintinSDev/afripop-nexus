const { OpenAI } = require("openai");
const prisma = require("../lib/prisma"); // Much cleaner!
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

exports.generateValuation = async (req, res) => {
  const { title, location, description, squareFootage } = req.body;

  try {
    let aiData;

    if (openai) {
      // --- REAL AI PATH ---
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a Kenyan Real Estate AI. Output ONLY JSON.",
          },
          {
            role: "user",
            content: `Valuate this property: ${title} in ${location}. Details: ${description}, Size: ${squareFootage}sqft. 
                      Provide: totalValuation(KES), pricePerOnePercent(KES), and growthScore(1-10).`,
          },
        ],
        response_format: { type: "json_object" },
      });
      aiData = JSON.parse(completion.choices[0].message.content);
    } else {
      // --- MOCK PATH (For Demo without Key) ---
      console.log("⚠️ No OpenAI Key found. Using Mock Logic for demo.");
      const baseValue = Math.floor(
        Math.random() * (45000000 - 15000000) + 15000000,
      );
      aiData = {
        totalValuation: baseValue,
        pricePerOnePercent: baseValue / 100,
        growthScore: (Math.random() * (9.5 - 7.0) + 7.0).toFixed(1),
      };
    }

    // Save to Postgres (This part remains exactly the same)
    const newProperty = await prisma.property.create({
      data: {
        title,
        location,
        description,
        totalValuation: aiData.totalValuation,
        pricePerFraction: aiData.pricePerOnePercent || aiData.pricePerFraction,
        growthPotential: parseFloat(aiData.growthScore),
      },
    });

    res.status(200).json(newProperty);
  } catch (error) {
    console.error("Valuation Error:", error);
    res.status(500).json({ error: "AI Valuation failed" });
  }
};
exports.getMarketStats = async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    const totalValue = properties.reduce(
      (acc, curr) => acc + curr.totalValuation,
      0,
    );

    res.json({
      totalValuation: totalValue,
      investorCount: 1432, // Hardcoded for demo or count Share records
      avgYield: "8.4%",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
