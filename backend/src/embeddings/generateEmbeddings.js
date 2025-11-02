import { openai, supabase } from "../config/env.js";
import * as tf from '@tensorflow/tfjs-node';

let moodModel;

async function loadMoodModel(path) {
  moodModel = await tf.loadLayersModel(path); // path to model.json
  console.log('Mood model loaded');
}

await loadMoodModel('file:///absolute/path/to/moodModelSaved/model.json');

export async function generateEmbedding(text) {
  const response = await openai.createEmbedding({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data.data[0].embedding;
}

async function generateMoodEmbedding(songMetadata) {
  if (!moodModel) throw new Error('Mood model not loaded');

  // Example: encode song metadata text as input tensor (e.g., using pretrained tokenizer)
  const inputTensor = preprocessSongToTensor(songMetadata);

  // Predict mood vector (10 floats between 0 and 1)
  const prediction = moodModel.predict(inputTensor);
  const moodVector = await prediction.array();

  return moodVector[0]; // assuming batch size 1
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
processEmbeddings();
