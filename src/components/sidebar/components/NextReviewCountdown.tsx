
import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebarStore';

export const NextReviewCountdown: React.FC = () => {
  const navigate = useNavigate();
  const { config, isLoadingConfig } = useSidebarStore();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!config?.nextReviewTs) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(config.nextReviewTs).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [config?.nextReviewTs]);

  if (isLoadingConfig) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-16 bg-gray-700 rounded animate-pulse" />
        <div className="h-2 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!config?.nextReviewTs || !timeLeft) {
    return null;
  }

  const handleClick = () => {
    if (timeLeft.isExpired) {
      navigate('/homepage'); // Navigate to latest review
    }
  };

  const progressPercentage = timeLeft.isExpired ? 100 : Math.max(0, 
    100 - ((timeLeft.days * 24 + timeLeft.hours) / 168) * 100 // Assuming 7-day cycle
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Próxima Review</h3>
      </div>
      
      {timeLeft.isExpired ? (
        <button
          onClick={handleClick}
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
        >
          <div className="flex items-center justify-center space-x-2 text-white">
            <span className="font-medium text-sm">Ler agora</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <div 
            className="text-center p-3 bg-gray-800 rounded-lg"
            aria-live="polite"
          >
            <div className="text-lg font-semibold text-white">
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {timeLeft.hours.toString().padStart(2, '0')}h{' '}
              {timeLeft.minutes.toString().padStart(2, '0')}m
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {timeLeft.days > 0 ? 'restantes' : 'hoje!'}
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
