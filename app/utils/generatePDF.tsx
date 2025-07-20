import { pdf } from "@react-pdf/renderer";
import { EstimateDocument } from "./EstimateDocument";
import type { GeneratedEstimate } from "~/stores/useQuestionnaireStore";

export const generateAndDownloadEstimatePDF = async (
  estimate: GeneratedEstimate,
  projectName: string = "Project Estimate"
) => {
  try {
    // Generate the PDF document
    const doc = (
      <EstimateDocument estimate={estimate} projectName={projectName} />
    );
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_estimate.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

export const generateAndDownloadProposalPDF = async (
  estimate: GeneratedEstimate,
  projectName: string = "Project Proposal"
) => {
  try {
    // For now, we'll use the same document template but with different styling
    // You can create a separate ProposalDocument component later if needed
    const doc = (
      <EstimateDocument
        estimate={estimate}
        projectName={projectName}
        isProposal={true}
      />
    );
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_proposal.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};
