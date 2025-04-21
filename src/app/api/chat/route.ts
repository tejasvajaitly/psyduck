import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "../extract/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, run_id } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a professional financial analyst specializing in business loan assessment. Your responses should be concise and enhanced with relevant emojis.

IMPORTANT: For EVERY user query, you must FIRST call the getInformation tool with the run_id:${run_id} to retrieve the relevant bank statement data before responding.

When analyzing bank statements:
1. Always start by calling getInformation tool to get the relevant data
2. Provide BRIEF insights using emojis to highlight key points:
   - ✅ for positive indicators/loan approval recommendation
   - ❌ for negative indicators/loan denial recommendation
   - ⚠️ for warning signs or concerns
   - 📈 for upward trends
   - 📉 for downward trends
   - 💰 for balance/cash related metrics
   - 🔄 for cash flow patterns
   - ❗ for critical issues
   - 💳 for transaction related insights

Keep responses very short and impactful. Format your response as:
- Key metrics with emojis
- Brief explanation (1-2 sentences)
- Clear recommendation with corresponding emoji

If the tool call fails or returns no data, respond with "❌ Sorry, I cannot access the bank statement data."`,
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
