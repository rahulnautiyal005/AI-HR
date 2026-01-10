
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Candidate, Job } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY || import.meta.env.VITE_API_KEY; // Support both Vite and Node envs
  if (!apiKey) {
    console.error("API_KEY is missing via process.env.API_KEY");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Resume Parsing
export const parseResumeAI = async (text: string): Promise<Partial<Candidate>> => {
  const ai = getAI();
  
  // Truncate text to avoid token limits (approx 15k chars is ~3-4k tokens, safe for Flash)
  const truncatedText = text.slice(0, 20000); 

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      email: { type: Type.STRING },
      phone: { type: Type.STRING },
      skills: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      experienceYears: { type: Type.NUMBER },
      summary: { type: Type.STRING },
    },
    required: ["name", "email", "skills", "experienceYears", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract candidate information from the following resume text. 
      If specific fields are missing, infer reasonable defaults or leave empty.
      
      RESUME TEXT:
      ${truncatedText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Parse Error:", error);
    // Fallback for demo if API fails
    return {
      name: "Unknown Candidate",
      email: "unknown@example.com",
      skills: [],
      experienceYears: 0,
      summary: "Failed to parse resume."
    };
  }
};

// 2. Candidate Ranking
export const rankCandidateAI = async (candidate: Partial<Candidate>, job: Job): Promise<{ score: number; reasoning: string }> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "A score from 0 to 100 indicating fit." },
      reasoning: { type: Type.STRING, description: "A one sentence explanation of the score." }
    },
    required: ["score", "reasoning"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Use Pro for better reasoning
      contents: `Evaluate the candidate against the job description.
      
      JOB TITLE: ${job.title}
      JOB REQUIREMENTS: ${job.requirements.join(", ")}
      JOB DESCRIPTION: ${job.description}
      
      CANDIDATE SKILLS: ${candidate.skills?.join(", ")}
      CANDIDATE EXPERIENCE: ${candidate.experienceYears} years
      CANDIDATE SUMMARY: ${candidate.summary}
      
      Provide a match score (0-100) and a concise reasoning string.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return { score: 0, reasoning: "AI evaluation failed." };
  } catch (error) {
    console.error("Ranking Error:", error);
    return { score: 50, reasoning: "AI service unavailable." };
  }
};

// 3. HR Chatbot
export const chatWithHR = async (history: {role: string, parts: {text: string}[]}[], message: string, context?: string) => {
  const ai = getAI();
  try {
    const systemInstruction = context 
        ? `You are a helpful HR Assistant for TalentAI. You answer questions about candidates, interview scheduling, and company policies. \n\nCONTEXT:\n${context}` 
        : "You are a helpful HR Assistant for TalentAI. You answer questions about candidates, interview scheduling, and company policies. Keep answers professional and concise.";

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the HR database right now.";
  }
};

// 4. Generate Offer Letter Content
export const generateOfferLetterAI = async (candidateName: string, jobTitle: string, date: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Write a professional job offer letter for ${candidateName} for the position of ${jobTitle}. Date: ${date}. 
            Include placeholders for salary and start date. Keep it warm and professional. Return raw text.`
        });
        return response.text || "Could not generate offer letter.";
    } catch (e) {
        return "Error generating offer letter.";
    }
}
