
import React, { useState } from 'react';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueForm } from '../issue/IssueForm';
import { ExternalLecturesManager } from './ExternalLecturesManager';
import { IssueDiscussionConfig } from '@/components/issue/IssueDiscussionConfig';

interface IssueFormContainerProps {
  issueId?: string;
  defaultValues: IssueFormValues;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const IssueFormContainer: React.FC<IssueFormContainerProps> = ({
  issueId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [discussionSettings, setDiscussionSettings] = useState({
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
      <IssueForm
        defaultValues={defaultValues}
        onSubmit={handleSubmitWithDiscussion}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
      
      <IssueDiscussionConfig
        issueId={issueId}
        onSettingsChange={setDiscussionSettings}
      />
      
      {issueId && (
        <ExternalLecturesManager issueId={issueId} />
      )}
    </div>
  );
};
