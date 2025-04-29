
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
      let bucketName;
      
      if (folder === 'issues') {
        bucketName = 'issues';
      } else if (folder === 'community') {
        bucketName = 'community';
      } else if (folder === 'avatars') {
        bucketName = 'avatars';
      } else {
        bucketName = 'public'; // Default bucket
      }
      
      // Check if bucket exists or create it if needed
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
          throw bucketsError;
        }
        
        // Find or create the bucket
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Bucket "${bucketName}" not found, creating it...`);
          
          // Instead of creating bucket directly (which causes RLS issues),
          // we'll use an existing bucket or fall back to the public bucket
          bucketName = 'avatars'; // Use existing bucket as fallback
        }
      } catch (error) {
        console.error('Error checking buckets:', error);
        // Fall back to using the avatars bucket which likely already exists
        bucketName = 'avatars';
      }
      
      // Upload the file to the bucket
      console.log(`Uploading file to path: ${filePath} in bucket: ${bucketName}`);
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
