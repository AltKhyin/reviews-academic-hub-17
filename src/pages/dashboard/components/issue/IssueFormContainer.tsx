
// ABOUTME: Issue form container with consistent color system
// Uses app colors for proper visual identity

import React, { useState } from 'react';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueForm } from './IssueForm';
import { ExternalLecturesManager } from './ExternalLecturesManager';
import { IssueDiscussionConfig } from '@/components/issue/IssueDiscussionConfig';
import { Card } from '@/components/ui/card';
import { CSS_VARIABLES } from '@/utils/colorSystem';

interface IssueFormContainerProps {
  issueId?: string;
  defaultValues: IssueFormValues;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface DiscussionSettings {
  discussionContent: string;
  includeReadButton: boolean;
  pinDurationDays: number;
}

export const IssueFormContainer: React.FC<IssueFormContainerProps> = ({
  issueId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [discussionSettings, setDiscussionSettings] = useState<DiscussionSettings>({
    discussionContent: '',
    includeReadButton: true,
    pinDurationDays: 7
  });

  const handleSubmitWithDiscussion = async (values: IssueFormValues) => {
    // Store discussion settings for potential use when publishing
    (window as any).issueDiscussionSettings = discussionSettings;
    await onSubmit(values);
  };

  return (
    <div className="space-y-8">
      <Card 
        className="p-6 border"
        style={{ 
          backgroundColor: CSS_VARIABLES.SECONDARY_BG, 
          borderColor: CSS_VARIABLES.BORDER_DEFAULT 
        }}
      >
        <IssueForm
          defaultValues={defaultValues}
          onSubmit={handleSubmitWithDiscussion}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
      
      <Card 
        className="p-6 border"
        style={{ 
          backgroundColor: CSS_VARIABLES.SECONDARY_BG, 
          borderColor: CSS_VARIABLES.BORDER_DEFAULT 
        }}
      >
        <IssueDiscussionConfig
          issueId={issueId}
          onSettingsChange={setDiscussionSettings}
        />
      </Card>
      
      {issueId && (
        <Card 
          className="p-6 border"
          style={{ 
            backgroundColor: CSS_VARIABLES.SECONDARY_BG, 
            borderColor: CSS_VARIABLES.BORDER_DEFAULT 
          }}
        >
          <ExternalLecturesManager issueId={issueId} />
        </Card>
      )}
    </div>
  );
};
