import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { receiverId } = await req.json();

    if (!receiverId) {
      return Response.json({ error: "receiverId가 필요합니다." }, {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { error } = await supabase.from("pokes").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      poke_date: today,
    });

    if (error?.code === "23505") {
      return Response.json(
        {
          error: "오늘은 이미 찔렀습니다.",
        },
        {
          status: 409,
          headers: corsHeaders,
        },
      );
    }

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
    }, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
