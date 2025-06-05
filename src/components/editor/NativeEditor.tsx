
// ABOUTME: Native review editor with simplified dark theme and enhanced UX
// Provides drag-and-drop interface, block management, and real-time preview

import React, { useState } from 'react';
import { ReviewBlock } from '@/types/review';
import { BlockPalette } from './BlockPalette';
import { BlockEditor } from './BlockEditor';
import { ReviewPreview } from './ReviewPreview';
import { EditorHeader } from './EditorHeader';
import { useBlockManagement } from '@/hooks/useBlockManagement';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { cn } from '@/lib/utils';

interface NativeEditorProps {
  issueId?: string;
  initialBlocks?: ReviewBlock[];
  onSave: (blocks: ReviewBlock[]) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const NativeEditor: React.FC<NativeEditorProps> = ({
  issueId,
  initialBlocks = [],
  onSave,
  onCancel,
  className
}) => {
  const {
    blocks,
    activeBlockId,
    setActiveBlockId,
    addBlock,
    duplicateBlock,
    updateBlock,
    deleteBlock,
    moveBlock
  } = useBlockManagement({ initialBlocks, issueId });

  const { handleSave, isSaving, lastSaved } = useEditorAutoSave({
    blocks,
    onSave
  });

  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');

  return (
    <div className={cn("native-editor editor-layout", className)}>
      <EditorHeader
        blocksCount={blocks.length}
        lastSaved={lastSaved}
        editorMode={editorMode}
        onModeChange={setEditorMode}
        showThemeCustomizer={false}
        onToggleThemeCustomizer={() => {}}
        onSave={() => handleSave(false)}
        onCancel={onCancel}
        isSaving={isSaving}
      />

      {/* Editor Content */}
      <div className="editor-content">
        {/* Block Palette - Left Sidebar */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="w-80 editor-sidebar overflow-y-auto">
            <BlockPalette onAddBlock={addBlock} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="editor-main">
          {editorMode === 'edit' && (
            <BlockEditor
              blocks={blocks}
              activeBlockId={activeBlockId}
              onActiveBlockChange={setActiveBlockId}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onMoveBlock={moveBlock}
              onAddBlock={addBlock}
              onDuplicateBlock={duplicateBlock}
            />
          )}

          {editorMode === 'preview' && (
            <ReviewPreview
              blocks={blocks}
              className="p-6"
            />
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-2 h-full">
              <div style={{ borderRight: `1px solid var(--editor-primary-border)` }}>
                <BlockEditor
                  blocks={blocks}
                  activeBlockId={activeBlockId}
                  onActiveBlockChange={setActiveBlockId}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onMoveBlock={moveBlock}
                  onAddBlock={addBlock}
                  onDuplicateBlock={duplicateBlock}
                  compact
                />
              </div>
              <div className="overflow-y-auto">
                <ReviewPreview
                  blocks={blocks}
                  className="p-6"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
