
// ABOUTME: Countdown widget for next issue release with flip animation
// Displays upcoming issue date with elegant typography and accessibility features

import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface MetricWidgetProps {
  nextIssueDate: string | null;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FlipDigit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className="text-center">
      <div className="relative h-16 w-12 mx-auto mb-2">
        <div 
          className={`absolute inset-0 bg-accent-blue-400/20 rounded-lg flex items-center justify-center transition-transform duration-300 ${
            isFlipping ? 'animate-flip' : ''
          }`}
        >
          <span className="font-mono text-2xl font-semibold text-accent-blue-300">
            {String(value).padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
};

const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
};

export const MetricWidget: React.FC<MetricWidgetProps> = ({ 
  nextIssueDate, 
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ 
    days: 0, hours: 0, minutes: 0, seconds: 0 
  });

  useEffect(() => {
    if (!nextIssueDate) return;

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(nextIssueDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextIssueDate]);

  if (!nextIssueDate) {
    return (
      <aside 
        className={`magazine-card p-6 sticky top-6 ${className}`}
        role="complementary"
        aria-label="Informações da próxima edição"
      >
        <div className="text-center">
          <Clock className="w-8 h-8 text-accent-blue-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold mb-2">Próxima Edição</h3>
          <p className="text-muted-foreground text-sm">
            Data ainda não definida
          </p>
        </div>
      </aside>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <aside 
      className={`magazine-card p-6 sticky top-6 ${className}`}
      role="complementary"
      aria-label="Contagem regressiva para próxima edição"
      aria-live="polite"
    >
      <div className="text-center space-y-4">
        {/* Header */}
        <div>
          <Calendar className="w-6 h-6 text-accent-blue-400 mx-auto mb-2" />
          <h3 className="font-serif text-lg font-semibold">Próxima Edição</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(nextIssueDate)}
          </p>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-2 gap-3">
          <FlipDigit value={timeRemaining.days} label="Dias" />
          <FlipDigit value={timeRemaining.hours} label="Horas" />
          <FlipDigit value={timeRemaining.minutes} label="Min" />
          <FlipDigit value={timeRemaining.seconds} label="Seg" />
        </div>

        {/* Status indicator */}
        <div className="pt-3 border-t border-border/30">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Em produção</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MetricWidget;
