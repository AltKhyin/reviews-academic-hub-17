
// ABOUTME: Defines the core data structures for the block-based review editor.
// This file establishes the unified type system for blocks, layouts, and content.

import { FC } from 'react';

// ========== CORE BLOCK & REVIEW STRUCTURES ==========

export type BlockType =
  | 'text' | 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'divider' | 'image'
  | 'video' | 'embed' | 'chart' | 'audio' | 'file' | 'gallery' | 'timeline'
  | 'comparison' | 'accordion' | 'tabs' | 'layout_grid' | 'grid_2d' | 'figure'
  | 'callout' | 'table' | 'citation_list' | 'poll' | 'reviewer_quote'
  | 'snapshot_card' | 'number_card' | 'diagram';

export interface ReviewBlock {
  id: string;
  type: BlockType;
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: {
    layout?: any; // Simplified for now
    [key: string]: any;
  };
}

export interface Review {
  id: string;
  title: string;
  elements: LayoutElement[];
  blocks: { [key: string]: ReviewBlock };
  version: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// ========== LAYOUT ELEMENT STRUCTURES (NEW) ==========
// Type alias to help TypeScript compiler with recursive types
export type LayoutElements = LayoutElement[];

export type LayoutElement =
  | BlockContainerElement
  | RowLayoutElement
  | GridLayoutElement;

export interface BlockContainerElement {
  id: string;
  type: 'block_container';
  blockId: string;
}

export interface RowLayoutElement {
  id: string;
  type: 'row';
  columns: LayoutColumn[];
  settings?: any;
}

export interface GridLayoutElement {
  id: string;
  type: 'grid';
  rows: LayoutRowDefinition[];
  settings?: any;
}

export interface LayoutColumn {
  id: string;
  elements: LayoutElements; // Using type alias here
  settings?: { width?: string };
}

export interface LayoutRowDefinition {
  id: string;
  cells: GridCell[];
}

export interface GridCell {
  id: string;
  blockId: string | null;
  colSpan?: number;
  rowSpan?: number;
}

export interface GridPosition {
  row: number;
  column: number;
}

// ========== EDITOR INTERFACES & OPTIONS (NEW) ==========

export interface AddBlockOptions {
  type: BlockType;
  initialContent?: any;
  insertAtIndex?: number;
  relativeToLayoutElementId?: string;
  position?: 'above' | 'below';
  parentElementId?: string;
  targetPosition?: GridPosition | number;
}

export interface BlockComponentProps<T = any> {
  block: ReviewBlock & { content: T };
  onUpdate: (blockId: string, updates: Partial<ReviewBlock>) => void;
  onDelete: (blockId: string) => void;
  onMove?: (elementId: string, direction: 'up' | 'down') => void;
  onAddBlock?: (options: AddBlockOptions) => void;
  isActive: boolean;
  onSelect: (blockId: string | null) => void;
  readonly?: boolean;
}

export type BlockComponent = FC<BlockComponentProps>;
