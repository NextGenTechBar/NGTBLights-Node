
document.addEventListener('DOMContentLoaded', (event) => {
    const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt'); // Use WebSocket connection

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
    });

    mqttClient.on('error', (error) => {
        console.error('Connection error: ', error);
    });

    document.getElementById('button1').addEventListener('click', () => {
        var mqttMsgToSend = 'COLOR255000000';
        var options = { retain: true };
        mqttClient.publish('GUHemmTree', mqttMsgToSend, options);
        console.log('Message sent');
    });

    document.getElementById('button2').addEventListener('click', () => {
        mqttClient.publish('GUHemmTree', 'Message 2');
        console.log('Message 2 sent');
    });
});