
// ABOUTME: Intelligent prefetching system that learns user behavior and preloads likely-needed data
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

interface UserBehaviorPattern {
  route: string;
  timestamp: number;
  duration: number;
  interactions: string[];
}

interface PrefetchRule {
  triggerRoute: string;
  targetQueries: string[][];
  probability: number;
  priority: number;
}

const STORAGE_KEY = 'user-behavior-patterns';
const MAX_STORED_PATTERNS = 100;

export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [behaviorPatterns, setBehaviorPatterns] = useState<UserBehaviorPattern[]>([]);
  const [prefetchRules, setPrefetchRules] = useState<PrefetchRule[]>([]);
  
  const routeStartTime = useRef<number>(Date.now());
  const interactionsRef = useRef<string[]>([]);

  // Load stored behavior patterns
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const patterns = JSON.parse(stored) as UserBehaviorPattern[];
        setBehaviorPatterns(patterns.slice(-MAX_STORED_PATTERNS));
      }
    } catch (error) {
      console.warn('Failed to load behavior patterns:', error);
    }
  }, []);

  // Save behavior patterns
  const saveBehaviorPatterns = useCallback((patterns: UserBehaviorPattern[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns.slice(-MAX_STORED_PATTERNS)));
    } catch (error) {
      console.warn('Failed to save behavior patterns:', error);
    }
  }, []);

  // Record user interaction
  const recordInteraction = useCallback((type: string, details?: string) => {
    const interaction = details ? `${type}:${details}` : type;
    interactionsRef.current.push(interaction);
  }, []);

  // Analyze patterns and generate prefetch rules
  const generatePrefetchRules = useCallback((patterns: UserBehaviorPattern[]): PrefetchRule[] => {
    const routeTransitions = new Map<string, Map<string, number>>();
    
    // Analyze route transitions
    for (let i = 0; i < patterns.length - 1; i++) {
      const current = patterns[i];
      const next = patterns[i + 1];
      
      if (!routeTransitions.has(current.route)) {
        routeTransitions.set(current.route, new Map());
      }
      
      const transitions = routeTransitions.get(current.route)!;
      transitions.set(next.route, (transitions.get(next.route) || 0) + 1);
    }
    
    const rules: PrefetchRule[] = [];
    
    // Convert patterns to prefetch rules
    routeTransitions.forEach((transitions, fromRoute) => {
      const totalTransitions = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
      
      transitions.forEach((count, toRoute) => {
        const probability = count / totalTransitions;
        
        if (probability > 0.3) { // Only prefetch if >30% probability
          let targetQueries: string[][] = [];
          
          // Define queries to prefetch based on route
          switch (toRoute) {
            case '/homepage':
              targetQueries = [
                ['parallel-issues'],
                ['sidebarStats'],
                ['parallel-reviewer-comments'],
              ];
              break;
            case '/archive':
              targetQueries = [
                ['archive-issues', false],
                ['archive-metadata'],
              ];
              break;
            case '/community':
              targetQueries = [
                ['posts'],
                ['community-stats'],
              ];
              break;
            default:
              if (toRoute.startsWith('/issue/')) {
                targetQueries = [
                  ['issue', toRoute.split('/')[2]],
                ];
              }
              break;
          }
          
          if (targetQueries.length > 0) {
            rules.push({
              triggerRoute: fromRoute,
              targetQueries,
              probability,
              priority: Math.round(probability * 10),
            });
          }
        }
      });
    });
    
    return rules.sort((a, b) => b.priority - a.priority);
  }, []);

  // Execute prefetch based on current route
  const executePrefetch = useCallback(async (currentRoute: string) => {
    const applicableRules = prefetchRules.filter(rule => rule.triggerRoute === currentRoute);
    
    if (applicableRules.length === 0) return;
    
    // Execute prefetch for high-priority rules
    const highPriorityRules = applicableRules.filter(rule => rule.priority >= 7);
    
    for (const rule of highPriorityRules) {
      try {
        await Promise.allSettled(
          rule.targetQueries.map(queryKey =>
            queryClient.prefetchQuery({
              queryKey,
              staleTime: 5 * 60 * 1000, // 5 minutes
            })
          )
        );
        
        console.log(`🔮 Prefetched ${rule.targetQueries.length} queries for probable route transition (${Math.round(rule.probability * 100)}% confidence)`);
      } catch (error) {
        console.warn('Prefetch failed:', error);
      }
    }
  }, [prefetchRules, queryClient]);

  // Track route changes
  useEffect(() => {
    const now = Date.now();
    const duration = now - routeStartTime.current;
    
    // Record the previous route behavior (if not the first load)
    if (duration > 1000) { // Only record if spent at least 1 second
      const newPattern: UserBehaviorPattern = {
        route: location.pathname,
        timestamp: routeStartTime.current,
        duration,
        interactions: [...interactionsRef.current],
      };
      
      setBehaviorPatterns(prev => {
        const updated = [...prev, newPattern].slice(-MAX_STORED_PATTERNS);
        saveBehaviorPatterns(updated);
        return updated;
      });
    }
    
    // Reset for new route
    routeStartTime.current = now;
    interactionsRef.current = [];
    
    // Execute prefetch for current route
    executePrefetch(location.pathname);
  }, [location.pathname, saveBehaviorPatterns, executePrefetch]);

  // Update prefetch rules when patterns change
  useEffect(() => {
    if (behaviorPatterns.length > 5) { // Need sufficient data
      const newRules = generatePrefetchRules(behaviorPatterns);
      setPrefetchRules(newRules);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🧠 Updated prefetch rules:', newRules);
      }
    }
  }, [behaviorPatterns, generatePrefetchRules]);

  // Manual prefetch trigger
  const prefetchForRoute = useCallback((route: string) => {
    executePrefetch(route);
  }, [executePrefetch]);

  return {
    recordInteraction,
    prefetchForRoute,
    behaviorPatterns,
    prefetchRules,
    currentConfidence: prefetchRules.find(r => r.triggerRoute === location.pathname)?.probability || 0,
  };
};
