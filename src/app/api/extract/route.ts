import {
  processDocument,
  extractTablesFromDocument,
  convertTablesToString,
} from "./process-document";
import { analyzeDocument, structureDocument } from "./analyze-document";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdfFile") as File;

    const document = await processDocument(file);
    if (!document) {
      return Response.json({ message: "No document found" }, { status: 400 });
    }

    const tables = extractTablesFromDocument(document);
    const tableString = convertTablesToString(tables);
    const metadata = await analyzeDocument(document.text || "");
    const structuredDocument = await structureDocument(tableString || "");

    return Response.json({
      tables,
      text: document.text,
      metadata,
      structuredDocument,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error processing document" },
      { status: 500 }
    );
  }
}
