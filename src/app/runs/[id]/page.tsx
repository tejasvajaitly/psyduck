"use client";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { MetricCard } from "./metric-card";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { ListFilter } from "lucide-react";

function Page() {
  const params = useParams<{ id: string }>();
  const { data, isPending } = useQuery({
    queryKey: ["run"],
    queryFn: () => fetch(`/api/run?id=${params.id}`).then((res) => res.json()),
  });

  console.log("data", data);

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-10">
      <div className="md:grid md:grid-flow-col md:grid-rows-3 gap-4">
        <Card className="md:row-span-3">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100">
                <img
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${data?.id}`}
                  alt="Avatar"
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-2xl font-bold">{data?.name}</p>
                <p className="text-sm text-gray-500 text-center">
                  Account Id: {data?.account_number}
                </p>
              </div>

              <div className="flex gap-3 mt-3 sm:mt-0">
                <Link
                  href={`/runs/${data.id}/transactions`}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ListFilter className="h-4 w-4" />
                  <span>Transactions</span>
                </Link>
                <Link
                  href={`/runs/${data.id}/chat`}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Chat</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <MetricCard
          status={
            data?.final_decision?.loanDecision === "approved"
              ? "good"
              : "danger"
          }
          title={data?.final_decision?.loanDecision}
          description={data?.final_decision?.internalReasons[0]}
        />

        {data?.financial_metrics.metrics.map(
          (metric: any, i: number) =>
            i < 5 && (
              <MetricCard
                key={metric.label}
                status={metric.colorTheme}
                title={metric.label}
                value={metric.value}
                description={metric.description}
              />
            )
        )}
      </div>
    </div>
  );
}

export default Page;
