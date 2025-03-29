import React from 'react';

const Modal = ({ isOpen, onClose, title, children, width = '90%', maxWidth = '500px' }) => {
    if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width, maxWidth }}>
      <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;