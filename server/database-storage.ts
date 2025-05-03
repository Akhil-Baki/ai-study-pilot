import { db } from "./db";
import { IStorage } from "./storage";
import { 
  User, InsertUser, 
  Syllabus, InsertSyllabus, 
  StudyPlan, InsertStudyPlan, 
  StudySession, InsertStudySession, 
  Summary, InsertSummary, 
  Task, InsertTask, 
  FocusSession, InsertFocusSession, 
  ChatMessage, InsertChatMessage,
  users, syllabi, studyPlans, studySessions, summaries, tasks, focusSessions, chatMessages 
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Implementation of IStorage using PostgreSQL database with Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  // Syllabus methods
  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    const [syllabus] = await db.select().from(syllabi).where(eq(syllabi.id, id));
    return syllabus;
  }

  async getSyllabiByUserId(userId: number): Promise<Syllabus[]> {
    return await db.select().from(syllabi).where(eq(syllabi.userId, userId));
  }

  async createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus> {
    const [createdSyllabus] = await db.insert(syllabi).values(syllabus).returning();
    return createdSyllabus;
  }

  async updateSyllabus(id: number, data: Partial<Syllabus>): Promise<Syllabus | undefined> {
    const [updatedSyllabus] = await db.update(syllabi)
      .set(data)
      .where(eq(syllabi.id, id))
      .returning();
    return updatedSyllabus;
  }

  async deleteSyllabus(id: number): Promise<boolean> {
    const [deleted] = await db.delete(syllabi).where(eq(syllabi.id, id)).returning();
    return !!deleted;
  }

  // Study plan methods
  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    const [studyPlan] = await db.select().from(studyPlans).where(eq(studyPlans.id, id));
    return studyPlan;
  }

  async getStudyPlansByUserId(userId: number): Promise<StudyPlan[]> {
    return await db.select().from(studyPlans).where(eq(studyPlans.userId, userId));
  }

  async createStudyPlan(studyPlan: InsertStudyPlan): Promise<StudyPlan> {
    const [createdStudyPlan] = await db.insert(studyPlans).values(studyPlan).returning();
    return createdStudyPlan;
  }

  async updateStudyPlan(id: number, data: Partial<StudyPlan>): Promise<StudyPlan | undefined> {
    const [updatedStudyPlan] = await db.update(studyPlans)
      .set(data)
      .where(eq(studyPlans.id, id))
      .returning();
    return updatedStudyPlan;
  }

  async deleteStudyPlan(id: number): Promise<boolean> {
    const [deleted] = await db.delete(studyPlans).where(eq(studyPlans.id, id)).returning();
    return !!deleted;
  }

  // Study session methods
  async getStudySession(id: number): Promise<StudySession | undefined> {
    const [studySession] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return studySession;
  }

  async getStudySessionsByPlanId(studyPlanId: number): Promise<StudySession[]> {
    return await db.select().from(studySessions).where(eq(studySessions.studyPlanId, studyPlanId));
  }

  async createStudySession(studySession: InsertStudySession): Promise<StudySession> {
    const [createdStudySession] = await db.insert(studySessions).values(studySession).returning();
    return createdStudySession;
  }

  async updateStudySession(id: number, data: Partial<StudySession>): Promise<StudySession | undefined> {
    const [updatedStudySession] = await db.update(studySessions)
      .set(data)
      .where(eq(studySessions.id, id))
      .returning();
    return updatedStudySession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    const [deleted] = await db.delete(studySessions).where(eq(studySessions.id, id)).returning();
    return !!deleted;
  }

  // Summary methods
  async getSummary(id: number): Promise<Summary | undefined> {
    const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
    return summary;
  }

  async getSummariesByUserId(userId: number): Promise<Summary[]> {
    return await db.select().from(summaries).where(eq(summaries.userId, userId));
  }

  async createSummary(summary: InsertSummary): Promise<Summary> {
    const [createdSummary] = await db.insert(summaries).values(summary).returning();
    return createdSummary;
  }

  async deleteSummary(id: number): Promise<boolean> {
    const [deleted] = await db.delete(summaries).where(eq(summaries.id, id)).returning();
    return !!deleted;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [createdTask] = await db.insert(tasks).values(task).returning();
    return createdTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [deleted] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return !!deleted;
  }

  // Focus session methods
  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    const [focusSession] = await db.select().from(focusSessions).where(eq(focusSessions.id, id));
    return focusSession;
  }

  async getFocusSessionsByUserId(userId: number): Promise<FocusSession[]> {
    return await db.select().from(focusSessions).where(eq(focusSessions.userId, userId));
  }

  async createFocusSession(focusSession: InsertFocusSession): Promise<FocusSession> {
    const [createdFocusSession] = await db.insert(focusSessions).values(focusSession).returning();
    return createdFocusSession;
  }

  async updateFocusSession(id: number, data: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const [updatedFocusSession] = await db.update(focusSessions)
      .set(data)
      .where(eq(focusSessions.id, id))
      .returning();
    return updatedFocusSession;
  }

  // Chat message methods
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }

  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [createdChatMessage] = await db.insert(chatMessages).values(chatMessage).returning();
    return createdChatMessage;
  }
}