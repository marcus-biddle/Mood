import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from "motion/react"
import { BsSearch } from 'react-icons/bs';

export const AnimatedButtonInput = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    if (!inputValue) {
      setIsExpanded(false);
    }
  }, [inputValue]);

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      console.log('Input submitted:', inputValue);
      setInputValue('');
      setIsExpanded(false);
    }
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <motion.div
      layout
      initial={false}
      animate={{ maxWidth: isExpanded ? 1200 : 40, borderRadius: isExpanded ? 9999 : 6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative flex items-center border rounded-lg overflow-hidden border-emerald-700"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.button
            key="button"
            onClick={handleExpand}
            className="w-full h-10 bg-transparent border border-emerald-700 rounded-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            aria-label="Expand input"
          >
            <BsSearch className='w-6 h-6 text-emerald-700 ' />
          </motion.button>
        ) : (
          <motion.div
            key="input-container"
            className="flex items-center grow px-2 py-1 border border-emerald-700"
            initial={{ opacity: 0, borderRadius: 6 }}
            animate={{ opacity: 1,  borderRadius:9999}}
            exit={{ opacity: 0, borderRadius: 6 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleCollapse}
              onKeyDown={handleKeyDown}
              placeholder="Search for songs..."
              className="grow outline-none px-2 py-1"
              aria-label="Search input"
            />
            {/* <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="ml-2 bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Go
            </button> */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};