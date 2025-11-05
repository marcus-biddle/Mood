import fetch from 'node-fetch';
import { supabase } from '../config/env.js';
import { openai } from '../config/env.js';
import { generateEmbedding } from '../embeddings/generateEmbeddings.js';

// node src/ingestion/ingest.js

const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN || '';

// Fetch songs from MusicBrainz by genre (example: rap)
async function fetchMusicBrainzSongs() {
  const url = 'https://musicbrainz.org/ws/2/recording?query=tag:energetic&limit=100&fmt=json';
  const response = await fetch(url, {
    headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' }
  });
  const data = await response.json();
  return data.recordings || [];
}

// Search Spotify API to get track details including preview URL
async function searchSpotifyTrack(trackName, artistName) {
  const q = encodeURIComponent(`${trackName} artist:${artistName}`);
  const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}` }
  });
  if (!response.ok) {
    console.error('Spotify search failed', await response.text());
    return null;
  }
  const data = await response.json();
  return data.tracks.items.length > 0 ? data.tracks.items[0] : null;
}

async function generateMoodVector(song) {
  const prompt = `
    Rate the following song on a scale from 0 to 1 for each mood:
    [happy, sad, energetic, calm, angry, romantic, melancholic, uplifting, chill, nostalgic]
    Song: "${song.title}" by ${song.artist}
    Genres: ${song.genres?.join(", ") || "none"}
    Tags: ${song.tags?.join(", ") || "none"}
    Return only a JSON array of 10 numbers.
  `;

  try {
    const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": prompt
        }
      ]
    }
  ],
  text: {
    "format": {
      "type": "text"
    }
  },
  reasoning: {},
  tools: [],
  temperature: 1,
  max_output_tokens: 2048,
  top_p: 1,
  store: true,
  include: ["web_search_call.action.sources"]
});

  const text = response.output_text;

  const arr = JSON.parse(text.match(/\[.*\]/s)[0]);
  return arr;
  } catch (error) {
    console.error("Error generating mood vector:", error);
    return new Array(10).fill(0.5); // fallback neutral mood
  }
}

// Upsert song record into Supabase
async function upsertSong(song) {
  const { data, error } = await supabase.from('songs').upsert([song], { onConflict: 'id' });
  if (error) {
    console.error('Error upserting song:', error);
  }
}

// Main ingestion workflow
async function ingestSongs() {
  const mbSongs = await fetchMusicBrainzSongs();

  for (const mbSong of mbSongs) {
    const artistName = mbSong['artist-credit']?.[0]?.name ?? 'Unknown Artist';
    const spotifyTrack = await searchSpotifyTrack(mbSong.title, artistName);

    // Generate embedding from combined metadata (title + artist + genres)
    const combinedText = `${mbSong.title} ${artistName} ${(mbSong.tags || []).map(t => t.name).join(" ")}`;
    const embedding = await generateEmbedding(combinedText);

    // Generate mood vector from OpenAI GPT
    const moodVector = await generateMoodVector({
      title: mbSong.title,
      artist: artistName,
      genres: mbSong.tags ? mbSong.tags.map(tag => tag.name) : [],
      tags: mbSong.tags ? mbSong.tags.map(tag => tag.name) : [],
    });

    const songRecord = {
      id: mbSong.id,
      title: mbSong.title,
      artist: artistName,
      album: mbSong['releases'] ? mbSong['releases'][0]?.title : null,
      release_date: mbSong['first-release-date'] || null,
      genres: mbSong.tags ? mbSong.tags.map(tag => tag.name) : [],
      mood_vector: moodVector,
      embedding: embedding,
      spotify_track_id: spotifyTrack ? spotifyTrack.id : null,
      audio_preview_url: spotifyTrack ? spotifyTrack.preview_url : null,
      popularity: spotifyTrack ? spotifyTrack.popularity : null,
    };

    try {
      await upsertSong(songRecord);
      console.log(`Upserted song: ${mbSong.title}`);
    } catch (error) {
      console.error('Error upserting song:', error);
    }
  }
}

ingestSongs();
