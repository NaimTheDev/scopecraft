import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase.client";

/**
 * Migrate existing projects from the old structure (projects collection)
 * to the new structure (users/{userId}/projects subcollection)
 *
 * This function should be run once to migrate existing data.
 * You can call this from the browser console or create a temporary admin script.
 */
export async function migrateProjectsToUserSubcollections() {
  try {
    console.log("Starting project migration...");

    // Get all projects from the old collection
    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);

    if (projectsSnapshot.empty) {
      console.log("No projects found to migrate.");
      return;
    }

    const batch = writeBatch(db);
    const projectsToDelete: string[] = [];
    let migratedCount = 0;

    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      const userId = projectData.userId;

      if (!userId) {
        console.warn(`Project ${projectDoc.id} has no userId, skipping...`);
        continue;
      }

      // Create the project in the user's subcollection
      const userProjectsRef = collection(db, "users", userId, "projects");
      const newProjectRef = doc(userProjectsRef);

      // Remove userId from the data since it's now implicit in the subcollection structure
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _, ...cleanProjectData } = projectData;

      batch.set(newProjectRef, cleanProjectData);
      projectsToDelete.push(projectDoc.id);
      migratedCount++;
    }

    // Execute the batch write
    await batch.commit();
    console.log(
      `Successfully migrated ${migratedCount} projects to user subcollections.`
    );

    // Delete the old projects (optional - uncomment if you want to clean up)
    // Warning: This will permanently delete the old project documents
    /*
    const deleteBatch = writeBatch(db);
    for (const projectId of projectsToDelete) {
      const oldProjectRef = doc(db, "projects", projectId);
      deleteBatch.delete(oldProjectRef);
    }
    await deleteBatch.commit();
    console.log(`Deleted ${projectsToDelete.length} old project documents.`);
    */

    console.log("Migration completed successfully!");
    return {
      migratedCount,
      projectsToDelete: projectsToDelete.length,
    };
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

/**
 * Function to verify the migration by checking if projects exist in user subcollections
 */
export async function verifyMigration(userId: string) {
  try {
    const userProjectsRef = collection(db, "users", userId, "projects");
    const userProjectsSnapshot = await getDocs(userProjectsRef);

    console.log(
      `User ${userId} has ${userProjectsSnapshot.size} projects in their subcollection.`
    );

    userProjectsSnapshot.docs.forEach((doc) => {
      console.log(`Project ID: ${doc.id}`, doc.data());
    });

    return userProjectsSnapshot.size;
  } catch (error) {
    console.error("Error verifying migration:", error);
    throw error;
  }
}
