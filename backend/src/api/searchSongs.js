import express from 'express';
import { supabase } from '../config/env.js';
import { generateEmbedding } from '../embeddings/generateEmbeddings.js';

const router = express.Router();

// RPC SQL function to perform vector similarity search in Supabase
// You need to create this function in your DB if not existing:
// CREATE OR REPLACE FUNCTION match_songs(query_embedding vector(1536))
// RETURNS TABLE (id uuid, title text, artist text, similarity float) AS $$
// BEGIN
//   RETURN QUERY SELECT id, title, artist, 1 - (embedding <=> query_embedding) as similarity
//   FROM songs ORDER BY embedding <=> query_embedding LIMIT 10;
// END;
// $$ LANGUAGE plpgsql STABLE;

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query string' });

    // Generate embedding vector for user query
    const embedding = await generateEmbedding(query);

    // Call Supabase RPC function to find similar songs
    const { data, error } = await supabase.rpc('match_songs', {
      query_embedding: embedding,
    });

    if (error) {
      throw error;
    }

    res.json({ results: data });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;