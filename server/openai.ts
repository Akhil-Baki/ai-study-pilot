import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational planner. Create a detailed study plan based on the syllabus content, exam dates, and user preferences. Break down the material into logical study sessions with specific topics, durations, and dates.",
        },
        {
          role: "user",
          content: `Generate a study plan with the following information:
          
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
      "duration": 60 // minutes
    }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing and structuring educational content. Extract key information from a syllabus into a structured format.",
        },
        {
          role: "user",
          content: `Extract the following information from this syllabus content:

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
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            `You are an educational content summarizer. Create concise summaries that retain key information and concepts. Format as ${format === "bullet_points" ? "bullet points" : "short paragraphs"}.`,
        },
        {
          role: "user",
          content: `Summarize the following educational content:

${content}

Format as ${format === "bullet_points" ? "bullet points" : "short paragraphs"}.`,
        },
      ],
    });

    return response.choices[0].message.content || "No summary generated";
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
    const messages = [
      {
        role: "system",
        content:
          `You are an educational AI Tutor specializing in answering student questions on academic subjects. 
          Provide helpful, clear explanations that help the student understand concepts deeply.
          ${referenceContent ? "Use the provided reference content to provide context-aware answers." : ""}`,
      },
      // Include previous conversation for context
      ...previousMessages.map(msg => ({
        role: msg.isUserMessage ? "user" as const : "assistant" as const,
        content: msg.content
      })),
      {
        role: "user" as const,
        content: question
      }
    ];

    if (referenceContent) {
      messages.splice(1, 0, {
        role: "system" as const,
        content: `Reference content: ${referenceContent}`
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return response.choices[0].message.content || "I don't have an answer for that question.";
  } catch (error) {
    console.error("Error getting AI tutor response:", error);
    throw new Error("Failed to get a response from the AI tutor: " + (error as Error).message);
  }
}
