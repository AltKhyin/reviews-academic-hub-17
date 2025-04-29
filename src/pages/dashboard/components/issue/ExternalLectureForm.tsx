
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

// Define schema for form validation
const lectureFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  external_url: z.string().url("Please enter a valid URL").min(1, "External URL is required")
});

type LectureFormValues = z.infer<typeof lectureFormSchema>;

interface ExternalLectureFormProps {
  issueId: string;
  onSuccess: () => void;
}

export function ExternalLectureForm({ issueId, onSuccess }: ExternalLectureFormProps) {
  const form = useForm<LectureFormValues>({
    resolver: zodResolver(lectureFormSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      external_url: ''
    }
  });

  const handleAddLecture = async (values: LectureFormValues) => {
    if (!issueId) {
      toast({
        title: "Error",
        description: "Please save the issue first before adding external lectures",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add lectures",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('external_lectures')
        .insert({
          issue_id: issueId,
          title: values.title,
          description: values.description || null,
          thumbnail_url: values.thumbnail_url || null,
          external_url: values.external_url,
          owner_id: user.id
        } as any) as { error: any };
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "External lecture added successfully",
      });
      
      // Reset form
      form.reset();
      
      // Call success callback
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add external lecture",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAddLecture)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Lecture title" {...field} />
              </FormControl>
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
                <Textarea placeholder="Short description" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="Thumbnail image URL" {...field} />
                </FormControl>
                <SimpleFileUpload
                  onUploadComplete={(url) => form.setValue("thumbnail_url", url)}
                  accept="image/*"
                  label="Upload"
                  bucket="issues"
                  folder="thumbnails"
                />
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="external_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External URL</FormLabel>
              <FormControl>
                <Input placeholder="URL to external resource" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add External Lecture
        </Button>
      </form>
    </Form>
  );
}
