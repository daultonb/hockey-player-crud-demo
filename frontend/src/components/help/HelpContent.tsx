export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  content: HelpContentItem[];
}

export interface HelpContentItem {
  type: "heading" | "paragraph" | "list" | "tip" | "warning" | "code";
  content: string | string[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "Overview",
    icon: "📘",
    content: [
      {
        type: "paragraph",
        content:
          "Welcome to the Hockey Player Database! This application allows you to manage and explore hockey player statistics with powerful search, filter, and sorting capabilities.",
      },
      {
        type: "paragraph",
        content:
          "Navigate through the help sections below to learn about all the features available to you.",
      },
    ],
  },
  {
    id: "search",
    title: "Search",
    icon: "🔍",
    content: [
      {
        type: "heading",
        content: "Basic Search",
      },
      {
        type: "paragraph",
        content:
          "Use the search bar at the top to find players. By default, the search looks across all fields including name, position, and team.",
      },
      {
        type: "list",
        content: [
          "Type in the search box to start searching immediately",
          "Search is case-insensitive and updates as you type (with a short delay)",
          "Click the X button or clear the text to reset the search",
        ],
      },
      {
        type: "heading",
        content: "Field-Specific Search",
      },
      {
        type: "paragraph",
        content:
          "Use the dropdown next to the search box to search within a specific field:",
      },
      {
        type: "list",
        content: [
          "All Fields - Search across all player data (default)",
          "Name - Search by player name only",
          "Position - Find players by position (e.g., Center, Winger)",
          "Team - Search for players on a specific team",
        ],
      },
      {
        type: "tip",
        content:
          "Tip: Use field-specific search for more precise results when you know exactly what you're looking for.",
      },
    ],
  },
  {
    id: "filters",
    title: "Filters",
    icon: "🔽",
    content: [
      {
        type: "heading",
        content: "Opening the Filter Panel",
      },
      {
        type: "paragraph",
        content:
          'Click the "🔽 Filters" button in the controls area (next to the Columns button) to open the filter panel.',
      },
      {
        type: "heading",
        content: "Adding Filters",
      },
      {
        type: "list",
        content: [
          "Select a field to filter by (Position, Team, Goals, etc.)",
          "Choose an operator based on the field type (see below)",
          "Enter or select a value to filter by",
          'Click "+ Add Filter" to add additional filters',
          'Click "Apply Filters" to apply all filters',
        ],
      },
      {
        type: "heading",
        content: "Filter Types by Field",
      },
      {
        type: "paragraph",
        content: "String Fields (Position, Team):",
      },
      {
        type: "list",
        content: [
          "= (equals) - Exact match",
          "!= (not equals) - Exclude exact match",
          "contains - Field contains the text",
          "not_contains - Field does not contain the text",
        ],
      },
      {
        type: "paragraph",
        content:
          "Numeric Fields (Goals, Assists, Points, Jersey #, Games Played):",
      },
      {
        type: "list",
        content: [
          "= (equals) - Exact value",
          "!= (not equals) - Not this value",
          "> (greater than) - Greater than value",
          "< (less than) - Less than value",
          ">= (greater than or equal) - Greater than or equal to value",
          "<= (less than or equal) - Less than or equal to value",
        ],
      },
      {
        type: "paragraph",
        content: "Boolean Fields (Active Status):",
      },
      {
        type: "list",
        content: [
          "= (equals) - Is true or false",
          "!= (not equals) - Is not true or false",
        ],
      },
      {
        type: "tip",
        content:
          "Tip: You can apply multiple filters at once. For example, filter for Position = 'Center' AND Goals > 30 to find high-scoring centers.",
      },
      {
        type: "paragraph",
        content:
          'Active filters are displayed below the table header and show a count in the Filters button (e.g., "Filters (2)").',
      },
    ],
  },
  {
    id: "sorting",
    title: "Sorting",
    icon: "⬆️",
    content: [
      {
        type: "heading",
        content: "How to Sort",
      },
      {
        type: "paragraph",
        content: "Click on any column header to sort the table by that column.",
      },
      {
        type: "list",
        content: [
          "First click - Sort ascending (A-Z or 0-9)",
          "Second click - Sort descending (Z-A or 9-0)",
          "Third click - Return to default sort (Name ascending)",
        ],
      },
      {
        type: "heading",
        content: "Sort Indicators",
      },
      {
        type: "paragraph",
        content: "The current sort column is highlighted and shows an arrow:",
      },
      {
        type: "list",
        content: ["▲ - Ascending order", "▼ - Descending order"],
      },
      {
        type: "heading",
        content: "Available Sort Fields",
      },
      {
        type: "paragraph",
        content:
          "You can sort by any column including: Name, Position, Team, Jersey #, Active Status, and all statistics (Regular Season, Playoff, and Total Goals, Assists, Points, Games Played).",
      },
      {
        type: "tip",
        content:
          "Tip: Sort by Points (Total) descending to quickly find the top-scoring players!",
      },
    ],
  },
  {
    id: "view-details",
    title: "Viewing Player Details",
    icon: "👁️",
    content: [
      {
        type: "paragraph",
        content:
          "Click on any player row in the table to open a detailed view of that player's information.",
      },
      {
        type: "heading",
        content: "Details Modal Contains",
      },
      {
        type: "list",
        content: [
          "Player name, position, team, and jersey number",
          "Active/Inactive status",
          "Regular Season statistics (Goals, Assists, Points, Games Played)",
          "Playoff statistics (Goals, Assists, Points, Games Played)",
          "Total statistics across both regular season and playoffs",
        ],
      },
      {
        type: "paragraph",
        content:
          'From the details modal, you can also access "Edit" and "Delete" buttons to modify or remove the player.',
      },
    ],
  },
  {
    id: "add-player",
    title: "Adding a Player",
    icon: "➕",
    content: [
      {
        type: "heading",
        content: "Opening the Add Player Form",
      },
      {
        type: "paragraph",
        content:
          'Click the "+ Add Player" button in the top-left area of the controls to open the add player form.',
      },
      {
        type: "heading",
        content: "Required Fields",
      },
      {
        type: "list",
        content: [
          "Name - Player's full name",
          "Position - Select from dropdown (Center, Left Wing, Right Wing, Defenseman, Goalie)",
          "Team - Team name (free text)",
          "Jersey Number - Player's jersey number (positive integer)",
          "Active Status - Whether the player is currently active (Yes/No)",
        ],
      },
      {
        type: "heading",
        content: "Optional Statistics Fields",
      },
      {
        type: "paragraph",
        content:
          "All statistics fields are optional and default to 0 if not provided:",
      },
      {
        type: "list",
        content: [
          "Regular Season: Goals, Assists, Games Played",
          "Playoff: Goals, Assists, Games Played",
        ],
      },
      {
        type: "paragraph",
        content:
          "Total statistics (Goals, Assists, Points, Games Played) are calculated automatically.",
      },
      {
        type: "tip",
        content:
          "Tip: All statistics must be non-negative numbers. Points are calculated automatically as Goals + Assists.",
      },
      {
        type: "paragraph",
        content:
          'Click "Add Player" to save the new player or "Cancel" to discard changes.',
      },
    ],
  },
  {
    id: "edit-player",
    title: "Editing a Player",
    icon: "✏️",
    content: [
      {
        type: "heading",
        content: "Opening the Edit Form",
      },
      {
        type: "list",
        content: [
          "Click on a player row to open the details modal",
          'Click the "Edit" button in the bottom-right of the modal',
        ],
      },
      {
        type: "heading",
        content: "What Can Be Edited",
      },
      {
        type: "paragraph",
        content:
          "You can edit all player fields including name, position, team, jersey number, active status, and all statistics (Regular Season and Playoff).",
      },
      {
        type: "heading",
        content: "Saving Changes",
      },
      {
        type: "list",
        content: [
          "Make your desired changes in the form",
          'Click "Save Changes" to update the player',
          'Click "Cancel" to discard your edits',
          "Validation errors will be displayed if any fields are invalid",
        ],
      },
      {
        type: "paragraph",
        content:
          "After saving, the table will automatically refresh to show your updates.",
      },
    ],
  },
  {
    id: "delete-player",
    title: "Deleting a Player",
    icon: "🗑️",
    content: [
      {
        type: "heading",
        content: "How to Delete",
      },
      {
        type: "list",
        content: [
          "Click on a player row to open the details modal",
          'Click the "Delete" button in the bottom-right of the modal',
          "A confirmation dialog will appear",
        ],
      },
      {
        type: "warning",
        content:
          "Warning: Deleting a player is permanent and cannot be undone! Make sure you want to delete the player before confirming.",
      },
      {
        type: "paragraph",
        content:
          'In the confirmation dialog, click "Delete" to permanently remove the player or "Cancel" to abort the deletion.',
      },
      {
        type: "paragraph",
        content:
          "After deletion, the table will automatically refresh to reflect the change.",
      },
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    icon: "📄",
    content: [
      {
        type: "heading",
        content: "Navigating Pages",
      },
      {
        type: "paragraph",
        content:
          "Use the pagination controls at the bottom of the table to navigate through player pages:",
      },
      {
        type: "list",
        content: [
          '"Previous" button - Go to the previous page',
          '"Next" button - Go to the next page',
          "Page indicator - Shows current page and total pages (e.g., Page 2 of 10)",
        ],
      },
      {
        type: "heading",
        content: "Items Per Page",
      },
      {
        type: "paragraph",
        content:
          'Use the "Items per page" dropdown to change how many players are displayed on each page:',
      },
      {
        type: "list",
        content: [
          "5 items per page",
          "10 items per page (default)",
          "25 items per page",
          "50 items per page",
          "100 items per page",
        ],
      },
      {
        type: "paragraph",
        content:
          "The total player count is displayed above the table (e.g., Total Players: 150).",
      },
      {
        type: "tip",
        content:
          "Tip: Increase items per page to view more players at once, or decrease it for faster page loads.",
      },
    ],
  },
  {
    id: "columns",
    title: "Column Visibility",
    icon: "📋",
    content: [
      {
        type: "heading",
        content: "Opening the Columns Panel",
      },
      {
        type: "paragraph",
        content:
          'Click the "📋 Columns" button in the controls area to open the column visibility panel.',
      },
      {
        type: "heading",
        content: "Showing and Hiding Columns",
      },
      {
        type: "paragraph",
        content: "The panel shows all available columns with checkboxes:",
      },
      {
        type: "list",
        content: [
          "Check a box to show that column in the table",
          "Uncheck a box to hide that column",
          "Changes apply immediately",
        ],
      },
      {
        type: "heading",
        content: "Available Columns",
      },
      {
        type: "paragraph",
        content:
          "You can toggle visibility for: Position, Team, Jersey #, Active Status, Regular Season stats (Goals, Assists, Points, Games Played), Playoff stats (Goals, Assists, Points, Games Played), and Total stats (Goals, Assists, Points, Games Played).",
      },
      {
        type: "tip",
        content:
          "Tip: Hide columns you don't need to simplify the table view and focus on the data that matters to you.",
      },
      {
        type: "paragraph",
        content:
          "Note: Your column visibility preferences are remembered during your current session.",
      },
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard Shortcuts",
    icon: "⌨️",
    content: [
      {
        type: "paragraph",
        content:
          "Use these keyboard shortcuts to navigate the application more efficiently:",
      },
      {
        type: "heading",
        content: "Global Shortcuts",
      },
      {
        type: "list",
        content: [
          "ESC - Close any open modal, panel, or dropdown",
          "Tab - Navigate between form fields and interactive elements",
          "Enter - Submit forms or activate focused buttons",
        ],
      },
      {
        type: "heading",
        content: "Form Shortcuts",
      },
      {
        type: "list",
        content: [
          "Enter in search box - Execute search immediately",
          "Enter in any form - Submit the form",
        ],
      },
      {
        type: "tip",
        content:
          "Tip: Press ESC to quickly close the help panel and return to the table!",
      },
    ],
  },
];
