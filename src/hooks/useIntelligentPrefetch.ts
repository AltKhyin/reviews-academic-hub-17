
// ABOUTME: Intelligent prefetching based on user behavior patterns
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

interface BehaviorPattern {
  fromRoute: string;
  toRoute: string;
  frequency: number;
  confidence: number;
}

interface PrefetchRule {
  triggerRoute: string;
  targetRoute: string;
  queryKey: unknown[];
  confidence: number;
}

export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [prefetchRules, setPrefetchRules] = useState<PrefetchRule[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(0);

  // Track route transitions
  useEffect(() => {
    const currentRoute = location.pathname;
    const lastRoute = sessionStorage.getItem('lastRoute');

    if (lastRoute && lastRoute !== currentRoute) {
      setBehaviorPatterns(prev => {
        const existing = prev.find(p => p.fromRoute === lastRoute && p.toRoute === currentRoute);
        
        if (existing) {
          return prev.map(p => 
            p === existing 
              ? { ...p, frequency: p.frequency + 1, confidence: Math.min(1, p.frequency / 10) }
              : p
          );
        } else {
          return [...prev, {
            fromRoute: lastRoute,
            toRoute: currentRoute,
            frequency: 1,
            confidence: 0.1,
          }];
        }
      });
    }

    sessionStorage.setItem('lastRoute', currentRoute);
  }, [location.pathname]);

  // Generate prefetch rules based on patterns
  useEffect(() => {
    const rules = behaviorPatterns
      .filter(pattern => pattern.confidence > 0.3)
      .map(pattern => ({
        triggerRoute: pattern.fromRoute,
        targetRoute: pattern.toRoute,
        queryKey: ['prefetch', pattern.toRoute],
        confidence: pattern.confidence,
      }));

    setPrefetchRules(rules);
  }, [behaviorPatterns]);

  // Calculate current route confidence
  useEffect(() => {
    const currentRoute = location.pathname;
    const relevantPatterns = behaviorPatterns.filter(p => p.fromRoute === currentRoute);
    
    if (relevantPatterns.length > 0) {
      const maxConfidence = Math.max(...relevantPatterns.map(p => p.confidence));
      setCurrentConfidence(maxConfidence);
    } else {
      setCurrentConfidence(0);
    }
  }, [location.pathname, behaviorPatterns]);

  return {
    behaviorPatterns,
    prefetchRules,
    currentConfidence,
  };
};
