
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { issueFormSchema, IssueFormValues } from '@/schemas/issue-form-schema';
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload';

interface IssueFormProps {
  defaultValues: IssueFormValues;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Issue title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Issue description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Add tags as [tag:name]..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review PDF URL</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="PDF URL" {...field} />
                  <SimpleFileUpload
                    onUploadComplete={(url) => form.setValue('pdf_url', url)}
                    accept="application/pdf"
                    label="Upload"
                    bucket="issues"
                    folder="pdfs"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="article_pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Article PDF URL</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="Original article PDF URL" {...field} />
                  <SimpleFileUpload
                    onUploadComplete={(url) => form.setValue('article_pdf_url', url)}
                    accept="application/pdf"
                    label="Upload"
                    bucket="issues"
                    folder="pdfs"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input placeholder="Cover image URL" {...field} />
                  <SimpleFileUpload
                    onUploadComplete={(url) => form.setValue('cover_image_url', url)}
                    accept="image/*"
                    label="Upload"
                    bucket="issues"
                    folder="covers"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
