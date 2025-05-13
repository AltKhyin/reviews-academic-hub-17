
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaUploader } from './postModal/MediaUploader';
import { PollCreator } from './postModal/PollCreator';
import { PostForm, PostFormData } from './postModal/PostForm';

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

export const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose, onPostCreated, flairs }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast({
        title: "Limite de opções",
        description: "Você pode adicionar no máximo 6 opções na enquete.",
        variant: "default",
      });
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma publicação.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // If there is an image file, upload it
      let finalImageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('community')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('community')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // Create the post
      const postData = {
        title: data.title,
        content: data.content || null,
        image_url: mediaType === 'image' ? (finalImageUrl || imageUrl) : null,
        video_url: mediaType === 'video' ? videoUrl : null,
        user_id: user.id,
        flair_id: data.flair_id,
        published: true,
      };
      
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
        
      if (postError) throw postError;
      
      // Add an automatic upvote from the post author
      const { error: voteError } = await supabase
        .from('post_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          value: 1
        });
        
      if (voteError) {
        console.error('Error adding author upvote:', voteError);
      }
      
      // If the poll is enabled and we have at least 2 options
      if (isPollEnabled && pollOptions.filter(o => o.trim()).length >= 2) {
        // Create the poll
        const { data: poll, error: pollError } = await supabase
          .from('post_polls')
          .insert({
            post_id: post.id
          })
          .select()
          .single();
          
        if (pollError) throw pollError;
        
        // Create the poll options
        const validOptions = pollOptions
          .filter(option => option.trim())
          .map((text, i) => ({
            poll_id: poll.id,
            text,
            position: i
          }));
          
        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(validOptions);
          
        if (optionsError) throw optionsError;
        
        // Update the post with the poll ID
        await supabase
          .from('posts')
          .update({ poll_id: poll.id })
          .eq('id', post.id);
      }

      toast({
        title: "Publicação criada",
        description: "Sua publicação foi criada com sucesso.",
        variant: "default",
      });
      
      onPostCreated();
      onClose();

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a publicação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Publicação</DialogTitle>
          <DialogDescription>
            Compartilhe uma pergunta, ideia ou discussão com a comunidade.
          </DialogDescription>
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
            onMediaTypeChange={setMediaType}
            onImageChange={setImageFile}
            onImagePreviewChange={setImageUrl}
            onVideoUrlChange={setVideoUrl}
            imageUrl={imageUrl}
            videoUrl={videoUrl}
          />
          
          <PollCreator 
            isPollEnabled={isPollEnabled}
            togglePoll={() => setIsPollEnabled(!isPollEnabled)}
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
