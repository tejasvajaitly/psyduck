import {
  processDocument,
  extractTablesFromDocument,
  convertTablesToString,
} from "./process-document";
import {
  analyzeDocument,
  structureDocument,
  decision,
} from "./analyze-document";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { generateEmbeddings } from "./embedding";

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
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("runs")
      .insert({
        account_number: metadata.accountNumber,
        name: metadata.name,
        transactions: structuredDocument,

        extracted_string: tableString,
      })
      .select();

    if (error || !data) {
      return Response.json({ message: "Error inserting run" }, { status: 500 });
    }

    const embeddings = await generateEmbeddings(tableString || "");

    const { data: embeddingsData, error: embeddingsError } = await supabase
      .from("embeddings")
      .insert(
        embeddings.map((embedding) => ({
          run_id: data[0].id,
          embedding: embedding.embedding,
          chunk_text: embedding.chunk_text,
        }))
      );

    if (embeddingsError) {
      return Response.json(
        { message: "Error inserting embeddings" },
        { status: 500 }
      );
    }

    return Response.json({
      tables,
      text: document.text,
      metadata,
      structuredDocument,
      finalDecision: finalDecision,
      tableString: tableString,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error processing document" },
      { status: 500 }
    );
  }
}

export function createServerSupabaseClient() {
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
