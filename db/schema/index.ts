import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/pg-core";

export const Budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  isFavourite: boolean("is_favourite").default(false).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const IncomeEntries = pgTable("income_entries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 100 }),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  date: date("date").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  budgetId: integer("budget_id").references(() => Budgets.id, {
    onDelete: "cascade",
  }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const RecurringPayments = pgTable("recurring_payments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  category: varchar("category", { length: 100 }),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  monthlyAllocation: numeric("monthly_allocation", { precision: 10, scale: 2 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const GoalContributions = pgTable("goal_contributions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => Goals.id, { onDelete: "cascade" }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  note: varchar("note", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Budget = typeof Budgets.$inferSelect;
export type NewBudget = typeof Budgets.$inferInsert;
export type IncomeEntry = typeof IncomeEntries.$inferSelect;
export type NewIncomeEntry = typeof IncomeEntries.$inferInsert;
export type Expense = typeof Expenses.$inferSelect;
export type NewExpense = typeof Expenses.$inferInsert;
export type RecurringPayment = typeof RecurringPayments.$inferSelect;
export type NewRecurringPayment = typeof RecurringPayments.$inferInsert;
export type Goal = typeof Goals.$inferSelect;
export type NewGoal = typeof Goals.$inferInsert;
export type GoalContribution = typeof GoalContributions.$inferSelect;
export type NewGoalContribution = typeof GoalContributions.$inferInsert;
