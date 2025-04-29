
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart } from 'lucide-react';

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

interface FormValues {
  title: string;
  content: string;
  flair_id: string;
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

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: {
      flair_id: ''
    }
  });

  // Set a default flair if available
  React.useEffect(() => {
    if (flairs && flairs.length > 0 && !setValue) {
      setValue('flair_id', flairs[0].id);
    }
  }, [flairs, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

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

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma publicação.",
        variant: "destructive",
      });
      return;
    }

    // Validate flair selection
    if (!data.flair_id) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma categoria para a publicação.",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Publicação</DialogTitle>
          <DialogDescription>
            Compartilhe uma pergunta, ideia ou discussão com a comunidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Digite um título para sua publicação"
              {...register('title', { required: 'O título é obrigatório' })}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Digite o conteúdo da sua publicação"
              rows={5}
              {...register('content')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flair">Categoria <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue={flairs.length > 0 ? flairs[0].id : undefined}
              onValueChange={(value) => setValue('flair_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {flairs.map((flair) => (
                  <SelectItem key={flair.id} value={flair.id}>
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: flair.color }} 
                    />
                    {flair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.flair_id && <p className="text-red-500 text-sm">A categoria é obrigatória</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label>Mídia (opcional)</Label>
              <Tabs value={mediaType || ""} onValueChange={setMediaType} className="ml-auto">
                <TabsList>
                  <TabsTrigger value="">Nenhum</TabsTrigger>
                  <TabsTrigger value="image">Imagem</TabsTrigger>
                  <TabsTrigger value="video">Vídeo</TabsTrigger>
                </TabsList>

                {/* Move TabsContent inside Tabs component */}
                <TabsContent value="image" className="space-y-2 mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-40 rounded"
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="video" className="space-y-2 mt-2">
                  <Input
                    type="url"
                    placeholder="Cole a URL do vídeo"
                    value={videoUrl || ''}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Dica: Você pode usar URLs do YouTube, Vimeo ou links diretos para arquivos de vídeo (.mp4, .webm, etc.)
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Poll Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center">
              <Button
                type="button"
                variant={isPollEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPollEnabled(!isPollEnabled)}
                className="gap-2"
              >
                <BarChart size={16} />
                {isPollEnabled ? "Remover Enquete" : "Adicionar Enquete"}
              </Button>
            </div>
            
            {isPollEnabled && (
              <div className="bg-gray-800/20 p-4 rounded-lg border border-gray-700/30 space-y-3">
                <Label>Opções da Enquete</Label>
                
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                    />
                    {index >= 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePollOption(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                
                {pollOptions.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                    className="w-full"
                  >
                    + Adicionar Opção
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
