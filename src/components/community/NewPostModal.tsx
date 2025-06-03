
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PostForm, PostFormData } from '@/components/community/postModal/PostForm';
import { MediaUploader } from '@/components/community/postModal/MediaUploader';
import { PollCreator } from '@/components/community/postModal/PollCreator';

interface Flair {
  id: string;
  name: string;
  color: string;
}

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  flairs: Flair[];
}

export const NewPostModal: React.FC<NewPostModalProps> = ({ 
  isOpen, 
  onClose, 
  onPostCreated,
  flairs
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Media upload states
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Poll states
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (data: PostFormData) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      let uploadedImageUrl = null;
      
      // Handle image upload if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Falha no upload da imagem');
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
          
        uploadedImageUrl = publicUrl;
      }
      
      // Create the post first
      const postData = {
        title: data.title,
        content: data.content || null,
        flair_id: data.flair_id,
        published: true,
        image_url: uploadedImageUrl,
        video_url: videoUrl,
        user_id: user.id
      };
      
      const { data: createdPost, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
        
      if (postError) throw postError;
      
      // Create poll if enabled
      let pollId = null;
      if (isPollEnabled && pollOptions.filter(option => option.trim()).length >= 2) {
        const { data: pollData, error: pollError } = await supabase
          .from('post_polls')
          .insert({
            post_id: createdPost.id
          })
          .select()
          .single();
          
        if (pollError) throw pollError;
        
        pollId = pollData.id;
        
        // Insert poll options
        const validOptions = pollOptions.filter(option => option.trim());
        const optionsToInsert = validOptions.map((option, index) => ({
          poll_id: pollId,
          text: option.trim(),
          position: index
        }));
        
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
        
        // Update the post with the poll_id
        const { error: updateError } = await supabase
          .from('posts')
          .update({ poll_id: pollId })
          .eq('id', createdPost.id);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Publicação criada!",
        description: "Sua publicação foi criada com sucesso.",
      });
      
      onPostCreated();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro ao criar publicação",
        description: error.message || "Não foi possível criar a publicação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaTypeChange = (type: string | null) => {
    setMediaType(type);
    if (type !== 'image') {
      setImageFile(null);
      setImagePreview(null);
    }
    if (type !== 'video') {
      setVideoUrl(null);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const togglePoll = () => {
    setIsPollEnabled(!isPollEnabled);
    if (!isPollEnabled) {
      // Reset poll options when enabling
      setPollOptions(['', '']);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Publicação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <PostForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            flairs={flairs}
            onCancel={onClose}
          />
          
          <MediaUploader
            mediaType={mediaType}
            onMediaTypeChange={handleMediaTypeChange}
            onImageChange={setImageFile}
            onImagePreviewChange={setImagePreview}
            onVideoUrlChange={setVideoUrl}
            imageUrl={imagePreview}
            videoUrl={videoUrl}
          />
          
          <PollCreator
            isPollEnabled={isPollEnabled}
            togglePoll={togglePoll}
            pollOptions={pollOptions}
            updatePollOption={updatePollOption}
            addPollOption={addPollOption}
            removePollOption={removePollOption}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
