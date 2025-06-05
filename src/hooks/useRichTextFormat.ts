
// ABOUTME: Rich text formatting hook for inline editors
// Provides text formatting state and actions for WYSIWYG editing

import { useCallback, useState, RefObject } from 'react';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface FormatActions {
  bold: () => void;
  italic: () => void;
  underline: () => void;
  undo: () => void;
  redo: () => void;
}

export const useRichTextFormat = (
  onContentChange: (content: string) => void,
  editorRef: RefObject<HTMLDivElement>
) => {
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false
  });

  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  }, [editorRef]);

  const executeCommand = useCallback((command: string) => {
    if (!editorRef.current) return;

    document.execCommand(command, false);
    editorRef.current.focus();
    
    // Update content
    const newContent = editorRef.current.innerHTML;
    onContentChange(newContent);
    
    // Update format state
    updateFormatState();
  }, [editorRef, onContentChange, updateFormatState]);

  const formatActions: FormatActions = {
    bold: () => executeCommand('bold'),
    italic: () => executeCommand('italic'),
    underline: () => executeCommand('underline'),
    undo: () => executeCommand('undo'),
    redo: () => executeCommand('redo')
  };

  return {
    formatState,
    formatActions,
    updateFormatState
  };
};
