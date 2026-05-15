import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, {
        status: 401,
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

    const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("pokes")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("poke_date", today);

      if (error) throw error;

      return Response.json(
        {
          pokedFriendIds: (data ?? []).map((row) => String(row.receiver_id)),
        },
        { headers: corsHeaders },
      );
    }

    if (req.method === "POST") {
      const { receiverId } = await req.json();

      if (!receiverId) {
        return Response.json({ error: "receiverId가 필요합니다." }, {
          status: 400,
          headers: corsHeaders,
        });
      }

      const { error } = await supabase.from("pokes").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        poke_date: today,
      });

      if (error?.code === "23505") {
        return Response.json(
          {
            success: true,
            alreadyPoked: true,
            receiverId,
          },
          {
            status: 200,
            headers: corsHeaders,
          },
        );
      }

      if (error) throw error;

      return Response.json(
        {
          success: true,
          alreadyPoked: false,
          receiverId,
        },
        { headers: corsHeaders },
      );
    }

    return Response.json({ error: "Method not allowed" }, {
      status: 405,
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