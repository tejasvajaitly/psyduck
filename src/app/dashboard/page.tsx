"use client";

import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Sparkles } from "lucide-react";
import { LoanApprovalList } from "./loan-approval-list";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
type Run = {
  id: string;
  user_id: string;
  created_at: string;
  structured_document: string;
  account_number: string;
  name: string;
  extracted_string: string;
  final_decision: {
    loanDecision: "approved" | "rejected" | null | undefined;
    internalReasons: string[] | null | undefined;
    customerFacingAdvice: string[] | null | undefined;
  };
  financial_metrics: {
    label: string;
    value: string;
    color: string;
    description: string;
  }[];
  transactions: {
    date: string;
    type: string;
    amount: string;
    description: string;
  }[];
};

export default function Home() {
  const { data: runs, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Run[]> => {
      const response = await fetch("/api/runs");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="my-10">
      <div className="py-10 flex items-center gap-2">
        <Link href="/analyze" className="flex items-center gap-2">
          <FileBarChart className="h-4 w-4" />
          Analyze bank statement{" "}
          <Sparkles className="h-3.5 w-3.5 text-purple-500 ml-0.5" />
        </Link>
      </div>
      <LoanApprovalList runs={runs} />
    </div>
  );
}
