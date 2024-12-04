import React, { useEffect, useState } from 'react';
import './styles/modal-alert.scss'; // Make sure to create and style this CSS file

const ModalAlert = ({ show, onClose, children }) => {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (show) {
            setCountdown(10); // Reset countdown when modal is shown
            const timer = setTimeout(() => {
                onClose();
            }, 10000); // 10 seconds

            const countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {children}
                <p>Closing in {countdown} seconds...</p>
            </div>
        </div>
    );
};

export default ModalAlert;