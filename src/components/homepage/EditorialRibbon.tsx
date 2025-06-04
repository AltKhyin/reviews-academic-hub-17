
// ABOUTME: Elegant editorial ribbon displaying site tagline with subtle styling
// Provides editorial voice and brand messaging in magazine layout

import React from 'react';
import { Sparkles } from 'lucide-react';

interface EditorialRibbonProps {
  tagline: string | null;
  className?: string;
}

export const EditorialRibbon: React.FC<EditorialRibbonProps> = ({ 
  tagline, 
  className = '' 
}) => {
  if (!tagline) return null;

  return (
    <section 
      className={`w-full bg-sheet/80 backdrop-blur-sm py-4 border-y border-border/50 ${className}`}
      role="complementary"
      aria-label="Mensagem editorial"
    >
      <div className="max-w-magazine mx-auto px-6">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5 text-accent-blue-400" aria-hidden="true" />
          <p className="text-center font-serif italic text-lg text-muted-foreground">
            {tagline}
          </p>
          <Sparkles className="w-5 h-5 text-accent-blue-400" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default EditorialRibbon;
