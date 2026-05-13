import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await req.json();

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

    const { data: report, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      throw new Error("리포트를 찾을 수 없습니다.");
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `
이번 주 감정 리포트를 기반으로
따뜻한 애니메이션풍 감성 포스터를 생성해줘.

텍스트는 넣지 마.

요약:
${report.summary}

감정:
${report.emotion_summary}
`,
      tools: [
        {
          type: "image_generation",
        },
      ],
    });

    const imageData = response.output.find(
      (item: any) => item.type === "image_generation_call",
    ) as any;

    const base64 = imageData?.result;

    if (!base64) {
      throw new Error("이미지 생성 실패");
    }

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const filePath = `${user.id}/${reportId}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("report-posters")
      .upload(filePath, bytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrl } = supabase.storage
      .from("report-posters")
      .getPublicUrl(uploadData.path);

    await supabase
      .from("weekly_reports")
      .update({
        poster_image_url: publicUrl.publicUrl,
      })
      .eq("id", reportId);

    return Response.json({
      posterImageUrl: publicUrl.publicUrl,
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
