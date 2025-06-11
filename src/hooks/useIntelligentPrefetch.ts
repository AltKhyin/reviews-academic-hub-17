
// ABOUTME: Intelligent prefetching based on user behavior patterns
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface BehaviorPattern {
  route: string;
  frequency: number;
  lastVisited: Date;
}

interface PrefetchRule {
  fromRoute: string;
  toRoute: string;
  confidence: number;
}

export const useIntelligentPrefetch = () => {
  const location = useLocation();
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [prefetchRules, setPrefetchRules] = useState<PrefetchRule[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(0);

  // Track route visits
  useEffect(() => {
    const currentRoute = location.pathname;
    
    setBehaviorPatterns(prev => {
      const existing = prev.find(p => p.route === currentRoute);
      if (existing) {
        return prev.map(p => 
          p.route === currentRoute 
            ? { ...p, frequency: p.frequency + 1, lastVisited: new Date() }
            : p
        );
      } else {
        return [...prev, { route: currentRoute, frequency: 1, lastVisited: new Date() }];
      }
    });
  }, [location.pathname]);

  // Generate prefetch rules based on patterns
  const generatePrefetchRules = useCallback(() => {
    const rules: PrefetchRule[] = [];
    
    // Simple rule: if user frequently visits archive after homepage
    const homepageVisits = behaviorPatterns.find(p => p.route === '/homepage')?.frequency || 0;
    const archiveVisits = behaviorPatterns.find(p => p.route === '/acervo')?.frequency || 0;
    
    if (homepageVisits > 3 && archiveVisits > 2) {
      rules.push({
        fromRoute: '/homepage',
        toRoute: '/acervo',
        confidence: 0.7,
      });
    }

    setPrefetchRules(rules);
    
    // Set confidence for current route
    const currentRule = rules.find(r => r.fromRoute === location.pathname);
    setCurrentConfidence(currentRule?.confidence || 0);
  }, [behaviorPatterns, location.pathname]);

  useEffect(() => {
    generatePrefetchRules();
  }, [generatePrefetchRules]);

  return {
    behaviorPatterns,
    prefetchRules,
    currentConfidence,
  };
};
