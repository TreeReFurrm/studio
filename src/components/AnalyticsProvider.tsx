
'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { trackEvent as track } from '@/lib/analytics';
import { useUser } from '@/firebase';

// Define the shape of the context
interface AnalyticsContextType {
  trackEvent: (eventName: any, properties: Record<string, any>) => void;
}

// Create the context with a default dummy function
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => console.warn('AnalyticsProvider not found'),
});

// Create the provider component
export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  // The trackEvent function now has access to the user from its closure
  const trackEvent = useCallback(
    (eventName: any, properties: Record<string, any>) => {
      track(eventName, properties, user);
    },
    [user] // The function is recreated if the user state changes
  );

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Create a custom hook for easy access to the trackEvent function
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
