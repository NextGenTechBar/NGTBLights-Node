import React, { useState } from 'react';
import './styles/patterns.scss'; // Make sure to create and style this CSS file
import Modal from './Modal'; // Import the Modal component
import Pride from './pride'; // Import the Pride component

const Pattern = (props) => {
    const { client } = props.mqttClient;
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

    const images = [
        'url(./Philipines.webp)',
        'url(./PCLD.jpg)',
        'url(./xmas.png)',
        'url(./Hanukkah.jpg)',
        'url(./GoZags.webp)',
        'url(./candycane.jpg)',
        'url(./dots.jpg)',
        'url(./random.jpg)',
        'url(./kwanzaa.jpg)',
        'url(./rainbow.jpg)',
        'url(./halloween.jpg)',
        'url(./USA.jpg)',
        'url(./joker.jpg)',
        'url(./grinch.jpg)',
        'url(./camo.jpg)',
        'url(./random.jpg)'
    ];
    const labels = [
        'FASU',
        'PCLD',
        'Christmas',
        'Hanukkah',
        'Go Zags',
        'Candy Cane',
        'Individual',
        'Random',
        'Kwanzaa',
        'Rainbow',
        'Halloween',
        'USA',
        'Joker',
        'Grinch',
        'Camoflauge',
        'Segments'
    ];

    const handleClick = (pattern, index) => {
        console.log(`Button ${index + 1} with color ${pattern} clicked`);
        if (pattern === "randomColors") {
            pattern = randomColors();
        }
        // Implement your custom logic here
        const colorToSend = pattern;
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        console.log('Message sent');
    };

    function randomColors() {
        var textToSend = "FRACS"
        var numLoops = Math.floor(Math.random() * (5 - 2) + 2);
        for (let i = 0; i < numLoops; i++) { //number of colors
            for (let j = 0; j < 3; j++) { //do RGB for each
                //complicated rand formula to ensure distinct colors (not just pastel)
                var randVal;
                if (Math.random() > 0.75) { //25% of the time, be in this range
                    randVal = Math.floor(Math.random() * (220 - 30) + 30);
                } else { //75% of the time choose a more defined color component
                    if (Math.random() > 0.5) {
                        randVal = Math.floor(Math.random() * (30 - 0) + 0);
                    } else {
                        randVal = Math.floor(Math.random() * (255 - 220) + 220);
                    }
                }

                var textRandVal;
                //left padding with 0s
                textRandVal = randVal.toString().padStart(3, '0');
                textToSend += textRandVal;
            }
        }
        return textToSend;
    }

    return (
        <div className="static-colors-container">
            <h2>Patterns!</h2>
            <div className="grid-container">
                {pattern.map((pattern, index) => (
                    <div key={index} className="pattern-button-container">
                        <button
                            className="pattern-button"
                            style={{ backgroundImage: images[index] }}
                            onClick={() => handleClick(pattern, index)}
                        >
                            {/* Pattern {index + 1} */}
                        </button>
                        <div className="pattern-label">{labels[index]}</div>
                    </div>
                ))}
                <div className="pattern-button-container">
                    <button 
                        className="pattern-button"
                        style={{ backgroundImage:' url(./Pride.png)'}}
                        onClick={() => setShowModal(true)}
                    >
                        {/* Launch Pride */}
                    </button>
                    <div className="pattern-label">Launch Pride</div>
                </div>
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                    <Pride mqttClient={{client: client}}/>
                </Modal>
            </div>
        </div>
    );
};

export default Pattern;