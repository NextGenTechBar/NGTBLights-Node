import React, { useState, useEffect } from 'react';
import Pattern from './components/patterns';
import StaticColors from './components/static_colors'; // Make sure to create and style this CSS file
import './App.css'; // Make sure to create and style this CSS file
function App() {
    const [message, setMessage] = useState('');
    const [currentView, setCurrentView] = useState('staticColors');

    useEffect(() => {
        fetch('http://localhost:3001/test')
            .then(res => res.text())
            .then(data => setMessage(data))
            .catch(err => console.error(err));
    }, []);

    const handleLeftArrowClick = () => {
        setCurrentView('staticColors');
    };

    const handleRightArrowClick = () => {
        setCurrentView('pattern');
    };

    return (
        <div>
            {currentView === 'staticColors' ? <StaticColors /> : <Pattern />}
            <div className="arrow-container">
              <button className="left-arrow" onClick={handleLeftArrowClick}>&larr;</button>
              <button className="right-arrow" onClick={handleRightArrowClick}>&rarr;</button>
            </div>
        </div>
    );
}

export default App;