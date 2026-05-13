import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weekStart, weekEnd } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY")!,
    });

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const { data: diaries, error } = await supabase
      .from("diaries")
      .select("*")
      .eq("user_id", user.id)
      .gte("diary_date", weekStart)
      .lte("diary_date", weekEnd)
      .order("diary_date", {
        ascending: true,
      });

    if (error) throw error;

    const prompt = `
아래 일기들을 바탕으로 주간 감정 리포트를 작성해줘.

조건:
- 따뜻한 말투
- 과장 금지
- 감정 흐름 분석
- 반복 키워드 분석
- JSON 형식 반환

JSON:
{
  "summary": "...",
  "emotionSummary": "...",
  "topKeywords": ["...", "..."]
}

일기:
${JSON.stringify(diaries)}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const outputText = response.output_text ?? "{}";

    const parsed = JSON.parse(outputText);

    const { data: report, error: insertError } = await supabase
      .from("weekly_reports")
      .upsert(
        {
          user_id: user.id,

          week_start: weekStart,
          week_end: weekEnd,

          summary: parsed.summary,
          emotion_summary: parsed.emotionSummary,

          top_keywords: parsed.topKeywords ?? [],
        },
        {
          onConflict: "user_id,week_start",
        },
      )
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return Response.json({
      report,
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
