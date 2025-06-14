
// ABOUTME: Utilities for importing/exporting review content.
import { ReviewBlock, BlockType } from '@/types/review';

export interface ExportData {
  version: string;
  blocks: ReviewBlock[];
  timestamp: string;
}

export const exportBlocks = (blocks: ReviewBlock[]): ExportData => {
  // Placeholder implementation
  return {
    version: '2.0.1',
    blocks: blocks,
    timestamp: new Date().toISOString(),
  };
};

export const validateImportData = (data: any): { isValid: boolean, errors: string[] } => {
  // Placeholder implementation
  if (!data || !Array.isArray(data.blocks)) {
    return { isValid: false, errors: ['Invalid import data format.'] };
  }
  return { isValid: true, errors: [] };
};

export const migrateImportData = (data: any): ReviewBlock[] => {
  // Placeholder implementation for data migration
  return data.blocks || [];
};

export const someExportFunction = () => {
  const blockData = {
    id: '1',
    type: 'paragraph' as const,
    content: {},
    sort_index: 0,
    visible: true,
  };

  // This assignment is now valid as `created_at` is removed.
  const reviewBlock: ReviewBlock = {
    ...blockData
  };

  return reviewBlock;
};

// This record now includes all BlockType keys to satisfy the type checking.
export const blockTypeInitialContent: Record<BlockType, any> = {
  text: { content: "" },
  heading: { text: "", level: 1 },
  paragraph: { text: "", content: "" },
  image: { url: "", caption: "" },
  video: { url: "", caption: "" },
  quote: { text: "", author: "" },
  list: { items: [], ordered: false },
  code: { code: "", language: "javascript" },
  table: { headers: [], rows: [[]] },
  divider: {},
  callout: { text: "", icon: "" },
  embed: { url: "" },
  poll: { question: "", options: [] },
  chart: { type: 'bar', data: [] },
  audio: { url: "" },
  file: { url: "", name: "" },
  gallery: { images: [] },
  timeline: { events: [] },
  comparison: { items: [] },
  accordion: { items: [] },
  tabs: { items: [] },
  figure: { url: "", caption: "" },
  number_card: { title: "", value: 0 },
  reviewer_quote: { text: "", reviewer: "" },
  citation_list: { citations: [] },
  snapshot_card: { title: "" },
  diagram: {},
  layout_grid: {},
  grid_2d: {},
};
