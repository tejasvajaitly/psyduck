"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@ai-sdk/react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ListFilter } from "lucide-react";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function Chat() {
  const params = useParams<{ id: string }>();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
    body: {
      run_id: params.id,
    },
  });
  const { data } = useQuery({
    queryKey: ["run"],
    queryFn: () => fetch(`/api/run?id=${params.id}`).then((res) => res.json()),
  });
  const { user } = useUser();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {data && (
        <div className="flex flex-row items-start gap-2 mb-8">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${data.id}&scale=200`}
              alt="Customer avatar"
            />
            <AvatarFallback>
              {data.name ? data.name.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row">
              <p className="text-xs">{data.name}, </p>
              <p className="text-xs">{data.account_number}</p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/runs/${params.id}`}
                className="text-xs flex items-center gap-1.5 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                <FileText className="h-2 w-2" />
                <span>Overview</span>
              </Link>
              <Link
                href={`/runs/${params.id}/transactions`}
                className="text-xs flex items-center gap-1.5 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                <ListFilter className="h-2 w-2" />
                <span>Transactions</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              {m.role === "user" ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/psyduck.png" />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {"calling tool: " + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 backdrop-blur-md"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
