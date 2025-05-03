import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Get userId from request body for webhook calls
    const body = await req.json();
    const userId = body.userId;

    console.log("Starting onboarding for user:", userId);
    console.log("Source user ID:", process.env.SOURCE_USER_ID);

    if (!userId) {
      return NextResponse.json(
        { error: "No user ID provided" },
        { status: 400 }
      );
    }

    // Create a Supabase client with service role key for all operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // This key bypasses RLS
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // First, check if the user already has runs
    const { data: existingRuns } = await supabaseAdmin
      .from("runs")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    console.log("Existing runs check:", existingRuns);

    if (existingRuns && existingRuns.length > 0) {
      return NextResponse.json({ message: "User already has runs" });
    }

    // Get all runs from the source user using admin client
    console.log("Fetching runs for source user:", process.env.SOURCE_USER_ID);
    const { data: sourceRuns, error: sourceError } = await supabaseAdmin
      .from("runs")
      .select("*")
      .eq("user_id", process.env.SOURCE_USER_ID);

    console.log("Source runs query result:", {
      count: sourceRuns?.length || 0,
      error: sourceError,
      firstRun: sourceRuns?.[0],
    });

    if (sourceError) {
      console.error("Error fetching source runs:", sourceError);
      throw sourceError;
    }

    if (!sourceRuns || sourceRuns.length === 0) {
      console.log(
        "No runs found for source user. Checking all runs in database..."
      );
      const { data: allRuns, error: allRunsError } = await supabaseAdmin
        .from("runs")
        .select("user_id, id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      console.log("Recent runs in database:", allRuns);
      return NextResponse.json({ message: "No source runs found" });
    }

    // Insert the runs for the new user using admin client
    const runsToInsert = sourceRuns.map((run) => {
      // Create a deep copy of the run to avoid modifying the original
      const newRun = JSON.parse(JSON.stringify(run));

      // Remove the id and update the user_id
      delete newRun.id;
      newRun.user_id = userId;
      newRun.created_at = new Date().toISOString();

      console.log("Preparing run for insertion:", {
        originalId: run.id,
        newUserId: newRun.user_id,
        hasTransactions: !!newRun.transactions,
        hasFinancialMetrics: !!newRun.financial_metrics,
        originalUserId: run.user_id,
      });

      return newRun;
    });

    console.log("Attempting to insert runs:", runsToInsert.length);
    console.log(
      "First run to insert:",
      JSON.stringify(runsToInsert[0], null, 2)
    );

    const { data: insertedRuns, error: insertError } = await supabaseAdmin
      .from("runs")
      .insert(runsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting runs:", insertError);
      throw insertError;
    }

    console.log("Successfully inserted runs:", insertedRuns?.length || 0);
    console.log("First inserted run:", insertedRuns?.[0]);

    // Verify the runs were inserted
    const { data: verifyRuns, error: verifyError } = await supabaseAdmin
      .from("runs")
      .select("*")
      .eq("user_id", userId);

    console.log("Verification query result:", {
      count: verifyRuns?.length || 0,
      error: verifyError,
      firstRun: verifyRuns?.[0],
    });

    return NextResponse.json({
      message: "Runs copied successfully",
      insertedCount: insertedRuns?.length || 0,
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return NextResponse.json({ error: "Failed to copy runs" }, { status: 500 });
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
