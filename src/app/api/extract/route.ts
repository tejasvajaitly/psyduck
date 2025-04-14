import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { GoogleAuth } from "google-auth-library";

export async function POST(req: Request) {
  const projectId = "model-coral-456701-p0";
  const location = "us"; // Format is 'us' or 'eu'
  const processorId = "8f2c71f87d4249f0"; // Create processor in Cloud Console

  const getGCPCredentials = () => {
    return process.env.GCP_PRIVATE_KEY
      ? {
          credentials: {
            client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GCP_PRIVATE_KEY,
          },
          projectId: process.env.GCP_PROJECT_ID,
        }
      : // for local development, use gcloud CLI
        {};
  };

  const auth = new GoogleAuth(getGCPCredentials());
  const client = new DocumentProcessorServiceClient({
    auth,
  });

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const formData = await req.formData();
  const file = formData.get("pdfFile") as File;

  const arrayBuffer = await file.arrayBuffer();
  const encodedFile = Buffer.from(arrayBuffer).toString("base64");

  const request = {
    name,
    rawDocument: {
      content: encodedFile,
      mimeType: "application/pdf",
    },
  };

  const [result] = await client.processDocument(request);
  const { document } = result;
  if (!document) {
    return new Response(
      JSON.stringify({
        message: "No document found",
      }),
      {
        status: 400,
      }
    );
  }
  const { text } = document;

  const getText = (textAnchor: any) => {
    if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return "";
    }
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;
    return text?.substring(startIndex, endIndex) || "";
  };

  // Extract tables from all pages
  const tables = [];
  for (const page of document?.pages || []) {
    const { tables: pageTables } = page;

    if (!pageTables) continue;

    for (const table of pageTables) {
      const tableData: { rows: { type: string; cells: string[] }[] } = {
        rows: [],
      };

      // Process each row in the table
      for (const tableRow of table.headerRows || []) {
        const row = [];
        for (const cell of tableRow.cells || []) {
          row.push(getText(cell.layout?.textAnchor));
        }
        const headerRow = { type: "header", cells: row };
        tableData.rows.push(headerRow);
      }

      for (const tableRow of table.bodyRows || []) {
        const row = [];
        for (const cell of tableRow.cells || []) {
          row.push(getText(cell.layout?.textAnchor));
        }
        const bodyRow = { type: "body", cells: row };
        tableData.rows.push(bodyRow);
      }

      tables.push(tableData);
    }
  }

  console.log(tables);

  return new Response(
    JSON.stringify({
      tables,
      message: `Found ${tables.length} tables in the document`,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
