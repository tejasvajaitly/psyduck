"use client";

import { useState } from "react";
import Transactions from "./transactions";
import { useMutation } from "@tanstack/react-query";

export default function Home() {
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
  });
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          mutation.mutate(formData);
        }}
      >
        <input type="file" name="pdfFile" accept=".pdf" required />
        <button type="submit">Upload PDF</button>
      </form>
      {mutation.data ? (
        <Transactions
          transactions={mutation.data.structuredDocument.transactions}
        />
      ) : null}
    </>
  );
}
