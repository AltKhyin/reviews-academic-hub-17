// ABOUTME: Editor tabs component for switching between different editor modes
import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReviewBlock } from '@/types/review';
import { NativeEditor } from './NativeEditor';
import { PdfEditor } from './PdfEditor';
import { ImportExport } from './ImportExport';

interface EditorTabsProps {
  initialBlocks: ReviewBlock[];
}

const EditorTabs: React.FC<EditorTabsProps> = ({ initialBlocks }) => {
  const [mode, setMode] = useState<'native' | 'pdf'>('native');
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const onSave = useCallback((blocks: ReviewBlock[]) => {
    console.log('Saving blocks:', blocks);
    toast.success('Blocks saved successfully!');
  }, []);

  const onCancel = useCallback(() => {
    toast.warning('Editor cancelled.');
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={handleGoBack} variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <ImportExport initialBlocks={initialBlocks} />
      </div>

      <Tabs defaultValue="native" className="w-full">
        <TabsList>
          <TabsTrigger value="native" onClick={() => setMode('native')}>
            Native Editor
          </TabsTrigger>
          <TabsTrigger value="pdf" onClick={() => setMode('pdf')}>
            PDF Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="native" className="mt-4">
          {mode === 'native' && (
            <NativeEditor
              blocks={initialBlocks}
              onSave={onSave}
              onCancel={onCancel}
            />
          )}
        </TabsContent>
        <TabsContent value="pdf" className="mt-4">
          {mode === 'pdf' && <PdfEditor />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorTabs;
