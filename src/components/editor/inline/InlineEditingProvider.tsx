
// ABOUTME: Context provider for managing inline editing states across the editor
// Provides centralized state management for edit modes and prevents conflicts

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface EditingState {
  activeEditor: string | null;
  pendingChanges: Map<string, any>;
  autoSave: boolean;
}

interface InlineEditingContextType {
  editingState: EditingState;
  setActiveEditor: (editorId: string | null) => void;
  setPendingChange: (editorId: string, value: any) => void;
  commitChanges: (editorId?: string) => void;
  discardChanges: (editorId?: string) => void;
  isEditing: (editorId: string) => boolean;
  toggleAutoSave: () => void;
}

const InlineEditingContext = createContext<InlineEditingContextType | null>(null);

interface InlineEditingProviderProps {
  children: ReactNode;
  onSave?: (changes: Map<string, any>) => void;
}

export const InlineEditingProvider: React.FC<InlineEditingProviderProps> = ({
  children,
  onSave
}) => {
  const [editingState, setEditingState] = useState<EditingState>({
    activeEditor: null,
    pendingChanges: new Map(),
    autoSave: true
  });

  const setActiveEditor = useCallback((editorId: string | null) => {
    setEditingState(prev => ({
      ...prev,
      activeEditor: editorId
    }));
  }, []);

  const setPendingChange = useCallback((editorId: string, value: any) => {
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      newPendingChanges.set(editorId, value);
      
      return {
        ...prev,
        pendingChanges: newPendingChanges
      };
    });
  }, []);

  const commitChanges = useCallback((editorId?: string) => {
    setEditingState(prev => {
      const changesToCommit = editorId 
        ? new Map([[editorId, prev.pendingChanges.get(editorId)]])
        : new Map(prev.pendingChanges);
      
      if (onSave && changesToCommit.size > 0) {
        onSave(changesToCommit);
      }
      
      const newPendingChanges = new Map(prev.pendingChanges);
      if (editorId) {
        newPendingChanges.delete(editorId);
      } else {
        newPendingChanges.clear();
      }
      
      return {
        ...prev,
        pendingChanges: newPendingChanges,
        activeEditor: editorId ? null : prev.activeEditor
      };
    });
  }, [onSave]);

  const discardChanges = useCallback((editorId?: string) => {
    setEditingState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      if (editorId) {
        newPendingChanges.delete(editorId);
      } else {
        newPendingChanges.clear();
      }
      
      return {
        ...prev,
        pendingChanges: newPendingChanges,
        activeEditor: editorId ? null : prev.activeEditor
      };
    });
  }, []);

  const isEditing = useCallback((editorId: string) => {
    return editingState.activeEditor === editorId;
  }, [editingState.activeEditor]);

  const toggleAutoSave = useCallback(() => {
    setEditingState(prev => ({
      ...prev,
      autoSave: !prev.autoSave
    }));
  }, []);

  const contextValue: InlineEditingContextType = {
    editingState,
    setActiveEditor,
    setPendingChange,
    commitChanges,
    discardChanges,
    isEditing,
    toggleAutoSave
  };

  return (
    <InlineEditingContext.Provider value={contextValue}>
      {children}
    </InlineEditingContext.Provider>
  );
};

export const useInlineEditing = (): InlineEditingContextType => {
  const context = useContext(InlineEditingContext);
  if (!context) {
    throw new Error('useInlineEditing must be used within an InlineEditingProvider');
  }
  return context;
};
