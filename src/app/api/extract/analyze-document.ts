import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

type Table = {
  rows: {
    type: "header" | "body";
    cells: any;
  }[];
};

export const analyzeDocument = async (res: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-nano"),
    schema: z.object({
      name: z
        .string()
        .nullable()
        .describe("The name of the account holder, return null if not found"),
      accountNumber: z
        .string()
        .nullable()
        .describe("The account number, return null if not found"),
    }),
    prompt: `Analyze the bank statement ${res} and extract the name and account number. If you do not find the name or account number, return null for each.`,
  });

  return object;
};

export const structureDocument = async (str: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4.1-nano"),
    schema: z.object({
      transactions: z.array(
        z.object({
          date: z
            .string()
            .nullable()
            .optional()
            .describe("The date of the transaction, return null if not found"),
          description: z
            .string()
            .nullable()
            .optional()
            .describe(
              "The actual name of the transaction, return null if not found"
            ),
          amount: z
            .string()
            .nullable()
            .optional()
            .describe(
              "The amount of the transaction on the statement, return null if not found"
            ),
          type: z
            .enum(["debit", "credit", ""])
            .nullable()
            .optional()
            .describe("The type of the transaction, return null if not found"),
        })
      ),
    }),
    prompt: `Analyze the bank statement ${str} and extract all the transactions. Each transaction should have the following fields: date, description(actual name of the transaction), amount, and type(debit or credit). Make sure to get all the transactions.`,
  });

  return object;
};
