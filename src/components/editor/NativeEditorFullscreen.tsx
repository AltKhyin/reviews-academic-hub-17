
// ABOUTME: Fullscreen editor experience wrapper using BlockEditor.
// Provides a distraction-free, immersive editing environment.
import React, { useState, useEffect } from 'react';
import { BlockEditor, BlockEditorProps } from './BlockEditor';
import { Review } from '@/types/review';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react'; // Icons for close and save

export interface NativeEditorFullscreenProps extends Omit<BlockEditorProps, 'readonly' | 'className'> {
  initialReview?: Review;
  onSave: (review: Review) => void;
  onClose: () => void;
  isOpen: boolean; // Control visibility from parent
}

export const NativeEditorFullscreen: React.FC<NativeEditorFullscreenProps> = ({
  initialReview,
  onSave,
  onClose,
  isOpen,
}) => {
  const [internalReview, setInternalReview] = useState<Review | undefined>(initialReview);

  useEffect(() => {
    setInternalReview(initialReview);
  }, [initialReview, isOpen]); // Reset when opened or initialReview changes

  if (!isOpen) {
    return null;
  }

  const handleSaveAndClose = () => {
    if (internalReview) {
      onSave(internalReview);
    }
    onClose();
  };
  
  const handleSaveInternal = (reviewToSave: Review) => {
    setInternalReview(reviewToSave); // Keep internal state updated
    onSave(reviewToSave); // Propagate save to parent immediately as well
  };


  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col p-0 m-0 overflow-hidden">
      <header className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Editor em Tela Cheia</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveAndClose} className="text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white">
            <Save size={16} className="mr-2" />
            Salvar e Fechar
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800">
            <X size={20} />
          </Button>
        </div>
      </header>
      
      <div className="flex-grow overflow-y-auto"> {/* Ensure this div allows scrolling for BlockEditor content */}
        <BlockEditor
          initialReview={internalReview}
          onSave={handleSaveInternal} // Use internal save handler
          readonly={false}
          className="h-full" // Critical for allowing BlockEditor to manage its own scroll if needed
        />
      </div>
    </div>
  );
};

