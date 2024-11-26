import React, { useEffect,useState} from 'react';
import Pattern from './components/patterns';
import StaticColors from './components/static_colors';
import Animations from './components/animations';
import Custom from './components/custom';
import './App.scss';
import mqtt from 'mqtt';
import Cookies from 'js-cookie';

const protocol = 'wss';
const host = 'ngtblights.gonzaga.edu';
const port = '1884';
const path = '/mqtt';
const connectUrl = `${protocol}://${host}:${port}${path}`;
var connected = false;
var mqttClient = null;

const getClientId = () => {
    let clientId = Cookies.get('mqttClientId');
    if (!clientId) {
        Cookies.set('mqttClientId', clientId, { expires: 365 }); // Expires in 1 year
        clientId = `mqtt_web_user_${Math.random  ().toString(16).slice(3)}`;
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

    const views = ['staticColors', 'pattern', 'animations', 'custom'];
    const [browser, setBrowser] = useState('');

    useEffect(() => {
      const userAgent = navigator.userAgent;
  
      if (userAgent.indexOf('Chrome') > -1) {
        setBrowser('Chrome');
      } else if (userAgent.indexOf('Firefox') > -1) {
        setBrowser('Firefox');
      } else if (userAgent.indexOf('Safari') > -1) {
        setBrowser('Safari');
      } else if (userAgent.indexOf('Edge') > -1) {
        setBrowser('Edge');
      } else {
        setBrowser('Other');
      }
    }, []);
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
    function checkBrowser(){
        // console.log(browser);
        if(browser === 'Firefox'){
            return(
            <div>
                <h1>Sorry, this application is not supported on Firefox. Please use Chrome or Safari.</h1>
            </div>
            );
        }
        else{   
            return(
                <div>
                    <div className="app-container">
                        {currentView === 'staticColors' && <StaticColors MqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}} />}
                        {currentView === 'pattern' && <Pattern mqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}}  />}
                        {currentView === 'animations' && <Animations mqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}}  />}
                        {currentView === 'custom' && <Custom mqttClient={{ client: mqttClient }} User={{ user:getClientId().toString()}}  />}

                        <div className="arrow-container">
                            <button className="left-arrow" onClick={handleLeftArrowClick}>&larr;</button>
                            <button className="right-arrow" onClick={handleRightArrowClick}>&rarr;</button>
                        </div>
                    </div>
                </div>
            );
            
        }

    }
    return (
        checkBrowser()
    );
}

export default App;