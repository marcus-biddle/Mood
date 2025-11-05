import React, { useRef, useState } from 'react';
import { BsSliders2 } from 'react-icons/bs';
import { FaRegHeart } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';
import { FaMusic } from 'react-icons/fa6';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { supabase } from './supabaseClient';

// Register components required for radar charts
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const moodAttributes = [
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

const initialData = {
  labels: moodAttributes,
  datasets: [{ label: 'Mood Allocation', data: new Array(moodAttributes.length).fill(1), backgroundColor: 'rgba(75,192,192,0.2)', borderColor: 'rgba(75,192,192,1)', borderWidth: 2 }],
};

export default function App() {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(initialData);
  const [searchResults, setSearchResults] = useState([]);
  const [isFiltersOpen, setOpenFilters] = useState(false);
  const [currentView, setCurrentView] = useState('choice'); // 'choice', 'mood', 'song', 'both'
  const [mood, setMood] = useState('');
  const [songSearch, setSongSearch] = useState('');

  const handleSearch = async () => {
  const { data, error } = await supabase.rpc("search_songs_by_mood", {
    search_vector: chartData.datasets[0].data,
    limit_count: 20,
  });

  console.log(data);

  if (error) {
    console.error("Error fetching songs:", error);
  } else {
    setSearchResults(data)
  }
};

  const updateMoodValue = (index, value) => {
  const newDataset = [...chartData.datasets];
  const newData = [...newDataset[0].data];
  newData[index] = value;
  newDataset[0].data = newData;
  setChartData({
    ...chartData,
    datasets: newDataset,
  });
};

const getDecimalFromCoords = (x, y, centerX, centerY, maxRadius) => {
  console.log(x, y, centerX, centerY, maxRadius)
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const decimal = distance / maxRadius;
  return Math.min(Math.max(decimal, 0), 1);
};

const handleClick = (event) => {
  const chart = chartRef.current;
  if (!chart) return;

  const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, true);
  if (elements.length === 0) return;

  const point = elements[0].element;
  const { x, y } = point;

  const chartArea = chart.chartArea;
  console.log(chartArea)
  const centerX = (chartArea.left + chartArea.right) / 2;
  const centerY = (chartArea.top + chartArea.bottom) / 2;
  const maxRadius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;

  const decimalValue = getDecimalFromCoords(x, y, centerX, centerY, maxRadius);

  console.log('Decimal value:', decimalValue);
};


  return (
    <div className=' relative h-screen items-center justify-center bg-linear-to-br from-green-300 via-emerald-300 to-teal-300 w-screen'>
      <div className='w-full flex items-center justify-center p-8 gap-2'>
        <button onClick={() => setCurrentView('mood')} className='bg-linear-to-br from-purple-500 to-pink-500 rounded-md p-3'>
          <FaRegHeart className='size-6' />
        </button>
        <button onClick={() => setCurrentView('song')} className='bg-linear-to-br from-blue-500 to-cyan-500 rounded-md p-3'>
          <FaMusic className='size-6' />
        </button>
        <button onClick={() => setOpenFilters(true)} className="bg-black p-3 rounded-md w-full flex items-center justify-center gap-2">
          <BsSliders2 className='size-6' />
          <span className=' text-lg'>Filter</span>
        </button>
      </div>

      {(currentView === 'mood' || currentView === 'both') && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-5 space-y-3 mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-full">
                <FaRegHeart className='size-6' />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">How are you feeling?</h2>
            </div>
            
            <textarea
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Express yourself... feeling happy, nostalgic, adventurous, peaceful..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 min-h-[100px] text-base"
              autoFocus
            />
            
            {/* {mood && (
              <div className="flex items-start gap-2 bg-purple-50 rounded-lg p-3">
                <Sparkles size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-700">
                  {currentView === 'mood' ? "Great! Now you can search for specific songs to match your vibe." : "Perfect! Add some songs below if you'd like."}
                </p>
              </div>
            )} */}
          </div>
        )}

        {currentView === 'song' && (
          <div className="bg-white rounded-2xl shadow-md p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full">
                <FaMusic className='size-6'/>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Search for songs</h2>
              {currentView === 'mood' && <span className="text-xs text-gray-500">(optional)</span>}
            </div>
            
            <div className="relative">
              <BsSearch className="absolute size-3 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                placeholder="Song name or artist..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                autoFocus={currentView === 'song'}
              />
            </div>
          </div>
        )}

      <div className='min-h-[75vh]'>
        <Radar
          ref={chartRef}
          data={chartData}
          onClick={handleClick}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>

      <div style={{ margin: '20px 0' }}>
        {moodAttributes.map((mood, idx) => (
          <div key={mood} style={{ marginBottom: 10 }}>
            <label>{mood}: {chartData.datasets[0].data[idx].toFixed(2)}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={chartData.datasets[0].data[idx]}
              onChange={(e) => updateMoodValue(idx, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div>
        <h3>Search Results</h3>
        <button onClick={() => handleSearch()}>Search results</button>
        <ul>
          {searchResults.map((song) => (
            <li key={song.id}>{song.title} by {song.artist}</li>
          ))}
        </ul>
      </div>

      {isFiltersOpen && (
        <div 
        className={`fixed h-screen bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-transform duration-300 max-h-[87vh] flex flex-col ${
          isFiltersOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >test</div>
      )}
    </div>
  );
}
