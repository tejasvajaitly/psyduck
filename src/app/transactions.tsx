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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Transaction = {
  date: string;
  description: string;
  amount: number;
  type: string;
};

export default function Transactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>A list of transactions.</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of transactions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Type</TableHead>
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
                <TableCell>{transaction.amount}</TableCell>
                <TableCell className="text-right">{transaction.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
