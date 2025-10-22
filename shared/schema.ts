import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcardSets = pgTable("flashcard_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  setId: varchar("set_id").notNull().references(() => flashcardSets.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "difficult"] }),
  reviewCount: varchar("review_count").default("0"),
});

// Progress Tracking Tables
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  flashcard_set_id: varchar("flashcard_set_id").notNull().references(() => flashcardSets.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  totalCards: integer("total_cards").notNull(),
  completedCards: integer("completed_cards").default(0),
  easyCount: integer("easy_count").default(0),
  mediumCount: integer("medium_count").default(0),
  difficultCount: integer("difficult_count").default(0),
});

export const cardReviews = pgTable("card_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  flashcardId: varchar("flashcard_id").notNull().references(() => flashcards.id),
  sessionId: varchar("session_id").notNull().references(() => studySessions.id),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "difficult"] }).notNull(),
  timeSpent: integer("time_spent"), // in seconds
  reviewedAt: timestamp("reviewed_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalStudyTime: integer("total_study_time").default(0), // in seconds
  totalSessions: integer("total_sessions").default(0),
  totalReviews: integer("total_reviews").default(0),
  totalEasyCards: integer("total_easy_cards").default(0),
  totalMediumCards: integer("total_medium_cards").default(0),
  totalDifficultCards: integer("total_difficult_cards").default(0),
  averageSessionTime: integer("average_session_time").default(0), // in seconds
  streak: integer("streak").default(0), // consecutive days studied
  lastStudyDate: timestamp("last_study_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  firebaseUid: true,
});

export const insertFlashcardSetSchema = createInsertSchema(flashcardSets).pick({
  userId: true,
  title: true,
  originalText: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  setId: true,
  question: true,
  answer: true,
});

// Progress Tracking Schemas
export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  flashcard_set_id: true,
  totalCards: true,
});

export const insertCardReviewSchema = createInsertSchema(cardReviews).pick({
  userId: true,
  flashcardId: true,
  sessionId: true,
  difficulty: true,
  timeSpent: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
});

// Update Study Session Schema
export const updateStudySessionSchema = createInsertSchema(studySessions).pick({
  endedAt: true,
  completedCards: true,
  easyCount: true,
  mediumCount: true,
  difficultCount: true,
}).partial();

// Existing Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;
export type FlashcardSet = typeof flashcardSets.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

// Progress Tracking Types
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertCardReview = z.infer<typeof insertCardReviewSchema>;
export type CardReview = typeof cardReviews.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type UpdateStudySession = z.infer<typeof updateStudySessionSchema>;

// Analytics Types
export type DifficultyStats = {
  easy: number;
  medium: number;
  difficult: number;
};

export type StudyProgressData = {
  totalSessions: number;
  totalStudyTime: number;
  averageSessionTime: number;
  streak: number;
  difficultyBreakdown: DifficultyStats;
  mostDifficultCards: Array<{
    flashcard: Flashcard;
    difficultyCount: number;
  }>;
  recentSessions: StudySession[];
};

export type TimeAnalyticsData = {
  averageTimePerCard: number;
  totalTimeSpent: number;
  timeByDifficulty: {
    easy: number;
    medium: number;
    difficult: number;
  };
  cardTimeDistribution: Array<{
    flashcard: Flashcard;
    averageTime: number;
    totalReviews: number;
    lastReviewed: string;
  }>;
  fastestCards: Array<{
    flashcard: Flashcard;
    averageTime: number;
  }>;
  slowestCards: Array<{
    flashcard: Flashcard;
    averageTime: number;
  }>;
};

// Deck (FlashcardSet) with additional UI data
export type DeckWithStats = FlashcardSet & {
  flashcardCount: number;
  lastActivity?: Date;
};
