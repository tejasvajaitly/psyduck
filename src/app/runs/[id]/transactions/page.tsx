"use client";
import Transactions from "@/app/dashboard/transactions";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";
function Page() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["run"],
    queryFn: () => fetch(`/api/run?id=${params.id}`).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pt-10">
      <Transactions
        transactions={data?.transactions?.transactions}
        name={data?.name}
        accountNumber={data?.account_number}
        runId={data?.id}
      />
    </div>
  );
}

export default Page;
