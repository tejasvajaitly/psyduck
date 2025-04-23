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
    const finalDecision = await decision(tableString || "");
    const financialMetrics = await extractMetricsFromDecision(finalDecision);
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
      return Response.json({ message: "Error inserting run" }, { status: 500 });
    }

    return Response.json({
      id: data[0].id,
      tables,
      text: document.text,
      metadata,
      structuredDocument,
      finalDecision: finalDecision,
      tableString: tableString,
      financial_metrics: financialMetrics,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error processing document" },
      { status: 500 }
    );
  }
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
