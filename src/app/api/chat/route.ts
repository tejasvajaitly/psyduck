import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "../extract/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, run_id } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a professional financial analyst specializing in business loan assessment. Your role is to analyze bank statements and provide recommendations for business loan applications.

When evaluating loan applications:
1. Review the transaction history and financial patterns from the provided bank statements
2. Assess key metrics such as:
   - Average monthly balance
   - Cash flow stability
   - Income consistency
   - Expense patterns
   - Any red flags (overdrafts, returned payments, etc.)

Only use information retrieved from the tool calls with run_id: ${run_id}. 
If you cannot find relevant information in the tool calls, respond with "Sorry, I cannot access the bank statement data."

Provide clear, professional explanations for your loan recommendations based on the financial data analysis.`,
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
