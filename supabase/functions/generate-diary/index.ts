import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY")!,
    });

    const {
      diaryDate,
      whenText = "",
      whereText = "",
      withWhomText,
      whatText,
      emotion,
      reasonText,
      imageUrls = [],
    } = await req.json();

    // 로그인 유저 확인
    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "Invalid user" }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    // OpenAI Prompt
    const whenLine = whenText ? `- 언제: ${whenText}` : "";
    const whereLine = whereText ? `- 어디서: ${whereText}` : "";

    const prompt = `
너는 감성적인 한국어 일기 작가다.

입력 정보:
${whenLine}
${whereLine}
- 누구와: ${withWhomText}
- 무엇을: ${whatText}
- 감정: ${emotion}
- 이유: ${reasonText}

조건:
- 자연스러운 한국어
- 1인칭 시점
- 과장 금지
- 400자 이내

JSON 형식:
{
  "title": "...",
  "content": "..."
}
`;

    // OpenAI 호출
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const outputText = response.output_text ?? "";

    let parsed;

    try {
      parsed = JSON.parse(outputText);
    } catch {
      parsed = {
        title: "오늘의 일기",
        content: outputText,
      };
    }

    // DB 저장
    const { data: diary, error: insertError } = await supabase
      .from("diaries")
      .upsert(
        {
          user_id: user.id,

          diary_date: diaryDate,

          when_text: whenText,
          where_text: whereText,
          with_whom_text: withWhomText,
          what_text: whatText,

          emotion,
          reason_text: reasonText,

          title: parsed.title,
          content: parsed.content,

          thumbnail_url: imageUrls.length > 0 ? imageUrls[0] : null,

          is_public: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,diary_date",
        },
      )
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 이미지 저장
    if (imageUrls.length > 0) {
      await supabase.from("diary_images").insert(
        imageUrls.map((url: string) => ({
          diary_id: diary.id,
          user_id: user.id,
          image_url: url,
        })),
      );
    }

    return Response.json({
      diary,
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
