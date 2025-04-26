
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

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
  const inputId = React.useId();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, folder);
    if (url) {
      onUploadComplete(url);
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
        {isUploading ? 'Uploading...' : (
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
