import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const findRelevantContent = async (
  userQuery: string,
  run_id: string
) => {
  const supabaseClient = createServerSupabaseClient();
  const { data, error } = await supabaseClient
    .from("runs")
    .select("*")
    .eq("id", run_id);

  console.log(data, error);

  return data;
};

export function createServerSupabaseClient() {
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
