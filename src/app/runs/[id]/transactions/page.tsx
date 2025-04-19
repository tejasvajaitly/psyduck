"use client";
import Transactions from "@/app/transactions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
function Page() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["run"],
    queryFn: () => fetch(`/api/run?id=${params.id}`).then((res) => res.json()),
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
  console.log("data", data);
  return (
    <div>
      <Transactions transactions={data?.transactions?.transactions} />
    </div>
  );
}

export default Page;
