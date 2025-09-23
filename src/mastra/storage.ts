import { DefaultStorage } from "@mastra/libsql";

// Create a shared LibSQL storage instance (SQLite-based)
// This will use in-memory storage for development
export const sharedPostgresStorage = new DefaultStorage({
  url: ":memory:", // Use in-memory SQLite for development
});
