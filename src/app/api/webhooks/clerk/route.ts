import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id } = evt.data;

    // Trigger the onboarding process
    try {
      console.log("Attempting to trigger onboarding for user:", id);
      console.log("Using APP_URL:", process.env.NEXT_PUBLIC_APP_URL);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: id }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Onboarding failed with status:", response.status);
        console.error("Error response:", errorText);
        throw new Error(`Failed to trigger onboarding: ${errorText}`);
      }

      console.log("Onboarding triggered successfully");
    } catch (error) {
      console.error("Error in webhook onboarding:", error);
      // Don't throw the error, just log it and return success to Clerk
      // This prevents webhook retries for non-critical errors
    }
  }

  return new Response("", { status: 200 });
}
