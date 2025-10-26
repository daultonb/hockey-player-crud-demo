import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = React.memo(
  ({ isOpen, onClose, children, title, headerActions }) => {
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        // Prevent body scroll when modal is open
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [isOpen, onClose]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    const handleCloseClick = () => {
      onClose();
    };

    if (!isOpen) {
      return null;
    }

    const modalContent = (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content">
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {headerActions && (
              <div className="modal-header-actions">{headerActions}</div>
            )}
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

    // Render modal in a portal to document.body to prevent parent re-renders from affecting it
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = "Modal";

export default Modal;
