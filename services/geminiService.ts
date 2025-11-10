
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Analyzes a plant image for diseases.
 * @param base64Image A base64 encoded string of the plant image.
 * @returns A text description of the diagnosis and suggested treatments.
 */
export const diagnosePlant = async (base64Image: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };
        const textPart = {
            text: "Please analyze this image of a plant. Identify any diseases, pests, or nutrient deficiencies. Provide a concise diagnosis and suggest both organic and chemical treatment options. Format the response clearly with headings for Diagnosis, Organic Treatments, and Chemical Treatments."
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error in diagnosePlant:", error);
        return "An error occurred while analyzing the image. Please ensure your API key is configured correctly.";
    }
};

/**
 * Generates AI-powered advice based on a prompt.
 * @param prompt The prompt to send to the model.
 * @returns The model's text response.
 */
const getAIGeneratedText = async (prompt: string): Promise<string> => {
     try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI text:", error);
        return "An error occurred while fetching AI insights. Please ensure your API key is configured correctly.";
    }
};

export const predictYield = (historicalData: string) => 
    getAIGeneratedText(`Based on the following historical farm data, predict the yield for the upcoming season for each crop. Provide a quantitative prediction (e.g., in tons per acre) and a brief explanation for your reasoning. Data: ${historicalData}`);

export const getPlantingAdvice = (crop: string, location: string, soilType: string) => 
    getAIGeneratedText(`I want to plant ${crop} in ${location} with ${soilType} soil. Provide an optimal planting schedule, key considerations for soil preparation, and recommendations for initial fertilization. Structure the response with clear headings.`);

export const summarizeRecords = (records: string) => 
    getAIGeneratedText(`Summarize the following farm operational records into a concise report. The report should cover: 1. Key activities performed. 2. Total expenses and a breakdown by category. 3. Potential areas for improvement or concern. Data: ${records}`);
