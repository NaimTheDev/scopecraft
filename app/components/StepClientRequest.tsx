import { useQuestionnaireStore } from "../stores/useQuestionnaireStore";

export default function StepClientRequest() {
  const { clientRequest, setClientRequest } = useQuestionnaireStore();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        📝 Describe the Client&apos;s Request
      </h2>
      <textarea
        className="w-full h-40 p-3 border rounded shadow-sm"
        placeholder="Example: The client wants a mobile app for event booking with user auth, payment integration, and calendar syncing."
        value={clientRequest}
        onChange={(e) => setClientRequest(e.target.value)}
      />
    </div>
  );
}
