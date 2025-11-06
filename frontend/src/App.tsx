import { useEffect, useState } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { FaMusic } from 'react-icons/fa6';
import { SongSearch } from './components/SongSearch';
import {MoodSearch} from './components/moodSearch';


// const moodAttributes = [
//   "happy",
//   "sad",
//   "energetic",
//   "calm",
//   "angry",
//   "romantic",
//   "melancholic",
//   "uplifting",
//   "chill",
//   "nostalgic",
// ];

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [currentView, setCurrentView] = useState('mood'); // 'choice', 'mood', 'song', 'both'
  const [songSearch, setSongSearch] = useState('');

//   const handleSearch = async () => {
//   const { data, error } = await supabase.rpc("search_songs_by_mood", {
//     search_vector: chartData.datasets[0].data,
//     limit_count: 20,
//   });

//   console.log(data);

//   if (error) {
//     console.error("Error fetching songs:", error);
//   } else {
//     setSearchResults(data)
//   }
// };

//   const updateMoodValue = (index, value) => {
//   const newDataset = [...chartData.datasets];
//   const newData = [...newDataset[0].data];
//   newData[index] = value;
//   newDataset[0].data = newData;
//   setChartData({
//     ...chartData,
//     datasets: newDataset,
//   });
// };

// const getDecimalFromCoords = (x, y, centerX, centerY, maxRadius) => {
//   console.log(x, y, centerX, centerY, maxRadius)
//   const dx = x - centerX;
//   const dy = y - centerY;
//   const distance = Math.sqrt(dx * dx + dy * dy);
//   const decimal = distance / maxRadius;
//   return Math.min(Math.max(decimal, 0), 1);
// };

// const handleClick = (event) => {
//   const chart = chartRef.current;
//   if (!chart) return;

//   const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, true);
//   if (elements.length === 0) return;

//   const point = elements[0].element;
//   const { x, y } = point;

//   const chartArea = chart.chartArea;
//   console.log(chartArea)
//   const centerX = (chartArea.left + chartArea.right) / 2;
//   const centerY = (chartArea.top + chartArea.bottom) / 2;
//   const maxRadius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;

//   const decimalValue = getDecimalFromCoords(x, y, centerX, centerY, maxRadius);

//   console.log('Decimal value:', decimalValue);
// };

useEffect(() => {
  if (searchResults.length > 0) {
    setCurrentView('choice')
  }
}, [searchResults])

  return (
    <div className=' relative min-h-screen items-center justify-center bg-linear-to-t from-slate-700 via-blue-500 to-teal-600 w-screen'>
      <div className='w-full flex items-center justify-center p-8 gap-2'>
        <button onClick={() => setCurrentView(prev => prev === 'mood' ? 'choice' : 'mood')} className='bg-linear-to-br from-purple-500 to-pink-500 rounded-md p-3'>
          <FaRegHeart className='size-6' />
        </button>
        <button onClick={() => setCurrentView(prev => prev === 'song' ? 'choice' : 'song')} className='bg-linear-to-br from-blue-500 to-cyan-500 rounded-md p-3'>
          <FaMusic className='size-6' />
        </button>
        {/* <button onClick={() => setOpenFilters(true)} className="bg-black p-3 rounded-md w-full flex items-center justify-center gap-2">
          <BsSliders2 className='size-6' />
          <span className=' text-lg'>Filter</span>
        </button> */}
      </div>

      {(currentView === 'mood' || currentView === 'both') && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-5 space-y-3 mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-full">
                <FaRegHeart className='size-6' />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">How are you feeling?</h2>
            </div>

            <MoodSearch setSearchResults={setSearchResults} />
            
            {/* <textarea
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Express yourself... feeling happy, nostalgic, adventurous, peaceful..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 min-h-[100px] text-base"
              autoFocus
            /> */}
            
          </div>
        )}

        {currentView === 'song' && (
          <div className="bg-white rounded-2xl shadow-md p-5 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-4">
            <div className="flex items-center gap-2">
              <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full">
                <FaMusic className='size-4'/>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Search for songs</h2>
            </div>
            
            <SongSearch currentView={currentView} songSearch={songSearch} setSongSearch={setSongSearch} setSearchResults={setSearchResults} />
          </div>
        )}

      {/* <div className='min-h-[75vh]'>
        <Radar
          ref={chartRef}
          data={chartData}
          onClick={handleClick}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div> */}

      {/* <div style={{ margin: '20px 0' }}>
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
      </div> */}

      <div className="max-w-7xl mx-auto">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 p-4">
  {searchResults.map((song: any) => (
    <li key={song.id} className="flex flex-col items-center backdrop-blur-3xl transition-all duration-300 cursor-pointer group p-4 text-black bg-slate-900/10 hover:bg-slate-900/20 rounded-md">
      <div className="relative mb-4">
        <img src={song.spotify_image} alt={song.title} className="shadow-lg aspect-square object-cover rounded-xl" />
      </div>
      <div className='flex flex-col justify-center w-full items-start'>
        <p className=' text-md truncate font-semibold max-w-full'>{song.title}</p>
        <p className="text-gray-300 text-sm truncate">{song.artist}</p>
      </div> 
        
    </li>
  ))}
</ul>
      </div>
    </div>
  );
}
