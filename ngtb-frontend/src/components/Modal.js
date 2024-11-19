import React from 'react';
import './styles/modal.css'; // Make sure to create and style this CSS file

const Modal = ({ show, onClose, children }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="close-button" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;