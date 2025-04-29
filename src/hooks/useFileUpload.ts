
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log(`Starting upload for file ${fileName} to ${folder}`);
      
      // Determine which bucket to use based on folder
      let bucketName = 'avatars'; // Default bucket
      
      if (folder.includes('community')) {
        bucketName = 'community';
      } else if (folder.includes('issue')) {
        bucketName = 'issues';
      } else if (folder.includes('article')) {
        bucketName = 'articles';
      }
      
      console.log(`Selected bucket: ${bucketName} for folder: ${folder}`);
      
      // Upload the file to the bucket
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, getting public URL');
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('File uploaded successfully, public URL:', urlData.publicUrl);
      return urlData.publicUrl;
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
