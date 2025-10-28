import React, { useState } from "react";
import { HelpSection as HelpSectionType } from "./HelpContent";

interface HelpSectionProps {
  section: HelpSectionType;
  isDefaultOpen?: boolean;
}

const HelpSection: React.FC<HelpSectionProps> = ({
  section,
  isDefaultOpen = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isDefaultOpen);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderContent = () => {
    return section.content.map((item, index) => {
      switch (item.type) {
        case "heading":
          return (
            <h4 key={index} className="help-section-heading">
              {item.content}
            </h4>
          );

        case "paragraph":
          return (
            <p key={index} className="help-section-paragraph">
              {item.content}
            </p>
          );

        case "list":
          return (
            <ul key={index} className="help-section-list">
              {Array.isArray(item.content) &&
                item.content.map((listItem, listIndex) => (
                  <li key={listIndex}>{listItem}</li>
                ))}
            </ul>
          );

        case "tip":
          return (
            <div key={index} className="help-section-tip">
              <strong>💡 </strong>
              {item.content}
            </div>
          );

        case "warning":
          return (
            <div key={index} className="help-section-warning">
              <strong>⚠️ </strong>
              {item.content}
            </div>
          );

        case "code":
          return (
            <code key={index} className="help-section-code">
              {item.content}
            </code>
          );

        default:
          return null;
      }
    });
  };

  return (
    <div className="help-section">
      <button
        className={`help-section-header ${isExpanded ? "expanded" : ""}`}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`help-section-${section.id}`}
      >
        <span className="help-section-icon">{section.icon}</span>
        <span className="help-section-title">{section.title}</span>
        <span className="help-section-chevron">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div
          id={`help-section-${section.id}`}
          className="help-section-content"
          role="region"
          aria-labelledby={`help-section-${section.id}-header`}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default HelpSection;
