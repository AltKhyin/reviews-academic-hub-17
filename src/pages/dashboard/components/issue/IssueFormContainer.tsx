
import React from 'react';
import { IssueFormValues } from '@/schemas/issue-form-schema';
import { IssueForm } from './IssueForm';
import { ExternalLecturesManager } from './ExternalLecturesManager';

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
  return (
    <div className="space-y-8">
      <IssueForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
      
      {issueId && (
        <ExternalLecturesManager issueId={issueId} />
      )}
    </div>
  );
};
