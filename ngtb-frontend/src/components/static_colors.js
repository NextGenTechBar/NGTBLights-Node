import React, { useState, useEffect, useRef } from 'react';

import ModalAlert from './ModalAlert.js'
// import './styles/static_colors.scss'; // Make sure to create and style this CSS file

import '../App.scss';
const StaticColors = (props) => {
    const {client} = props.MqttClient;
    // const mqttClient = client.mqttClient;
    const colors = [
        '#FF0000', '#CC0000', '#FF8000', '#FFFF00', 
        '#CCFF00', '#00FF00', '#00CC00', '#00FFFF', '#00CCCC',
        '#0000FF', '#0000CC', '#000080', '#EE00EE', '#FF00FF',
        '#FFC0CB', '#8d4cc8', '#800080', '#660066', '#FF0080',
        '#FFDAB9', '#ffffff'
    ];

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
    const handleClick = (color, index) => {
        console.log(`Button ${index + 1} with color ${color} clicked`);
        // Implement your custom logic here
        const colorToSend = hexToColorFormat(color);
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', colorToSend+"," + props.User.user);
        // if(props.User.user === 'mqtt_web_user_d767e6c6cb95'){
        //     alert('You are not allowed to change the color');
        // }
        console.log(props.User.user);
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
    const buttons = colors.map((color, index) => (
        <button
            key={index} 
            className="color-button" 
            style={{ backgroundColor: color }} 
            onClick={() => ratelimit(color, index)}
        >
            
        </button>
    ));

    function hexToColorFormat(hex) {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');
    
        // Parse the r, g, b values
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
    
        // Format the values to be three digits
        r = r.toString().padStart(3, '0');
        g = g.toString().padStart(3, '0');
        b = b.toString().padStart(3, '0');
    
        // Return the formatted string
        return `COLOR${r}${g}${b}`;
    }
    return (
        <div className="static-colors-container">
            <h1>Colors</h1>
            <div className="grid-container">
                {buttons}
            </div>
            <ModalAlert show={showModal} onClose={() => setShowModal(false)}>
                <p>Please slow down! Spamming makes it no fun for anyone.</p>
            </ModalAlert>
        </div>
    );
};

export default StaticColors;
