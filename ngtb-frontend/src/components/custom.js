import React, { useState } from 'react';
// import './styles/patterns.scss'; // Make sure to create and style this CSS file
import '../App.scss';
import ModalAlert from './ModalAlert.js'

const Custom = (props) => {
    const { client } = props.mqttClient;
    const [showModal, setShowModal] = useState(false);

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
            case 'test':
                colorToSend = 'DYNAMchase'
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

    var counter = 0;
    function ratelimit(event, mode) {
        event.preventDefault(); // Prevent the form from submitting and reloading the page
        counter++;
        if (counter === 3) {
            setShowModal(true);
            counter = 0;
        } else {
            handleClick(event, mode);
        }
    }
    setInterval(function () { counter = 0; }, 1000);

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