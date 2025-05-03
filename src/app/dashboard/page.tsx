"use client";

import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Sparkles } from "lucide-react";
import { LoanApprovalList } from "./loan-approval-list";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";

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
  const { user } = useUser();
  console.log("Current user:", user?.id);

  const {
    data: runs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Run[]> => {
      console.log("Fetching runs...");
      const response = await fetch("/api/runs");
      const data = await response.json();
      console.log("Fetched runs:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching runs:", error);
    return <div>Error loading runs</div>;
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
