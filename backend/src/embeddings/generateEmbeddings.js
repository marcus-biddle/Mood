import { openai, supabase } from "../config/env.js";

export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

// Call this function after the initial data ingestion
// processEmbeddings();
