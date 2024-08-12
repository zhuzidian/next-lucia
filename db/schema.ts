import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("lucia_user", {
	id: text("id").primaryKey(),
  username: text("username"),
  password: text("password"),
  role: text("role"),
});

export const sessionTable = pgTable("lucia_session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});
