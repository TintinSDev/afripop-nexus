const { OpenAI } = require("openai");
const prisma = require("../lib/prisma"); // Much cleaner!

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateValuation = async (req, res) => {
  const { title, location, description, squareFootage } = req.body;

  try {
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

    const aiData = JSON.parse(completion.choices[0].message.content);

    // Save to Postgres via Prisma
    const newProperty = await prisma.property.create({
      data: {
        title,
        location,
        description,
        totalValuation: aiData.totalValuation,
        pricePerFraction: aiData.pricePerOnePercent,
        growthPotential: aiData.growthScore,
      },
    });

    res.status(200).json(newProperty);
  } catch (error) {
    console.error(error);
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
