
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  external_url: z.string().url('Must be a valid URL'),
  thumbnail_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExternalLectureFormProps {
  issueId: string;
  onSuccess: () => void;
}

export function ExternalLectureForm({ issueId, onSuccess }: ExternalLectureFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      external_url: '',
      thumbnail_url: '',
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;
  
  const onSubmit = async (values: FormValues) => {
    try {
      // Use any type to bypass TypeScript's type checking
      const { error } = await (supabase as any)
        .from('external_lectures')
        .insert({
          ...values,
          issue_id: issueId,
        });
        
      if (error) throw error;
      
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "External lecture added successfully",
        duration: 3000
      });
    } catch (error: any) {
      console.error("Error adding external lecture:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add external lecture",
        variant: "destructive",
        duration: 5000
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter lecture title" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter lecture description" {...field} />
              </FormControl>
              <FormMessage />
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
                <Input placeholder="https://example.com/lecture" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add External Lecture"}
        </Button>
      </form>
    </Form>
  );
}
