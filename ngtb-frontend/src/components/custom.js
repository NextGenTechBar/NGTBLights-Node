import React from 'react';
// import './styles/patterns.scss'; // Make sure to create and style this CSS file
import '../App.scss';

const Custom = (props) => {
    const { client } = props.mqttClient;

    const handleClick = (event, mode) => {
        event.preventDefault(); // Prevent the form from submitting and reloading the page

        var colorToSend = '';
        switch (mode.toLowerCase()) {
            case 'thayne':
                colorToSend = 'SHORTthayne';
                break;
            case 'tluey':
                colorToSend = 'SHORTbluey';
                break;
            case 'tordan':
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
                colorToSend = 'COLOR000000000000000000000000000000000000000000000255255255255255255255255255255255255255255255';
                break;
            default:
                document.getElementById('custom').value = '';

                document.getElementById('custom').placeholder = 'Invalid code';
                return;
        }

        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', colorToSend + "," + props.User.user);

        console.log('Message sent');
    };

    return (
        <div className="static-colors-container">
            <h2>Patterns!</h2>
            <div className="grid-container">
                <form onSubmit={(event) => handleClick(event, document.getElementById('custom').value)}>
                    <input type="text" id="custom" name="Custom" placeholder="Enter a secret code!" />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default Custom;