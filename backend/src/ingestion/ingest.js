import fetch from 'node-fetch';
import { supabase } from '../config/env.js';
import { openai } from '../config/env.js';
import { generateEmbedding } from '../embeddings/generateEmbeddings.js';

// node src/ingestion/ingest.js

const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN || '';

// Fetch songs from MusicBrainz by genre (example: rap)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMusicBrainzSongs() {
  const urls = [
    'https://musicbrainz.org/ws/2/recording?query=Melanie%Martinez+AND+country:US&limit=100&fmt=json',
    'https://musicbrainz.org/ws/2/recording?query=Jessie%Reyez+AND+country:US&limit=100&fmt=json',
    'https://musicbrainz.org/ws/2/recording?query=tag:anime+AND+country:US&limit=100&fmt=json',
    'https://musicbrainz.org/ws/2/recording?query=tag:trap+AND+country:US&limit=100&fmt=json',
    'https://musicbrainz.org/ws/2/recording?query=tag:alt%trap+AND+country:US&limit=100&fmt=json',
    'https://musicbrainz.org/ws/2/recording?query=Workout+AND+country:US&limit=100&fmt=json'
  ]

  let allRecordings = [];

  for (const url of urls) {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' }
    });
    const result = await response.json();
    allRecordings = allRecordings.concat(result.recordings || []);
    await delay(1100); // Wait 1.1 seconds between requests to respect rate limit
  }

  return allRecordings;
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

  // Filter tracks to those with images, since images are on album property
  const tracksWithImages = data.tracks.items.filter(track =>
    track.album && Array.isArray(track.album.images) && track.album.images.length > 0
  );

  // Return the first track with images or null if none found
  return tracksWithImages[0] ? tracksWithImages[0] : null;
}

export async function generateOpenAIVectorResponse(prompt) {
  return await openai.responses.create({
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
}

async function generateMoodEmbedding(song) {
  const prompt = `
    Generate a list of the biggest emotions a human has when listening to music genres. Decide what type of emotion and feelings a person would have based on the song below.

    Song metadata:
    Title: "${song.title}"
    Artist: "${song.artist}"
    Genres: ${song.genres.length ? song.genres.join(", ") : "none"}
    Tags: ${song.tags.length ? song.tags.join(", ") : "none"}
  `;

  try {
    return await generateEmbedding(prompt);
  } catch (error) {
    console.error("Error generating mood embedding:", error);
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

    if (!spotifyTrack || spotifyTrack.album.images.length < 1) {
      // Skip this song if no Spotify track found
      console.log(`Skipping song with no Spotify track: ${mbSong.title}`);
      continue;
    }

    // Generate embedding from combined metadata (title + artist + genres)
    const combinedText = `${mbSong.title} ${artistName} ${(mbSong.tags || []).map(t => t.name).join(" ")}`;
    const embedding = await generateEmbedding(combinedText);

    // Generate mood vector from OpenAI GPT
    const moodEmbedding = await generateMoodEmbedding({
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
      mood_vector: moodEmbedding,
      embedding: embedding,
      spotify_track_id: spotifyTrack ? spotifyTrack.id : null,
      spotify_image: spotifyTrack ? spotifyTrack.album.images[0].url : null,
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

// ingestSongs();
