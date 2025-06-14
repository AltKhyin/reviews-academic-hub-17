// ABOUTME: Fullscreen editor experience wrapper using BlockEditor.
// Provides a distraction-free, immersive editing environment.
import React, { useState, useEffect } from 'react';
import { BlockEditor, BlockEditorProps } from './BlockEditor';
import { Review } from '@/types/review'; // Ensure Review is exported from types
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
      // The BlockEditor now manages its own state via useBlockManagement.
      // To get the latest state for saving, we might need onSave from BlockEditor
      // to update internalReview here, or BlockEditor needs a way to expose its current state.
      // For now, assuming onSave in BlockEditor updates a shared state or this internalReview correctly.
      onSave(internalReview); 
    }
    onClose();
  };
  
  // This handler is passed to BlockEditor. BlockEditor will call this with the complete Review object.
  const handleSaveInternal = (reviewToSave: Review) => {
    setInternalReview(reviewToSave); 
    onSave(reviewToSave); 
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
      
      <div className="flex-grow overflow-y-auto">
        <BlockEditor
          initialReview={internalReview} // BlockEditor takes initialReview
          onSave={handleSaveInternal}    // BlockEditor calls this with the full, updated Review object
          readonly={false}
          className="h-full"
        />
      </div>
    </div>
  );
};
