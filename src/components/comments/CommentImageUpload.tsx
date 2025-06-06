
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onImageRemove: () => void;
  selectedImage?: string;
}

export const CommentImageUpload: React.FC<CommentImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!selectedImage ? (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="comment-image-upload"
            disabled={isUploading}
          />
          <label htmlFor="comment-image-upload">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
              disabled={isUploading}
              asChild
            >
              <span className="cursor-pointer">
                <Image className="h-4 w-4" />
              </span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-gray-800/20 rounded-md">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-12 h-12 object-cover rounded"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
            onClick={onImageRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
