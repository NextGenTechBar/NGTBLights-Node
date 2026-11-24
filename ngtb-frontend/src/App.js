import React, { useEffect,useState} from 'react';
import Pattern from './components/patterns';
import StaticColors from './components/static_colors';
import Animations from './components/animations';
import Wizard from './components/wizard';
import './App.scss';
import mqtt from 'mqtt';
import Cookies from 'js-cookie';
import { CURRENT_SELECTION_TOPIC } from './components/currentSelection';

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
        clientId = `mqtt_web_user_${Math.random  ().toString(16).slice(3)}`;
    }
    Cookies.set('mqttClientId', clientId, { expires: 400 }); 
    return clientId;
};
function onConnect() {
    const clientId = getClientId();
    if(!connected){
        mqttClient = mqtt.connect(connectUrl, (clientId + Math.random  ().toString(16).slice(3)))
        connected = true;
        //console.log('Connected');
        //console.log(clientId);
    }
    
}

function App() {
    onConnect();
    // console.log(clientId);
    const [currentView, setCurrentView] = useState('staticColors');
    const [currentSelection, setCurrentSelection] = useState('');

    const tabs = [
        { id: 'bt-tab-0', label: 'Colors', view: 'staticColors', component: StaticColors, mqttProp: 'MqttClient' },
        { id: 'bt-tab-1', label: 'Patterns', view: 'pattern', component: Pattern, mqttProp: 'mqttClient' },
        { id: 'bt-tab-2', label: 'Animations', view: 'animations', component: Animations, mqttProp: 'mqttClient' },
        { id: 'bt-tab-3', label: 'Wizard', view: 'wizard', component: Wizard, mqttProp: 'mqttClient' }
    ];
    const views = tabs.map((tab) => tab.view);
    const [browser, setBrowser] = useState('');

    useEffect(() => {
        if (!mqttClient) {
            return undefined;
        }

        const handleMessage = (topic, payload) => {
            if (topic === CURRENT_SELECTION_TOPIC) {
                setCurrentSelection(payload.toString());
            }
        };
        const subscribeToSelection = () => {
            mqttClient.subscribe(CURRENT_SELECTION_TOPIC, (error) => {
                if (error) {
                    console.error('Unable to subscribe to the current light selection.', error);
                }
            });
        };

        mqttClient.on('message', handleMessage);
        mqttClient.on('connect', subscribeToSelection);
        if (mqttClient.connected) {
            subscribeToSelection();
        }

        return () => {
            mqttClient.removeListener('message', handleMessage);
            mqttClient.removeListener('connect', subscribeToSelection);
        };
    }, []);

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
                <div className="App">
                    <div className="header">
                        <h1>HemmTree Lights App</h1>
                        <p className="current-selection" role="status" aria-live="polite">
                            Current lights: {currentSelection || 'Waiting for a selection'}
                        </p>
                    </div>


                    <div className={`app-container ${currentView === 'wizard' ? 'wizard-active' : ''}`}>
                        <div className="view-area">
                            <div className="tabs" aria-label="Views">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        className="tab"
                                        type="button"
                                        role="tab"
                                        id={tab.id}
                                        aria-selected={currentView === tab.view}
                                        aria-controls={`bt-panel-${tab.id.split('-')[2]}`}
                                        tabIndex={currentView === tab.view ? 0 : -1}
                                        onClick={() => setCurrentView(tab.view)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {tabs.map((tab) => {
                                if (currentView !== tab.view) {
                                    return null;
                                }

                                const ActiveComponent = tab.component;
                                const componentProps = {
                                    User: { user: getClientId().toString() },
                                    [tab.mqttProp]: { client: mqttClient }
                                };
                                return (
                                    <div
                                        key={tab.view}
                                        id={`bt-panel-${tab.id.split('-')[2]}`}
                                        role="tabpanel"
                                        aria-labelledby={tab.id}
                                    >
                                        <ActiveComponent {...componentProps} />
                                    </div>
                                );
                            })}
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


const tiles = document.querySelectorAll('.tile');
tiles.forEach(tile => {
    tile.addEventListener('click', () => {
        tiles.forEach(t => t.classList.remove('is-selected'));
        tile.classList.add('is-selected');
    });
});

export default App;