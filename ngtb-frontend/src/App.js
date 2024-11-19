import React, { useState } from 'react';
import Pattern from './components/patterns';
import StaticColors from './components/static_colors'; // Make sure to create and style this CSS file
import Animations from './components/animations'; // Import the Animations component
import './App.css'; // Make sure to create and style this CSS file
import mqtt from 'mqtt';
const protocol = 'ws'
const host = '52.37.79.188'
const port = '1883'
const path = '/mqtt'
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}${path}`
function App() {
    const mqttClient = mqtt.connect(connectUrl); 
    const [currentView, setCurrentView] = useState('staticColors');

    const views = ['staticColors', 'pattern', 'animations'];

    const handleLeftArrowClick = () => {
        const currentIndex = views.indexOf(currentView);
        const newIndex = (currentIndex - 1 + views.length) % views.length;
        setCurrentView(views[newIndex]);
    };

    const handleRightArrowClick = () => {
        const currentIndex = views.indexOf(currentView);
        const newIndex = (currentIndex + 1) % views.length;
        setCurrentView(views[newIndex]);
    };

    return (
        <div className="app-container">
            {currentView === 'staticColors' && <StaticColors mqttClient={{client: mqttClient}}/>}
            {currentView === 'pattern' && <Pattern mqttClient={{client: mqttClient}}/>}
            {currentView === 'animations' && <Animations mqttClient={{client: mqttClient}}/>}
            <div className="arrow-container">
                <button className="left-arrow" onClick={handleLeftArrowClick}>&larr;</button>
                <button className="right-arrow" onClick={handleRightArrowClick}>&rarr;</button>
            </div>
        </div>
    );
}

export default App;