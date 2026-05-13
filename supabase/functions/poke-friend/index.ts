import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("pokes").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      poke_date: today,
    });

    if (error) {
      return Response.json(
        {
          error: "오늘은 이미 찔렀습니다.",
        },
        {
          status: 409,
        },
      );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
});
