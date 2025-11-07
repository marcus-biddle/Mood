import { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
export const MoodCategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodCategories = ['Happy', 'Sad', 'Calm', 'Angry', 'Melancholic', 'Excited'];

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setIsOpen(false);
  };

  return (
    <div className="">
      <div className="">

        {/* Dropdown Container */}
        <div className="relative">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full min-w-40 px-2 py-1 bg-gray-800 border-1 border-gray-700 rounded-md hover:border-emerald-500 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedMood ? (
                  <>
                    <div className="text-left">
                      <p className="font-semibold text-white text-lg">{selectedMood} Music</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-left">
                      <p className="font-semibold text-gray-300 text-lg">Category</p>
                    </div>
                  </>
                )}
              </div>
              <>
              <BsChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
              </>
              
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu Items */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-2 border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-h-96 overflow-y-auto">
                  {moodCategories.map((mood, index) => {
                    return (
                      <button
                        key={mood}
                        onClick={() => handleSelectMood(mood)}
                        className={`w-full px-6 py-4 hover:bg-gray-700 transition-all duration-200 group ${
                          index !== moodCategories.length - 1 ? 'border-b border-gray-700' : ''
                        } ${selectedMood === mood ? 'bg-gray-700 text-emerald-500' : 'text-white'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left flex-1">
                            <p className="font-semibold text-lg mb-0.5 group-hover:text-emerald-400 transition-colors">
                              {mood} Music
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};