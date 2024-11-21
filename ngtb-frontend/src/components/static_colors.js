import React from 'react';
import './styles/static_colors.scss'; // Make sure to create and style this CSS file

const StaticColors = (props) => {
    const {client} = props.mqttClient;
    // const mqttClient = client.mqttClient;
    const colors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', 
        '#4B0082', '#8B00FF', '#FF1493', '#00CED1', '#FFD700',
        '#ADFF2F', '#FF4500', '#DA70D6', '#7FFF00', '#00FA9A',
        '#1E90FF', '#FF6347', '#40E0D0', '#EE82EE', '#F08080',
        '#98FB98'
    ];

    const handleClick = (color, index) => {
        console.log(`Button ${index + 1} with color ${color} clicked`);
        // Implement your custom logic here
        const colorToSend = hexToColorFormat(color);
        var options = { retain: true };
        console.log(colorToSend);
        client.publish('GUHemmTree', colorToSend, options);
        console.log('Message sent');
    };

    const buttons = colors.map((color, index) => (
        <button
            key={index} 
            className="color-button" 
            style={{ backgroundColor: color }} 
            onClick={() => handleClick(color, index)}
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
        </div>
    );
};

export default StaticColors;