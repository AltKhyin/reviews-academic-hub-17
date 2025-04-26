
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString().replace('0.', '')}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Get signed URL approach (avoids permissions issues)
      const { data: signedURLData, error: signedURLError } = await supabase.storage
        .from('issues')
        .createSignedUploadUrl(filePath);

      if (signedURLError) {
        console.error('Error getting signed URL:', signedURLError);
        throw signedURLError;
      }

      const { error: uploadError } = await supabase.storage
        .from('issues')
        .uploadToSignedUrl(
          signedURLData.path,
          signedURLData.token,
          file
        );

      if (uploadError) {
        console.error('Error uploading with signed URL:', uploadError);
        throw uploadError;
      }

      // Get public URL after successful upload
      const { data } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading
  };
};
