
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReviewStatus } from '@/types/issue';

interface ArticleReviewFormProps {
  onSubmit: (data: { status: ReviewStatus; comments: string }) => void;
  initialValues?: {
    status: ReviewStatus;
    comments: string;
  };
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const ArticleReviewForm: React.FC<ArticleReviewFormProps> = ({
  onSubmit,
  initialValues = { status: 'in_review', comments: '' },
  isSubmitting = false,
  isEditing = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Update Review' : 'Submit Review'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your review of this article.'
            : 'Please provide your feedback on this article.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label>Review Status</Label>
            <RadioGroup defaultValue={initialValues.status}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in_review" id="in_review" {...register('status')} />
                <Label htmlFor="in_review">In Review</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" {...register('status')} />
                <Label htmlFor="approved">Approve</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" {...register('status')} />
                <Label htmlFor="rejected">Reject</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Provide your feedback here..."
              rows={6}
              {...register('comments', {
                required: 'Comments are required',
              })}
            />
            {errors.comments && (
              <p className="text-sm text-red-500">{errors.comments.message as string}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
