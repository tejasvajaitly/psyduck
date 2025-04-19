"use client";

import { useState } from "react";
import Transactions from "./transactions";
import { useMutation, useQuery } from "@tanstack/react-query";
import UploadStatement from "./upload-statement";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoanApprovalList } from "./loan-approval-list";
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
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <UploadStatement mutate={mutation.mutate} />

      <div>
        <LoanApprovalList runs={runs} />
      </div>
    </>
  );
}
