/**
 * Performance monitoring utilities for the frontend.
 *
 * Centralized performance tracking that can be easily enabled/disabled.
 * Use this to measure and log timing information for API calls and renders.
 *
 * Enable by setting REACT_APP_ENABLE_PERF_LOGS=true in .env.local
 */

// Check if performance logging is enabled
const PERF_ENABLED =
  process.env.REACT_APP_ENABLE_PERF_LOGS === "true" ||
  process.env.NODE_ENV === "development";

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * Log a performance message with optional duration
   */
  static log(message: string, durationMs?: number): void {
    if (!PERF_ENABLED) return;

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });

    if (durationMs !== undefined) {
      console.log(`⏱️  [${timestamp}] ${message} | ${durationMs.toFixed(2)}ms`);
    } else {
      console.log(`⏱️  [${timestamp}] ${message}`);
    }
  }

  /**
   * Start a named timer
   */
  static startTimer(name: string): void {
    if (!PERF_ENABLED) return;
    this.timers.set(name, performance.now());
    this.log(`${name} - START`);
  }

  /**
   * End a named timer and log the duration
   */
  static endTimer(name: string): number | null {
    if (!PERF_ENABLED) return null;

    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`⚠️  No timer found for: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.log(`${name} - COMPLETE`, duration);
    this.timers.delete(name);
    return duration;
  }

  /**
   * Add a checkpoint to an existing timer
   */
  static checkpoint(timerName: string, checkpointName: string): void {
    if (!PERF_ENABLED) return;

    const startTime = this.timers.get(timerName);
    if (!startTime) {
      console.warn(`⚠️  No timer found for: ${timerName}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.log(`  └─ ${timerName} - ${checkpointName}`, duration);
  }
}

/**
 * Decorator for timing async functions
 */
export function timed(operationName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      PerformanceMonitor.startTimer(operationName);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        PerformanceMonitor.endTimer(operationName);
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function to wrap API calls with performance tracking
 */
export function trackApiCall<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const timerId = `API: ${name}`;
    PerformanceMonitor.startTimer(timerId);

    try {
      const result = await fn(...args);
      PerformanceMonitor.checkpoint(timerId, "response_received");
      return result;
    } catch (error) {
      PerformanceMonitor.log(`${timerId} - ERROR`);
      throw error;
    } finally {
      PerformanceMonitor.endTimer(timerId);
    }
  }) as T;
}

/**
 * Utility to track component render times
 */
export class RenderTracker {
  private componentName: string;
  private renderStart: number;

  constructor(componentName: string) {
    this.componentName = componentName;
    this.renderStart = performance.now();
    PerformanceMonitor.log(`${componentName} - RENDER START`);
  }

  complete() {
    const duration = performance.now() - this.renderStart;
    PerformanceMonitor.log(`${this.componentName} - RENDER COMPLETE`, duration);
  }
}
