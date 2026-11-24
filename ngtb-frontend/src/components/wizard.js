import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
// import './styles/patterns.scss'; // Make sure to create and style this CSS file
import '../App.scss';
import ModalAlert from './ModalAlert.js'
import { publishCurrentSelection } from './currentSelection';

const WIZARD_TOWER_STORAGE_KEY = 'hemmTreeWizardTower';

const getSavedWizardTower = () => {
    try {
        const saved = sessionStorage.getItem(WIZARD_TOWER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        return null;
    }
};

const Wizard = (props) => {
    const { client } = props.mqttClient;
    const [showModal, setShowModal] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const clickTimestamps = useRef([]);
    const [timer, setTimer] = useState(null);
    const [genieResponse, setGenieResponse] = useState(() => getSavedWizardTower()?.response || '');
    const [isRevealing, setIsRevealing] = useState(() => false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFollowResponse, setShowFollowResponse] = useState(false);
    const wizardTowerRef = useRef(null);
    const responseEndRef = useRef(null);
    const autoFollowRef = useRef(false);
    const scrollFrameRef = useRef(null);

    useEffect(() => {
        if (!genieResponse || isRevealing || genieResponse.startsWith('The wizard is casting')) {
            return;
        }

        try {
            sessionStorage.setItem(WIZARD_TOWER_STORAGE_KEY, JSON.stringify({
                response: genieResponse
            }));
        } catch (error) {
            console.error('Unable to save the Wizard response.', error);
        }
    }, [genieResponse, isRevealing]);

    useEffect(() => {
        if (clickCount >= 5) {
            setShowModal(true);
            setClickCount(0);
            clickTimestamps.current = [];
        }
    }, [clickCount]);

    useEffect(() => {
        const handleUserScroll = () => {
            if (!isGenerating || !autoFollowRef.current) {
                return;
            }

            autoFollowRef.current = false;
            if (scrollFrameRef.current !== null) {
                cancelAnimationFrame(scrollFrameRef.current);
                scrollFrameRef.current = null;
            }
            setShowFollowResponse(true);
        };

        window.addEventListener('wheel', handleUserScroll, { passive: true });
        window.addEventListener('touchmove', handleUserScroll, { passive: true });
        return () => {
            window.removeEventListener('wheel', handleUserScroll);
            window.removeEventListener('touchmove', handleUserScroll);
        };
    }, [isGenerating]);

    const isMobileLayout = () => window.matchMedia('(max-width: 1139px)').matches;

    const followResponse = (resumeFollowing = true) => {
        if (!isMobileLayout()) {
            return;
        }

        if (resumeFollowing) {
            autoFollowRef.current = true;
            setShowFollowResponse(false);
        }

        if (!autoFollowRef.current) {
            return;
        }

        if (scrollFrameRef.current !== null) {
            return;
        }

        scrollFrameRef.current = requestAnimationFrame(() => {
            if (autoFollowRef.current) {
                responseEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
            scrollFrameRef.current = null;
        });
    };

    //Deprecated click function for secret codes.
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

	//Don't retain messages that are intended to be a one-time effect
	if(colorToSend.includes('SHORT')){
		options = { retain: false };
	}

        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        if (options.retain && colorToSend !== 'invalid') {
            publishCurrentSelection(client, `${mode}`);
        }
        client.publish('GUHemmTreeStats', colorToSend + "," + props.User.user);

        console.log('Message sent');
    };


    const handleClickExperimental = async (event, mode) => {
        event.preventDefault(); // Prevent the form from submitting and reloading the page

        if (isGenerating) {
            return;
        }

        setIsGenerating(true);
        autoFollowRef.current = isMobileLayout();
        setShowFollowResponse(false);
        if (autoFollowRef.current) {
            requestAnimationFrame(() => {
                if (autoFollowRef.current) {
                    wizardTowerRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            });
        }

        var colorToSend = '';
 
        colorToSend = 'invalid';

        document.getElementById('ExperimentalField').value = '';
        

        //var options = { retain: true };
        //console.log(colorToSend);
        //client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', "AI- "+ mode + "," + props.User.user);
        
        try {
            await generateTheme(mode);
        } catch (error) {
            setGenieResponse("Error generating theme. Please try again.");
        } finally {
            setIsGenerating(false);
        }

        console.log('Message sent');
    };


    /** 
     * Sends a request to the backend (ngtb-node-server/route.js) to trigger a Workato workflow with the given text.
     * @param {string} text - The text to send to the backend for processing by the Workato workflow.
     * Note: The response from the backend will be available asynchronously and can be retrieved using the waitForGenieResponse function.
    */
    async function sendWebhook(text) {
        const jobId = crypto.randomUUID(); // Generate a unique jobId for each request
        const apiURL = `/api/jobs/${jobId}`;

        setGenieResponse("The wizard is casting...");

        toggleSubmit(); // Disable the submit button while waiting for the response
        
        try {
            //This route calls the post endpoint in ngtb-node-server/route.js to send info to Genie
            const response = await fetch('/api/genie', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text, jobId }) // Generate a unique jobId for each request
            });

            if (!response.ok) {
                setGenieResponse(`Request failed: ${response.status}`);
                console.error("Failed to send text. Status:", response.status);
                return;
            }
            
            console.log("Command sent! Wait ~15 seconds for the tree to display it");
            await waitForGenieResponse(apiURL);
        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            toggleSubmit(); // Re-enable the submit button after the response is received or an error occurs
        }
    }

    /**
     * Wait 30 seconds for response from the backend before timing out. Upon getting a response, it updates the UI with the result.
     * @param {*} apiURL - The URL to poll for the status and result of the previously submitted job.
     * References: Called by sendWebhook function after sending a request to the backend (apiURL is GET /api/jobs/:jobId).
     */
    async function waitForGenieResponse(apiURL) {
        const maxAttempts = 30; // Wait for up to 30 seconds

        let dots = ".";

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

            try {
                const result = await fetch(apiURL);

                if (result.status === 404) {
                    
                    setGenieResponse(`The wizard is casting${dots}`);
                    dots += ".";
                    if (dots.length > 3) {
                        dots = ".";
                    }
                    
                    continue; // If the response is 404, continue to the next attempt (404 is expected while waiting for the response)
                }
                
                if (!result.ok) {
                    console.error("Failed to fetch genie response. Status:", result.status);
                    continue;
                }

                const data = await result.json();

                const response = typeof data.result === "string"
                    ? data.result
                    : data.result?.text ?? JSON.stringify(data.result);

                setGenieResponse(response);
                return; // Exit the loop once a valid response is received

            } catch (error) {
                console.error("Error while waiting for genie response:", error.message);
                setGenieResponse("Error retrieving wizard's response.");
                return;
            }
        }
        setGenieResponse("The wizard's spell failed :(");
    }

    /**
     * Wait 30 seconds for response from the backend before timing out. Upon getting a response, it updates the UI with the result.
     * @param {*} theme - The theme to generate a conversation for.
     * References: Called by sendWebhook function after sending a request to the backend (apiURL is GET /api/generate-conversation).
     */
    async function generateTheme(theme) {
        let castingDots = "";
        setGenieResponse("The wizard is casting.");
        const castingInterval = setInterval(() => {
            castingDots = castingDots.length >= 3 ? "" : `${castingDots}.`;
            setGenieResponse(`The wizard is casting${castingDots}`);
        }, 400);

        try {
            const response = await fetch('/api/generate-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme })
            });

            if (!response.ok) {
                console.error("Error generating theme:", response.status);
                const errorBody = await response.text();
                throw new Error(errorBody || `Request failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let sseBuffer = "";
            let result = "";
            const revealDelay = 15;

            const consumeEventBuffer = () => {
                const events = sseBuffer.split("\n\n");
                sseBuffer = events.pop() || "";

                for (const event of events) {
                    const dataLine = event
                        .split("\n")
                        .find((line) => line.startsWith("data: "));

                    if (!dataLine) {
                        continue;
                    }

                    try {
                        const data = JSON.parse(dataLine.slice(6));
                        if (data.type === "agent.message" && typeof data.message === "string") {
                            result = data.message;
                        }
                    } catch (error) {
                        console.error("Unable to parse Workato SSE event:", error);
                    }
                }
            };

            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                sseBuffer += chunk;
                consumeEventBuffer();
            }

            sseBuffer += decoder.decode();
            consumeEventBuffer();

            publishCurrentSelection(client, theme);
            clearInterval(castingInterval);
            let visibleResponse = "";
            setGenieResponse("");
            setIsRevealing(true);
            await new Promise((resolve) => requestAnimationFrame(resolve));

            for (const character of Array.from(result)) {
                visibleResponse += character;
                setGenieResponse(visibleResponse);
                followResponse(false);
                let delay = revealDelay;
                if (/[.!?]/.test(character)) {
                    delay = 450;
                } else if (/[,;:]/.test(character)) {
                    delay = 220;
                }

                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            setGenieResponse(result);
            followResponse(false);
            return result;
        } finally {
            clearInterval(castingInterval);
            setIsRevealing(false);
        }
    }

    /**
     * Toggles the disabled state of the submit button in the Experimental AI section.
     */
    function toggleSubmit() {
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = !submitButton.disabled;
        }
    }

    /**
     * DEPRECATED
     * Rate limits the button clicks to prevent spamming. If the user clicks too many times in a short period, it shows a modal alert.
     * It increments the click count and sets a timer to reset the count after 1 second.
     * If the click count exceeds 5, it shows a modal alert and resets the count.
     * @param {*} color 
     * @param {*} index 
     * References: Called by the onSubmit event of the form in the secret code section.
     */
    const ratelimit = (event, mode) => {
        if (timer) {
            clearInterval(timer);
        }

        setClickCount(prevCount => prevCount + 1);

        const newTimer = setInterval(() => {
            setClickCount(0);
            clearInterval(newTimer);
        }, 1000);

        setTimer(newTimer);

        handleClick(event, mode);
    };
    
    /**
     * Rate limits the button clicks to prevent spamming. If the user clicks too many times in a short period, it shows a modal alert.
     * It increments the click count and sets a timer to reset the count after 1 second.
     * If the click count exceeds 5, it shows a modal alert and resets the count.
     * @param {*} color
     * @param {*} index 
     * References: Called by the onSubmit event of the form in the Experimental AI section.
     */
    const ratelimitExperimental = (event, theme) => {
        if (timer) {
            clearInterval(timer);
        }

        setClickCount(prevCount => prevCount + 1);

        const newTimer = setInterval(() => {
            setClickCount(0);
            clearInterval(newTimer);
        }, 1000);

        setTimer(newTimer);

        handleClickExperimental(event, theme);
    };

    return (
        //restyled this div because the default made it weird and squished and not scroll properly on mobile. There's still one problem -- the red extends too far (because paddingBottom), but if you remove that, you can't click the generate button cause it's behind the arrows div. If we can extend the blue scrollable region, that would fix it
        //<div className="static-colors-container">
        <div className="wizard-layout">
            <div className="wizard-container">

                {/* Secret Commands Section */}
            {/*<h2>Secret Commands!</h2>
                <div style={{ backgroundColor: '#c1c6c8', borderRadius: '10px', padding: '7px', marginBottom: '0px' }}>
                    
                    <form onSubmit={(event) => ratelimit(event, document.getElementById('custom').value)}>
                        <input type="text" id="custom" name="Custom" placeholder="Enter a secret code!" />
                        <button type="submit" className='submit-button' style={{ display: 'block', marginTop: '10px' }}>
                            Submit
                        </button>
                    </form>
                </div>


            <h2>-----</h2>*/}

            <h2 style={{ textAlign: 'center' }}><u>Speak with the HemmTree Wizard!</u></h2>
            <font color="white" style={{ textAlign: 'center' }}>
                <b>Set the color of the lights using AI! (allow 15-30 seconds for theme to take effect)</b>
                <br></br>
            </font>
            
                {/* Experimental Section */}
                <div id="experimental-section" style={{borderRadius: '12px', padding: '22px'}}>
                    <div className="example-commands">
                        <div className="example-commands-label">Example Commands:</div>
                        <button id="beach-button" className="example-command" disabled={isGenerating} onClick={(event) => ratelimitExperimental(event, 'Beach')}>Beach</button>
                        <button id="sunset-button" className="example-command" disabled={isGenerating} onClick={(event) => ratelimitExperimental(event, 'Sunset')}>Sunset</button>
                        <button id="seahawks-button" className="example-command" disabled={isGenerating} onClick={(event) => ratelimitExperimental(event, 'Seahawks')}>Seahawks</button>
                    </div>
                    <form onSubmit={(event) => ratelimitExperimental(event, document.getElementById('ExperimentalField').value)}>
                        <input
                            type="text"
                            id="ExperimentalField"
                            name="Custom2"
                            placeholder={isGenerating ? 'Wizard is casting!' : 'Enter a color theme!'}
                            maxLength={50}
                            minLength={1}
                            disabled={isGenerating}
                            style={{ marginTop: '10px', width: '70%' }}
                        />
                        <button type="submit" className='submit-button tile' disabled={isGenerating} style={{ display: 'block', marginTop: '10px', backgroundColor: '#c1c6c8', color: 'black', fontWeight: 'bold' }}>
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </form>

                </div>
            </div>

            <div ref={wizardTowerRef} className="wizard-tower">
                <div className="wizard-tower-header">
                    <img
                        className="wizard-avatar"
                        src="/hemm-tree-wizard.jpg"
                        alt="HemmTree Wizard"
                    />
                    <h3>Wizard's Tower:</h3>
                </div>
                <div id="GenieResponse" style={{ marginTop: '10px', color: 'black', whiteSpace: 'pre-wrap', width: '100%' }}>
                    <Markdown>
                        {genieResponse || (isRevealing ? '' : 'The wizard is sleeping...')}
                    </Markdown>
                </div>
                <span ref={responseEndRef} aria-hidden="true" />
            </div>

            {showFollowResponse && (
                <button
                    type="button"
                    className="follow-response"
                    onClick={followResponse}
                >
                    Follow response
                </button>
            )}

            {/* Modal Alert */}
            <ModalAlert show={showModal} onClose={() => setShowModal(false)}>
                <p>Please slow down! Spamming makes it no fun for anyone.</p>
                <p>If you are using Experimental AI mode, please allow 15-30 seconds after pressing generate for the mode to be generated and displayed</p>
            </ModalAlert>
        </div>
    );



};

export default Wizard;