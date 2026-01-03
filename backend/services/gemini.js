import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Estimate travel for a single leg
export async function estimateTrip(data) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a travel planning assistant. Estimate travel details for this trip leg.

From: ${data.from}
To: ${data.to}
Transport Mode: ${data.mode}
Stay Duration: ${data.days} days

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "travelTime": "estimated travel duration as string",
  "ticketCost": estimated cost as number in INR,
  "dailyStayCost": estimated daily accommodation cost as number in INR,
  "totalStayCost": total stay cost for all days as number in INR,
  "totalCost": total cost (ticket + stay) as number in INR,
  "budgetReasoning": "brief explanation of the estimates",
  "assumptions": ["assumption 1", "assumption 2"]
}
`;

  const generateResponse = async () => {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean up and parse JSON
    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  };

  try {
    return await retryWithBackoff(generateResponse, 3, 2000);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw new Error("Failed to get AI estimation: " + error.message);
  }
}

// Estimate entire itinerary with multiple stops
export async function estimateItinerary(tripName, stops) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Build stops description
  const stopsDescription = stops
    .map((stop, i) => `${i + 1}. ${stop.city} (${stop.stay_days} days, travel by ${stop.mode})`)
    .join("\n");

  const prompt = `
You are a travel planning assistant. Create a complete travel estimate for this multi-city trip in India.

Trip Name: ${tripName}
Itinerary:
${stopsDescription}

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "tripName": "${tripName}",
  "totalDays": total number of days,
  "totalEstimatedCost": total trip cost in INR as number,
  "legs": [
    {
      "from": "city name or Starting Point for first leg",
      "to": "destination city",
      "mode": "transport mode",
      "stayDays": number of days,
      "travelTime": "estimated travel time",
      "travelCost": estimated travel cost as number,
      "stayCost": accommodation cost as number,
      "legTotal": total for this leg as number
    }
  ],
  "summary": "brief trip summary",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
`;

  const generateResponse = async () => {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  };

  try {
    return await retryWithBackoff(generateResponse, 3, 2000);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw new Error("Failed to get AI estimation for itinerary: " + error.message);
  }
}
