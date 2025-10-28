import { renderHook } from "@testing-library/react";
import {
  useAsyncPerformance,
  useComponentPerformance,
  useFetchPerformance,
  useInteractionTracking,
} from "../hooks/usePerformance";
import { PerformanceMonitor } from "../utils/performance";

// Mock the PerformanceMonitor
jest.mock("../utils/performance", () => ({
  PerformanceMonitor: {
    log: jest.fn(),
    startTimer: jest.fn(),
    endTimer: jest.fn(),
    checkpoint: jest.fn(),
  },
}));

describe("usePerformance hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useComponentPerformance", () => {
    it("should log component mount", () => {
      renderHook(() => useComponentPerformance("TestComponent"));

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "TestComponent - MOUNTED"
      );
    });

    it("should log component unmount with lifetime", () => {
      const { unmount } = renderHook(() =>
        useComponentPerformance("TestComponent")
      );

      jest.clearAllMocks();
      unmount();

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        expect.stringMatching(
          /TestComponent - UNMOUNTED \(lived \d+ms, \d+ renders\)/
        )
      );
    });

    it("should track render count on re-renders", () => {
      const { rerender } = renderHook(() =>
        useComponentPerformance("TestComponent")
      );

      jest.clearAllMocks();
      rerender();

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "TestComponent - RE-RENDER #2"
      );
    });

    it("should increment render count on multiple re-renders", () => {
      const { rerender } = renderHook(() =>
        useComponentPerformance("TestComponent")
      );

      jest.clearAllMocks();
      rerender();
      rerender();
      rerender();

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "TestComponent - RE-RENDER #4"
      );
    });

    it("should not log re-render on first render", () => {
      renderHook(() => useComponentPerformance("TestComponent"));

      const reRenderCalls = (
        PerformanceMonitor.log as jest.Mock
      ).mock.calls.filter((call) => call[0].includes("RE-RENDER"));
      expect(reRenderCalls.length).toBe(0);
    });
  });

  describe("useAsyncPerformance", () => {
    it("should track successful async operation", async () => {
      const { result } = renderHook(() => useAsyncPerformance());

      const asyncFn = jest.fn().mockResolvedValue("success");
      const returnValue = await result.current.trackAsync(
        "testOperation",
        asyncFn
      );

      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith(
        "testOperation"
      );
      expect(asyncFn).toHaveBeenCalled();
      expect(returnValue).toBe("success");
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith("testOperation");
    });

    it("should track failed async operation and still end timer", async () => {
      const { result } = renderHook(() => useAsyncPerformance());

      const error = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(error);

      await expect(
        result.current.trackAsync("testOperation", asyncFn)
      ).rejects.toThrow("Test error");

      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith(
        "testOperation"
      );
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith("testOperation");
    });

    it("should return the result from async function", async () => {
      const { result } = renderHook(() => useAsyncPerformance());

      const testData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(testData);

      const returnValue = await result.current.trackAsync("fetchData", asyncFn);

      expect(returnValue).toEqual(testData);
    });
  });

  describe("useFetchPerformance", () => {
    it("should start fetch tracking", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.startFetch();

      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith(
        "fetchPlayers"
      );
      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "📡 fetchPlayers - FETCH STARTED"
      );
    });

    it("should mark response received checkpoint", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.markReceived();

      expect(PerformanceMonitor.checkpoint).toHaveBeenCalledWith(
        "fetchPlayers",
        "response_received"
      );
    });

    it("should mark data processed checkpoint", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.markProcessed();

      expect(PerformanceMonitor.checkpoint).toHaveBeenCalledWith(
        "fetchPlayers",
        "data_processed"
      );
    });

    it("should end fetch tracking", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.endFetch();

      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith("fetchPlayers");
      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "✅ fetchPlayers - FETCH COMPLETE"
      );
    });

    it("should handle fetch error", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      const error = new Error("Network error");
      result.current.errorFetch(error);

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "❌ fetchPlayers - FETCH ERROR: Network error"
      );
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith("fetchPlayers");
    });

    it("should handle fetch error with non-Error object", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.errorFetch("String error");

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "❌ fetchPlayers - FETCH ERROR: String error"
      );
    });

    it("should track complete fetch lifecycle", () => {
      const { result } = renderHook(() => useFetchPerformance("fetchPlayers"));

      result.current.startFetch();
      result.current.markReceived();
      result.current.markProcessed();
      result.current.endFetch();

      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith(
        "fetchPlayers"
      );
      expect(PerformanceMonitor.checkpoint).toHaveBeenCalledWith(
        "fetchPlayers",
        "response_received"
      );
      expect(PerformanceMonitor.checkpoint).toHaveBeenCalledWith(
        "fetchPlayers",
        "data_processed"
      );
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith("fetchPlayers");
    });
  });

  describe("useInteractionTracking", () => {
    it("should track button clicks", () => {
      const { result } = renderHook(() => useInteractionTracking());

      result.current.trackClick("SubmitButton");

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "🖱️  USER CLICK: SubmitButton"
      );
    });

    it("should track page changes", () => {
      const { result } = renderHook(() => useInteractionTracking());

      result.current.trackPageChange(3);

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        "📄 PAGE CHANGE: → 3"
      );
    });

    it("should track search queries", () => {
      const { result } = renderHook(() => useInteractionTracking());

      result.current.trackSearch("Wayne Gretzky");

      expect(PerformanceMonitor.log).toHaveBeenCalledWith(
        '🔍 SEARCH: "Wayne Gretzky"'
      );
    });

    it("should track empty search queries", () => {
      const { result } = renderHook(() => useInteractionTracking());

      result.current.trackSearch("");

      expect(PerformanceMonitor.log).toHaveBeenCalledWith('🔍 SEARCH: ""');
    });

    it("should track multiple interactions in sequence", () => {
      const { result } = renderHook(() => useInteractionTracking());

      result.current.trackClick("FilterButton");
      result.current.trackSearch("Toronto");
      result.current.trackPageChange(2);
      result.current.trackClick("NextButton");

      expect(PerformanceMonitor.log).toHaveBeenCalledTimes(4);
      expect(PerformanceMonitor.log).toHaveBeenNthCalledWith(
        1,
        "🖱️  USER CLICK: FilterButton"
      );
      expect(PerformanceMonitor.log).toHaveBeenNthCalledWith(
        2,
        '🔍 SEARCH: "Toronto"'
      );
      expect(PerformanceMonitor.log).toHaveBeenNthCalledWith(
        3,
        "📄 PAGE CHANGE: → 2"
      );
      expect(PerformanceMonitor.log).toHaveBeenNthCalledWith(
        4,
        "🖱️  USER CLICK: NextButton"
      );
    });
  });
});
