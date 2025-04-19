import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "../extract/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, run_id } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls. The information only need to be from the following run_id ${run_id}
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
          run_id: z.string().describe("the run id to search within"),
        }),
        execute: async ({ question, run_id }) =>
          findRelevantContent(question, run_id),
      }),
    },
  });

  return result.toDataStreamResponse();
}
