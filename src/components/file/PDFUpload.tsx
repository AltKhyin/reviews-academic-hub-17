
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PDFUploadProps {
  bucketName?: 'pdfs' | 'articles';
  onUploadComplete: (url: string) => void;
  label?: string;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ 
  bucketName = 'pdfs',
  onUploadComplete,
  label = 'Upload PDF'
}) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      
      toast({
        title: "Upload complete",
        description: "The PDF was uploaded successfully"
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the file",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload">
        <Button variant="outline" asChild>
          <span>{label}</span>
        </Button>
      </label>
    </div>
  );
};
