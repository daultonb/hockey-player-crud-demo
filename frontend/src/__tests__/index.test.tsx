import React from "react";

// Mock react-dom/client
let mockRender: jest.Mock;

jest.mock("react-dom/client", () => {
  mockRender = jest.fn();
  return {
    createRoot: jest.fn(() => ({
      render: mockRender,
    })),
  };
});

// Mock CSS
jest.mock("../index.css", () => ({}));

// Mock App component
jest.mock("../App", () => ({
  __esModule: true,
  default: () => "App Component",
}));

describe("Application Entry Point (index.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up DOM
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  /*
   * Tests that the application renders without crashing
   * Expected: Renders App wrapped in StrictMode
   */
  test("renders without crashing", () => {
    require("../index");

    const ReactDOM = require("react-dom/client");

    // Verify createRoot was called
    expect(ReactDOM.createRoot).toHaveBeenCalledTimes(1);
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById("root")
    );

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Verify StrictMode wrapping
    const renderedElement = mockRender.mock.calls[0][0];
    expect(renderedElement.type).toBe(React.StrictMode);
  });
});
