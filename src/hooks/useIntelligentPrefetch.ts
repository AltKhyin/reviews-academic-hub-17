
// ABOUTME: Intelligent prefetching system based on user behavior patterns
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface BehaviorPattern {
  fromRoute: string;
  toRoute: string;
  count: number;
  confidence: number;
  lastSeen: Date;
}

interface PrefetchRule {
  route: string;
  prefetchTargets: string[];
  confidence: number;
  enabled: boolean;
}

export const useIntelligentPrefetch = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [prefetchRules, setPrefetchRules] = useState<PrefetchRule[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(0);

  // Load patterns from localStorage
  useEffect(() => {
    const storedPatterns = localStorage.getItem('user_behavior_patterns');
    const storedRules = localStorage.getItem('prefetch_rules');
    
    if (storedPatterns) {
      try {
        setBehaviorPatterns(JSON.parse(storedPatterns));
      } catch (error) {
        console.warn('Failed to parse behavior patterns:', error);
      }
    }
    
    if (storedRules) {
      try {
        setPrefetchRules(JSON.parse(storedRules));
      } catch (error) {
        console.warn('Failed to parse prefetch rules:', error);
      }
    }
  }, []);

  // Record navigation pattern
  const recordNavigation = useCallback((fromRoute: string, toRoute: string) => {
    setBehaviorPatterns(prev => {
      const existingPattern = prev.find(p => p.fromRoute === fromRoute && p.toRoute === toRoute);
      
      if (existingPattern) {
        const updated = prev.map(p => 
          p === existingPattern 
            ? { 
                ...p, 
                count: p.count + 1, 
                lastSeen: new Date(),
                confidence: Math.min(1, (p.count + 1) / 10) // Max confidence after 10 visits
              }
            : p
        );
        localStorage.setItem('user_behavior_patterns', JSON.stringify(updated));
        return updated;
      } else {
        const newPattern: BehaviorPattern = {
          fromRoute,
          toRoute,
          count: 1,
          confidence: 0.1,
          lastSeen: new Date(),
        };
        const updated = [...prev, newPattern];
        localStorage.setItem('user_behavior_patterns', JSON.stringify(updated));
        return updated;
      }
    });
  }, []);

  // Generate prefetch rules from patterns
  const generatePrefetchRules = useCallback(() => {
    const rules: PrefetchRule[] = [];
    
    // Group patterns by fromRoute
    const patternGroups = behaviorPatterns.reduce((acc, pattern) => {
      if (!acc[pattern.fromRoute]) acc[pattern.fromRoute] = [];
      acc[pattern.fromRoute].push(pattern);
      return acc;
    }, {} as Record<string, BehaviorPattern[]>);

    Object.entries(patternGroups).forEach(([route, patterns]) => {
      const highConfidenceTargets = patterns
        .filter(p => p.confidence > 0.3)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3) // Max 3 prefetch targets per route
        .map(p => p.toRoute);

      if (highConfidenceTargets.length > 0) {
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
        
        rules.push({
          route,
          prefetchTargets: highConfidenceTargets,
          confidence: avgConfidence,
          enabled: avgConfidence > 0.4,
        });
      }
    });

    setPrefetchRules(rules);
    localStorage.setItem('prefetch_rules', JSON.stringify(rules));
  }, [behaviorPatterns]);

  // Prefetch data for route
  const prefetchForRoute = useCallback(async (route: string) => {
    try {
      if (route === '/acervo' || route.startsWith('/acervo')) {
        // Prefetch archive data
        queryClient.prefetchQuery({
          queryKey: ['archive', 'metadata'],
          queryFn: async () => {
            // This would call the archive metadata function
            return { specialties: [], years: [], total_published: 0 };
          },
          staleTime: 10 * 60 * 1000,
        });
      }
      
      if (route === '/' || route === '/home') {
        // Prefetch homepage data
        queryClient.prefetchQuery({
          queryKey: ['issues', 'featured'],
          queryFn: async () => {
            // This would call the featured issue function
            return null;
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    } catch (error) {
      console.warn('Prefetch failed for route:', route, error);
    }
  }, [queryClient]);

  // Execute prefetching based on current route
  useEffect(() => {
    const currentRule = prefetchRules.find(rule => 
      rule.route === location.pathname && rule.enabled
    );
    
    if (currentRule) {
      setCurrentConfidence(currentRule.confidence);
      
      // Prefetch targets with delay to avoid blocking main thread
      setTimeout(() => {
        currentRule.prefetchTargets.forEach(target => {
          prefetchForRoute(target);
        });
      }, 500);
    } else {
      setCurrentConfidence(0);
    }
  }, [location.pathname, prefetchRules, prefetchForRoute]);

  // Generate rules when patterns change
  useEffect(() => {
    if (behaviorPatterns.length > 0) {
      generatePrefetchRules();
    }
  }, [behaviorPatterns, generatePrefetchRules]);

  // Track route changes
  useEffect(() => {
    const previousRoute = sessionStorage.getItem('previous_route');
    const currentRoute = location.pathname;

    if (previousRoute && previousRoute !== currentRoute) {
      recordNavigation(previousRoute, currentRoute);
    }

    sessionStorage.setItem('previous_route', currentRoute);
  }, [location.pathname, recordNavigation]);

  return {
    behaviorPatterns,
    prefetchRules,
    currentConfidence,
    recordNavigation,
    prefetchForRoute,
  };
};
