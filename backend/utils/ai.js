const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// Returns the assistant's text, or null if AI isn't configured / fails
const generateText = async (system, user, { maxTokens = 220, temperature = 0.7 } = {}) => {
  if (!process.env.GROQ_API_KEY) {
    console.log("[ai skipped - no GROQ_API_KEY]");
    return null;
  }
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[groq error]", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("[groq error]", e.message);
    return null;
  }
};

module.exports = { generateText };