import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  syllabi: many(syllabi),
  studyPlans: many(studyPlans),
  summaries: many(summaries),
  tasks: many(tasks),
  focusSessions: many(focusSessions),
  chatMessages: many(chatMessages),
}));

// Syllabus model
export const syllabi = pgTable("syllabi", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  courseName: text("course_name"),
  parsedContent: jsonb("parsed_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSyllabusSchema = createInsertSchema(syllabi).pick({
  userId: true,
  title: true,
  content: true,
  courseName: true,
  parsedContent: true,
});

export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type Syllabus = typeof syllabi.$inferSelect;

export const syllabiRelations = relations(syllabi, ({ one }) => ({
  user: one(users, {
    fields: [syllabi.userId],
    references: [users.id]
  })
}));

// Study Plan model
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).pick({
  userId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
});

export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type StudyPlan = typeof studyPlans.$inferSelect;

export const studyPlansRelations = relations(studyPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [studyPlans.userId],
    references: [users.id]
  }),
  sessions: many(studySessions)
}));

// Study Session model
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  studyPlanId: integer("study_plan_id").notNull().references(() => studyPlans.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  studyPlanId: true,
  title: true,
  description: true,
  date: true,
  duration: true,
  completed: true,
});

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  studyPlan: one(studyPlans, {
    fields: [studySessions.studyPlanId],
    references: [studyPlans.id]
  })
}));

// Summary model
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  userId: true,
  title: true,
  originalContent: true,
  summary: true,
});

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;

export const summariesRelations = relations(summaries, ({ one }) => ({
  user: one(users, {
    fields: [summaries.userId],
    references: [users.id]
  })
}));

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"),
  category: text("category").default("study"), // study, assignment, personal
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  category: true,
  completed: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  }),
  focusSessions: many(focusSessions)
}));

// Focus Session model
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(), // in minutes
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "set null" }),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  userId: true,
  duration: true,
  startTime: true,
  endTime: true,
  taskId: true,
});

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

export const focusSessionsRelations = relations(focusSessions, ({ one }) => ({
  user: one(users, {
    fields: [focusSessions.userId],
    references: [users.id]
  }),
  task: one(tasks, {
    fields: [focusSessions.taskId],
    references: [tasks.id]
  })
}));

// Chat model
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  content: true,
  isUserMessage: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id]
  })
}));
