import React, { useState } from 'react';
import './styles/patterns.scss'; // Make sure to create and style this CSS file
import Modal from './Modal'; // Import the Modal component
import Pride from './pride'; // Import the Pride component

const Pattern = (props) => {
    const {client} = props.mqttClient;
    const [showModal, setShowModal] = useState(false); // Define the showModal state

    const pattern = [
        'COLOR255000000255000000000000255000000255255255000255255000',
        'FRACS255070000255000000255190000',
        'COLOR255000000255000000000255000000255000',
        'COLOR255255255255255255000000255000000255',
        'COLOR255000000255000000000000255000000255',
        'COLOR255255255255255255255255255255000000255000000255000000',
        'OTHERdifferentcolors',
        'OTHERrandom',
        'COLOR255000000255000000000000000000000000000255000000255000000000000000000000',
        'OTHERrainbow',
        'COLOR16000013016000013016000013025504000025504000025504000',
        'COLOR255255255255255255255000000255000000000000255000000255',
        'COLOR128000128128000128000255000000255000',
        'OTHERgrinch',
        'COLOR255125030',
        'randomColors'
    ];

    const handleClick = (pattern, index) => {
        console.log(`Button ${index + 1} with color ${pattern} clicked`);
        if(pattern==="randomColors"){
            pattern=randomColors();
        }
        // Implement your custom logic here
        const colorToSend = pattern;
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        console.log('Message sent');
    };
    function randomColors() {
        var textToSend="FRACS"
        var numLoops = Math.floor(Math.random() * (5 - 2) + 2);
        for (let i = 0; i<numLoops; i++) { //number of colors
            for(let j=0;j<3;j++){ //do RGB for each
                //complicated rand formula to ensure distinct colors (not just pastel)
                var randVal;
                if(Math.random()>0.75){ //25% of the time, be in this range
                    randVal=Math.floor(Math.random() * (220 - 30) + 30);
                }else{ //75% of the time choose a more defined color component
                    if(Math.random()>0.5){
                        randVal=Math.floor(Math.random() * (30 - 0) + 0);
                    }else{
                        randVal=Math.floor(Math.random() * (255 - 220) + 220);
                    }
                }
                
                var textRandVal;
                //left padding with 0s
                if(randVal<10){
                    textRandVal="00"+randVal;
                }else if(randVal<100){
                    textRandVal="0"+randVal;
                }else{
                    textRandVal=randVal;
                }
                textToSend+=textRandVal;
            }
        }
       return textToSend;
    }
    const buttons = pattern.map((color, index) => (
        <button
            key={index} 
            className="pattern-button"
            onClick={() => handleClick(color, index)}
        >
            Pattern {index + 1}
        </button>
    ));

    return (
        <div className="static-colors-container">
            <h1>Patterns!</h1>
            <div className="grid-container">
                {buttons}
                <button 
                    className="pattern-button"
                    onClick={() => setShowModal(true)}
                >
                    Launch Pride
                </button>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Pride mqttClient={{client: client}}/>
            </Modal>
        </div>
    );
};

export default Pattern;