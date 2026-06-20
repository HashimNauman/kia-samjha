const ALLOWED_ORIGINS = [
  "https://hashimnauman.github.io",
  "http://localhost:5173",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = ALLOWED_ORIGINS.includes(origin)
      ? corsHeaders(origin)
      : corsHeaders(ALLOWED_ORIGINS[0]);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const body = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-6",
        max_tokens: body.max_tokens || 1200,
        messages: body.messages,
      }),
    });

    const result = await response.text();
    return new Response(result, {
      status: response.status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  },
};
