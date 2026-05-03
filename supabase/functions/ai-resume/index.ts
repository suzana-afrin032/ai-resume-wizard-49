const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROMPTS: Record<string, (input: any) => string> = {
  summary: (i) =>
    `Write a concise, first-person professional resume summary (3-4 sentences, no fluff, ATS-friendly) for:\nName: ${i.name}\nTitle: ${i.title}\nYears of experience: ${i.years}\nKey skills: ${i.skills}\nReturn only the summary text.`,
  bullets: (i) =>
    `Rewrite these work experience notes as 3-5 strong, quantified resume bullet points starting with action verbs. Role: ${i.role} at ${i.company}. Notes: ${i.notes}\nReturn only the bullets, one per line, prefixed with "• ".`,
  skills: (i) =>
    `Suggest 12 relevant, in-demand skills (mix of hard and soft) for the role "${i.title}". Return as a comma-separated list, no numbering, no extra text.`,
  ats: (i) =>
    `Analyze this resume against ATS best practices and suggest 5 specific improvements (missing keywords, weak verbs, formatting). Resume:\n${i.resume}\nJob target: ${i.jobTitle || "general"}\nReturn a short markdown list.`,
  improve: (i) =>
    `Rewrite this resume text to be more professional, concise, and impactful while preserving meaning:\n"""${i.text}"""\nReturn only the rewritten text.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, input } = await req.json();
    const builder = PROMPTS[type];
    if (!builder) {
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert resume writer and career coach. Be concise and ATS-aware." },
          { role: "user", content: builder(input) },
        ],
      }),
    });

    if (resp.status === 429)
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (resp.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
