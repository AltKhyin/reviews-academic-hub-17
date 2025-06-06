
// ABOUTME: Refactored issue form container with improved organization
// Main form container with better component separation and prop handling

import React, { useState } from 'react';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueForm } from './IssueForm';
import { ExternalLecturesManager } from './ExternalLecturesManager';
import { IssueDiscussionConfig } from '@/components/issue/IssueDiscussionConfig';
import { Card } from '@/components/ui/card';

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
        style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
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
        style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
      >
        <IssueDiscussionConfig
          issueId={issueId}
          onSettingsChange={setDiscussionSettings}
        />
      </Card>
      
      {issueId && (
        <Card 
          className="p-6 border"
          style={{ backgroundColor: '#212121', borderColor: '#2a2a2a' }}
        >
          <ExternalLecturesManager issueId={issueId} />
        </Card>
      )}
    </div>
  );
};
