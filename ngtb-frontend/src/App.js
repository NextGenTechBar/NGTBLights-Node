import React, { useState} from 'react';
import Pattern from './components/patterns';
import StaticColors from './components/static_colors';
import Animations from './components/animations';
import './App.scss';
import mqtt from 'mqtt';
import Cookies from 'js-cookie';

const protocol = 'wss';
const host = '52.37.79.188';
const port = '1884';
const path = '/mqtt';
const connectUrl = `${protocol}://${host}:${port}${path}`;
var connected = false;
var mqttClient = null;
const getClientId = () => {
    let clientId = Cookies.get('mqttClientId');
    if (!clientId) {
        clientId = `mqtt_web_user_${Math.random  ().toString(16).slice(3)}`;
        Cookies.set('mqttClientId', clientId, { expires: 365 }); // Expires in 1 year
    }
    return clientId;
};
function onConnect() {
    const clientId = getClientId();
    if(!connected){
        console.log('Connected');
        mqttClient = mqtt.connect(connectUrl, (clientId + Math.random  ().toString(16).slice(3)))
        connected = true;
    }
    
}

function App() {
    onConnect();
    // console.log(clientId);
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
            {currentView === 'staticColors' && <StaticColors MqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}} />}
            {currentView === 'pattern' && <Pattern mqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}}  />}
            {currentView === 'animations' && <Animations mqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}}  />}
            <div className="arrow-container">
                <button className="left-arrow" onClick={handleLeftArrowClick}>&larr;</button>
                <button className="right-arrow" onClick={handleRightArrowClick}>&rarr;</button>
            </div>
        </div>
    );
}

export default App;