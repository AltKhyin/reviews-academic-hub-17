
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore';

export const NextReviewCountdown: React.FC = () => {
  const { config, isLoadingConfig } = useSidebarStore();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    if (!config?.nextReviewTs) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(config.nextReviewTs);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [config?.nextReviewTs]);

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-muted/50 rounded w-32 animate-pulse" />
        <div className="h-16 bg-muted/50 rounded animate-pulse" />
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Próxima Edição</h3>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="px-2 py-1 bg-muted/20 rounded">
            <div className="text-lg font-bold text-foreground/80">{timeRemaining.days}</div>
            <div className="text-xs text-muted-foreground">dias</div>
          </div>
          <div className="px-2 py-1 bg-muted/20 rounded">
            <div className="text-lg font-bold text-foreground/80">{timeRemaining.hours}</div>
            <div className="text-xs text-muted-foreground">horas</div>
          </div>
          <div className="px-2 py-1 bg-muted/20 rounded">
            <div className="text-lg font-bold text-foreground/80">{timeRemaining.minutes}</div>
            <div className="text-xs text-muted-foreground">min</div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">restantes</p>
      </div>
    </div>
  );
};
