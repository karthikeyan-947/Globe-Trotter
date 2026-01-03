import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing Gemini API...");
console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = "Reply with just the word 'OK' if you can receive this message.";

        console.log("Sending test request...");
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log("SUCCESS! Response:", response);
    } catch (error) {
        console.error("\n=== GEMINI API ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
    }
}

testGemini();
