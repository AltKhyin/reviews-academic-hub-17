
// ABOUTME: Rich text formatting state and commands hook
// Manages text formatting state and executes document commands

import { useState, useCallback } from 'react';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
}

export const useRichTextFormat = (onChange: (value: string) => void, editorRef: React.RefObject<HTMLDivElement>) => {
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    textColor: '#000000',
    backgroundColor: 'transparent'
  });

  const updateFormatState = useCallback(() => {
    if (!document.getSelection) return;
    
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      fontSize: parseInt(document.queryCommandValue('fontSize') || '16'),
      textColor: document.queryCommandValue('foreColor') || '#000000',
      backgroundColor: document.queryCommandValue('hiliteColor') || 'transparent'
    });
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateFormatState();
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange, updateFormatState, editorRef]);

  const formatActions = {
    bold: () => execCommand('bold'),
    italic: () => execCommand('italic'),
    underline: () => execCommand('underline'),
    undo: () => execCommand('undo'),
    redo: () => execCommand('redo'),
    textColor: (color: string) => {
      execCommand('foreColor', color);
      setFormatState(prev => ({ ...prev, textColor: color }));
    },
    backgroundColor: (color: string) => {
      execCommand('hiliteColor', color);
      setFormatState(prev => ({ ...prev, backgroundColor: color }));
    },
    fontSize: (delta: number) => {
      const newSize = Math.max(8, Math.min(72, formatState.fontSize + delta));
      execCommand('fontSize', '7');
      execCommand('fontSize', newSize.toString());
    },
    createLink: (url: string) => execCommand('createLink', url),
    removeLink: () => execCommand('unlink')
  };

  return {
    formatState,
    formatActions,
    updateFormatState
  };
};
