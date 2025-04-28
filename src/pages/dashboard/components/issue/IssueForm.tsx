
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { issueFormSchema, IssueFormValues } from '@/schemas/issue-form-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ExternalLecture } from '@/types/issue';
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash } from 'lucide-react';

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

  const issueId = defaultValues.id;

  const { data: lectures = [], refetch } = useQuery({
    queryKey: ['external-lectures', issueId],
    queryFn: async () => {
      if (!issueId) return [];
      
      const { data, error } = await supabase
        .from('external_lectures')
        .select('*')
        .eq('issue_id', issueId);
        
      if (error) throw error;
      return data as ExternalLecture[];
    },
    enabled: !!issueId
  });
  
  const [newLecture, setNewLecture] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    external_url: ''
  });
  
  const handleAddLecture = async () => {
    if (!issueId) {
      toast({
        title: "Error",
        description: "Please save the issue first before adding external lectures",
        variant: "destructive",
      });
      return;
    }
    
    if (!newLecture.title || !newLecture.external_url) {
      toast({
        title: "Error",
        description: "Title and external URL are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('external_lectures')
        .insert({
          ...newLecture,
          issue_id: issueId
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "External lecture added successfully",
      });
      
      // Reset form and refetch lectures
      setNewLecture({
        title: '',
        description: '',
        thumbnail_url: '',
        external_url: ''
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add external lecture",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteLecture = async (lectureId: string) => {
    try {
      const { error } = await supabase
        .from('external_lectures')
        .delete()
        .eq('id', lectureId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "External lecture deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete external lecture",
        variant: "destructive",
      });
    }
  };

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
                <Input placeholder="PDF URL" {...field} />
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
                <Input placeholder="Original article PDF URL" {...field} />
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
                <Input placeholder="Cover image URL" {...field} />
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
      
      {issueId && (
        <div className="mt-8">
          <Separator className="my-6" />
          <h2 className="text-lg font-semibold mb-4">External Lectures</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Add External Lecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <FormLabel>Title</FormLabel>
                  <Input 
                    placeholder="Lecture title" 
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({...newLecture, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    placeholder="Short description" 
                    value={newLecture.description}
                    onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Thumbnail image URL" 
                      value={newLecture.thumbnail_url}
                      onChange={(e) => setNewLecture({...newLecture, thumbnail_url: e.target.value})}
                    />
                    <SimpleFileUpload
                      onUploadComplete={(url) => setNewLecture({...newLecture, thumbnail_url: url})}
                      accept="image/*"
                      label="Upload"
                      bucket="issues"
                      folder="thumbnails"
                    />
                  </div>
                </div>
                
                <div>
                  <FormLabel>External URL</FormLabel>
                  <Input 
                    placeholder="URL to external resource" 
                    value={newLecture.external_url}
                    onChange={(e) => setNewLecture({...newLecture, external_url: e.target.value})}
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddLecture}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add External Lecture
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {lectures.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="text-md font-semibold">Current External Lectures</h3>
              {lectures.map((lecture) => (
                <Card key={lecture.id} className="bg-secondary/20">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {lecture.thumbnail_url && (
                        <img 
                          src={lecture.thumbnail_url} 
                          alt={lecture.title} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{lecture.title}</h4>
                        {lecture.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{lecture.description}</p>
                        )}
                        <a href={lecture.external_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400">
                          {lecture.external_url}
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteLecture(lecture.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Form>
  );
};
