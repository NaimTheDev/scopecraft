import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, createUserDocument } from "./firebase.client";
import { QuestionnaireState } from "../stores/useQuestionnaireStore";

export async function saveEstimateToFirestore(state: QuestionnaireState) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  // Ensure user document exists before creating projects
  await createUserDocument(user);

  // Save to users/{userId}/projects subcollection
  const ref = collection(db, "users", user.uid, "projects");

  const doc = await addDoc(ref, {
    clientRequest: state.clientRequest,
    projectType: state.projectType,
    features: state.features,
    timeline: state.timeline,
    budget: state.budget,
    notes: state.notes,
    createdAt: serverTimestamp(),
  });

  return doc.id;
}
