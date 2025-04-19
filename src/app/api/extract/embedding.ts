import { embedMany, embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddingModel = openai.embedding("text-embedding-ada-002");

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; chunk_text: string }>> => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const chunkedContent = await textSplitter.createDocuments([value]);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunkedContent.map((chunk) => chunk.pageContent),
  });
  return embeddings.map((e, i) => ({
    chunk_text: chunkedContent[i].pageContent,
    embedding: e,
  }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (
  userQuery: string,
  run_id: string
) => {
  const supabaseClient = createServerSupabaseClient();
  const { data, error } = await supabaseClient
    .from("runs")
    .select("*")
    .eq("id", run_id);

  return data;
};

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
