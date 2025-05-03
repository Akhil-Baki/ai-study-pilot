// User types
export interface User {
  id: number;
  username: string;
}

// Syllabus types
export interface Syllabus {
  id: number;
  userId: number;
  title: string;
  content: string;
  courseName?: string;
  parsedContent?: SyllabusParsedContent;
  createdAt: Date;
}

export interface SyllabusParsedContent {
  courseName: string;
  instructor: string;
  topics: { name: string; description: string }[];
  examDates: { name: string; date: string }[];
}

// Study plan types
export interface StudyPlan {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  sessions?: StudySession[];
}

export interface StudySession {
  id: number;
  studyPlanId: number;
  title: string;
  description?: string;
  date: Date;
  duration: number; // in minutes
  completed: boolean;
  createdAt: Date;
}

// Summary types
export interface Summary {
  id: number;
  userId: number;
  title: string;
  originalContent: string;
  summary: string;
  createdAt: Date;
}

// Task types
export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "urgent" | "high" | "medium" | "regular" | "low";
  category: "study" | "assignment" | "personal";
  completed: boolean;
  createdAt: Date;
}

// Focus session types
export interface FocusSession {
  id: number;
  userId: number;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  taskId?: number;
}

// Chat message types
export interface ChatMessage {
  id: number;
  userId: number;
  content: string;
  isUserMessage: boolean;
  createdAt: Date;
}

// Form types
export interface TaskFormValues {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "urgent" | "high" | "medium" | "regular" | "low";
  category: "study" | "assignment" | "personal";
}

export interface StudyPlanFormValues {
  syllabusId: number;
  startDate: Date;
  endDate: Date;
  preferences: {
    hoursPerDay?: number;
    preferredStudyTimes?: string[];
    excludedDays?: string[];
  };
}

export interface SummaryFormValues {
  title?: string;
  content?: string;
  format: "bullet_points" | "paragraphs";
}

// Stats types for dashboard
export interface DashboardStats {
  courseCount: number;
  studyHours: number;
  completedTasks: number;
  upcomingDeadlines: number;
}
