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

export const decision = async (str: string) => {
  const { object } = await generateObject({
    model: openai("o4-mini"),
    temperature: 1,
    schema: z.object({
      loanDecision: z.union([
        z.enum(["approved", "rejected"]),
        z.null(),
        z.undefined(),
      ]),
      internalReasons: z.union([z.array(z.string()), z.null(), z.undefined()]),
      customerFacingAdvice: z.union([
        z.array(z.string()),
        z.null(),
        z.undefined(),
      ]),
    }),
    prompt: `You are a highly experienced financial underwriter with expert-level understanding of banking algorithms and risk models used to assess business loan eligibility. You are reviewing this parsed bank statement ${str} data for a customer who has applied for a business loan.
    Use this data to make a decision on whether this customer should be approved or rejected for a loan. Your decision should be based on key financial indicators such as:
      •	Net monthly cash flow
      •	Debt-to-income ratio
      •	Recurring income and expenses
      •	Savings or financial cushion
      •	Signs of erratic spending or risky financial behavior
    Your Task:
    
    Return a structured JSON response that includes:
      1.	loanDecision: "approved" or "rejected"
      2.	internalReasons: List of internal reasons for approval/rejection (for internal team only). Be detailed, analytical, and direct.
      3.	customerFacingAdvice: List of tips or actionable suggestions for the customer (in a polite, positive tone). Only needed when the loan is rejected. Avoid sounding negative or overly technical. Focus on helpfulness and hope.
      
    If rejected it should look like this:
      {
        "loanDecision": "rejected",
        "internalReasons": [
          "Debt-to-income ratio exceeds safe threshold (36%+).",
          "Discretionary spending is over 20% of income, indicating possible financial risk.",
          "Savings are below the minimum buffer recommended for small business lending."
        ],
        "customerFacingAdvice": [
          "Reduce discretionary expenses like dining and shopping to improve your savings rate.",
          "Try to bring down monthly debt payments by consolidating or paying off smaller loans.",
          "Maintain a steady positive cash flow for the next 3-6 months to strengthen your application."
        ]
      }

    If approved it should look like this:
      {
        "loanDecision": "approved",
        "internalReasons": [
          "Net cash flow is positive and consistent over the review period.",
          "Debt-to-income ratio is within the healthy range (under 35%).",
          "Savings balance provides sufficient financial cushion."
        ],
        "customerFacingAdvice": [],
      }
  `,
  });

  return object;
};
