import React from 'react';
import './styles/patterns.scss'; // Make sure to create and style this CSS file

const Pride = (props) => {
    const {client} = props.mqttClient;

    const pride = [
        'FRACS001159205200130145255255255200130145001159205001159205200130145255255255200130145001159205001159205200130145255255255200130145001159205',
        'FRACS255033140255216000033177255255033140255216000033177255255033140255216000033177255',
        'FRACS080000082080000082036010071000000100000000100080000082080000082036010071000000100000000100080000082080000082036010071000000100000000100',
        'FRACS007142112038206170152232193255255255123173226060073203041026125007142112038206170152232193255255255123173226060073203041026125',
        'FRACS213045000235124066255255255180078144143002078213045000235124066255255255180078144143002078213045000235124066255255255180078144143002078',
        'FRACS001001001100100100255255255104006080001001001100100100255255255104006080001001001100100100255255255104006080',
        'FRACS255216000255255255140089180001001001255216000255255255140089180001001001255216000255255255140089180001001001',
        'FRACS058166064168212122255255255130130130001001001058166064168212122255255255130130130001001001058166064168212122255255255130130130001001001',
        'FRACS141076200255255255034109025141076200255255255034109025141076200255255255034109025',
        'FRACS228003003255140000255237000000128038000076255255041255'
    ];
    const images = [
        'url(./trans.png)',
        'url(./pan.png)',
        'url(./bi.png)',
        'url(./gay.png)',
        'url(./lesbian.png)',
        'url(./ace.png)',
        'url(./nonbinary.png)',
        'url(./aro.png)',
        'url(./queer.jpg)',
        'url(./Pride.png)'
    ];
    const labels = [
        'Trans', 
        'Pan',
        'Bi',
        'Gay',
        'Lesbian',
        'Ace',
        'Nonbinary',
        'Aro',
        'Queer',
        'Pride'
    ];
    const handleClick = (pride, index) => {
        console.log(`Button ${index + 1} with color ${pride} clicked`);
        // Implement your custom logic here
        const colorToSend = pride;
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        client.publish('GUHemmTreeStats', colorToSend+"," + props.User.user);

        console.log('Message sent');
    };

    const buttons = pride.map((color, index) => (
        <div key={index} className="pattern-button-container">

            <button
                key={index} 
                className="pride-button" 
                style={{ backgroundImage: images[index] }}

                onClick={() => handleClick(color, index)}
            >
                
            </button>
            <div className="animation-label">{labels[index]}</div>

        </div>
    ));
    return (
        <div className="static-colors-container">
            <h1>Pride Flags!</h1>
            <div className="grid-container">
                {buttons}
            </div>
        </div>
    );
};

export default Pride;