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
                colorToSend = 'COLOR000000000000000000000000000000000000000000000255255255255255255255255255255255255255255255';
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
            case 'julia':
                colorToSend = 'OTHERjulia'
                break;
            case 'test':
                colorToSend = 'SHORTalex'
                break;
	    case 'truejaxon':
		colorToSend = 'OTHERtruejaxon'
		break;
	    case 'evil':
		colorToSend = 'OTHERevilmode'
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



const handleClickExperimental = (event, mode) => {
        event.preventDefault(); // Prevent the form from submitting and reloading the page

        var colorToSend = '';
 
        colorToSend = 'invalid';

        document.getElementById('ExperimentalField').value = '';
        document.getElementById('ExperimentalField').placeholder = 'Mode will display in ~15 seconds!';
        

        //var options = { retain: true };
        //console.log(colorToSend);
        //client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', "AI- "+mode + "," + props.User.user);
	sendWebhook(mode);

        console.log('Message sent');
    };


async function sendWebhook(text) {
    const webhookURL = "https://webhooks.workato.com/webhooks/rest/9aff14d4-3289-42d9-91b4-db436e64bf06/hemmtreewizard-webhook";

    try {
        const response = await fetch(webhookURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (response.ok) {
            console.log("Command sent! Wait ~15 seconds for the tree to display it");
        } else {
            console.error("Failed to send text. Status:", response.status);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}


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
    
    const ratelimitExperimental = (color, index) => {
        if (timer) {
            clearInterval(timer);
        }

        setClickCount(prevCount => prevCount + 1);

        const newTimer = setInterval(() => {
            setClickCount(0);
            clearInterval(newTimer);
        }, 1000);

        setTimer(newTimer);

        handleClickExperimental(color, index);
    };

    return (
    <div className="static-colors-container">
        {/* Secret Commands Section */}
	<h2>Secret Commands!</h2>
        <div style={{ backgroundColor: '#c1c6c8', borderRadius: '10px', padding: '7px', marginBottom: '20px' }}>
            
            <form onSubmit={(event) => ratelimit(event, document.getElementById('custom').value)}>
                <input type="text" id="custom" name="Custom" placeholder="Enter a secret code!" />
                <button type="submit" className='submit-button' style={{ display: 'block', marginTop: '10px' }}>
                    Submit
                </button>
            </form>
        </div>


<h2>-----------------------------------</h2>

	<h2><u>Experimental</u></h2>
	<font color="white"><b>Set the color of the lights using AI!</b> <br></br><br></br>
	1. Enter a color theme (ex: "ocean", "pickle", "autumn" etc).<br></br>
	2. Wait ~15 seconds<br></br>
	3. See the generated color scheme on the tree!
	</font>
	<br></br>
        {/* Experimental Section */}
        <div style={{ backgroundColor: '#c1c6c8', borderRadius: '12px', padding: '22px'}}>
            
            <form onSubmit={(event) => ratelimitExperimental(event, document.getElementById('ExperimentalField').value)}>
                <input
                    type="text"
                    id="ExperimentalField"
                    name="Custom2"
                    placeholder="Enter a color theme!"
                    style={{ marginTop: '10px', width: '100%' }}
                />
                <button type="submit" className='submit-button' style={{ display: 'block', marginTop: '10px' }}>
                    Generate
                </button>
            </form>
        </div>

        {/* Modal Alert */}
        <ModalAlert show={showModal} onClose={() => setShowModal(false)}>
            <p>Please slow down! Spamming makes it no fun for anyone.</p>
	    <p>If you are using Experimental AI mode, please allow 15-30 seconds after pressing generate for the mode to be generated and displayed</p>
        </ModalAlert>
    </div>
);



};

export default Custom;