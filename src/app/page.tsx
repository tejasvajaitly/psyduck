"use client";

import { useState } from "react";
import Transactions from "./transactions";

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);

          try {
            const response = await fetch("/api/extract", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            const data = await response.json();

            setTransactions(data.structuredDocument.transactions);
          } catch (error) {
            console.error("Error:", error);
          }
        }}
      >
        <input type="file" name="pdfFile" accept=".pdf" required />
        <button type="submit">Upload PDF</button>
      </form>
      {transactions.length > 0 ? (
        <Transactions transactions={transactions} />
      ) : null}
    </>
  );
}
