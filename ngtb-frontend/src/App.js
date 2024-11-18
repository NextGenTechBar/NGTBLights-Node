import React, { useState, useEffect } from 'react';
import StaticColors from './components/static_colors'; // Make sure to create and style this CSS file
function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:3001/test')
            .then(res => res.text())
            .then(data => setMessage(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            {/* <h1>{message}</h1> */}
            <StaticColors />
        </div>
    );
}

export default App;