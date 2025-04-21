"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MoveUpRight, MoveDownRight } from "lucide-react";

type Transaction = {
  date: string;
  description: string;
  amount: number;
  type: string;
};

export default function Transactions({
  transactions,
  name,
  accountNumber,
  runId,
}: {
  transactions: Transaction[];
  name: string;
  accountNumber: string;
  runId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${runId}&scale=200`}
              alt="Customer avatar"
            />
            <AvatarFallback>
              {name ? name.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          {name} - {accountNumber}
          <div className="flex gap-3 mt-3 sm:mt-0">
            <Link
              href={`/runs/${runId}`}
              className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Overview</span>
            </Link>

            <Link
              href={`/runs/${runId}/chat`}
              className="text-sm flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Chat</span>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of transactions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.description + transaction.amount}>
                <TableCell className="font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell className="truncate max-w-[200px]">
                  {transaction.description}
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    <span
                      className={
                        transaction.type.toLowerCase() === "credit"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }
                    >
                      {transaction.amount}
                    </span>
                    {transaction.type.toLowerCase() === "credit" ? (
                      <MoveUpRight className="h-2 w-2 text-emerald-500" />
                    ) : (
                      <MoveDownRight className="h-2 w-2 text-red-500" />
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
