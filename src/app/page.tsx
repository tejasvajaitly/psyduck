"use client";

import { useQuery } from "@tanstack/react-query";
import { FileBarChart } from "lucide-react";
import { LoanApprovalList } from "./loan-approval-list";
import Link from "next/link";
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
    return <div>Loading...</div>;
  }
  return (
    <div className="my-10">
      <div className="py-10 flex items-center gap-2">
        <FileBarChart className="h-4 w-4" />
        <Link href="/analyze">Analyze bank statement</Link>
      </div>
      <LoanApprovalList runs={runs} />
    </div>
  );
}
