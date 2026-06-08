import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StickySearch.css';

const StickySearch = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/menu?search=${encodeURIComponent(query)}`);
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in your browser.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      navigate(`/menu?search=${encodeURIComponent(transcript)}`);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="sticky-search-wrapper mobile-only">
      <form className="sticky-search-bar" onSubmit={handleSearch}>
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search Dosa, Idli, Meals, Batter..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="button" 
          className={`voice-search-btn ${isListening ? 'listening' : ''}`}
          onClick={startVoiceSearch}
        >
          <Mic size={20} />
        </button>
      </form>
    </div>
  );
};

export default StickySearch;
