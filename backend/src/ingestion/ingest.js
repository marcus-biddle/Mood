import fetch from 'node-fetch';
import { supabase } from '../config/env.js';


// Fetch songs from MusicBrainz by genre (example: rock)
async function fetchMusicBrainzSongs() {
  const url = 'https://musicbrainz.org/ws/2/recording?query=tag:rap&limit=20&fmt=json';
  const response = await fetch(url, {
    headers: { 'User-Agent': 'YourAppName/1.0 ( your-email@example.com )' }
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

// Insert or update song record in Supabase
async function upsertSong(song) {
  const { data, error } = await supabase.from('songs').upsert([song], { onConflict: 'id' });
  if (error) {
    console.error('Error upserting song:', error);
  } else {
    console.log(`Upserted song: ${song.title} by ${song.artist}`);
  }
}

async function generateMoodScores(song) {
  const prompt = `
  Rate the following song on a scale from 0 to 1 for each mood:
  [happy, sad, energetic, calm, angry, romantic, melancholic, uplifting, chill, nostalgic]
  Song: "${song.title}" by ${song.artist}
  Genres: ${song.genres?.join(", ") || "none"}
  Tags: ${song.tags?.join(", ") || "none"}
  Return only a JSON array of 10 numbers.
  `;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text = response.output_text;
  try {
    const arr = JSON.parse(text.match(/\[.*\]/s)[0]); // extract array from GPT response
    return arr;
  } catch {
    console.error("Error parsing GPT mood array:", text);
    return new Array(10).fill(0.5); // fallback neutral
  }
}

async function ingestSongs() {
  const mbSongs = await fetchMusicBrainzSongs();

  for (const mbSong of mbSongs) {
    const artistName = mbSong['artist-credit']?.[0]?.name ?? 'Unknown Artist';
    const spotifyTrack = await searchSpotifyTrack(mbSong.title, artistName); // or other id mapping logic

    // Compute mood vector (10-dim) for song using title, artist, metadata
    // This could be via ML model, heuristic, or static mapping
    const moodVector = calculateMoodVectorForSong(mbSong);

    const songRecord = {
      id: mbSong.id,
      title: mbSong.title,
      artist: artistName,
      album: mbSong['releases'] ? mbSong['releases'][0]?.title : null,
      release_date: mbSong['first-release-date'] || null,
      genres: mbSong.tags ? mbSong.tags.map(tag => tag.name) : [],
      mood_vector: moodVector,          // store the continuous vector of feelings
      spotify_track_id: spotifyTrack ? spotifyTrack.id : null,
      audio_preview_url: spotifyTrack ? spotifyTrack.preview_url : null,
      popularity: spotifyTrack ? spotifyTrack.popularity : null,
      embedding: null,                  // keep null or generate separately if needed
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
