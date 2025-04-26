
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SimpleFileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  label: string;
  bucket: string;
  folder: string;
}

export const SimpleFileUpload: React.FC<SimpleFileUploadProps> = ({
  onUploadComplete,
  accept = '*/*',
  label,
  bucket,
  folder
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputId = React.useId();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      console.log(`Starting upload to ${bucket}/${folder}...`);
      
      // Generate unique filename
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log(`Uploading to path: ${filePath}`);
      
      // Try using createSignedUploadUrl for more reliable uploads
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);
        
      if (signedError) {
        console.error('Error creating signed URL:', signedError);
        throw signedError;
      }
      
      console.log('Got signed URL, uploading...');
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(signedData.path, signedData.token, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful, getting public URL...');
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      console.log('Public URL:', data.publicUrl);
      onUploadComplete(data.publicUrl);
      
      toast({
        title: "Upload successful",
        description: "File has been uploaded successfully."
      });
      
      // Clear the input
      event.target.value = '';
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className="whitespace-nowrap"
        onClick={() => document.getElementById(inputId)?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" /> {label}
          </>
        )}
      </Button>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleUpload}
      />
    </>
  );
};
