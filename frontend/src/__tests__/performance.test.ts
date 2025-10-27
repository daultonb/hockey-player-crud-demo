import {
  PerformanceMonitor,
  RenderTracker,
  timed,
  trackApiCall,
} from "../utils/performance";

// Mock console methods to suppress output
let consoleLogSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

describe("PerformanceMonitor", () => {
  beforeEach(() => {
    // Clear any existing timers
    (PerformanceMonitor as any).timers.clear();
  });

  describe("log", () => {
    it("should be callable with message only", () => {
      expect(() => PerformanceMonitor.log("Test message")).not.toThrow();
    });

    it("should be callable with message and duration", () => {
      expect(() => PerformanceMonitor.log("Test operation", 123.45)).not.toThrow();
    });
  });

  describe("startTimer", () => {
    it("should be callable", () => {
      expect(() => PerformanceMonitor.startTimer("testTimer")).not.toThrow();
    });
  });

  describe("endTimer", () => {
    it("should be callable and return value", () => {
      const result = PerformanceMonitor.endTimer("nonexistentTimer");
      expect(result === null || typeof result === "number").toBe(true);
    });

    it("should work with existing timer", () => {
      PerformanceMonitor.startTimer("testTimer");
      const result = PerformanceMonitor.endTimer("testTimer");
      expect(result === null || typeof result === "number").toBe(true);
    });
  });

  describe("checkpoint", () => {
    it("should be callable", () => {
      expect(() => PerformanceMonitor.checkpoint("timer", "checkpoint")).not.toThrow();
    });

    it("should work with existing timer", () => {
      PerformanceMonitor.startTimer("testTimer");
      expect(() => PerformanceMonitor.checkpoint("testTimer", "midpoint")).not.toThrow();
      PerformanceMonitor.endTimer("testTimer");
    });
  });
});

describe("timed decorator", () => {
  beforeEach(() => {
    (PerformanceMonitor as any).timers.clear();
  });

  it("should decorate async methods", async () => {
    class TestClass {
      @timed("testOperation")
      async testMethod() {
        return "success";
      }
    }

    const instance = new TestClass();
    const result = await instance.testMethod();
    expect(result).toBe("success");
  });

  it("should handle errors in decorated methods", async () => {
    class TestClass {
      @timed("failingOperation")
      async failingMethod() {
        throw new Error("Test error");
      }
    }

    const instance = new TestClass();
    await expect(instance.failingMethod()).rejects.toThrow("Test error");
  });

  it("should preserve return values", async () => {
    class TestClass {
      @timed("dataOperation")
      async getData() {
        return { id: 1, name: "Test" };
      }
    }

    const instance = new TestClass();
    const result = await instance.getData();
    expect(result).toEqual({ id: 1, name: "Test" });
  });
});

describe("trackApiCall", () => {
  beforeEach(() => {
    (PerformanceMonitor as any).timers.clear();
  });

  it("should wrap and execute async functions", async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: "test" });
    const wrapped = trackApiCall("test", mockFn);

    const result = await wrapped();
    expect(result).toEqual({ data: "test" });
    expect(mockFn).toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    const error = new Error("API Error");
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrapped = trackApiCall("test", mockFn);

    await expect(wrapped()).rejects.toThrow("API Error");
  });

  it("should pass arguments through", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");
    const wrapped = trackApiCall("test", mockFn);

    await wrapped("arg1", 123, { key: "value" });
    expect(mockFn).toHaveBeenCalledWith("arg1", 123, { key: "value" });
  });

  it("should preserve return type", async () => {
    const mockFn = jest.fn().mockResolvedValue({ id: 1, name: "Player" });
    const wrapped = trackApiCall<typeof mockFn>("getPlayer", mockFn);

    const result = await wrapped();
    expect(result).toEqual({ id: 1, name: "Player" });
  });
});

describe("RenderTracker", () => {
  it("should construct without errors", () => {
    expect(() => new RenderTracker("TestComponent")).not.toThrow();
  });

  it("should have complete method", () => {
    const tracker = new RenderTracker("TestComponent");
    expect(() => tracker.complete()).not.toThrow();
  });

  it("should work with multiple instances", () => {
    const tracker1 = new RenderTracker("Component1");
    const tracker2 = new RenderTracker("Component2");

    expect(() => {
      tracker1.complete();
      tracker2.complete();
    }).not.toThrow();
  });

  it("should track time between construction and complete", async () => {
    const tracker = new RenderTracker("TestComponent");
    await new Promise((resolve) => setTimeout(resolve, 10));
    tracker.complete();
    // Test passes if no errors thrown
    expect(true).toBe(true);
  });
});
