import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { GoogleAuth } from "google-auth-library";

const CONFIG = {
  projectId: "model-coral-456701-p0",
  location: "us",
  processorId: "8f2c71f87d4249f0",
};

const getGCPCredentials = () => {
  return process.env.GCP_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : {};
};

const initializeDocumentClient = () => {
  const auth = new GoogleAuth(getGCPCredentials());
  return new DocumentProcessorServiceClient({ auth });
};

const getText = (textAnchor: any, text: string) => {
  if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
    return "";
  }
  const startIndex = textAnchor.textSegments[0].startIndex || 0;
  const endIndex = textAnchor.textSegments[0].endIndex;
  return text.substring(startIndex, endIndex);
};

export const extractTablesFromDocument = (document: any) => {
  const tables = [];
  const { text } = document;

  for (const page of document?.pages || []) {
    const { tables: pageTables } = page;
    if (!pageTables) continue;

    for (const table of pageTables) {
      const tableData = {
        rows: [
          ...processTableRows(table.headerRows, text, "header"),
          ...processTableRows(table.bodyRows, text, "body"),
        ],
      };
      tables.push(tableData);
    }
  }
  return tables;
};

const processTableRows = (
  rows: any[] = [],
  text: string,
  type: "header" | "body"
) => {
  return rows.map((tableRow) => ({
    type,
    cells: (tableRow.cells || []).map((cell: any) =>
      getText(cell.layout?.textAnchor, text)
    ),
  }));
};

export const convertTablesToString = (tables: any[]): string => {
  return tables
    .map((table, tableIndex) => {
      const rowStrings = table.rows
        .map((row: any) => {
          return row.cells.join("\t");
        })
        .join("\n");

      return `Table ${tableIndex + 1}:\n${rowStrings}\n`;
    })
    .join("\n---\n");
};

export const processDocument = async (file: Response) => {
  const client = initializeDocumentClient();
  const name = `projects/${CONFIG.projectId}/locations/${CONFIG.location}/processors/${CONFIG.processorId}`;

  const arrayBuffer = await file.arrayBuffer();
  const encodedFile = Buffer.from(arrayBuffer).toString("base64");

  const [result] = await client.processDocument({
    name,
    rawDocument: {
      content: encodedFile,
      mimeType: "application/pdf",
    },
  });

  return result.document;
};
