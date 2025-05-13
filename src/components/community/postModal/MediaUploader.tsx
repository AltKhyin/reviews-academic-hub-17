
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface MediaUploaderProps {
  mediaType: string | null;
  onMediaTypeChange: (type: string | null) => void;
  onImageChange: (file: File | null) => void;
  onImagePreviewChange: (url: string | null) => void;
  onVideoUrlChange: (url: string | null) => void;
  imageUrl: string | null;
  videoUrl: string | null;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaType,
  onMediaTypeChange,
  onImageChange,
  onImagePreviewChange,
  onVideoUrlChange,
  imageUrl,
  videoUrl
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
      const objectUrl = URL.createObjectURL(file);
      onImagePreviewChange(objectUrl);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Label>Mídia (opcional)</Label>
        <Tabs value={mediaType || ""} onValueChange={onMediaTypeChange} className="ml-auto">
          <TabsList>
            <TabsTrigger value="">Nenhum</TabsTrigger>
            <TabsTrigger value="image">Imagem</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
          </TabsList>

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
              onChange={(e) => onVideoUrlChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Dica: Você pode usar URLs do YouTube, Vimeo ou links diretos para arquivos de vídeo (.mp4, .webm, etc.)
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
