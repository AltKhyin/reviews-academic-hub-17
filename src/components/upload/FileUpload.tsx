import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  bucket: string;
  folder: string;
  accept?: string;
  buttonText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  bucket,
  folder,
  accept = '*/*',
  buttonText = 'Upload'
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setIsUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      onUploadComplete(data.publicUrl);
      
      toast({
        title: "Arquivo enviado com sucesso",
        description: "O arquivo foi carregado e associado.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro ao enviar arquivo",
        description: "Ocorreu um erro ao carregar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadId = React.useId();

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className="whitespace-nowrap"
        onClick={() => document.getElementById(uploadId)?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Enviando...' : (
          <>
            <Upload className="h-4 w-4 mr-2" /> {buttonText}
          </>
        )}
      </Button>
      <input
        id={uploadId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleUpload}
      />
    </>
  );
};
