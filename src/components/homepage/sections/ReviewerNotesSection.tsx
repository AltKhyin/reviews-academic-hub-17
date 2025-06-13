
// ABOUTME: Reviewer notes section component for homepage
// Displays reviewer notes and comments

import React from 'react';

interface ReviewerNotesSectionProps {
  reviewerData?: any;
  sectionConfig?: {
    visible: boolean;
    order: number;
    title: string;
  };
  onConfigChange?: (updates: any) => void;
}

export const ReviewerNotesSection: React.FC<ReviewerNotesSectionProps> = ({
  reviewerData,
  sectionConfig,
  onConfigChange
}) => {
  return (
    <section className="reviewer-notes-section mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {sectionConfig?.title || 'Notas dos Revisores'}
        </h2>
      </div>
      
      <div className="space-y-4">
        {reviewerData?.notes?.length > 0 ? (
          reviewerData.notes.map((note: any, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                  {note.reviewer_name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{note.reviewer_name}</h4>
                  <p className="text-xs text-gray-400">{note.date}</p>
                </div>
              </div>
              <p className="text-gray-300">{note.message}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Nenhuma nota de revisor disponível.</p>
          </div>
        )}
      </div>
    </section>
  );
};
