import { useState } from 'react';
import axiosClient from '../api/axiosClient';

type Props = {
    setSearchResults: (results: []) => void;
}
export const MoodSearch = ({
    setSearchResults
}: Props) => {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleMoodSearch() {
    if (!mood.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/api/find-mood-song', {
        query: mood.trim(),
      });
      console.log(response.data.results)
      setSearchResults(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <textarea
        value={mood}
        onChange={(e) => {
          let val = e.target.value
            .replace(/\s+/g, ' ')
            .replace(/[^a-zA-Z0-9\s,.!?'()-]/g, ''); // Clean input
          setMood(val);
        }}
        placeholder="Express yourself... feeling happy, nostalgic, adventurous, peaceful..."
        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 min-h-[100px] text-base"
        autoFocus
      />
      <button onClick={handleMoodSearch} disabled={loading} className="mt-4 bg-purple-600 text-white py-2 px-6 rounded-md">
        {loading ? 'Searching...' : 'Find Songs'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}