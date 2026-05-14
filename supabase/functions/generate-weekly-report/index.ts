import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const { weekStart, weekEnd } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return Response.json({ error: "Invalid user" }, { status: 401, headers: corsHeaders });
    }

    const { data: diaries, error } = await supabase
      .from("diaries")
      .select("diary_date, emotion, content, body")
      .eq("user_id", user.id)
      .gte("diary_date", weekStart)
      .lte("diary_date", weekEnd)
      .order("diary_date", { ascending: true });

    if (error) throw error;

    if (!diaries || diaries.length === 0) {
      throw new Error("이번 주 작성된 일기가 없어요.");
    }

    const diaryList = diaries.map((d) => ({
      date: d.diary_date,
      emotion: d.emotion ?? "",
      content: (d.content ?? d.body ?? "").slice(0, 300),
    }));

    const prompt = `
다음은 사용자의 ${weekStart} ~ ${weekEnd} 주간 일기 목록이야.

일기:
${JSON.stringify(diaryList, null, 2)}

아래 JSON 형식으로 주간 감정 리포트를 생성해줘.

조건:
- 따뜻한 한국어 사용
- 과장 금지
- 실제 일기 내용 기반으로 분석

{
  "emotion_story": [
    { "date": "YYYY-MM-DD", "emotion": "일기의 감정ID 그대로", "intensity": 1에서10사이_정수 }
  ],
  "insights": [
    { "type": "increase 또는 decrease 또는 neutral", "title": "짧은제목(8자이내)", "delta_percent": -100에서100사이_정수 }
  ],
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "reflection_tip": "이번 주를 돌아보는 따뜻한 한두 줄 조언"
}

규칙:
- emotion_story: 일기가 있는 날짜만 포함, intensity는 감정의 긍정도 (1=매우부정, 10=매우긍정)
- insights: 2~3개, 이번 주 감정/활동 변화 분석
- keywords: 일기에서 반복되거나 중요한 단어 최대 5개
- JSON만 반환, 다른 텍스트 없이
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const outputText = response.choices[0]?.message?.content ?? "";
    let parsed: {
      emotion_story?: unknown[];
      insights?: unknown[];
      keywords?: string[];
      reflection_tip?: string;
    };

    try {
      parsed = JSON.parse(extractJson(outputText));
    } catch {
      throw new Error("리포트 생성 응답을 읽지 못했습니다.");
    }

    const { data: report, error: insertError } = await supabase
      .from("weekly_reports")
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          week_end: weekEnd,
          emotion_story: parsed.emotion_story ?? [],
          insights: parsed.insights ?? [],
          keywords: parsed.keywords ?? [],
          reflection_tip: parsed.reflection_tip ?? "",
        },
        { onConflict: "user_id,week_start" },
      )
      .select()
      .single();

    if (insertError) throw insertError;

    return Response.json({ report }, { headers: corsHeaders });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    );
  }
});
