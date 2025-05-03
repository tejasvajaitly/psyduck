import {
  processDocument,
  extractTablesFromDocument,
  convertTablesToString,
} from "./process-document";
import {
  analyzeDocument,
  structureDocument,
  decision,
  extractMetricsFromDecision,
} from "./analyze-document";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("fileUrl");

  if (!fileUrl) {
    return Response.json({ message: "No file URL provided" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const sendProgress = (message: string) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", message })}\n\n`
            )
          );
        };

        sendProgress("Fetching file...");
        const file = await fetch(fileUrl);
        if (!file.ok) {
          throw new Error("Failed to fetch file");
        }

        sendProgress("Extracting information...");
        const document = await processDocument(file);
        if (!document) {
          throw new Error("No document found");
        }

        sendProgress("Preparing information for analysis...");
        const tables = extractTablesFromDocument(document);
        const tableString = convertTablesToString(tables);

        sendProgress("Analyzing information...");
        const metadata = await analyzeDocument(document.text || "");

        sendProgress("Structuring information into transactions...");
        const structuredDocument = await structureDocument(tableString || "");

        sendProgress("Making final decision...");
        const finalDecision = await decision(tableString || "");

        sendProgress("Deep analysis of financial metrics...");
        const financialMetrics = await extractMetricsFromDecision(
          finalDecision
        );

        sendProgress("Saving to database...");
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
          .from("runs")
          .insert({
            account_number: metadata.accountNumber,
            name: metadata.name,
            transactions: structuredDocument,
            final_decision: finalDecision,
            extracted_string: tableString,
            financial_metrics: financialMetrics,
          })
          .select();

        if (error || !data) {
          throw new Error("Error inserting run");
        }

        sendProgress("Complete!");
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              data: {
                id: data[0].id,
                tables,
                text: document.text,
                metadata,
                structuredDocument,
                finalDecision: finalDecision,
                tableString: tableString,
                financial_metrics: financialMetrics,
              },
            })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        console.error(error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Error processing document",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
