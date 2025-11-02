// moodModel.js
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import { generateEmbedding } from './generateEmbeddings.js'

// === CONFIG ===
const MODEL_SAVE_PATH = "file://./embeddings/moodModelSaved";
const EPOCHS = 50;
const BATCH_SIZE = 16;

// === PREDEFINED MOOD LABELS ===
const MOOD_LABELS = [
  "happy",
  "sad",
  "energetic",
  "calm",
  "angry",
  "romantic",
  "melancholic",
  "uplifting",
  "chill",
  "nostalgic",
];

// === SAMPLE TRAINING DATA ===
// You can later replace this with a CSV, database, or scraped dataset.
const SONGS = [
  {
    title: "Sunshine",
    artist: "The Happy Beats",
    genres: ["pop"],
    tags: ["bright", "upbeat", "positive"],
    mood: [1, 0, 0.9, 0, 0, 0.2, 0, 0.8, 0.6, 0.3],
  },
  {
    title: "Lost in Thought",
    artist: "Dreamscape",
    genres: ["ambient"],
    tags: ["slow", "relax", "emotional"],
    mood: [0.1, 0.8, 0.2, 0.9, 0.1, 0.4, 0.8, 0.3, 0.9, 0.7],
  },
  {
    title: "Firestorm",
    artist: "Volt Rage",
    genres: ["metal", "rock"],
    tags: ["aggressive", "fast", "power"],
    mood: [0.1, 0.2, 0.9, 0, 1, 0, 0.2, 0.3, 0.2, 0.1],
  },
  {
    title: "Moonlit Walk",
    artist: "Lover's Echo",
    genres: ["r&b"],
    tags: ["love", "romantic", "soft"],
    mood: [0.8, 0.2, 0.4, 0.6, 0.1, 1, 0.5, 0.7, 0.7, 0.8],
  },
];

// 2️⃣ Convert training songs into input (X) and label (Y) tensors
async function prepareTrainingData(songs) {
  console.log("📦 Generating embeddings...");
  const embeddings = [];
  const labels = [];

  for (const song of songs) {
    const text = [song.title, song.artist, ...(song.genres || []), ...(song.tags || [])]
      .filter(Boolean)
      .join(" ");
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
    labels.push(song.mood);
  }

  const trainX = tf.tensor2d(embeddings);
  const trainY = tf.tensor2d(labels);
  console.log("✅ Data ready:", trainX.shape, trainY.shape);

  return { trainX, trainY, inputDim: embeddings[0].length };
}

// 3️⃣ Define and compile model
function createMoodModel(inputDim) {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [inputDim], units: 128, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 10, activation: "sigmoid" }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
    metrics: ["mse"],
  });

  model.summary();
  return model;
}

// 4️⃣ Train and save the model
async function trainAndSaveModel() {
  const { trainX, trainY, inputDim } = await prepareTrainingData(SONGS);
  const model = createMoodModel(inputDim);

  console.log("🚀 Training model...");
  await model.fit(trainX, trainY, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: tf.callbacks.earlyStopping({ monitor: "val_loss", patience: 5 }),
  });

  console.log("💾 Saving model...");
  await model.save(MODEL_SAVE_PATH);
  console.log(`✅ Model saved to ${MODEL_SAVE_PATH}`);

  // Optional: clean up memory
  trainX.dispose();
  trainY.dispose();
}

// 5️⃣ Load model and test prediction
async function testModel() {
  const model = await tf.loadLayersModel(`${MODEL_SAVE_PATH}/model.json`);
  console.log("🔍 Testing model...");

  const text = "Soft acoustic love song with romantic lyrics";
  const embedding = await generateEmbedding(text);
  const prediction = model.predict(tf.tensor2d([embedding]));
  prediction.print();
}

// Run the full training + test sequence
(async () => {
  if (!fs.existsSync("./models")) fs.mkdirSync("./moodmodelsSaved");
  await trainAndSaveModel();
  await testModel();
})();