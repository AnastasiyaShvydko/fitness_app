//require("dotenv").config();

const DIM = Number(process.env.EMBEDDING_DIM || 1536);
const PROVIDER = (process.env.EMBEDDING_PROVIDER || "mock").toLowerCase();

/** Мок-эмбеддинг для dev: детерминированный вектор той же размерности */
function mockEmbed(text) {
  const v = new Array(DIM).fill(0);
  let h = 0; for (const ch of String(text || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = 0; i < DIM; i++) v[i] = ((Math.sin(h + i) + 1) / 2);
  return v;
}

async function embedOpenAI(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for EMBEDDING_PROVIDER=openai");
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ input: String(text || ""), model: "text-embedding-3-small" })
  });
  if (!resp.ok) throw new Error(`OpenAI embeddings error: ${resp.status}`);
  const json = await resp.json();
  return json.data[0].embedding;
}

async function embed(text) {
  if (PROVIDER === "openai") return embedOpenAI(text);
  // по умолчанию — мок
  return mockEmbed(text);
}

module.exports = { embed, DIM, PROVIDER };
