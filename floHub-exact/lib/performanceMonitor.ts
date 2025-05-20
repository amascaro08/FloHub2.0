/**
 * Performance monitoring utilities for FlowHub
 * This file contains functions to monitor and report performance metrics
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Interface for performance metrics
interface PerformanceMetrics {
  fcp: number | null;  // First Contentful Paint
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  navStart: number;    // Navigation Start timestamp
  loadComplete: number | null; // Load complete timestamp
  apiCalls: Record<string, number>; // API call durations
  componentRenders: Record<string, number>; // Component render times
}

// Initialize metrics object
let metrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
  navStart: typeof performance !== 'undefined' ? performance.now() : 0,
  loadComplete: null,
  apiCalls: {},
  componentRenders: {}
};

// Reset metrics (useful for SPA navigation)
export function resetMetrics(): void {
  metrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navStart: typeof performance !== 'undefined' ? performance.now() : 0,
    loadComplete: null,
    apiCalls: {},
    componentRenders: {}
  };
}

// Start monitoring performance metrics
export function startPerformanceMonitoring(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Record navigation start time
  metrics.navStart = performance.timeOrigin || performance.timing.navigationStart;

  // Monitor First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        metrics.fcp = entries[0].startTime;
        console.log(`[Performance] First Contentful Paint: ${Math.round(metrics.fcp)}ms`);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('[Performance] FCP monitoring not supported', e);
  }

  // Monitor Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      // We use the most recent LCP event
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
      console.log(`[Performance] Largest Contentful Paint: ${Math.round(metrics.lcp)}ms`);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('[Performance] LCP monitoring not supported', e);
  }

  // Monitor First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const firstInput = entries[0] as any;
        metrics.fid = firstInput.processingStart - firstInput.startTime;
        console.log(`[Performance] First Input Delay: ${Math.round(metrics.fid)}ms`);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('[Performance] FID monitoring not supported', e);
  }

  // Monitor Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      }
      metrics.cls = clsValue;
      console.log(`[Performance] Cumulative Layout Shift: ${metrics.cls?.toFixed(3)}`);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('[Performance] CLS monitoring not supported', e);
  }

  // Monitor Time to First Byte (TTFB)
  try {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      console.log(`[Performance] Time to First Byte: ${Math.round(metrics.ttfb)}ms`);
    }
  } catch (e) {
    console.warn('[Performance] TTFB monitoring not supported', e);
  }

  // Record when page load is complete
  window.addEventListener('load', () => {
    metrics.loadComplete = performance.now();
    const loadTime = metrics.loadComplete - metrics.navStart;
    console.log(`[Performance] Total page load time: ${Math.round(loadTime)}ms`);
    
    // Send metrics to analytics after page load
    setTimeout(() => {
      sendMetricsToAnalytics();
    }, 1000);
  });
}

// Track API call performance
export function trackApiCall(url: string, startTime: number, endTime: number): void {
  const duration = endTime - startTime;
  
  // Extract the base endpoint from the URL
  const urlObj = new URL(url, window.location.origin);
  const endpoint = urlObj.pathname.split('/').slice(0, 3).join('/');
  
  metrics.apiCalls[endpoint] = (metrics.apiCalls[endpoint] || 0) + duration;
  console.log(`[Performance] API call to ${endpoint}: ${Math.round(duration)}ms`);
}

// Track component render time
export function trackComponentRender(componentName: string, duration: number): void {
  metrics.componentRenders[componentName] = duration;
  console.log(`[Performance] ${componentName} render time: ${Math.round(duration)}ms`);
}

// Get current performance metrics
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

// Send metrics to analytics service
async function sendMetricsToAnalytics(): Promise<void> {
  // Log metrics to console for debugging
  console.log('[Performance] Sending metrics to analytics:', metrics);
  
  try {
    // Get user ID if available
    let userId = null;
    if (typeof window !== 'undefined') {
      try {
        // Try to get user email from localStorage (set during session)
        userId = localStorage.getItem('flohub.userEmail');
      } catch (e) {
        console.warn('[Performance] Error getting user ID:', e);
      }
    }
    
    // Send metrics to Firestore
    const performanceRef = collection(db, 'analytics', 'performance', 'metrics');
    await addDoc(performanceRef, {
      ...metrics,
      userId,
      timestamp: serverTimestamp()
    });
    
    console.log('[Performance] Metrics sent to Firestore successfully');
  } catch (e) {
    console.warn('[Performance] Error sending metrics to Firestore:', e);
    
    // Fallback to API endpoint if Firestore fails
    if (typeof fetch !== 'undefined') {
      try {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metrics),
          // Don't wait for the response - fire and forget
          keepalive: true,
        }).catch(err => {
          console.warn('[Performance] Failed to send metrics to API:', err);
        });
      } catch (e) {
        console.warn('[Performance] Error sending metrics to API:', e);
      }
    }
  }
}

// Create a performance-wrapped fetch function
export function performanceFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  
  // Extract URL string from input
  let urlString: string;
  if (typeof input === 'string') {
    urlString = input;
  } else if (input instanceof Request) {
    urlString = input.url;
  } else {
    // Handle URL object
    urlString = input.toString();
  }
  
  return fetch(input, init).then(response => {
    const endTime = performance.now();
    trackApiCall(urlString, startTime, endTime);
    return response;
  }).catch(error => {
    const endTime = performance.now();
    trackApiCall(urlString, startTime, endTime);
    throw error;
  });
}

// Track user session duration
let sessionStartTime = Date.now();
let isTracking = false;

export function startSessionTracking(): void {
  if (isTracking) return;
  
  sessionStartTime = Date.now();
  isTracking = true;
  
  // Set up event listeners for session end
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', trackSessionEnd);
    
    // Also track session when user navigates away (SPA)
    window.addEventListener('pagehide', trackSessionEnd);
  }
}

async function trackSessionEnd(): Promise<void> {
  if (!isTracking) return;
  
  const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // Convert to minutes
  isTracking = false;
  
  try {
    // Get user ID if available
    let userId = null;
    if (typeof window !== 'undefined') {
      try {
        // Try to get user email from localStorage
        userId = localStorage.getItem('flohub.userEmail');
      } catch (e) {
        console.warn('[Performance] Error getting user ID for session tracking:', e);
      }
    }
    
    // Send session data to Firestore
    const sessionsRef = collection(db, 'analytics', 'sessions', 'durations');
    await addDoc(sessionsRef, {
      sessionDuration,
      userId,
      timestamp: serverTimestamp()
    });
    
    console.log(`[Performance] Session duration tracked: ${sessionDuration.toFixed(2)} minutes`);
  } catch (e) {
    console.warn('[Performance] Error tracking session duration:', e);
  }
}

// React hook to use performance monitoring in components
export function usePerformanceMonitoring() {
  const { data: session } = useSession();
  
  useEffect(() => {
    // Start performance monitoring
    startPerformanceMonitoring();
    
    // Start session tracking
    startSessionTracking();
    
    // Store user email in localStorage for analytics
    if (session?.user?.email) {
      try {
        localStorage.setItem('flohub.userEmail', session.user.email);
      } catch (e) {
        console.warn('[Performance] Error storing user email:', e);
      }
    }
    
    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', trackSessionEnd);
        window.removeEventListener('pagehide', trackSessionEnd);
      }
    };
  }, [session]);
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  startPerformanceMonitoring();
  startSessionTracking();
}