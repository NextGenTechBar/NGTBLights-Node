import React, { useState, useEffect, useRef } from 'react';
// import './styles/patterns.scss'; // Make sure to create and style this CSS file
import '../App.scss';
import ModalAlert from './ModalAlert.js'

const Custom = (props) => {
    const { client } = props.mqttClient;
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
    const handleClick = (event, mode) => {
        event.preventDefault(); // Prevent the form from submitting and reloading the page

        var colorToSend = '';
        switch (mode.toLowerCase()) {
            case 'thayne':
                colorToSend = 'SHORTthayne';
                break;
            case 'bluey':
                colorToSend = 'SHORTbluey';
                break;
            case 'jordan':
                colorToSend = 'SHORTjordan';
                break;
            case 'emma':
                colorToSend = 'SHORTemma';
                break;
            case 'emmag':
                colorToSend = 'OTHERemmag';
                break;
            case 'fred':
                colorToSend = 'OTHERfred';
                break;
            case 'bea':
                colorToSend = 'COLOR255000000000000255255255000';
                break;
            case 'eva':
                colorToSend = 'COLOR000000000000000000000000000000000000000000000255255255255255255255255255255255255255255';
                break;
            case 'julia':
                colorToSend = 'FRACS011153077077077077255000190';
                break;
            case 'andrew':
                colorToSend = 'OTHERandrewBlue';
                break;
            case 'reid':
                colorToSend = 'COLOR024155204';
                break;
            case 'ponk':
                colorToSend = 'FRACS942075739471327393942075739471327393942075739471327393';
                break;
            case 'leif':
                colorToSend = 'FRACS255255000000000255255255000000000255255255000000000255255255000000000255';
                break;
            case 'jackson':
                colorToSend = 'FRACS000255255255255255000000255255045000000255255255255255000000255255045000000255255255255255000000255255045000'
                break;
            case 'blaine':
                colorToSend = 'FRACS000000000255255255255255255000000000000000000255255255000000000255255255255255255000000000000000000255255255';
                break;
            case 'kenny':
                colorToSend = 'FRACS255000000255128000255128000255000000'
                break;
            case 'mikupattern':
                colorToSend = 'FRACS024155204000200000255255255024155204024155204255255255000200000024155204'
                break;
            case 'poop':
                colorToSend = 'COLOR154205050'
                break;
            case 'miku':
                colorToSend = 'SHORTmiku'
                break;
            case 'test':
                colorToSend = 'OTHERdarkness'
                break;
            default:
                colorToSend = 'invalid';
                document.getElementById('custom').value = '';
                document.getElementById('custom').placeholder = 'Invalid code. Try again!';
        }

        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', colorToSend + "," + props.User.user);

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
    return (
        <div className="static-colors-container">
            <h2>Secret Commands!</h2>
            <div style={{ backgroundColor: '#c1c6c8', borderRadius: '10px' }}>
                <form onSubmit={(event) => ratelimit(event, document.getElementById('custom').value)}>
                    <input type="text" id="custom" name="Custom" placeholder="Enter a secret code!" />
                    <button type="submit" className='submit-button'>Submit</button>
                </form>
                <ModalAlert show={showModal} onClose={() => setShowModal(false)}>
                    <p>Please slow down! Spamming makes it no fun for anyone.</p>
                </ModalAlert>
            </div>
        </div>
    );
};

export default Custom;