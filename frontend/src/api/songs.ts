import axiosClient from "./axiosClient";

async function search(query: string) {
  try {
    const response = await axiosClient.post('/api/search', { query });
    return response.data.results;
  } catch (error) {
    console.error('Error in search API:', error);
    throw error;
  }
}

async function findSongsByMood(mood: string) {
  try {
    const response = await axiosClient.post('/api/find-mood-song', {
      query: mood.trim(),
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching mood song:', error);
    throw error;
  }
}

export const Songs = {
    search,
    findSongsByMood
}