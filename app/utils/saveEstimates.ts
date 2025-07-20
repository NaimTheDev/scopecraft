import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.client";
import { QuestionnaireState } from "../stores/useQuestionnaireStore";

export async function saveEstimateToFirestore(state: QuestionnaireState) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = collection(db, "projects");

  const doc = await addDoc(ref, {
    userId: user.uid,
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
