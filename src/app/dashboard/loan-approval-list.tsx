import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  FileText,
  ListFilter,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

interface LoanApprovalListProps {
  runs: Run[] | undefined;
}

export function LoanApprovalList({ runs }: LoanApprovalListProps) {
  if (!runs) {
    return <div>No runs found</div>;
  }
  return (
    <div className="space-y-6">
      {runs.map((run) => {
        const isApproved = run.final_decision?.loanDecision === "approved";
        const isRejected = run.final_decision?.loanDecision === "rejected";
        const isPending = !isApproved && !isRejected;

        return (
          <Card key={run.id} className="p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${run.id}&scale=200`}
                    alt="Customer avatar"
                  />
                  <AvatarFallback>
                    {run.name ? run.name.substring(0, 2).toUpperCase() : "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-base">
                    {run.name || (
                      <span className="text-gray-500 italic">
                        Name not extracted
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {run.account_number || (
                      <span className="italic">Account number not found</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                    isApproved
                      ? "bg-emerald-100 text-emerald-700"
                      : isRejected
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Approved</span>
                    </>
                  ) : isRejected ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Denied</span>
                    </>
                  ) : (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-amber-500 border-dashed flex items-center justify-center">
                        ?
                      </span>
                      <span>Pending</span>
                    </>
                  )}
                </div>

                <div className="flex gap-3 mt-3 sm:mt-0">
                  <Link
                    href={`/runs/${run.id}`}
                    className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href={`/runs/${run.id}/transactions`}
                    className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ListFilter className="h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                  <Link
                    href={`/runs/${run.id}/chat`}
                    className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Chat</span>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
