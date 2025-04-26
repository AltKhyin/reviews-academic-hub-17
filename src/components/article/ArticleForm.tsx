
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/upload/FileUpload';

// Validation schema
const articleSchema = z.object({
  title: z.string().min(3, 'Title is required and must be at least 3 characters'),
  content: z.string().min(10, 'Content is required and must be at least 10 characters'),
  summary: z.string().optional(),
  image_url: z.string().optional(),
  published: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialValues?: Partial<ArticleFormValues>;
  onSubmit: (data: ArticleFormValues) => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
}) => {
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialValues?.title || '',
      content: initialValues?.content || '',
      summary: initialValues?.summary || '',
      image_url: initialValues?.image_url || '',
      published: initialValues?.published || false,
    },
  });

  const handleImageUpload = (url: string) => {
    form.setValue('image_url', url);
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Article' : 'Create New Article'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Article title" {...field} />
                  </FormControl>
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of the article"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A short summary that will be shown in article listings</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Article content"
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                  )}
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Featured Image</FormLabel>
              <div className="mt-2">
                {form.watch('image_url') ? (
                  <div className="relative rounded-md overflow-hidden mb-2">
                    <img
                      src={form.watch('image_url')}
                      alt="Article cover"
                      className="w-full h-[200px] object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      type="button"
                      onClick={() => form.setValue('image_url', '')}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    onUploadComplete={handleImageUpload}
                    accept="image/*"
                    bucketName="article-images"
                    label="Upload Image"
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Make this article visible to readers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
