import {
  type User, type InsertUser, users,
  type Syllabus, type InsertSyllabus, syllabi,
  type StudyPlan, type InsertStudyPlan, studyPlans,
  type StudySession, type InsertStudySession, studySessions,
  type Summary, type InsertSummary, summaries,
  type Task, type InsertTask, tasks,
  type FocusSession, type InsertFocusSession, focusSessions,
  type ChatMessage, type InsertChatMessage, chatMessages
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Syllabus methods
  getSyllabus(id: number): Promise<Syllabus | undefined>;
  getSyllabiByUserId(userId: number): Promise<Syllabus[]>;
  createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus>;
  updateSyllabus(id: number, data: Partial<Syllabus>): Promise<Syllabus | undefined>;
  deleteSyllabus(id: number): Promise<boolean>;

  // Study plan methods
  getStudyPlan(id: number): Promise<StudyPlan | undefined>;
  getStudyPlansByUserId(userId: number): Promise<StudyPlan[]>;
  createStudyPlan(studyPlan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: number, data: Partial<StudyPlan>): Promise<StudyPlan | undefined>;
  deleteStudyPlan(id: number): Promise<boolean>;

  // Study session methods
  getStudySession(id: number): Promise<StudySession | undefined>;
  getStudySessionsByPlanId(studyPlanId: number): Promise<StudySession[]>;
  createStudySession(studySession: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, data: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;

  // Summary methods
  getSummary(id: number): Promise<Summary | undefined>;
  getSummariesByUserId(userId: number): Promise<Summary[]>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  deleteSummary(id: number): Promise<boolean>;

  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Focus session methods
  getFocusSession(id: number): Promise<FocusSession | undefined>;
  getFocusSessionsByUserId(userId: number): Promise<FocusSession[]>;
  createFocusSession(focusSession: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, data: Partial<FocusSession>): Promise<FocusSession | undefined>;

  // Chat message methods
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private syllabi: Map<number, Syllabus>;
  private studyPlans: Map<number, StudyPlan>;
  private studySessions: Map<number, StudySession>;
  private summaries: Map<number, Summary>;
  private tasks: Map<number, Task>;
  private focusSessions: Map<number, FocusSession>;
  private chatMessages: Map<number, ChatMessage>;
  
  private userId: number = 1;
  private syllabusId: number = 1;
  private studyPlanId: number = 1;
  private studySessionId: number = 1;
  private summaryId: number = 1;
  private taskId: number = 1;
  private focusSessionId: number = 1;
  private chatMessageId: number = 1;

  constructor() {
    this.users = new Map();
    this.syllabi = new Map();
    this.studyPlans = new Map();
    this.studySessions = new Map();
    this.summaries = new Map();
    this.tasks = new Map();
    this.focusSessions = new Map();
    this.chatMessages = new Map();
    
    // Add a default user
    this.createUser({
      username: "user",
      password: "password"
    });
    
    // Add some sample tasks for the default user
    this.createTask({
      userId: 1,
      title: "Read Chapter 3: Neural Networks Basics",
      description: "Machine Learning Fundamentals",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      priority: "high",
      category: "study",
      completed: false
    });
    
    this.createTask({
      userId: 1,
      title: "Complete Assignment: Data Structures",
      description: "Computer Science 202",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
      priority: "urgent",
      category: "assignment",
      completed: false
    });
    
    this.createTask({
      userId: 1,
      title: "Watch Lecture: Macroeconomics",
      description: "Economics 101",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
      priority: "medium",
      category: "study",
      completed: false
    });
    
    this.createTask({
      userId: 1,
      title: "Review Notes: Organic Chemistry",
      description: "Chemistry 301",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 days from now
      priority: "regular",
      category: "study",
      completed: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Syllabus methods
  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    return this.syllabi.get(id);
  }

  async getSyllabiByUserId(userId: number): Promise<Syllabus[]> {
    return Array.from(this.syllabi.values()).filter(
      (syllabus) => syllabus.userId === userId
    );
  }

  async createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus> {
    const id = this.syllabusId++;
    const createdAt = new Date();
    const newSyllabus: Syllabus = { ...syllabus, id, createdAt };
    this.syllabi.set(id, newSyllabus);
    return newSyllabus;
  }

  async updateSyllabus(id: number, data: Partial<Syllabus>): Promise<Syllabus | undefined> {
    const syllabus = this.syllabi.get(id);
    if (!syllabus) return undefined;
    
    const updatedSyllabus = { ...syllabus, ...data };
    this.syllabi.set(id, updatedSyllabus);
    return updatedSyllabus;
  }

  async deleteSyllabus(id: number): Promise<boolean> {
    return this.syllabi.delete(id);
  }

  // Study plan methods
  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    return this.studyPlans.get(id);
  }

  async getStudyPlansByUserId(userId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values()).filter(
      (studyPlan) => studyPlan.userId === userId
    );
  }

  async createStudyPlan(studyPlan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.studyPlanId++;
    const createdAt = new Date();
    const newStudyPlan: StudyPlan = { ...studyPlan, id, createdAt };
    this.studyPlans.set(id, newStudyPlan);
    return newStudyPlan;
  }

  async updateStudyPlan(id: number, data: Partial<StudyPlan>): Promise<StudyPlan | undefined> {
    const studyPlan = this.studyPlans.get(id);
    if (!studyPlan) return undefined;
    
    const updatedStudyPlan = { ...studyPlan, ...data };
    this.studyPlans.set(id, updatedStudyPlan);
    return updatedStudyPlan;
  }

  async deleteStudyPlan(id: number): Promise<boolean> {
    return this.studyPlans.delete(id);
  }

  // Study session methods
  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async getStudySessionsByPlanId(studyPlanId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (studySession) => studySession.studyPlanId === studyPlanId
    );
  }

  async createStudySession(studySession: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionId++;
    const createdAt = new Date();
    const newStudySession: StudySession = { ...studySession, id, createdAt };
    this.studySessions.set(id, newStudySession);
    return newStudySession;
  }

  async updateStudySession(id: number, data: Partial<StudySession>): Promise<StudySession | undefined> {
    const studySession = this.studySessions.get(id);
    if (!studySession) return undefined;
    
    const updatedStudySession = { ...studySession, ...data };
    this.studySessions.set(id, updatedStudySession);
    return updatedStudySession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Summary methods
  async getSummary(id: number): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async getSummariesByUserId(userId: number): Promise<Summary[]> {
    return Array.from(this.summaries.values()).filter(
      (summary) => summary.userId === userId
    );
  }

  async createSummary(summary: InsertSummary): Promise<Summary> {
    const id = this.summaryId++;
    const createdAt = new Date();
    const newSummary: Summary = { ...summary, id, createdAt };
    this.summaries.set(id, newSummary);
    return newSummary;
  }

  async deleteSummary(id: number): Promise<boolean> {
    return this.summaries.delete(id);
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const createdAt = new Date();
    const newTask: Task = { ...task, id, createdAt };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Focus session methods
  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    return this.focusSessions.get(id);
  }

  async getFocusSessionsByUserId(userId: number): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(
      (focusSession) => focusSession.userId === userId
    );
  }

  async createFocusSession(focusSession: InsertFocusSession): Promise<FocusSession> {
    const id = this.focusSessionId++;
    const newFocusSession: FocusSession = { ...focusSession, id };
    this.focusSessions.set(id, newFocusSession);
    return newFocusSession;
  }

  async updateFocusSession(id: number, data: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const focusSession = this.focusSessions.get(id);
    if (!focusSession) return undefined;
    
    const updatedFocusSession = { ...focusSession, ...data };
    this.focusSessions.set(id, updatedFocusSession);
    return updatedFocusSession;
  }

  // Chat message methods
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (chatMessage) => chatMessage.userId === userId
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageId++;
    const createdAt = new Date();
    const newChatMessage: ChatMessage = { ...chatMessage, id, createdAt };
    this.chatMessages.set(id, newChatMessage);
    return newChatMessage;
  }
}

import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
