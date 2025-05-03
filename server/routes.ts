import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertTaskSchema, insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { 
  generateStudyPlan, 
  parseSyllabus, 
  summarizeContent, 
  getAITutorResponse 
} from "./gemini";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = req.user.id;
    const tasks = await storage.getTasksByUserId(userId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const taskData = { ...req.body, userId };
      const validatedData = insertTaskSchema.parse(taskData);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error: (error as Error).message });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error: (error as Error).message });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task", error: (error as Error).message });
    }
  });

  // Syllabus uploader routes
  app.post("/api/syllabi/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Check if it's a PDF file
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF files are supported" });
      }

      // Parse PDF file
      const pdfData = await pdfParse(req.file.buffer);
      const text = pdfData.text;

      // Extract title from original filename
      const title = req.file.originalname.replace(/\.pdf$/, "");

      // Parse syllabus with Gemini
      const parsedContent = await parseSyllabus(text);

      // Store in database
      const syllabus = await storage.createSyllabus({
        userId: req.user.id,
        title,
        content: text,
        courseName: parsedContent.courseName,
        parsedContent
      });

      res.status(201).json({
        id: syllabus.id,
        title: syllabus.title,
        courseName: syllabus.courseName,
        parsedContent: syllabus.parsedContent
      });
    } catch (error) {
      console.error("Error uploading syllabus:", error);
      res.status(500).json({ message: "Failed to process syllabus", error: (error as Error).message });
    }
  });

  app.get("/api/syllabi", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const syllabi = await storage.getSyllabiByUserId(userId);
      res.json(syllabi);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch syllabi", error: (error as Error).message });
    }
  });

  // Study planner routes
  app.post("/api/study-plans", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { syllabusId, startDate, endDate, preferences } = req.body;

      // Get syllabus content
      const syllabus = await storage.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      // Parse exam dates from syllabus
      const examDates = syllabus.parsedContent && typeof syllabus.parsedContent === 'object' && 'examDates' in syllabus.parsedContent 
        ? (syllabus.parsedContent.examDates as Array<{name: string, date: string}>).map(exam => exam.date) 
        : [];

      // Generate study plan using Gemini
      const studyPlanData = await generateStudyPlan(
        syllabus.content,
        examDates,
        {
          startDate,
          endDate,
          ...preferences
        }
      );

      // Create study plan
      const studyPlan = await storage.createStudyPlan({
        userId: req.user.id,
        title: studyPlanData.title,
        description: studyPlanData.description,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      // Create study sessions
      const studySessions = await Promise.all(
        studyPlanData.sessions.map(session => 
          storage.createStudySession({
            studyPlanId: studyPlan.id,
            title: session.title,
            description: session.description,
            date: new Date(session.date),
            duration: session.duration,
            completed: false
          })
        )
      );

      res.status(201).json({
        ...studyPlan,
        sessions: studySessions
      });
    } catch (error) {
      console.error("Error creating study plan:", error);
      res.status(500).json({ message: "Failed to create study plan", error: (error as Error).message });
    }
  });

  app.get("/api/study-plans", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const studyPlans = await storage.getStudyPlansByUserId(userId);
      
      // Fetch sessions for each plan
      const studyPlansWithSessions = await Promise.all(studyPlans.map(async (plan) => {
        const sessions = await storage.getStudySessionsByPlanId(plan.id);
        return {
          ...plan,
          sessions
        };
      }));
      
      res.json(studyPlansWithSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study plans", error: (error as Error).message });
    }
  });

  // Summarizer routes
  app.post("/api/summarize", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let content = "";
      const format = req.body.format || "bullet_points";
      
      // Handle both file uploads and direct text input
      if (req.file) {
        // Parse uploaded file (PDF)
        if (req.file.mimetype === "application/pdf") {
          const pdfData = await pdfParse(req.file.buffer);
          content = pdfData.text;
        } else {
          // For text files
          content = req.file.buffer.toString("utf-8");
        }
      } else if (req.body.content) {
        content = req.body.content;
      } else {
        return res.status(400).json({ message: "No content or file provided" });
      }

      // Generate summary with Gemini
      const summary = await summarizeContent(content, format as any);

      // Store the summary
      const savedSummary = await storage.createSummary({
        userId: req.user.id,
        title: req.file?.originalname || req.body.title || "Untitled Summary",
        originalContent: content,
        summary
      });

      res.status(201).json({
        id: savedSummary.id,
        title: savedSummary.title,
        summary: savedSummary.summary
      });
    } catch (error) {
      console.error("Error summarizing content:", error);
      res.status(500).json({ message: "Failed to summarize content", error: (error as Error).message });
    }
  });

  app.get("/api/summaries", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const summaries = await storage.getSummariesByUserId(userId);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summaries", error: (error as Error).message });
    }
  });

  // Focus session routes
  app.post("/api/focus-sessions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { duration, taskId } = req.body;
      const focusSession = await storage.createFocusSession({
        userId: req.user.id,
        duration: parseInt(duration),
        startTime: new Date(),
        endTime: undefined,
        taskId: taskId ? parseInt(taskId) : undefined
      });
      res.status(201).json(focusSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to create focus session", error: (error as Error).message });
    }
  });

  app.put("/api/focus-sessions/:id/end", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const updatedSession = await storage.updateFocusSession(id, { endTime: new Date() });
      if (!updatedSession) {
        return res.status(404).json({ message: "Focus session not found" });
      }
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to end focus session", error: (error as Error).message });
    }
  });

  app.get("/api/focus-sessions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const focusSessions = await storage.getFocusSessionsByUserId(userId);
      res.json(focusSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch focus sessions", error: (error as Error).message });
    }
  });

  // AI Tutor chat routes
  app.get("/api/chat", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages", error: (error as Error).message });
    }
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const { content, referenceContent } = req.body;
      
      // Validate user message
      const validatedUserMessage = insertChatMessageSchema.parse({
        userId,
        content,
        isUserMessage: true
      });
      
      // Save user message
      const userMessage = await storage.createChatMessage(validatedUserMessage);
      
      // Get previous messages for context
      const previousMessages = await storage.getChatMessagesByUserId(userId);
      const messageHistory = previousMessages.map(msg => ({
        content: msg.content,
        isUserMessage: msg.isUserMessage
      }));
      
      // Get AI response
      const aiResponseContent = await getAITutorResponse(content, messageHistory, referenceContent);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        content: aiResponseContent,
        isUserMessage: false
      });
      
      res.status(201).json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message", error: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
