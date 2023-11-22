import React, { useState } from 'react';
import Modal from 'react-modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onRequestClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirmation Modal"
      ariaHideApp={false}
    >
      <div>
        <p>Are you sure you want to delete this item?</p>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onRequestClose}>No</button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
