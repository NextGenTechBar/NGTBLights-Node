import React, { useState, useEffect, useRef } from 'react';
// import './styles/animations.scss'; // Make sure to create and style this CSS file
import '../App.scss';
import ModalAlert from './ModalAlert.js'

const Animations = (props) => {
    const {client} = props.mqttClient;
    const [showModal, setShowModal] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const clickTimestamps = useRef([]);
    const [timer, setTimer] = useState(null);


    useEffect(() => {
        if (clickCount >= 5) {
            setShowModal(true);
            setClickCount(0);
            clickTimestamps.current = [];
        }
    }, [clickCount]);
    const animations = [
        'DYNAMrainbow',
        'DYNAMchase',
        'DYNAMfade',
        'DYNAMcolorwipe',
        'DYNAMmulticolorwipe',
        'DYNAMtwinkle',
        'DYNAMpulses',
        'DYNAMtwinkleMod'
    ];

    const images = [
        'url(./rainbow.gif)',
        'url(./colorchase.webp)',
        'url(./homer.gif)',
        'url(./colorwipe.webp)',
        'url(./multicolorwipe.jpg)',
        'url(./twinkle.gif)',
        'url(./pulse.gif)',
        'url(./twinklemod.gif)'
    ];
    const labels = [
        'Rainbow Zoom', 
        'Color Chase',
        'Fade',
        'Color Wipe',
        'Multi-Color Wipe',
        'Sparkle',
        'Pulse',
        'Shimmer'
    ];
    const handleClick = (animations, index) => {
        console.log(`Button ${index + 1} with color ${animations} clicked`);

        // Implement your custom logic here
        const colorToSend = animations;
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', colorToSend+"," + props.User.user);

        console.log('Message sent');
    };

    const ratelimit = (color, index) => {
        if (timer) {
            clearInterval(timer);
        }

        setClickCount(prevCount => prevCount + 1);

        const newTimer = setInterval(() => {
            setClickCount(0);
            clearInterval(newTimer);
        }, 1000);

        setTimer(newTimer);

        handleClick(color, index);
    };
    const buttons = animations.map((animations, index) => (
        <div key={index} className="animation-button-container">
            <button
                key={index} 
                className="animation-button" 
                style={{ backgroundImage: images[index] }}
                onClick={() => ratelimit(animations, index)}
            >
                
            </button>
            <div className="label">{labels[index]}</div>
        </div>

    ));
    
    return (
        <div className="static-colors-container">
            <h1>Animations!</h1>
            <div className="grid-container">
                {buttons}
            </div>
            <ModalAlert show={showModal} onClose={() => setShowModal(false)}>
                <p>Please slow down! Spamming makes it no fun for anyone.</p>
            </ModalAlert>
        </div>
    );
};

export default Animations;