// ABOUTME: Defines the core data structures for the block-based review editor.
// This file establishes the unified type system for blocks, layouts, and content.

import { FC, CSSProperties } from 'react';

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
  settings?: { width?: string; style?: CSSProperties };
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
  settings?: { style?: CSSProperties };
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

// ========== SPACING ==========
export interface SpacingConfig {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
}

// ========== SNAPSHOT CARD ==========
export interface SnapshotMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  imageUrl?: string; // Added imageUrl
  value?: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  metrics?: SnapshotMetric[];
  key_findings?: string[];
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  design?: string;
  evidence_level?: 'high' | 'moderate' | 'low' | 'very_low' | string;
  recommendation_strength?: 'strong' | 'conditional' | 'expert_opinion' | string;
  source?: string;
  timestamp?: string;
}

// ========== DIAGRAMS ==========
export interface DiagramNodeData {
  type?: 'rectangle' | 'circle' | 'diamond';
  label: string;
  color?: string;
  width?: number;
  height?: number;
  [key: string]: any; // Added index signature for React Flow compatibility
}

export interface DiagramEdgeData {
  label?: string;
  [key: string]: any; // Added index signature for React Flow compatibility
}

export interface DiagramNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: DiagramNodeData;
  width?: number;
  height?: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string; // Added label
  data?: DiagramEdgeData;
  animated?: boolean;
  style?: CSSProperties; // Added style
}

export interface DiagramContent {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: any;
  title?: string;
  description?: string;
  canvas?: {
    backgroundColor?: string;
    gridSize?: number;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

export interface DiagramTemplateNode {
  id: string;
  label: string;
  type?: 'rectangle' | 'circle' | 'diamond' | 'group';
  position: { x: number; y: number };
  parentId?: string;
  width?: number;
  height?: number;
}

export interface DiagramTemplateConnection {
  source: string;
  target: string;
  label?: string;
}

// Helper type for enhanced issue data in viewer
export interface EnhancedIssue {
  id: string;
  title: string;
  description: string;
  authors: string;
  specialty: string;
  year?: number;
  population: string;
  review_type: 'native' | 'pdf' | 'mixed';
  article_pdf_url: string;
  pdf_url: string;
}
