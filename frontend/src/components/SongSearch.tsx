import { useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Songs } from '../api/songs';

type Props = {
    currentView: string;
    songSearch: string;
    setSearchResults: (results: []) => void
    setSongSearch: (song: string) => void;
}

export const SongSearch = ({
    currentView,
    songSearch,
    setSongSearch,
    setSearchResults
}: Props) => {
//   const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Searching....')
    e.preventDefault();
    if (!songSearch) {
        setSearchResults([]);
        return;
    }

    setLoading(true);
    setError(null);

    let query = songSearch;

    query = query.trim();
    // Replace multiple spaces with a single space
    query = query.replace(/\s+/g, ' ');
    // Remove special characters except alphanumerics and spaces (customize as needed)
    query = query.replace(/[^a-zA-Z0-9\s]/g, '');

    console.log('query', query)

    try {
      const results = await Songs.search(query)

      if (!results) {
        setError(results || 'Search failed');
        setSearchResults([]);
      } else {
        console.log(results)
        setSearchResults(results || []);
      }
    } catch (err) {
      setError('Network error');
      setSearchResults([]);
    }

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div className='relative'>
            <BsSearch className="absolute size-4 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
            type="text"
            value={songSearch}
            onChange={(e) => {
                if (e.target.value === '') {
                    setSearchResults([]);
                };
                setSongSearch(e.target.value);
            }}
            placeholder="Song name or artist..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            autoFocus={currentView === 'song'}
            />
        </div>
        
        <div className='w-full flex justify-end items-center my-4'>
            <button type="submit" disabled={loading} className='bg-linear-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-md'>
          {loading ? 'Searching...' : 'Search'}
        </button>
        </div>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}