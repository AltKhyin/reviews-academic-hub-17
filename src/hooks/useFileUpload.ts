
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

      console.log(`Uploading file ${fileName} to ${folder}`);
      
      // Check if bucket exists before upload
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'issues');
      
      if (!bucketExists) {
        console.error('Bucket "issues" not found');
        throw new Error('Storage bucket not found. Please contact support.');
      }
      
      const { data, error: uploadError } = await supabase.storage
        .from('issues')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('issues')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', urlData.publicUrl);
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
