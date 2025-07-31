import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('Modal: Escape key pressed, closing modal');
        onClose();
      }
    };

    if (isOpen) {
      console.log('Modal: Opening modal, adding event listeners');
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      console.log('Modal: Cleaning up event listeners');
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      console.log('Modal: Backdrop clicked, closing modal');
      onClose();
    }
  };

  const handleCloseClick = () => {
    console.log('Modal: Close button clicked');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button
            className="modal-close-button"
            onClick={handleCloseClick}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
