
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from '@/hooks/use-toast';

interface IssuePDFUploadProps {
  onUploadComplete: (url: string) => void;
  label: string;
  folder: string;
  useProcessingBucket?: boolean;
}

export const IssuePDFUpload: React.FC<IssuePDFUploadProps> = ({
  onUploadComplete,
  label,
  folder,
  useProcessingBucket = false
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [progress, setProgress] = useState(false);
  const inputId = React.useId();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setProgress(true);
    
    try {
      console.log(`Starting upload of PDF: ${file.name} to folder: ${folder}`);
      console.log(`Using processing bucket: ${useProcessingBucket}`);
      
      const url = await uploadFile(file, folder, { useProcessingBucket });
      
      if (url) {
        console.log(`Upload successful: ${url}`);
        onUploadComplete(url);
        toast({
          title: "Upload successful",
          description: "The PDF was uploaded successfully",
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
        accept="application/pdf"
        className="hidden"
        onChange={handleUpload}
      />
    </>
  );
};
