// Run this file with: npm run dev and visit a route that imports this
// Or temporarily add this to an existing component

import { migrateProjectsToUserSubcollections } from "./migrateProjects";

// Add this to a component's useEffect or call it manually
export const runMigration = async () => {
  console.log("🚀 Starting migration...");

  try {
    const result = await migrateProjectsToUserSubcollections();
    console.log("✅ Migration completed:", result);
    return result;
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

// Uncomment this to run immediately when imported
// runMigration();
