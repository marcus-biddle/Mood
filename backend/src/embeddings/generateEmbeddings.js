import { openai, supabase } from "../config/env.js";

export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

async function generateMoodEmbedding(songMetadata) {

}


async function updateSongEmbedding(song) {
  // Generate embedding from combined metadata (title, artist, genres)
  const combinedText = `${song.title} ${song.artist} ${song.genres.join(" ")}`;
  const songEmbedding = await generateEmbedding(combinedText);
  const moodEmbedding = generateMoodEmbedding(song);

 const { error } = await supabase
  .from('songs')
  .upsert({
    id: song.id,
    embedding: songEmbedding,
    mood_vector: moodEmbedding,
  }, { onConflict: 'id' });

  if (error) {
    console.error("Error updating embedding for song:", song.title, error);
  } else {
    console.log(`Updated embedding for song: ${song.title}`);
  }
}

async function processEmbeddings() {
  try {
    const { data: songs, error } = await supabase.from("songs").select("*");

    if (error) {
      throw error;
    }

    for (const song of songs) {
      await updateSongEmbedding(song);
    }

    console.log("Embedding generation complete");
  } catch (error) {
    console.error("Embedding generation failed:", error);
  }
}

// Call this function after the initial data ingestion
// processEmbeddings();
