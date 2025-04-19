"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
type Run = {
  id: string;
  user_id: string;
  created_at: string;
  structured_document: string;
  account_number: string;
  name: string;
  extracted_string: string;
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
      <div>
        {runs?.map((run) => (
          <Link href={`/run/${run.id}`} key={run.id}>
            <div key={run.id}>{run.id}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
