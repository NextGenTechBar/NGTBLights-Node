export const CURRENT_SELECTION_TOPIC = 'GUHemmTreeCurrentSelection';

export const publishCurrentSelection = (client, selection) => {
    const label = selection.trim();
    if (!label) {
        throw new Error('Current selection label must not be empty.');
    }

    client.publish(CURRENT_SELECTION_TOPIC, label, { retain: true }, (error) => {
        if (error) {
            console.error('Unable to publish the current light selection.', error);
        }
    });
};
