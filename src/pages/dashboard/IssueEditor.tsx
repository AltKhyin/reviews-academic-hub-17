
// ABOUTME: Issue editor with proper type conversion and string ID support
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReviewBlock, BlockType } from '@/types/review';
import { NativeEditor } from '@/components/editor/NativeEditor';
import { NativeEditorFullscreen } from '@/components/editor/NativeEditorFullscreen';
import { useBlockOperations } from '@/hooks/useBlockOperations';
import { convertDatabaseIdToString, sanitizeBlockType, parseJsonSafely } from '@/utils/typeGuards';
import { Button } from '@/components/ui/button';
import { Save, Eye, Maximize } from 'lucide-react';

export const IssueEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [blocks, setBlocks] = useState<ReviewBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load blocks from database
  useEffect(() => {
    const loadBlocks = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data: reviewBlocks, error } = await supabase
          .from('review_blocks')
          .select('*')
          .eq('issue_id', id)
          .order('sort_index');

        if (error) {
          console.error('Error loading blocks:', error);
          return;
        }

        // Convert database blocks to ReviewBlock format with proper type safety
        const convertedBlocks: ReviewBlock[] = (reviewBlocks || []).map(block => ({
          id: convertDatabaseIdToString(block.id),
          type: sanitizeBlockType(block.type),
          content: parseJsonSafely(block.payload, {}),
          sort_index: block.sort_index,
          visible: Boolean(block.visible),
          meta: parseJsonSafely(block.meta, {}),
        }));

        setBlocks(convertedBlocks);
      } catch (error) {
        console.error('Error loading blocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlocks();
  }, [id]);

  const {
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock
  } = useBlockOperations({
    blocks,
    onBlocksChange: setBlocks,
    activeBlockId,
    onActiveBlockChange: setActiveBlockId
  });

  const handleSave = useCallback(async () => {
    if (!id || isSaving) return;

    try {
      setIsSaving(true);

      // Delete existing blocks
      await supabase
        .from('review_blocks')
        .delete()
        .eq('issue_id', id);

      // Insert new blocks with proper type conversion
      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
          issue_id: id,
          type: block.type,
          payload: block.content,
          sort_index: index,
          visible: block.visible,
          meta: block.meta || {},
        }));

        const { error } = await supabase
          .from('review_blocks')
          .insert(blocksToInsert);

        if (error) {
          console.error('Error saving blocks:', error);
          return;
        }
      }

      console.log('Blocks saved successfully');
    } catch (error) {
      console.error('Error saving blocks:', error);
    } finally {
      setIsSaving(false);
    }
  }, [id, blocks, isSaving]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  const editorProps = {
    blocks,
    onUpdateBlock: updateBlock,
    onDeleteBlock: deleteBlock,
    onMoveBlock: moveBlock,
    onAddBlock: addBlock,
    onDuplicateBlock: duplicateBlock,
    activeBlockId,
    onActiveBlockChange: setActiveBlockId,
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Issue Editor</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </Button>
          
          <Button
            onClick={() => setIsFullscreen(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Maximize className="w-4 h-4" />
            <span>Fullscreen</span>
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {isFullscreen ? (
          <NativeEditorFullscreen
            {...editorProps}
            onClose={() => setIsFullscreen(false)}
          />
        ) : (
          <NativeEditor {...editorProps} />
        )}
      </div>
    </div>
  );
};
