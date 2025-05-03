import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAMeCrlrqRymjkzbOVd5tIndeO02vBUNvA");

// Safety settings to ensure appropriate content generation
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// A utility function to safely parse JSON from AI response
async function safelyParseJSON(text: string) {
  try {
    // First try a direct parse
    return JSON.parse(text);
  } catch (directParseError) {
    console.log("Direct parsing failed, trying to extract JSON...");
    
    // Try to extract a JSON object from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    
    // Clean up the JSON string
    let jsonString = jsonMatch[0];
    
    // Remove any trailing commas in arrays and objects which are invalid in JSON
    jsonString = jsonString
      .replace(/,\s*}/g, '}')    // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']')   // Remove trailing commas in arrays
      .replace(/\]\s*\[/g, '],['); // Fix adjacent arrays
    
    console.log("Cleaned JSON string:", jsonString);
    
    // Try parsing again
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("JSON parsing error after cleaning:", error);
      throw error;
    }
  }
}

/**
 * Generates a study plan based on syllabus content and user preferences
 */
export async function generateStudyPlan(
  syllabusContent: string,
  examDates: string[] = [],
  userPreferences: { 
    startDate: string;
    endDate: string;
    hoursPerDay?: number;
    preferredStudyTimes?: string[];
    excludedDays?: string[];
  }
): Promise<{
  title: string;
  description: string;
  sessions: {
    title: string;
    description: string;
    date: string;
    duration: number;
  }[];
}> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    });
    
    const prompt = `Generate a study plan with the following information:
    
Syllabus Content: ${syllabusContent}

Exam Dates: ${examDates.join(", ") || "None provided"}

User Preferences:
- Start Date: ${userPreferences.startDate}
- End Date: ${userPreferences.endDate}
- Hours Per Day: ${userPreferences.hoursPerDay || "Flexible"}
- Preferred Study Times: ${userPreferences.preferredStudyTimes?.join(", ") || "Not specified"}
- Excluded Days: ${userPreferences.excludedDays?.join(", ") || "None"}

Please respond with a JSON object with the following structure:
{
  "title": "Title of the study plan",
  "description": "Brief description of the plan",
  "sessions": [
    {
      "title": "Session title",
      "description": "What will be studied",
      "date": "YYYY-MM-DD",
      "duration": 60
    }
  ]
}

Important: Format your entire response as valid JSON with no extra text before or after it.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw AI response:", text);
    
    try {
      // Try to parse the JSON response
      return await safelyParseJSON(text);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      
      // Fallback to a minimal valid structure
      return {
        title: "Study Plan",
        description: "Generated study plan based on your syllabus",
        sessions: [
          {
            title: "Review Session",
            description: "Review key topics from syllabus",
            date: new Date().toISOString().split('T')[0],
            duration: 60
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan: " + (error as Error).message);
  }
}

/**
 * Parses a syllabus PDF content into structured data
 */
export async function parseSyllabus(content: string): Promise<{
  courseName: string;
  instructor: string;
  topics: { name: string; description: string }[];
  examDates: { name: string; date: string }[];
}> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    });
    
    const prompt = `Extract the following information from this syllabus content:

${content}

Please respond with a JSON object with the following structure:
{
  "courseName": "Name of the course",
  "instructor": "Name of the instructor",
  "topics": [
    {
      "name": "Topic name",
      "description": "Topic description"
    }
  ],
  "examDates": [
    {
      "name": "Exam name",
      "date": "YYYY-MM-DD"
    }
  ]
}

Important: Format your entire response as valid JSON with no extra text before or after it.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw AI response for syllabus parsing:", text.substring(0, 200) + "...");
    
    try {
      // Try to parse the JSON response
      return await safelyParseJSON(text);
    } catch (error) {
      console.error("Error parsing syllabus JSON:", error);
      
      // Fallback to a minimal valid structure
      return {
        courseName: "Untitled Course",
        instructor: "Unknown",
        topics: [{ name: "General Topics", description: "Extracted from syllabus" }],
        examDates: []
      };
    }
  } catch (error) {
    console.error("Error parsing syllabus:", error);
    throw new Error("Failed to parse syllabus: " + (error as Error).message);
  }
}

/**
 * Summarizes content into bullet points or paragraphs
 */
export async function summarizeContent(
  content: string,
  format: "bullet_points" | "paragraphs" = "bullet_points"
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Summarize the following educational content:

${content}

Format as ${format === "bullet_points" ? "bullet points" : "short paragraphs"}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error summarizing content:", error);
    throw new Error("Failed to summarize content: " + (error as Error).message);
  }
}

/**
 * Gets answer from AI tutor
 */
export async function getAITutorResponse(
  question: string,
  previousMessages: { content: string; isUserMessage: boolean }[] = [],
  referenceContent?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Start a chat
    const chat = model.startChat({
      safetySettings,
      history: previousMessages.map(msg => ({
        role: msg.isUserMessage ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });
    
    // Prepare the prompt with context if available
    let prompt = question;
    if (referenceContent) {
      prompt = `Reference content: ${referenceContent}\n\nQuestion: ${question}`;
    }
    
    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting AI tutor response:", error);
    throw new Error("Failed to get a response from the AI tutor: " + (error as Error).message);
  }
}