
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from '@/hooks/use-toast';

interface IssueFileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  label: string;
  folder: string;
}

export const IssueFileUpload: React.FC<IssueFileUploadProps> = ({
  onUploadComplete,
  accept = '*/*',
  label,
  folder
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [progress, setProgress] = useState(false);
  const inputId = React.useId();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProgress(true);
    
    try {
      console.log(`Starting upload of file: ${file.name} to folder: ${folder}`);
      const url = await uploadFile(file, folder);
      
      if (url) {
        console.log(`Upload successful: ${url}`);
        onUploadComplete(url);
        toast({
          title: "Upload successful",
          description: "The file was uploaded successfully",
        });
      } else {
        console.error("Upload failed: No URL returned");
      }
    } catch (error) {
      console.error("Error in handleUpload:", error);
    } finally {
      setProgress(false);
      // Reset file input to allow selecting the same file again
      event.target.value = '';
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className="whitespace-nowrap"
        onClick={() => document.getElementById(inputId)?.click()}
        disabled={isUploading || progress}
      >
        {(isUploading || progress) ? (
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
