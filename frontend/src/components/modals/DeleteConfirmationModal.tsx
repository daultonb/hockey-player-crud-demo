import React from "react";
import { Player } from "../../types/Player";
import Modal from "./Modal";
import "./DeleteConfirmationModal.css";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  player: Player | null;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  player,
  isDeleting,
}) => {
  if (!player) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="delete-confirmation">
        <p className="delete-message">
          Are you sure you want to delete Player: <strong>{player.name}</strong>{" "}
          on the team <strong>{player.team.name}</strong>?
        </p>
        <p className="delete-warning">This action cannot be undone.</p>
        <div className="delete-actions">
          <button
            type="button"
            onClick={onClose}
            className="button button-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="button button-danger"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
