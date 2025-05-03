import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching runs:", error);
      return Response.json({ error: "Failed to fetch runs" }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error in runs API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
