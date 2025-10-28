import React, { useEffect, useRef } from "react";
import { HELP_SECTIONS } from "./HelpContent";
import HelpSection from "./HelpSection";
import "./HelpPanel.css";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus trap - keep focus within panel when open
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTab = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTab);
      // Focus the first element when panel opens
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleTab);
      };
    }
  }, [isOpen]);

  // Handle click on backdrop to close
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        ref={backdropRef}
        className="help-panel-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Help Panel */}
      <div
        ref={panelRef}
        className="help-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
      >
        {/* Header */}
        <div className="help-panel-header">
          <h2 id="help-panel-title" className="help-panel-title">
            Help & Documentation
          </h2>
          <button
            className="help-panel-close"
            onClick={onClose}
            aria-label="Close help panel"
            title="Close help panel (ESC)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="help-panel-content">
          {HELP_SECTIONS.map((section, index) => (
            <HelpSection
              key={section.id}
              section={section}
              isDefaultOpen={index === 0} // First section (Overview) open by default
            />
          ))}
        </div>

        {/* Footer */}
        <div className="help-panel-footer">
          <p className="help-panel-footer-text">
            Need more help? Contact your system administrator.
          </p>
        </div>
      </div>
    </>
  );
};

export default HelpPanel;
