/**
 * React hooks for performance monitoring.
 *
 * These hooks integrate with the PerformanceMonitor utility to track
 * component lifecycle events and data fetching operations.
 */

import { useEffect, useRef } from "react";
import { PerformanceMonitor } from "../utils/performance";

/**
 * Hook to track component mount/unmount and render times
 */
export function useComponentPerformance(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    // Component mounted
    mountTime.current = performance.now();
    PerformanceMonitor.log(`${componentName} - MOUNTED`);

    return () => {
      // Component unmounted
      const lifetime = performance.now() - mountTime.current;
      PerformanceMonitor.log(
        `${componentName} - UNMOUNTED (lived ${lifetime.toFixed(0)}ms, ${
          renderCount.current
        } renders)`
      );
    };
  }, [componentName]);

  // Track render count
  useEffect(() => {
    renderCount.current++;
    if (renderCount.current > 1) {
      PerformanceMonitor.log(
        `${componentName} - RE-RENDER #${renderCount.current}`
      );
    }
  });
}

/**
 * Hook to track the duration of async operations
 */
export function useAsyncPerformance() {
  return {
    trackAsync: async <T>(
      operationName: string,
      asyncFn: () => Promise<T>
    ): Promise<T> => {
      PerformanceMonitor.startTimer(operationName);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        PerformanceMonitor.endTimer(operationName);
      }
    },
  };
}

/**
 * Hook to track data fetching operations with detailed timing
 */
export function useFetchPerformance(operationName: string) {
  return {
    startFetch: () => {
      PerformanceMonitor.startTimer(operationName);
      PerformanceMonitor.log(`📡 ${operationName} - FETCH STARTED`);
    },

    markReceived: () => {
      PerformanceMonitor.checkpoint(operationName, "response_received");
    },

    markProcessed: () => {
      PerformanceMonitor.checkpoint(operationName, "data_processed");
    },

    endFetch: () => {
      PerformanceMonitor.endTimer(operationName);
      PerformanceMonitor.log(`✅ ${operationName} - FETCH COMPLETE`);
    },

    errorFetch: (error: any) => {
      PerformanceMonitor.log(
        `❌ ${operationName} - FETCH ERROR: ${error.message || error}`
      );
      PerformanceMonitor.endTimer(operationName);
    },
  };
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracking() {
  return {
    trackClick: (elementName: string) => {
      PerformanceMonitor.log(`🖱️  USER CLICK: ${elementName}`);
    },

    trackPageChange: (page: number) => {
      PerformanceMonitor.log(`📄 PAGE CHANGE: → ${page}`);
    },

    trackSearch: (query: string) => {
      PerformanceMonitor.log(`🔍 SEARCH: "${query}"`);
    },
  };
}
